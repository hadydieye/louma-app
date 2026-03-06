# PROMPT DE MIGRATION : LOUMA-APP -> SUPABASE (SERVERLESS)

## 🎯 OBJECTIF
Migrer l'intégralité du backend actuel (Express.js + Drizzle ORM) vers une architecture **Serverless avec Supabase**. L'objectif est de supprimer le serveur Node.js et d'utiliser directement le SDK Supabase dans l'application Expo (React Native).

---

## 🏗️ ARCHITECTURE ACTUELLE (SOURCE DE VÉRITÉ)

### 1. Base de Données (PostgreSQL)
Le schéma de référence est situé dans `shared/schema.ts`. Il contient :
- **Tables :** `users`, `properties`, `property_images`, `favorites`, `leads`, `visits`, `reviews`.
- **Enums Spécifiques :** `property_type`, `commune` (Conakry: Ratoma, Matam, etc.), `furnished_type`, `water_supply`, `electricity_type`, `currency`, `user_role`, `property_condition`.
- **Relations :** Clés étrangères avec `onDelete: "cascade"`.
- **Index :** Optimisations sur `phone`, `email`, `commune`, `price_gnf`, `owner_id`.

### 2. Services à Remplacer
- **AuthService :** Gère actuellement `bcrypt`, `jsonwebtoken`, et `phone-based login`.
- **PropertyService :** Gère des filtres complexes (prix, chambres, eau/électricité fiable, accessible sous la pluie).
- **ImageService :** Utilise actuellement Cloudinary.
- **NotificationService :** Utilise `expo-server-sdk` pour les push notifications.

---

## 🛠️ INSTRUCTIONS DE MIGRATION (NE PAS HALLUCINER)

### Étape 1 : Schéma SQL & Sécurité (RLS)
Génère le script SQL complet pour l'éditeur Supabase :
- Crée tous les **Enums** personnalisés.
- Crée les tables en respectant scrupuleusement les types de `shared/schema.ts` (UUID, Decimal, Timestamp).
- Active la **Row Level Security (RLS)** sur TOUTES les tables.
- **Politiques de sécurité (Policies) :**
  - `properties` : Lecture anonyme (SELECT), insertion/mise à jour réservée au propriétaire authentifié (`auth.uid() = owner_id`).
  - `users` : Lecture/écriture strictement réservée à l'utilisateur lui-même (`auth.uid() = id`).
  - `leads` : Insertion publique, lecture réservée au propriétaire de la propriété liée.

### Étape 2 : Authentification (Phone OTP)
- Configure Supabase Auth pour utiliser le **numéro de téléphone** comme identifiant principal.
- Crée un **Trigger PostgreSQL** pour synchroniser automatiquement `auth.users` vers la table `public.users` lors de l'inscription (pour conserver les champs `fullName`, `role`, etc.).

### Étape 3 : Logique Métier & Filtres
Réécris la logique de `getProperties` (actuellement dans `propertyService.ts`) en utilisant le client `@supabase/supabase-js`.
- Implémente la recherche textuelle avec `.ilike()`.
- Implémente les filtres de commodités (ex: `waterSupply` IN ['SEEG fiable', 'Puits']).

### Étape 4 : Stockage (Storage)
- Configure un bucket nommé `property-images`.
- Génère les politiques de stockage (R/W réservé aux propriétaires, lecture publique).

### Étape 5 : Notifications (Edge Functions)
Crée une **Supabase Edge Function** (Deno) qui :
- Écoute les insertions dans la table `leads` via un Webhook.
- Envoie une notification via l'API Expo (`https://exp.host/--/api/v2/push/send`) au propriétaire de la propriété.

---

## 📦 LIVRABLES ATTENDUS
1. `migration.sql` : Script complet (Tables, Enums, RLS, Triggers).
2. `lib/supabase.ts` : Initialisation du client dans le frontend.
3. `services/propertyService.ts` : Version réécrite pour le SDK Supabase.
4. `supabase/functions/send-lead-notification/index.ts` : La Edge Function Deno.

---

## 🚫 CONTRAINTES STRICTES
- **Zéro Express :** Ne génère aucun code de serveur Node.js. Tout doit être direct (Frontend -> Supabase) ou via Edge Functions.
- **Types TypeScript :** Utilise les types générés par Supabase CLI ou assure une compatibilité stricte avec les interfaces existantes.
- **Drizzle :** Ne propose plus d'utiliser Drizzle côté serveur, mais accepte son utilisation côté frontend si nécessaire pour le typage.
