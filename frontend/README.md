# LOUMA Frontend 🚀

Application mobile React Native (Expo) pour la plateforme immobilière guinéenne.
Cette application est désormais entièrement **Serverless**, utilisant **Supabase** comme infrastructure backend.

## 📱 Technologies & Infrastructure

- **Frontend**: React Native 0.81.5 / Expo SDK 54
- **Backend (Supabase)**:
  - **Auth**: Authentification par numéro de téléphone (Supabase Auth).
  - **Database**: PostgreSQL avec Row Level Security (RLS).
  - **Storage**: Supabase Storage pour les photos de propriétés et avatars.
  - **Edge Functions**: Deno Edge Functions pour les notifications push et logique serveur.
- **Navigation**: Expo Router (file-based).
- **Type Safety**: TypeScript & Zod.

## 🛠 Configuration

Créer un fichier `.env` à la racine de `frontend/` :

```env
EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

## 🚀 Démarrage

### Installation
```bash
npm install
```

### Développement
```bash
# Lancer avec vidage du cache (recommandé après installation)
npx expo start -c
```

## 👥 Utilisateurs de Test

Utilisez ces comptes pour tester les différentes fonctionnalités (Mot de passe: `Password123!`) :

| Rôle | Email |
| :--- | :--- |
| **Locataire** | `tenant@test.com` |
| **Propriétaire** | `owner@test.com` |
| **Agence** | `agency@test.com` |

## 📂 Services Principaux

- `lib/AuthContext.tsx`: Gestion de la session et du profil utilisateur.
- `services/propertyService.ts`: Recherche, filtres complexes et gestion des biens.
- `services/leadService.ts`: Gestion des demandes de contact (leads).
- `lib/useImageUpload.ts`: Upload direct vers Supabase Storage.
- `lib/NotificationProvider.tsx`: Gestion des notifications Push.

## 🌍 Spécificités Guinéennes

- Communes: Ratoma, Matam, Kaloum, Matoto, Dixinn
- Devises: GNF et USD
- Critères: Eau SEEG, Électricité EDG, accès pluies
