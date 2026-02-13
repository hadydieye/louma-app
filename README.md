# LOUMA - Plateforme SaaS Immobilière

LOUMA est une application mobile destinée à structurer le marché immobilier en Guinée. Elle connecte les locataires à la recherche de logements avec des propriétaires et agences immobilières via un système de leads qualifiés.

## Structure du Projet

- **frontend/** : Application mobile React Native (Expo)
- **backend/** : Configuration et migrations Supabase (PostgreSQL)

## Prérequis

- Node.js (v18+)
- npm ou yarn
- Compte Supabase (pour le backend)

## Démarrage Rapide

### 1. Installation des dépendances Frontend

```bash
cd frontend
npm install
```

### 2. Configuration Backend

Assurez-vous d'avoir une instance Supabase active.
Les migrations SQL se trouvent dans `backend/supabase/migrations`.

Créez un fichier `.env` dans le dossier `frontend` avec vos clés Supabase :

```env
EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

### 3. Lancer l'application

```bash
cd frontend
npm start
```

Vous pouvez ensuite scanner le QR code avec l'application Expo Go sur votre téléphone Android ou iOS.

## Fonctionnalités Principales

- **Authentification** : Inscription/Connexion (Locataire/Propriétaire)
- **Explorer** : Liste des biens immobiliers disponibles
- **Détails** : Vue détaillée d'un bien
- **Leads** : Formulaire pour manifester son intérêt
- **Dashboard** : Statistiques pour les propriétaires (Biens actifs, Leads reçus)
- **Publication** : Ajout de biens immobiliers (Propriétaires uniquement)

## Technologies

- React Native / Expo
- TypeScript
- NativeWind (TailwindCSS)
- Supabase (Auth & Database)
- TanStack Query
- Zustand
