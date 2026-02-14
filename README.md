# LOUMA - Plateforme SaaS Immobilière

LOUMA est une application mobile destinée à structurer le marché immobilier en Guinée. Elle connecte les locataires à la recherche de logements avec des propriétaires et agences immobilières via un système de leads qualifiés.

## 📋 Structure du Projet

- **frontend/** : Application mobile React Native (Expo)
- **backend/** : Configuration et migrations Supabase (PostgreSQL)

## 🚀 Prérequis

- Node.js (v18+)
- npm ou yarn
- Compte Supabase (pour le backend)
- Expo Go (pour tester sur mobile)

## ⚙️ Installation et Configuration

### 1. Installation des dépendances Frontend

```bash
cd frontend
npm install
```

### 2. Configuration Backend (Supabase)

Assurez-vous d'avoir une instance Supabase active.
Les migrations SQL se trouvent dans `backend/supabase/migrations`.

**Créez un fichier `.env` dans le dossier `frontend`** en copiant `.env.example` :

```bash
cd frontend
cp .env.example .env
```

Puis modifiez le fichier `.env` avec vos clés Supabase :

```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

### 3. Lancer l'application

```bash
cd frontend
npm start
```

Vous pouvez ensuite :
- Scanner le QR code avec l'application **Expo Go** sur votre téléphone Android ou iOS
- Appuyer sur `a` pour ouvrir sur un émulateur Android
- Appuyer sur `i` pour ouvrir sur un simulateur iOS (macOS uniquement)

## ✨ Fonctionnalités Implémentées

### Authentification
- ✅ Inscription avec Email/Mot de passe
- ✅ Connexion avec Email/Mot de passe
- ✅ Sélection du rôle (Locataire, Propriétaire, Agence)
- ✅ Gestion de session avec Supabase Auth

### Navigation par Rôle
- ✅ **Espace Locataire** : Explorer les biens + Profil
- ✅ **Espace Propriétaire/Agence** : Tableau de bord + Profil
- ✅ Redirection automatique selon le rôle

### Fonctionnalités Locataire
- ✅ Explorer la liste des biens immobiliers
- ✅ Voir les détails d'un bien
- ✅ Formulaire de lead (manifester son intérêt)

### Fonctionnalités Propriétaire/Agence
- ✅ Tableau de bord avec statistiques (Biens actifs, Leads reçus)
- ✅ Publication de nouveaux biens
- ✅ Gestion des biens (liste, détails)

### Gestion des Profils
- ✅ Écran de profil utilisateur
- ✅ Affichage des informations de compte

## 🛠 Technologies Utilisées

- **React Native** / **Expo** - Framework mobile multiplateforme
- **TypeScript** - Typage statique
- **NativeWind** - TailwindCSS pour React Native
- **Supabase** - Backend as a Service (Auth, Database, Storage)
- **TanStack Query** - Gestion du cache et des requêtes API
- **React Navigation** - Navigation dans l'application
- **React Hook Form** + **Zod** - Gestion et validation des formulaires

## 📁 Architecture Frontend

```
frontend/
├── src/
│   ├── features/          # Fonctionnalités par domaine
│   │   ├── auth/         # Authentification (Login, SignUp)
│   │   ├── dashboard/    # Tableau de bord propriétaire
│   │   ├── leads/        # Gestion des leads
│   │   ├── profile/      # Profil utilisateur
│   │   └── properties/   # Gestion des biens
│   ├── navigation/        # Configuration de la navigation
│   │   ├── RootNavigator.tsx    # Navigation principale
│   │   ├── AppStack.tsx         # Stack authentifié
│   │   ├── AuthStack.tsx        # Stack non-authentifié
│   │   ├── TenantTabs.tsx       # Onglets Locataire
│   │   └── OwnerTabs.tsx        # Onglets Propriétaire
│   ├── shared/           # Composants réutilisables
│   ├── utils/            # Utilitaires (Supabase client)
│   └── types.ts          # Types TypeScript
├── App.tsx               # Point d'entrée
└── package.json
```

## 🐛 Problèmes Résolus

- ✅ Écran blanc au démarrage (configuration `.env` manquante)
- ✅ Écran blanc après connexion (QueryClientProvider manquant)
- ✅ Navigation unique pour tous les rôles (séparation des espaces)

## 📝 Prochaines Étapes

- [ ] Système d'abonnements (Starter, Pro, Agency)
- [ ] Intégration des paiements (Orange Money, MTN MoMo)
- [ ] Notifications push
- [ ] Déblocage des coordonnées des locataires
- [ ] Lead scoring automatique

## 📄 Licence

Projet privé - LOUMA SaaS
