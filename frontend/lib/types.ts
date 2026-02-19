export type PropertyType = 'Appartement' | 'Villa' | 'Studio' | 'Chambre' | 'Duplex' | 'Maison';
export type Commune = 'Ratoma' | 'Matam' | 'Kaloum' | 'Matoto' | 'Dixinn';
export type FurnishedType = 'Meublé' | 'Semi-meublé' | 'Vide';
export type WaterSupply = 'SEEG fiable' | 'SEEG intermittente' | 'Puits' | 'Citerne';
export type ElectricityType = 'EDG fiable' | 'EDG intermittente' | 'Groupe seul' | 'Solaire';
export type Currency = 'GNF' | 'USD';
export type LeadLevel = 'COLD' | 'WARM' | 'HOT' | 'VERIFIED';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  commune: Commune;
  quartier: string;
  repere?: string;
  latitude?: number;
  longitude?: number;
  surfaceM2?: number;
  totalRooms: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  furnished: FurnishedType;
  condition: 'Neuf' | 'Bon état' | 'À rénover';
  waterSupply: WaterSupply;
  electricityType: ElectricityType;
  hasGenerator: boolean;
  generatorIncluded: boolean;
  hasAC: boolean;
  acCount?: number;
  hasParking: boolean;
  hasSecurity: boolean;
  hasInternet: boolean;
  hasHotWater: boolean;
  accessibleInRain: boolean;
  priceGNF: number;
  priceUSD?: number;
  preferredCurrency: Currency;
  chargesIncluded: boolean;
  depositMonths: number;
  advanceMonths: number;
  negotiable: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  maxOccupants?: number;
  availableFrom: string;
  minDurationMonths: number;
  isVerified: boolean;
  images: string[];
  description: string;
  viewCount: number;
  leadCount: number;
  ownerId: string;
  ownerName: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  avatar?: string;
  role: 'TENANT' | 'OWNER' | 'AGENCY';
  commune?: Commune;
  budget?: number;
  budgetCurrency?: Currency;
  profession?: string;
  householdSize?: number;
  completionPercent: number;
}

export interface FilterState {
  communes: Commune[];
  types: PropertyType[];
  minPrice?: number;
  maxPrice?: number;
  currency: Currency;
  bedrooms?: number;
  furnished?: FurnishedType;
  waterReliable: boolean;
  electricityReliable: boolean;
  generatorIncluded: boolean;
  accessibleInRain: boolean;
  verifiedOnly: boolean;
  availableNow: boolean;
}

export const COMMUNES: Commune[] = ['Ratoma', 'Matam', 'Kaloum', 'Matoto', 'Dixinn'];
export const PROPERTY_TYPES: PropertyType[] = ['Appartement', 'Villa', 'Studio', 'Chambre', 'Duplex', 'Maison'];

export function formatGNF(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' GNF';
}

export function formatUSD(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

export function formatPrice(property: Property): string {
  if (property.preferredCurrency === 'USD' && property.priceUSD) {
    return formatUSD(property.priceUSD);
  }
  return formatGNF(property.priceGNF);
}

export function getLeadLevel(score: number): LeadLevel {
  if (score >= 80) return 'VERIFIED';
  if (score >= 60) return 'HOT';
  if (score >= 40) return 'WARM';
  return 'COLD';
}
