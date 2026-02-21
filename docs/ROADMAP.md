# 🗺️ LOUMA — Roadmap de Développement

> **Rappel Vision** : LOUMA est un SaaS B2B mobile ciblant le marché immobilier guinéen. Le produit connecte les propriétaires/agences à des locataires qualifiés via un système de leads structurés et des abonnements mensuels (Orange Money / MTN MoMo).

---

## ✅ Phase 0 — Fondations (Terminé)

**Objectif :** Poser les bases techniques solides du projet.

| Élément | Statut |
|---|---|
| Structure monorepo `frontend/` + `backend/` + `shared/` | ✅ |
| Serveur Express avec CORS, body parsing, logging | ✅ |
| ORM Drizzle + PostgreSQL (Supabase) connecté | ✅ |
| Landing page dynamique servie par le backend | ✅ |
| Application Expo/React Native initialisée | ✅ |
| Navigation par onglets (5 tabs) avec Expo Router | ✅ |
| Onboarding screen | ✅ |
| Composants UI clés : `PropertyCard`, `FilterSheet`, `FilterChip`, `OnboardingScreen`, `ErrorBoundary` | ✅ |
| Types TypeScript partagés (`Property`, `UserProfile`, `FilterState`, `Lead`, etc.) | ✅ |
| Filtres avancés : commune, type, prix, chambres, meublé, eau, électricité, générateur, pluie | ✅ |
| AsyncStorage pour favoris, onboarding et profil utilisateur | ✅ |
| Données de démo (`sample-data.ts`) pour développement UI | ✅ |

---

## ✅ Phase 1 — Backend API Complète (Terminé)

**Objectif :** Finaliser une API REST robuste et sécurisée, prête pour l'intégration frontend.

### 1.1 Authentification
- [x] Route `POST /api/auth/register` — inscription email/password
- [x] Route `POST /api/auth/login` — connexion + émission JWT
- [x] Route `GET /api/auth/me` — profil utilisateur (middleware JWT)
- [x] Service `authService.ts` — gestion JWT (bcrypt, refresh, reset)
- [x] Route `POST /api/auth/refresh` — rafraîchissement du token
- [x] Middleware `requireRole` + `requireOwnerOrAgency` (rôles)
- [x] **Mise à jour du profil** (Route `PATCH /api/auth/profile`)

### 1.2 Propriétés
- [x] Route `GET /api/properties` — liste paginée des propriétés actives
- [x] Route `GET /api/properties/:id` — détail d'une propriété
- [x] Route `POST /api/properties` — création (propriétaires/agences)
- [x] Route `PUT /api/properties/:id` — modification
- [x] Route `DELETE /api/properties/:id` — suppression / archivage
- [x] Service `propertyService.ts` — logique CRUD complète
- [x] Filtrage côté serveur (commune, type, prix, dispo)
- [x] Incrémentation `view_count` à chaque consultation

### 1.3 Leads (Demandes Locataires)
- [x] Route `POST /api/leads` — soumission d'un lead par un locataire
- [x] Route `GET /api/leads` — liste des leads reçus (propriétaires/agences)
- [x] Route `GET /api/leads/mine` — leads soumis par le locataire connecté
- [x] Route `GET /api/leads/:id` — détail d'un lead
- [x] Route `PATCH /api/leads/:id/status` — mise à jour de statut

### 1.4 Infrastructure Backend
- [x] Middleware de validation des entrées (Zod)
- [x] Gestion centralisée des erreurs (codes d'erreur standardisés)
- [x] Utilisation de `asyncHandler` pour tous les route handlers

---

## ✅ Phase 2 — Intégration Frontend ↔ Backend (Terminé)

**Objectif :** Remplacer les données de démo par les vraies APIs. Connecter l'état global de l'app aux endpoints réels.

### 2.1 Configuration du client API
- [x] Client HTTP `api.ts` avec `Authorization: Bearer <token>` auto
- [x] Intercepteur pour le refresh automatique du token
- [x] Gestion globale des erreurs réseau (`ApiError` class)
- [x] Branchement de React Query sur tous les endpoints

### 2.2 Authentification Frontend
- [x] `AuthContext` + `AuthProvider` (flux complet)
- [x] Protection des routes privées (redirect vers `/auth`)
- [x] Écran `app/auth.tsx` — Login + Register fonctionnel
- [x] **Édition du profil** — Formulaire complet avec recalcul du score

### 2.3 Propriétés & Recherche
- [x] Remplacement des données statiques par `useQuery`
- [x] Pagination infinie sur l'écran Home et Search
- [x] Recherche unifiée (titre, quartier, description) côté serveur
- [x] Écran Détail propriété dynamique

### 2.4 Leads
- [x] Modal de soumission de demande locataire (`LeadSubmissionModal`)
- [x] Écran "Mes Demandes" avec switch Envoyées / Reçues
- [x] **Vue détaillée d'un lead** avec toutes les infos locataire
- [x] **Gestion du statut** pour les propriétaires (Nouveau, Contacté, Visité, Clos)

---

## ⏳ Phase 3 — Paiements & Fonctionnalités Avancées

**Objectif :** Compléter le produit avec les features payantes et la monétisation.

### 3.1 Abonnements & Paywall
- [ ] Route `POST /api/subscriptions` — souscrire à un plan
- [ ] Intégration Orange Money & MTN MoMo (Guinea)
- [ ] Écran Abonnement avec détails des plans
- [ ] Paywall sur les contacts directs

### 3.2 Dashboard Pro (Agences / Propriétaires)
- [ ] Statistiques par propriété (vues, leads)
- [ ] Gestion multi-propriétés simplifiée

### 3.3 Notifications & Carte
- [ ] Notifications push (nouveau lead, expiration)
- [ ] Carte interactive des propriétés (`react-native-maps`)

---

## 📅 Timeline Mise à jour

| Phase | Statut |
|---|---|
| Phase 0 — Fondations | ✅ Terminé |
| Phase 1 — Backend API complète | ✅ Terminé |
| Phase 2 — Intégration Frontend | ✅ Terminé |
| Phase 3 — Paiements & Avancé | ⏳ À venir |

**Sprint actuel terminé : Intégration complète réussie.**

---

*Dernière mise à jour : Février 2026*
