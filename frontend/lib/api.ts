import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Config ───────────────────────────────────────────────────────────────────

// In development Expo connects to your LAN machine; adjust if needed.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const TOKEN_KEY = '@louma_token';
const REFRESH_TOKEN_KEY = '@louma_refresh_token';

// ─── Token helpers ─────────────────────────────────────────────────────────────

export async function saveTokens(token: string, refreshToken: string) {
    await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, token),
        AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
    ]);
}

export async function getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function clearTokens() {
    await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
    ]);
}

// ─── Core fetch wrapper ────────────────────────────────────────────────────────

interface ApiOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
    auth?: boolean; // Attach Bearer token (default: true)
}

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    pagination?: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function refreshAccessToken(): Promise<string | null> {
    const storedRefreshToken = await getRefreshToken();
    if (!storedRefreshToken) return null;

    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });

        if (!res.ok) {
            await clearTokens();
            return null;
        }

        const json: ApiResponse<{ token: string; refreshToken: string }> = await res.json();
        if (json.success && json.data) {
            await saveTokens(json.data.token, json.data.refreshToken);
            return json.data.token;
        }

        await clearTokens();
        return null;
    } catch {
        await clearTokens();
        return null;
    }
}

export async function apiFetch<T = unknown>(
    path: string,
    options: ApiOptions = {},
): Promise<ApiResponse<T>> {
    const { body, auth = true, headers: extraHeaders = {}, ...rest } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(extraHeaders as Record<string, string>),
    };

    if (auth) {
        const token = await getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const init: RequestInit = {
        ...rest,
        headers,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    };

    let res = await fetch(`${API_BASE_URL}${path}`, init);

    // Auto-refresh on 401
    if (res.status === 401 && auth) {
        if (!isRefreshing) {
            isRefreshing = true;
            const newToken = await refreshAccessToken();
            isRefreshing = false;
            refreshQueue.forEach(cb => cb(newToken));
            refreshQueue = [];

            if (newToken) {
                headers['Authorization'] = `Bearer ${newToken}`;
                res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
            }
        } else {
            // Queue additional requests while refreshing
            const newToken = await new Promise<string | null>(resolve => {
                refreshQueue.push(resolve);
            });
            if (newToken) {
                headers['Authorization'] = `Bearer ${newToken}`;
                res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
            }
        }
    }

    const json = await res.json();

    if (!res.ok && !json.success) {
        throw new ApiError(json.message || 'Erreur serveur', res.status, json);
    }

    return json as ApiResponse<T>;
}

// ─── Error class ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public body?: unknown,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export interface RegisterPayload {
    fullName: string;
    phone: string;
    password: string;
    email?: string;
    role?: 'TENANT' | 'OWNER' | 'AGENCY';
}

export interface LoginPayload {
    phone: string;
    password: string;
}

export interface AuthUser {
    id: string;
    fullName: string;
    phone: string;
    email: string | null;
    role: 'TENANT' | 'OWNER' | 'AGENCY';
    commune?: string;
    avatar?: string;
    profession?: string;
    budget?: string;
    budgetCurrency?: 'GNF' | 'USD';
    householdSize?: number;
    completionPercent: number;
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
}

export interface UpdateProfilePayload {
    fullName?: string;
    email?: string;
    avatar?: string;
    commune?: string;
    budget?: number;
    budgetCurrency?: 'GNF' | 'USD';
    profession?: string;
    householdSize?: number;
}

export const authApi = {
    register: (data: RegisterPayload) =>
        apiFetch<AuthResponse>('/api/auth/register', { method: 'POST', body: data, auth: false }),

    login: (data: LoginPayload) =>
        apiFetch<AuthResponse>('/api/auth/login', { method: 'POST', body: data, auth: false }),

    me: () => apiFetch<AuthUser>('/api/auth/me'),

    updateProfile: (data: UpdateProfilePayload) =>
        apiFetch<AuthUser>('/api/auth/profile', { method: 'PATCH', body: data }),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
        apiFetch('/api/auth/change-password', { method: 'POST', body: data }),

    requestPasswordReset: (phone: string) =>
        apiFetch('/api/auth/request-password-reset', { method: 'POST', body: { phone }, auth: false }),

    resetPassword: (data: { resetToken: string; newPassword: string }) =>
        apiFetch('/api/auth/reset-password', { method: 'POST', body: data, auth: false }),
};

// ─── Properties endpoints ─────────────────────────────────────────────────────

export interface PropertyFilters {
    q?: string;
    commune?: string | string[];
    type?: string | string[];
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    furnished?: string;
    waterReliable?: boolean;
    electricityReliable?: boolean;
    generatorIncluded?: boolean;
    accessibleInRain?: boolean;
    verifiedOnly?: boolean;
    availableNow?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'priceGNF' | 'viewCount';
    sortOrder?: 'asc' | 'desc';
}

function buildQueryString(params: Record<string, unknown>): string {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
            value.forEach(v => query.append(key, String(v)));
        } else {
            query.set(key, String(value));
        }
    }
    const qs = query.toString();
    return qs ? `?${qs}` : '';
}

export const propertiesApi = {
    list: (filters: PropertyFilters = {}) =>
        apiFetch<unknown[]>(`/api/properties${buildQueryString(filters as Record<string, unknown>)}`, { auth: false }),

    search: (q: string, limit = 10) =>
        apiFetch<unknown[]>(`/api/properties/search?q=${encodeURIComponent(q)}&limit=${limit}`, { auth: false }),

    getById: (id: string) =>
        apiFetch<unknown>(`/api/properties/${id}`, { auth: false }),

    getByOwner: (ownerId: string, limit = 20, offset = 0) =>
        apiFetch<unknown[]>(`/api/properties/owner/${ownerId}?limit=${limit}&offset=${offset}`),

    create: (data: unknown) =>
        apiFetch<unknown>('/api/properties', { method: 'POST', body: data }),

    update: (id: string, data: unknown) =>
        apiFetch<unknown>(`/api/properties/${id}`, { method: 'PUT', body: data }),

    delete: (id: string) =>
        apiFetch(`/api/properties/${id}`, { method: 'DELETE' }),
};

// ─── Leads endpoints ──────────────────────────────────────────────────────────

export interface CreateLeadPayload {
    propertyId: string;
    message?: string;
    budgetGNF?: number;
    professionalStatus?: string;
    desiredDurationMonths?: number;
    householdSize?: number;
}

export interface UpdateLeadStatusPayload {
    status: 'NEW' | 'CONTACTED' | 'VISITED' | 'CLOSED';
    notes?: string;
    contactDate?: string;
}

export const leadsApi = {
    create: (data: CreateLeadPayload) =>
        apiFetch<unknown>('/api/leads', { method: 'POST', body: data }),

    myLeads: (params: { status?: string; limit?: number; offset?: number } = {}) =>
        apiFetch<unknown[]>(`/api/leads/mine${buildQueryString(params)}`),

    forOwner: (params: { status?: string; propertyId?: string; limit?: number; offset?: number } = {}) =>
        apiFetch<unknown[]>(`/api/leads${buildQueryString(params)}`),

    updateStatus: (leadId: string, data: UpdateLeadStatusPayload) =>
        apiFetch<unknown>(`/api/leads/${leadId}/status`, { method: 'PATCH', body: data }),

    getById: (leadId: string) =>
        apiFetch<unknown>(`/api/leads/${leadId}`),
};
