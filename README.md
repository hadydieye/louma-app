# LOUMA - Plateforme Immobilière Guinéenne

## 📋 Vue d'ensemble

**LOUMA** est une application mobile React Native (Expo SDK 54) pour le marché immobilier guinéen, permettant la mise en relation entre locataires et propriétaires/agences immobilières. Le projet utilise une architecture moderne avec un frontend React Native robuste et une intégration directe avec **Supabase** pour l'authentification, la base de données PostgreSQL et le stockage média.

## 🏗️ Architecture Technique

LOUMA repose sur une séparation claire des responsabilités :

- **Frontend** : React Native/Expo avec `expo-router`. Gestion d'état via React Context et TanStack Query.
- **Backend (BaaS)** : Intégration complète **Supabase** (Auth, Database, Storage).
- **Base de Données** : PostgreSQL avec RLS (Row Level Security) activé sur toutes les tables.
- **Stockage** : Supabase Storage pour les photos de biens, avatars et documents.

## 📸 Gestion des Médias (Nouveau)

Le système d'upload d'images a été entièrement refondu pour être robuste et hybride.

### Fonctionnalités Clés
- **Support Hybride** : Fonctionne parfaitement sur **Web** (via Blobs) et **Mobile** (via `expo-file-system`).
- **Upload Centralisé** : Logique unique dans `propertyService.ts` pour garantir la cohérence des chemins (`properties/userId/filename`).
- **Fiabilité** : Gestion d'erreurs par image lors de l'ajout multiple de photos pour un bien.
- **Optimisation** : Pas de conversion Base64 inutile sur le Web, réduisant la consommation mémoire.

### ⚙️ Configuration du Stockage (SQL)
Pour activer l'upload, exécutez ce SQL dans votre console Supabase :
```sql
-- Créer le bucket public
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true) ON CONFLICT (id) DO NOTHING;

-- Politiques RLS
CREATE POLICY "Images publiques" ON storage.objects FOR SELECT TO public USING (bucket_id = 'property-images');
CREATE POLICY "Upload authentifié" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images');
CREATE POLICY "Suppression propriétaire" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'property-images' AND (storage.foldername(name))[1] = 'properties');
```

## 🎨 Système de Thèmes (Nouveau)

L'application propose désormais une gestion de thèmes avancée et persistante.

- **Modes** : Clair (Light), Sombre (Dark) et Automatique (Système).
- **Contrôle utilisateur** : Sélecteur dédié dans l'écran de profil.
- **Persistance** : Le choix de l'utilisateur est sauvegardé localement via `AsyncStorage`.
- **UI Cohérente** : Intégration de `StatusBar` dynamique et `BlurView` adaptatif.

## 🔐 Système d'Authentification

Conçu pour la sécurité et le contexte local guinéen.
- **Authentification par email** : Identifiant principal.
- **Rôles** : `TENANT` (Locataire), `OWNER` (Propriétaire) et `AGENCY` (Agence).
- **Score de Complétion** : Profil évolutif (25% à 100%) selon les infos fournies.

## 🏠 Gestion des Propriétés & Leads

- **Filtres Guinéens** : Critères spécifiques (SEEG fiable, EDG fiable, accès saison des pluies).
- **Dashboard Propriétaire (Nouveau)** : Les propriétaires peuvent désormais gérer leurs prospects directement depuis l'application :
    - **Contact Rapide** : Boutons directs pour appeler ou envoyer un message **WhatsApp** pré-rempli au locataire.
    - **Gestion du Cycle de Vie** : Mise à jour du statut (`Nouveau`, `Contacté`, `Visité`, `Clos`) en un clic.
- **Badge de Vérification Dynamique** : Le badge "✓ Vérifié" s'affiche automatiquement sur les annonces si le propriétaire a complété son score KYC à **100%**.

## 🔔 Notifications & Temps Réel

- **Push Notifications** : L'application enregistre automatiquement les tokens de notification (EAS) dans Supabase pour permettre l'envoi d'alertes en temps réel (ex: nouvelle demande reçue).
- **Temps Réel** : Les changements de statut sont immédiatement répercutés grâce à TanStack Query et Supabase.

## 📊 État Actuel du Projet

### ✅ Phase 1 : Infrastructure & Auth - 100% Terminé
- [x] Schéma PostgreSQL avec RLS complet.
- [x] Intégration Supabase Auth.
- [x] Système de thèmes manuel et automatique.

### ✅ Phase 2 : Médias & Profils - 100% Terminé
- [x] Système d'upload d'images hybride (Web/Mobile).
- [x] Gestion des avatars et photos de biens.
- [x] Profil utilisateur avec score de complétion automatique (Trigger SQL).

### ✅ Phase 3 : Fonctionnalités Avancées - 100% Terminé
- [x] Système de vérification de documents (KYC).
- [x] Dashboard Propriétaire avec actions de contact (WhatsApp/Appel).
- [x] Synchronisation des Push Tokens.

---
**Statut**: Application fonctionnelle à 100% (Prête pour déploiement et tests utilisateurs).

#### Prérequis
- Node.js 18+
- Compte Supabase (ou instance locale)
- Expo CLI

#### Installation & Lancement
```bash
# Installer les dépendances
npm install
cd frontend && npm install

# Lancer l'application
npx expo start
```

---
**Statut**: Application fonctionnelle à 98% (Prête pour déploiement de test).
