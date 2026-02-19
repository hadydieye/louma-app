# LOUMA Frontend

Application mobile React Native (Expo) pour la plateforme immobilière guinéenne.

## 📱 Technologies

- **React Native 0.81.5** avec Expo SDK 54
- **TypeScript** pour la type safety
- **Expo Router** pour la navigation (file-based)
- **TanStack React Query** pour la gestion des requêtes API
- **Zod** pour la validation des données
- **AsyncStorage** pour le stockage local

## 🚀 Démarrage

### Installation
```bash
npm install
```

### Développement
```bash
npm run expo:dev    # Développement avec proxy Replit
npm start          # Développement local
```

### Build
```bash
npm run expo:start:static:build  # Build statique
npm run expo:static:build        # Build production
```

### Linting
```bash
npm run lint       # Vérifier le code
npm run lint:fix    # Corriger automatiquement
```

## 📱 Écrans

1. **Accueil** - Hero, catégories, biens populaires
2. **Recherche** - Barre de recherche, filtres, résultats
3. **Favoris** - Biens sauvegardés
4. **Profil** - Informations utilisateur, menu
5. **Détail Propriété** - Informations complètes, calculateur
6. **Filtres** - Modal avec critères guinéens
7. **Onboarding** - 3 slides d'introduction

## 🎨 Design System

- **Thème**: Light/Dark automatique
- **Palette**: Fond `#F5F5F0`/`#0D0D0D`, accent `#B8F53A`
- **Style**: Glassmorphism avec BlurView
- **Police**: Inter
- **Icônes**: @expo/vector-icons

## 🌍 Spécificités Guinéennes

- Communes: Ratoma, Matam, Kaloum, Matoto, Dixinn
- Devises: GNF et USD
- Critères: Eau SEEG, Électricité EDG, accès pluies

## 📂 Structure

```
frontend/
├── app/              # Écrans et navigation
├── components/       # Composants réutilisables
├── lib/             # Utilitaires et types
├── constants/       # Couleurs et design system
└── assets/          # Images et ressources
```
