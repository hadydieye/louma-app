import { type Request, type Response } from 'express';
import { z } from 'zod';
import { leadService } from '../services/leadService';
import { asyncHandler } from '../utils/asyncHandler';
import { UnauthorizedError, NotFoundError, ForbiddenError } from '../utils/errors';
import type { LeadStatus } from '../services/leadService';

// Import side-effect: ensures Express.Request augmentation with `user` is loaded
import '../middleware/auth';

// Schemas de validation
const createLeadSchema = z.object({
    body: z.object({
        propertyId: z.string().uuid("ID de propriété invalide"),
        message: z.string().optional(),
        budgetGNF: z.number().optional(),
        professionalStatus: z.string().optional(),
        desiredDurationMonths: z.number().int().positive().optional(),
        householdSize: z.number().int().positive().optional(),
    }),
});

const updateLeadStatusSchema = z.object({
    params: z.object({
        id: z.string().uuid("ID de lead invalide"),
    }),
    body: z.object({
        status: z.enum(['NEW', 'CONTACTED', 'VISITED', 'CLOSED']),
        notes: z.string().optional(),
        contactDate: z.string().datetime().optional().or(z.literal("")),
    }),
});

// POST /api/leads — Soumettre un lead (locataire)
export const createLead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError();

    const { propertyId, message, budgetGNF, professionalStatus, desiredDurationMonths, householdSize } = req.body;

    const lead = await leadService.createLead(userId, {
        propertyId,
        message,
        budgetGNF,
        professionalStatus,
        desiredDurationMonths,
        householdSize,
    });

    res.status(201).json({
        success: true,
        data: lead,
        message: 'Demande envoyée au propriétaire',
    });
});

// GET /api/leads — Leads reçus (propriétaires / agences)
export const getLeadsForOwner = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError();

    const { status, level, propertyId, limit = '20', offset = '0' } = req.query;

    const leads = await leadService.getLeadsForOwner(userId, {
        status: status as LeadStatus | undefined,
        level: level as any,
        propertyId: propertyId ? String(propertyId) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
    });

    const total = await leadService.countLeadsForOwner(userId, status as LeadStatus | undefined);

    res.json({
        success: true,
        data: leads,
        pagination: {
            total,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            hasMore: parseInt(offset as string) + parseInt(limit as string) < total,
        },
    });
});

// GET /api/leads/mine — Leads soumis (locataires)
export const getMyLeads = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError();

    const { status, limit = '20', offset = '0' } = req.query;

    const leads = await leadService.getLeadsForTenant(userId, {
        status: status as LeadStatus | undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
    });

    res.json({ success: true, data: leads });
});

// GET /api/leads/:id — Détail d'un lead
export const getLeadById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError();

    const { id } = req.params;
    const lead = await leadService.getLeadById(id);

    if (!lead) throw new NotFoundError('Lead non trouvé');

    // Le locataire ne peut voir que ses propres leads, le propriétaire peut voir les leads de ses propriétés
    const isTenant = lead.userId === userId;
    const isOwnerOrAgency = req.user?.role === 'OWNER' || req.user?.role === 'AGENCY';

    if (!isTenant && !isOwnerOrAgency) {
        throw new ForbiddenError('Accès non autorisé');
    }

    res.json({ success: true, data: lead });
});

// PATCH /api/leads/:id/status — Mettre à jour le statut (propriétaire)
export const updateLeadStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError();

    const { id } = req.params;
    const { status, notes, contactDate } = req.body;

    const lead = await leadService.updateLeadStatus(id, userId, {
        status: status as LeadStatus,
        notes,
        contactDate: contactDate ? new Date(contactDate) : undefined,
    });

    res.json({
        success: true,
        data: lead,
        message: 'Statut du lead mis à jour',
    });
});

export const leadSchemas = {
    create: createLeadSchema,
    updateStatus: updateLeadStatusSchema,
};
