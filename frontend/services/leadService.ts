import { supabase } from '../lib/supabase';
import { type CreateLeadPayload, type UpdateLeadStatusPayload } from '../lib/types';

export const leadService = {
    /**
     * Create a new lead for a property
     */
    async createLead(data: CreateLeadPayload) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Authentication required');

        // If a phone number was provided, update the user's profile first
        if (data.phone) {
            await supabase
                .from('users')
                .update({ phone: data.phone })
                .eq('id', user.id);
        }

        const { data: lead, error } = await supabase
            .from('leads')
            .insert({
                property_id: data.propertyId,
                user_id: user.id,
                message: data.message,
                notes: JSON.stringify({
                    budgetGNF: data.budgetGNF,
                    professionalStatus: data.professionalStatus,
                    desiredDurationMonths: data.desiredDurationMonths,
                    householdSize: data.householdSize
                })
            })
            .select()
            .single();

        if (error) throw error;
        return lead;
    },

    /**
     * Get leads submitted by the current user
     */
    async getMyLeads() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Authentication required');

        const { data: leads, error } = await supabase
            .from('leads')
            .select(`
        *,
        properties (
          id,
          title,
          price_gnf,
          commune,
          type
        )
      `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return leads;
    },

    /**
     * Get leads for properties owned by the current user
     */
    async getForOwner(params: { status?: string, propertyId?: string } = {}) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Authentication required');

        let query = supabase
            .from('leads')
            .select(`
        *,
        user:users (
          id,
          full_name,
          phone,
          avatar
        ),
        property:properties (
          id,
          title
        )
      `)
            .order('created_at', { ascending: false });

        if (params.status) {
            query = query.eq('status', params.status);
        }

        if (params.propertyId) {
            query = query.eq('property_id', params.propertyId);
        }

        // RLS handles the owner check
        const { data: leads, error } = await query;

        if (error) throw error;
        return leads;
    },

    /**
     * Update lead status or notes
     */
    async updateLeadStatus(leadId: string, data: UpdateLeadStatusPayload) {
        const { data: updatedLead, error } = await supabase
            .from('leads')
            .update({
                status: data.status,
                notes: data.notes,
                contact_date: data.contactDate,
                updated_at: new Date().toISOString()
            })
            .eq('id', leadId)
            .select()
            .single();

        if (error) throw error;
        return updatedLead;
    }
};
