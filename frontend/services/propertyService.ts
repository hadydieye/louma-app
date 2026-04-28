import { supabase } from '../lib/supabase';
import type { Property, PropertyFilters, CreateLeadPayload } from '../lib/types';
import { Platform } from 'react-native';

export const propertyService = {
    /**
     * List properties with complex filters
     */
    async getProperties(filters: any) {
        let query = supabase
            .from('properties')
            .select(`
        *,
        property_images (*),
        owner:users (full_name, avatar, is_verified, completion_percent)
      `)
            .eq('is_active', true)
            .eq('is_available', true);

        // Text search
        if (filters.q) {
            query = query.or(`title.ilike.%${filters.q}%,commune.ilike.%${filters.q}%,quartier.ilike.%${filters.q}%,type.ilike.%${filters.q}%`);
        }

        // Mapped correct filter keys from the store
        if (filters.communes && filters.communes.length > 0) {
            query = query.in('commune', filters.communes);
        }

        if (filters.types && filters.types.length > 0) {
            query = query.in('type', filters.types);
        }

        // Amenities filters
        if (filters.waterReliable) {
            query = query.in('water_supply', ['SEEG fiable', 'Citerne']);
        }

        if (filters.electricityReliable) {
            query = query.in('electricity_type', ['EDG fiable', 'Solaire', 'Groupe seul']);
        }

        if (filters.generatorIncluded) {
            query = query.eq('generator_included', true);
        }

        if (filters.accessibleInRain) {
            query = query.eq('accessible_in_rain', true);
        }
        
        if (filters.furnished) {
            if (Array.isArray(filters.furnished)) {
                query = query.in('furnished', filters.furnished);
            } else {
                query = query.eq('furnished', filters.furnished);
            }
        }

        if (filters.availableNow) {
            // Ideally we'd use a date comparison, but if it's available now, available_from should be <= today
            const today = new Date().toISOString().split('T')[0];
            query = query.lte('available_from', today);
        }
        
        if (filters.verifiedOnly) {
            // Note: Since isVerified can also be true if the owner is verified, 
            // the exact filtering might need a view or inner join if we wanted to be perfectly strict on owner.
            // But checking property is_verified is the baseline here.
            query = query.eq('is_verified', true);
        }

        // Price range
        const priceColumn = filters.currency === 'USD' ? 'price_usd' : 'price_gnf';
        if (filters.minPrice) query = query.gte(priceColumn, filters.minPrice);
        if (filters.maxPrice) query = query.lte(priceColumn, filters.maxPrice);

        // Rooms
        if (filters.bedrooms) {
             if (filters.bedrooms >= 5) {
                 query = query.gte('bedrooms', 5);
             } else {
                 query = query.eq('bedrooms', filters.bedrooms);
             }
        }

        // Sort
        const sortBy = filters.sortBy || 'created_at';
        const sortOrder = filters.sortOrder || 'desc';
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        // Pagination
        if (filters.limit) {
            const from = filters.offset || 0;
            const to = from + filters.limit - 1;
            query = query.range(from, to);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        // Map snake_case to CamelCase to match existing frontend interfaces
        const mappedData = data?.map((item: any) => ({
            ...item,
            priceGNF: Number(item.price_gnf),
            priceUSD: item.price_usd ? Number(item.price_usd) : undefined,
            surfaceM2: item.surface_m2 ? Number(item.surface_m2) : undefined,
            waterSupply: item.water_supply,
            electricityType: item.electricity_type,
            hasGenerator: item.has_generator,
            generatorIncluded: item.generator_included,
            hasAC: item.has_ac,
            acCount: item.ac_count,
            hasParking: item.has_parking,
            hasSecurity: item.has_security,
            hasInternet: item.has_internet,
            hasHotWater: item.has_hot_water,
            accessibleInRain: item.accessible_in_rain,
            preferredCurrency: item.preferred_currency,
            chargesIncluded: item.charges_included,
            depositMonths: item.deposit_months,
            advanceMonths: item.advance_months,
            petsAllowed: item.pets_allowed,
            smokingAllowed: item.smoking_allowed,
            availableFrom: item.available_from,
            minDurationMonths: item.min_duration_months,
            isVerified: item.is_verified || (item.owner?.is_verified) || (item.owner?.completion_percent === 100),
            description: item.description,
            viewCount: item.view_count,
            leadCount: item.lead_count,
            ownerId: item.owner_id,
            ownerName: item.owner?.full_name || 'Inconnu',
            ownerAvatar: item.owner?.avatar,
            images: item.property_images?.map((img: any) => ({
                id: img.id,
                imageUrl: img.image_url,
                alt: img.alt,
                order: img.order,
                isMain: img.is_main,
            })) || [],
            createdAt: item.created_at,
        }));

        return { data: mappedData, count };
    },

    /**
     * Get properties owned by the current user
     */
    async getMyProperties() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authenticated user required");

        const { data, error } = await supabase
            .from('properties')
            .select(`
                *,
                property_images (*)
            `)
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((item: any) => ({
            ...item,
            priceGNF: Number(item.price_gnf),
            petsAllowed: item.pets_allowed,
            smokingAllowed: item.smoking_allowed,
            images: item.property_images?.map((img: any) => ({
                id: img.id,
                imageUrl: img.image_url,
                isMain: img.is_main,
            })) || [],
        }));
    },

    /**
     * Get a single property by ID
     */
    async getPropertyById(id: string) {
        const { data, error } = await supabase
            .from('properties')
            .select(`
        *,
        property_images (*),
        owner:users (*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;

        // Map single result
        return {
            ...data,
            priceGNF: Number(data.price_gnf),
            priceUSD: data.price_usd ? Number(data.price_usd) : undefined,
            surfaceM2: data.surface_m2 ? Number(data.surface_m2) : undefined,
            waterSupply: data.water_supply,
            electricityType: data.electricity_type,
            hasGenerator: data.has_generator,
            generatorIncluded: data.generator_included,
            hasAC: data.has_ac,
            acCount: data.ac_count,
            hasParking: data.has_parking,
            hasSecurity: data.has_security,
            hasInternet: data.has_internet,
            hasHotWater: data.has_hot_water,
            accessibleInRain: data.accessible_in_rain,
            preferredCurrency: data.preferred_currency,
            chargesIncluded: data.charges_included,
            depositMonths: data.deposit_months,
            advanceMonths: data.advance_months,
            petsAllowed: data.pets_allowed,
            smokingAllowed: data.smoking_allowed,
            availableFrom: data.available_from,
            minDurationMonths: data.min_duration_months,
            isVerified: data.is_verified,
            description: data.description,
            viewCount: data.view_count,
            leadCount: data.lead_count,
            ownerId: data.owner_id,
            ownerName: data.owner?.full_name || 'Inconnu',
            ownerAvatar: data.owner?.avatar,
            images: data.property_images?.map((img: any) => ({
                id: img.id,
                imageUrl: img.image_url,
                alt: img.alt,
                order: img.order,
                isMain: img.is_main,
            })) || [],
            createdAt: data.created_at,
        };
    },


    /**
     * Create a new property
     */
    async createProperty(data: any) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authenticated user required");

        const { data: property, error } = await supabase
            .from('properties')
            .insert({
                ...data,
                owner_id: user.id
            })
            .select()
            .single();

        if (error) throw error;
        return property;
    },

    /**
     * Update a property
     */
    async updateProperty(id: string, data: any) {
        const { data: property, error } = await supabase
            .from('properties')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return property;
    },

    /**
     * Delete a property
     */
    async deleteProperty(id: string) {
        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    /**
     * Add an image to a property
     */
    async addPropertyImage(propertyId: string, data: { imageUrl: string; alt?: string; isMain?: boolean; order?: number }) {
        const { data: image, error } = await supabase
            .from('property_images')
            .insert({
                property_id: propertyId,
                image_url: data.imageUrl,
                alt: data.alt,
                is_main: data.isMain || false,
                order: data.order || 0
            })
            .select()
            .single();

        if (error) throw error;
        return image;
    },

    /**
     * Upload a file to Supabase Storage (generic)
     */
    async uploadToStorage(uri: string, folder: 'properties' | 'avatars' | 'docs' = 'properties') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Vous devez être connecté pour uploader des fichiers.");

        try {
            // Prepare file info
            const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
            
            // Path structure: userId/folder/filename (Aligned with RLS: Users manage own files)
            const path = `${user.id}/${folder}/${fileName}`;
            const mimeType = `image/${ext === 'png' ? 'png' : 'jpeg'}`;

            console.log(`[propertyService] Uploading (${Platform.OS}) to: ${path}`);

            let fileBody: any;

            if (Platform.OS === 'web') {
                // For Web, fetch the blob directly from the blob URI
                const response = await fetch(uri);
                fileBody = await response.blob();
            } else {
                // Nouvelle API Expo SDK 54
                const { File } = await import('expo-file-system/next');
                const file = new File(uri);
                fileBody = await file.arrayBuffer();
            }

            // Upload to Supabase Storage
            const { error: storageError } = await supabase.storage
                .from('property-images')
                .upload(path, fileBody, {
                    contentType: mimeType,
                    cacheControl: '3600',
                    upsert: true
                });

            if (storageError) {
                console.error('[propertyService] Storage error:', storageError);
                throw storageError;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('property-images')
                .getPublicUrl(path);

            return publicUrl;
        } catch (error) {
            console.error('[propertyService] uploadToStorage error:', error);
            throw error;
        }
    },

    /**
     * Upload an image and link it to a property
     */
    async uploadAndAddImage(propertyId: string, uri: string, isMain: boolean = false) {
        try {
            const publicUrl = await this.uploadToStorage(uri, 'properties');

            // Add record to database
            return await this.addPropertyImage(propertyId, {
                imageUrl: publicUrl,
                isMain
            });
        } catch (error) {
            console.error('[propertyService] uploadAndAddImage error:', error);
            throw error;
        }
    },

    /**
     * Remove an image
     */
    async removePropertyImage(imageId: string) {
        const { error } = await supabase
            .from('property_images')
            .delete()
            .eq('id', imageId);

        if (error) throw error;
        return true;
    }
};
