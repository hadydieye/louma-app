# LOUMA - Plateforme Immobilière Guinéenne

## 📋 Vue d'ensemble

**LOUMA** est une application mobile React Native (Expo SDK 54) pour le marché immobilier guinéen, permettant la mise en relation entre locataires et propriétaires/agences immobilières.

**Architecture**: Monorepo séparé en `frontend/` et `backend/` pour une meilleure scalabilité et maintenabilité.

## 🏗️ Structure du Projet

```
louma-app/
├── frontend/           # 📱 Application React Native/Expo
├── backend/            # 🖥️ API REST Express/TypeScript  
├── shared/             # 📚 Types et schémas communs
├── docs/               # 📖 Documentation et roadmap
└── README.md           # 📋 Ce fichier
```

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- PostgreSQL
- Expo CLI

### Installation
```bash
# Installer les dépendances
npm run install:all

# Démarrer le backend
cd backend && npm run dev

# Démarrer le frontend (nouveau terminal)
cd frontend && npm run expo:dev
```

### Scripts Disponibles
```bash
npm run install:all    # Installer toutes les dépendances
npm run dev:all        # Démarrer frontend + backend
npm run dev:frontend   # Démarrer uniquement le frontend
npm run dev:backend    # Démarrer uniquement le backend
npm run build:all      # Build frontend + backend
npm run test:all       # Tests frontend + backend
npm run db:push        # Synchroniser la base de données
```

> 📖 **Guide complet** : Voir `docs/UTILISATION.md` pour des instructions détaillées étape par étape

## 📱 Application Mobile (Frontend)

### Écrans Implémentés
1. **Accueil** (`app/(tabs)/index.tsx`)
   - Hero section avec recherche
   - Catégories de biens
   - Biens populaires (scroll horizontal)
   - Biens près de vous (liste verticale)

2. **Recherche** (`app/(tabs)/search.tsx`)
   - Barre de recherche avec filtrage temps réel
   - Compteur de résultats
   - Filtres actifs supprimables

3. **Favoris** (`app/(tabs)/favorites.tsx`)
   - Liste des biens sauvegardés
   - Persistance AsyncStorage

4. **Profil** (`app/(tabs)/profile.tsx`)
   - Informations utilisateur
   - Score de qualification
   - Menu navigation

5. **Détail Propriété** (`app/property/[id].tsx`)
   - Carousel d'images
   - Informations complètes
   - Calculateur de coût total
   - Équipements et restrictions

6. **Filtres** (`app/filters.tsx`)
   - Modal complet avec critères spécifiques Guinée
   - Multi-sélection communes
   - Critères locaux (eau, électricité, accès pluies)

7. **Onboarding** (`app/onboarding.tsx`)
   - 3 slides animés
   - Persistance état

### Design System
- **Thème**: Light/Dark automatique
- **Palette**: Fond chaud `#F5F5F0` / `#0D0D0D`, accent lime `#B8F53A`
- **Style**: Glassmorphism avec BlurView
- **Police**: Inter (Google Fonts)
- **Icônes**: @expo/vector-icons
- **Spacing**: Base 8px systématique

## 🖥️ Serveur Backend

### Architecture Express
- **CORS**: Configuré pour Replit et localhost
- **Logging**: Requests API avec durée et réponse
- **Static files**: Assets et build Expo
- **Error handling**: Middleware centralisé
- **Landing page**: Template HTML dynamique

### Base de Données
- **Schema**: Table `users` basique (id, username, password)
- **ORM**: Drizzle avec PostgreSQL
- **Migrations**: Dossier `./migrations`

## 🌍 Spécificités Guinéennes

### Localisation
- **Communes**: Ratoma, Matam, Kaloum, Matoto, Dixinn
- **Devises**: GNF (formatage avec espaces) et USD
- **Critères locaux**: 
  - Eau: SEEG fiable/intermittente, Puits, Citerne
  - Électricité: EDG fiable/intermittente, Groupe, Solaire
  - Accès saison des pluies
  - Groupe électrogène inclus

### Données
- **8 propriétés d'exemple** dans `lib/sample-data.ts`
- **Images Unsplash** pour les démonstrations

## 🔧 Configuration & Déploiement

### Scripts Disponibles
```json
{
  "expo:dev": "Développement Expo avec proxy Replit",
  "server:dev": "Serveur Express en développement", 
  "db:push": "Migrations Drizzle",
  "expo:static:build": "Build Expo production",
  "server:prod": "Serveur Express production"
}
```

### Environnement
- **Replit**: Configuration proxy automatique
- **Expo**: New Architecture activée, React Compiler expérimental
- **TypeScript**: Routes typées activées

## 📊 État Actuel

### ✅ Fonctionnalités Implémentées
- Navigation complète (tabs, stack, modals)
- Système de filtres avancé
- Gestion des favoris
- Design system complet
- Onboarding utilisateur
- Calculateur de coût
- Support multi-devises

### 🔄 MVP Frontend Terminé
- Interface utilisateur complète
- Données locales fonctionnelles
- Navigation fluide
- Design moderne glassmorphism

### ⏳ Prochaines Étapes
- Intégration API backend
- Authentification utilisateurs
- Gestion des propriétés CRUD
- Notifications push
- Cartes interactives
- Messagerie intégrée

## 🎯 Points Forts

1. **Architecture solide**: Séparation claire frontend/backend
2. **Design moderne**: Glassmorphism et thème light/dark
3. **Localisation**: Adaptation spécifique marché guinéen
4. **Performance**: React Query, new architecture Expo
5. **Type Safety**: TypeScript strict partout
6. **UX optimisée**: Navigation native, animations fluides

## 📈 Potentiel d'Évolution

Le projet est bien structuré pour évoluer vers une plateforme complète avec:
- Gestion des annonces
- Paiements intégrés
- Vérification documents
- Matching intelligent
- Analytics avancés

**Statut**: MVP front-end fonctionnel, prêt pour intégration backend complète.
