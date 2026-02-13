export interface User {
    id: string;
    email: string;
    full_name?: string;
    role: 'locataire' | 'proprietaire' | 'agence' | 'admin';
    avatar_url?: string;
    city?: string;
    phone?: string;
}

export interface Property {
    id: string;
    owner_id: string;
    type: string;
    city: string;
    commune: string;
    price_gnf: number;
    deposit?: number;
    description?: string;
    status: 'active' | 'inactive' | 'archived';
    images_url: string[];
    created_at: string;
}

export interface Lead {
    id: string;
    property_id: string;
    tenant_id: string;
    budget_gnf: number;
    status: 'new' | 'contacted' | 'converted' | 'rejected';
    professional_status?: string;
    desired_duration?: string;
    created_at: string;
}
