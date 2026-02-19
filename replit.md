# LOUMA - Plateforme Immobilière Guinéenne

## Overview
LOUMA est une application mobile React Native (Expo SDK 54) pour le marché immobilier guinéen. Plateforme de mise en relation entre locataires et propriétaires/agences immobilières.

**État actuel** : MVP front-end avec données locales (AsyncStorage). Le back-end Express sert une landing page et les API seront ajoutées ultérieurement.

## Architecture

### Stack
- **Frontend** : React Native + Expo Router (file-based routing) + TypeScript
- **Backend** : Express + TypeScript (port 5000)
- **State** : React Context (`AppProvider`) + AsyncStorage pour la persistance locale
- **Données** : Données d'exemple dans `lib/sample-data.ts` (8 propriétés)
- **Styling** : StyleSheet natif, pas de NativeWind
- **Fonts** : Inter (via @expo-google-fonts/inter)
- **Icons** : @expo/vector-icons (Ionicons, MaterialCommunityIcons, Feather)

### Structure des fichiers
```
app/
  _layout.tsx              # Root layout (providers, fonts, Stack navigator)
  (tabs)/
    _layout.tsx            # Tab navigator (4 tabs, liquid glass iOS 26+)
    index.tsx              # Accueil - hero, catégories, populaires, proches
    search.tsx             # Recherche - barre de recherche, liste filtrée
    favorites.tsx          # Favoris - biens sauvegardés
    profile.tsx            # Profil - infos utilisateur, score, menu
  property/
    [id].tsx               # Détail propriété - images, prix, équipements, CTA
  filters.tsx              # Modal filtres (formSheet iOS / modal Android)
  onboarding.tsx           # Écran d'onboarding (3 slides)

components/
  PropertyCard.tsx         # Carte propriété (variante verticale + horizontale)
  FilterChip.tsx           # Pill filtres animé (actif/inactif)
  EquipmentIcon.tsx        # Icône équipement (eau, électricité, clim, etc.)
  FilterSheet.tsx          # Panneau de filtres complet
  OnboardingScreen.tsx     # 3 slides d'onboarding
  ErrorBoundary.tsx        # Error boundary (class component)
  ErrorFallback.tsx        # UI de fallback erreur

lib/
  types.ts                 # Types TypeScript (Property, UserProfile, FilterState, etc.)
  sample-data.ts           # 8 propriétés d'exemple avec images Unsplash
  store.ts                 # Context React + hook useApp()
  AppProvider.tsx           # Provider global (favoris, filtres, user, onboarding)
  useTheme.ts              # Hook thème (isDark, colors, spacing, borderRadius)
  query-client.ts          # TanStack React Query client

constants/
  colors.ts                # Design system : light/dark themes, spacing, borderRadius
```

### Design System
- **Palette** : Fond chaud `#F5F5F0` (light) / `#0D0D0D` (dark), accent lime `#B8F53A`
- **Glassmorphism** : Blur + bordures semi-transparentes sur cartes et modals
- **Spacing** : Base 8px (xs:4, sm:8, md:16, lg:24, xl:32, xxl:48)
- **Border radius** : sm:8, md:12, lg:16, xl:24, xxl:32, full:9999
- **Thème** : Support complet light/dark via `useColorScheme()`

### Navigation
- **Tabs** : 4 onglets (Accueil, Recherche, Favoris, Profil)
  - NativeTabs avec liquid glass sur iOS 26+
  - Classic Tabs avec BlurView sur iOS < 26 et Android
- **Stack** : Détail propriété (slide_from_right)
- **Modal** : Filtres (formSheet iOS / modal Android)
- **Full screen modal** : Onboarding

## Fonctionnalités implémentées

### Écran Accueil
- Header avec nom de l'app et bouton notifications
- Titre hero "Trouvez votre logement idéal"
- Barre de recherche (redirige vers l'onglet Recherche)
- Chips catégories horizontaux (Tous, Appartement, Villa, Studio, etc.)
- Section "Biens populaires" (scroll horizontal, cartes verticales)
- Section "Près de vous" (liste verticale, cartes horizontales)

### Recherche
- Barre de recherche avec filtre en temps réel
- Bouton filtres avec badge compteur
- Chips actifs des filtres (supprimables)
- Compteur de résultats
- Liste des propriétés filtrées
- État vide avec icône et message

### Filtres (Modal)
- Commune (Ratoma, Matam, Kaloum, Matoto, Dixinn) - chips multi-select
- Type de bien - chips horizontaux
- Chambres (1-5+) - chips
- Meublé (Meublé, Semi-meublé, Vide) - chips
- **Critères Guinée** : Eau fiable, Électricité fiable, Groupe électrogène, Accès pluies - toggles
- Biens vérifiés uniquement - toggle
- Disponible immédiatement - toggle
- Boutons Réinitialiser / Appliquer avec compteur

### Détail Propriété
- Hero image plein écran (42% hauteur) avec carousel swipeable
- Boutons glass (retour, favori, partager)
- Indicateurs de page (dots)
- Titre, localisation, badge vérifié
- Prix avec "/mois" et badges (charges incluses, négociable)
- Calculateur coût total (loyer + caution + avance)
- Grille détails (chambres, SdB, surface, meublé)
- Grille équipements (8 icônes : eau, électricité, groupe, clim, parking, sécurité, internet, eau chaude)
- Description (expandable "Lire plus")
- Restrictions (animaux, fumeurs, occupants max)
- Carte propriétaire
- Barre CTA sticky "Je suis intéressé(e)"

### Favoris
- Liste des biens sauvegardés
- État vide avec icône coeur
- Toggle favori depuis n'importe quelle carte
- Persistance AsyncStorage

### Profil
- Avatar avec initiales
- Infos utilisateur (nom, téléphone, rôle)
- Score de qualification avec barre de progression
- Menu de navigation (informations, documents, notifications, vérification, aide, à propos)
- Bouton déconnexion
- Version de l'app

### Onboarding
- 3 slides avec gradient sombre
- Icônes animées (maison, bouclier, poignée de main)
- Navigation (Passer, dots, bouton suivant/valider)
- Persistance AsyncStorage

## Données Guinea-spécifiques
- **Communes** : Ratoma, Matam, Kaloum, Matoto, Dixinn
- **Devises** : GNF (formatage avec espaces : 2 500 000 GNF) et USD
- **Eau** : SEEG fiable, SEEG intermittente, Puits, Citerne
- **Électricité** : EDG fiable, EDG intermittente, Groupe seul, Solaire
- **Filtres critiques** : Accès saison des pluies, groupe électrogène inclus

## Workflows
- `Start Backend` : `npm run server:dev` (Express, port 5000)
- `Start Frontend` : `npm run expo:dev` (Expo, port 8081)

## Préférences utilisateur
- Langue de l'app : Français
- Design : Glassmorphism avec accent lime green (#B8F53A)

## Recent Changes
- **2026-02-19** : MVP initial créé
  - Design system complet (light/dark, glassmorphism)
  - 4 écrans principaux (Accueil, Recherche, Favoris, Profil)
  - Détail propriété avec calculateur de coût
  - Système de filtres avec critères spécifiques Guinée
  - 8 propriétés d'exemple
  - Onboarding 3 slides
  - Icône et splash screen générés
