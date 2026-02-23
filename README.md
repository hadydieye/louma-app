# LOUMA - Plateforme Immobilière Guinéenne

## 📋 Vue d'ensemble

**LOUMA** est une application mobile React Native (Expo SDK 54) pour le marché immobilier guinéen, permettant la mise en relation entre locataires et propriétaires/agences immobilières. Le projet utilise une architecture moderne monorepo avec un backend TypeScript robuste et une base de données PostgreSQL optimisée.

## 🏗️ Architecture Technique

LOUMA repose sur une séparation claire des responsabilités :

- **Frontend** : React Native/Expo avec `expo-router`. Gestion d'état via React Context et persistance via `AsyncStorage`.
- **Backend** : API REST Express/TypeScript structurée en services (`AuthService`, `PropertyService`, `LeadService`).
- **Base de Données** : PostgreSQL avec **Drizzle ORM**. Schéma de 8 tables avec relations complexes et indexation avancée.
- **Shared** : Schémas Zod et types TypeScript partagés entre le frontend et le backend.

## 🔐 Système d'Authentification

Le système d'authentification a été conçu pour être sécurisé et adapté au contexte local.

### Fonctionnalités Clés
- **Authentification par numéro**: Utilisation du numéro de téléphone comme identifiant principal (format Guinéen `+224` validé via Zod).
- **Sécurité**: Mots de passe hashés avec **Bcrypt** (12 salt rounds).
- **Tokens**: Système de double token (**JWT Access Token** + **Refresh Token**) pour une session sécurisée et fluide.
- **Rôles**: Gestion fine des permissions pour 3 types d'utilisateurs : `TENANT` (Locataire), `OWNER` (Propriétaire) et `AGENCY` (Agence).
- **Score de Complétion**: Un profil évolue de 25% à 100% selon les informations fournies (email, avatar, budget, household size), encourageant la confiance.

### Flux de Réinitialisation
- Système de réinitialisation de mot de passe via token sécurisé.

## 🏠 Gestion des Propriétés & Leads

### Propriétés
- **Filtres Avancés**: Recherche par commune (Ratoma, Matam, etc.), type de bien, prix, et critères spécifiques guinéens (SEEG, EDG, accès saison des pluies).
- **Services Locaux**: Distinction entre eau SEEG, puits ou citerne ; électricité EDG, groupe ou solaire.

### Système de Leads
- **Mise en relation**: Les locataires peuvent soumettre des demandes ("Leads") directement sur une propriété.
- **Cycle de vie**: Gestion du statut du prospect par le propriétaire : `NEW` -> `CONTACTED` -> `VISITED` -> `CLOSED`.
- **Tracking**: Suivi des niveaux de qualification (`COLD`, `WARM`, `HOT`, `VERIFIED`).

## 📊 État Actuel du Projet

### ✅ Phase 1 : Infrastructure & Auth - 100% Terminé
- [x] Schéma PostgreSQL de 8 tables (users, properties, images, favorites, leads, visits, reviews, property_images).
- [x] AuthService complet avec JWT & Refresh Tokens.
- [x] Middlewares de protection des routes.
- [x] Validation Zod stricte sur tous les points d'entrée.

### ✅ Phase 2 : API & Business Logic - 100% Terminé
- [x] PropertyService : Recherche full-text, filtres complexes, CRUD complet.
- [x] LeadService : Gestion des interactions locataires/propriétaires.
- [x] Intégration frontend complète pour la navigation, la recherche et le profil.

### 🔄 Phase 3 : Profils Avancés & Médias - En cours
- [/] Mise à jour des profils utilisateurs et scores de complétion.
- [ ] Intégration réelle du stockage d'images (actuellement images Unsplash).
- [ ] Système de vérification de documents (KYC).
- [ ] Notifications Push.

## 🚀 Démarrage Rapide

### 🚀 Démarrage Rapide

#### Prérequis
- Node.js 18+
- PostgreSQL
- Expo CLI

#### Installation & Lancement
Si vous êtes débutant, suivez notre **[Guide du Débutant](docs/GUIDE_DEBUTANT.md)**.

```bash
# Installer les dépendances
npm run install:all

# Configurer les .env (voir .env.example dans backend/ et frontend/)

# Démarrer le projet complet (Backend + Frontend)
npm run dev:all
```

#### Scripts Principaux
- `npm run dev:all` : Frontend + Backend en simultané
- `npm run db:push` : Synchronisation de la base de données
- `npm run db:studio` : Interface visuelle pour la base de données

---
**Statut**: Backend 95% (Prêt pour test, manque upload média réel) - Frontend 95% (Prêt pour test) - Documentation 100%.
