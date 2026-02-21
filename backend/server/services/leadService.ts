import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { leads, properties, users, type Lead, type InsertLead } from '../../../shared/schema';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'VISITED' | 'CLOSED';
export type LeadLevel = 'COLD' | 'WARM' | 'HOT' | 'VERIFIED';

export interface CreateLeadData {
    propertyId: string;
    message?: string;
    budgetGNF?: number;
    professionalStatus?: string;
    desiredDurationMonths?: number;
    householdSize?: number;
}

export interface UpdateLeadStatusData {
    status: LeadStatus;
    notes?: string;
    contactDate?: Date;
}

export interface LeadWithDetails extends Lead {
    property?: {
        id: string;
        title: string;
        commune: string;
        quartier: string;
        priceGNF: string;
        type: string;
    };
    tenant?: {
        id: string;
        fullName: string;
        phone: string;
        profession: string | null;
        completionPercent: number;
    };
}

export interface LeadFilters {
    status?: LeadStatus;
    level?: LeadLevel;
    propertyId?: string;
    limit?: number;
    offset?: number;
}

/**
 * Calcule le niveau du lead (COLD / WARM / HOT / VERIFIED)
 * basé sur les données disponibles.
 */
function computeLeadLevel(data: {
    hasMessage: boolean;
    budgetGNF?: number;
    professionalStatus?: string;
    desiredDurationMonths?: number;
    householdSize?: number;
}): LeadLevel {
    let score = 0;

    if (data.hasMessage) score += 20;
    if (data.budgetGNF && data.budgetGNF > 0) score += 20;
    if (data.professionalStatus) score += 20;
    if (data.desiredDurationMonths && data.desiredDurationMonths >= 6) score += 20;
    if (data.householdSize && data.householdSize > 0) score += 20;

    if (score >= 80) return 'VERIFIED';
    if (score >= 60) return 'HOT';
    if (score >= 40) return 'WARM';
    return 'COLD';
}

class LeadService {
    /**
     * Créer un nouveau lead (soumis par un locataire)
     */
    async createLead(tenantId: string, data: CreateLeadData): Promise<Lead> {
        // Vérifier que la propriété existe et est disponible
        const [property] = await db
            .select({ id: properties.id, ownerId: properties.ownerId, isAvailable: properties.isAvailable })
            .from(properties)
            .where(and(eq(properties.id, data.propertyId), eq(properties.isActive, true)))
            .limit(1);

        if (!property) {
            throw new Error('Propriété non trouvée ou non disponible');
        }

        // Un propriétaire ne peut pas soumettre un lead sur sa propre propriété
        if (property.ownerId === tenantId) {
            throw new Error('Vous ne pouvez pas soumettre une demande pour votre propre propriété');
        }

        // Vérifier qu'un lead actif n'existe pas déjà pour ce locataire / cette propriété
        const existingLead = await db
            .select({ id: leads.id })
            .from(leads)
            .where(and(
                eq(leads.propertyId, data.propertyId),
                eq(leads.userId, tenantId),
            ))
            .limit(1);

        if (existingLead.length > 0) {
            throw new Error('Vous avez déjà soumis une demande pour cette propriété');
        }

        // Calculer le niveau du lead
        const level = computeLeadLevel({
            hasMessage: !!data.message,
            budgetGNF: data.budgetGNF,
            professionalStatus: data.professionalStatus,
            desiredDurationMonths: data.desiredDurationMonths,
            householdSize: data.householdSize,
        });

        // Construire le message enrichi
        const enrichedMessage = buildEnrichedMessage(data);

        const [newLead] = await db
            .insert(leads)
            .values({
                propertyId: data.propertyId,
                userId: tenantId,
                message: enrichedMessage,
                status: 'NEW',
                level,
            })
            .returning();

        // Incrémenter le compteur de leads de la propriété
        await db
            .update(properties)
            .set({ leadCount: sql`${properties.leadCount} + 1` })
            .where(eq(properties.id, data.propertyId));

        return newLead;
    }

    /**
     * Lister les leads reçus pour les propriétés d'un propriétaire
     */
    async getLeadsForOwner(ownerId: string, filters: LeadFilters = {}): Promise<LeadWithDetails[]> {
        const { status, level, propertyId, limit = 20, offset = 0 } = filters;

        // Récupérer les propriétés de ce propriétaire
        const ownerProperties = await db
            .select({ id: properties.id })
            .from(properties)
            .where(eq(properties.ownerId, ownerId));

        if (ownerProperties.length === 0) return [];

        const propertyIds = ownerProperties.map(p => p.id);

        // Construire la requête des leads avec les détails
        const result = await db
            .select({
                lead: leads,
                property: {
                    id: properties.id,
                    title: properties.title,
                    commune: properties.commune,
                    quartier: properties.quartier,
                    priceGNF: properties.priceGNF,
                    type: properties.type,
                },
                tenant: {
                    id: users.id,
                    fullName: users.fullName,
                    phone: users.phone,
                    profession: users.profession,
                    completionPercent: users.completionPercent,
                },
            })
            .from(leads)
            .innerJoin(properties, eq(leads.propertyId, properties.id))
            .innerJoin(users, eq(leads.userId, users.id))
            .where(and(
                propertyId
                    ? eq(leads.propertyId, propertyId)
                    : sql`${leads.propertyId} = ANY(ARRAY[${sql.raw(propertyIds.map(id => `'${id}'`).join(','))}]::uuid[])`,
                status ? eq(leads.status, status) : undefined,
                level ? eq(leads.level, level) : undefined,
            ))
            .orderBy(desc(leads.createdAt))
            .limit(limit)
            .offset(offset);

        return result.map(row => ({
            ...row.lead,
            property: row.property,
            tenant: row.tenant,
        }));
    }

    /**
     * Lister les leads soumis par un locataire
     */
    async getLeadsForTenant(tenantId: string, filters: LeadFilters = {}): Promise<LeadWithDetails[]> {
        const { status, limit = 20, offset = 0 } = filters;

        const result = await db
            .select({
                lead: leads,
                property: {
                    id: properties.id,
                    title: properties.title,
                    commune: properties.commune,
                    quartier: properties.quartier,
                    priceGNF: properties.priceGNF,
                    type: properties.type,
                },
            })
            .from(leads)
            .innerJoin(properties, eq(leads.propertyId, properties.id))
            .where(and(
                eq(leads.userId, tenantId),
                status ? eq(leads.status, status) : undefined,
            ))
            .orderBy(desc(leads.createdAt))
            .limit(limit)
            .offset(offset);

        return result.map(row => ({
            ...row.lead,
            property: row.property,
        }));
    }

    /**
     * Récupérer un lead par son ID
     */
    async getLeadById(leadId: string): Promise<LeadWithDetails | null> {
        const [result] = await db
            .select({
                lead: leads,
                property: {
                    id: properties.id,
                    title: properties.title,
                    commune: properties.commune,
                    quartier: properties.quartier,
                    priceGNF: properties.priceGNF,
                    type: properties.type,
                },
                tenant: {
                    id: users.id,
                    fullName: users.fullName,
                    phone: users.phone,
                    profession: users.profession,
                    completionPercent: users.completionPercent,
                },
            })
            .from(leads)
            .innerJoin(properties, eq(leads.propertyId, properties.id))
            .innerJoin(users, eq(leads.userId, users.id))
            .where(eq(leads.id, leadId))
            .limit(1);

        if (!result) return null;

        return {
            ...result.lead,
            property: result.property,
            tenant: result.tenant,
        };
    }

    /**
     * Mettre à jour le statut d'un lead (par le propriétaire)
     */
    async updateLeadStatus(
        leadId: string,
        ownerId: string,
        data: UpdateLeadStatusData,
    ): Promise<Lead> {
        // Vérifier que le lead appartient à une propriété de ce propriétaire
        const [lead] = await db
            .select({ id: leads.id, propertyId: leads.propertyId, status: leads.status })
            .from(leads)
            .innerJoin(properties, eq(leads.propertyId, properties.id))
            .where(and(
                eq(leads.id, leadId),
                eq(properties.ownerId, ownerId),
            ))
            .limit(1);

        if (!lead) {
            throw new Error('Lead non trouvé ou accès non autorisé');
        }

        // Calculer le nouveau niveau selon le statut
        const newLevel = statusToLevel(data.status);

        const [updatedLead] = await db
            .update(leads)
            .set({
                status: data.status,
                level: newLevel,
                notes: data.notes !== undefined ? data.notes : undefined,
                contactDate: data.contactDate,
                updatedAt: new Date(),
            })
            .where(eq(leads.id, leadId))
            .returning();

        return updatedLead;
    }

    /**
     * Compter les leads d'un propriétaire
     */
    async countLeadsForOwner(ownerId: string, status?: LeadStatus): Promise<number> {
        const ownerProperties = await db
            .select({ id: properties.id })
            .from(properties)
            .where(eq(properties.ownerId, ownerId));

        if (ownerProperties.length === 0) return 0;

        const propertyIds = ownerProperties.map(p => p.id);

        const [result] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(leads)
            .where(and(
                sql`${leads.propertyId} = ANY(ARRAY[${sql.raw(propertyIds.map(id => `'${id}'`).join(','))}]::uuid[])`,
                status ? eq(leads.status, status) : undefined,
            ));

        return result?.count ?? 0;
    }
}

/**
 * Construit un message enrichi à partir des données du formulaire de demande.
 */
function buildEnrichedMessage(data: CreateLeadData): string {
    const parts: string[] = [];

    if (data.message) parts.push(data.message);

    const details: string[] = [];
    if (data.budgetGNF) details.push(`Budget : ${data.budgetGNF.toLocaleString('fr-FR')} GNF`);
    if (data.professionalStatus) details.push(`Situation professionnelle : ${data.professionalStatus}`);
    if (data.desiredDurationMonths) details.push(`Durée souhaitée : ${data.desiredDurationMonths} mois`);
    if (data.householdSize) details.push(`Taille du foyer : ${data.householdSize} personne(s)`);

    if (details.length > 0) {
        parts.push(`\n---\n${details.join('\n')}`);
    }

    return parts.join('\n') || 'Demande de renseignements';
}

/**
 * Associe un statut de lead à un niveau de qualification.
 */
function statusToLevel(status: LeadStatus): LeadLevel {
    switch (status) {
        case 'VISITED': return 'HOT';
        case 'CONTACTED': return 'WARM';
        case 'CLOSED': return 'VERIFIED';
        default: return 'COLD';
    }
}

export const leadService = new LeadService();
