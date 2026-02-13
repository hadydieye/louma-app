# 📄 Cahier des Charges Fonctionnel et Technique
## 📌 LOUMA — Plateforme SaaS de génération de leads immobiliers en Guinée

---

## 1️⃣ Introduction

**LOUMA** est une plateforme mobile destinée au marché immobilier guinéen. Elle connecte les professionnels de l'immobilier (agences, propriétaires multi-biens) avec des locataires sérieux. L'objectif est de structurer un marché informel en fournissant des leads qualifiés et des outils de gestion.

Ce n'est pas une simple marketplace. **LOUMA est un SaaS B2B** dont l'unité de valeur est le **lead qualifié**.

---

## 2️⃣ Contexte & Problème

- **Problème :** Marché immobilier guinéen informel, fragmenté (Facebook/bouche-à-oreille), inefficace.
- **Souffrance :** Professionnels submergés d'appels inutiles, perte de temps, absence d'outils de suivi.
- **Solution :** Centralisation des offres et qualification systématique des demandes.

---

## 3️⃣ Vision & Positionnement

- **Proposition de valeur :** Offrir aux professionnels un outil simple pour publier des biens, recevoir des demandes structurées et gérer leurs prospects, **gagnant du temps et professionnalisant leur activité**.
- **Cible principale :** Agences immobilières et propriétaires (3+ biens) à Conakry et villes principales, utilisateurs Android de niveau technique bas à intermédiaire.

---

## 4️⃣ Scope Fonctionnel 🧩

### 4.1 Authentification & Gestion des Utilisateurs

- **Méthodes de connexion :**
  - **Email + Mot de passe** (avec validation stricte)
  - **Google Sign-In** (connexion rapide et fiable)
  - *(Le téléphone/OTP est retiré comme demandé)*

- **Rôles utilisateurs :**
  - `Locataire` : Recherche et envoie des demandes
  - `Propriétaire` : Gère ses propres biens
  - `Agence` : Gère les biens de l'agence
  - `Admin` : Super-utilisateur pour la gestion plateforme

- **Sécurité :** JWT (JSON Web Tokens) avec refresh token pour gérer les sessions

### 4.2 Module Principal : Le Parcours du Lead

🎯 **Unité de valeur centrale.**

#### Côté Locataire :
1. Consultation d'une annonce
2. Soumission d'un **formulaire structuré** :
   - Budget (GNF)
   - Commune souhaitée
   - Type de logement
   - Situation professionnelle (optionnel mais recommandé)
   - Durée souhaitée
3. **Traitement :** Vérification du compte, validation des champs, création du `lead` en base de données
4. **Résultat :** Lead envoyé au propriétaire, notification push et in-app

#### Côté Professionnel (Propriétaire/Agence) :
1. Publication d'un bien (photos, description, loyer, caution)
2. Réception des leads dans un tableau de bord dédié
3. Consultation du profil du locataire (sans informations de contact privées)
4. **Déblocage des coordonnées** (téléphone, email) du locataire **uniquement si l'abonnement est valide** (lead qualifié et payant)
5. Contact via WhatsApp ou appel

### 4.3 Tableau de Bord B2B (Dashboard)

- Vue d'ensemble :
  - Nombre de biens actifs
  - Nombre de leads reçus (avec distinction nouveaux / contactés / convertis)
- Actions rapides : Ajouter un bien, voir les derniers leads, gérer son abonnement

### 4.4 Système de Paiement 💰

- **Modèle :** Abonnement mensuel en GNF
- **Plans :**
  - **Starter :** 3 biens max, 10 leads/mois
  - **Pro :** 10 biens max, 50 leads/mois
  - **Agency :** Biens illimités, leads illimités, visibilité prioritaire
- **Moyens de paiement :** Intégration API Orange Money et MTN MoMo (via un service intermédiaire comme Cineteck ou équivalent). Stripe envisagé pour le long terme

### 4.5 Notifications

- **Push :** Alerte d'un nouveau lead, rappel de fin d'abonnement
- **In-app :** Notification dans l'application (badge, centre de notification)
- **Email :** Confirmation d'inscription, reçu de paiement, relance abonnement

### 4.6 Paramètres utilisateur

- Gestion du profil, changement de mot de passe
- Suppression de compte
- Conditions générales d'utilisation et politique de confidentialité

---

## 5️⃣ Architecture Technique 🏗

### Structure du Projet

```
louma-saas/
├── frontend/          # Application mobile React Native
│   ├── src/
│   │   ├── features/  # Organisation par fonctionnalités
│   │   │   ├── auth/
│   │   │   ├── properties/
│   │   │   ├── leads/
│   │   │   └── subscriptions/
│   │   ├── shared/    # Composants réutilisables
│   │   ├── utils/     # Utilitaires
│   │   └── App.tsx
│   ├── package.json
│   └── README.md
└── backend/           # API et logique métier (Supabase)
    ├── supabase/
    │   ├── functions/   # Edge Functions
    │   ├── migrations/  # Schéma de la base de données
    │   └── seeds/       # Données de test
    ├── config.toml
    └── README.md
```

### 5.1 Frontend (Dossier `/frontend`)

- **Technologie :** **React Native (Expo)**
  - *Pourquoi ?* Meilleur écosystème JavaScript/TypeScript, compatible avec Supabase, large communauté. Priorité Android, mais architecture extensible à iOS.

- **Stack technique :**
  - **Language :** TypeScript
  - **Navigation :** React Navigation (Stack, Bottom Tabs)
  - **State Management :** Zustand (état global) + TanStack Query (cache API)
  - **UI :** NativeWind (TailwindCSS pour React Native) ou React Native Paper
  - **Forms :** React Hook Form + Zod (validation)
  - **HTTP Client :** Supabase Client SDK

### 5.2 Backend (Dossier `/backend`)

- **Technologie :** **Supabase**
  - *Pourquoi ?* PostgreSQL robuste, authentification prête à l'emploi (Email, Google), stockage d'images, Edge Functions.

- **Configuration :**
  - **Base de données :** PostgreSQL avec Row Level Security (RLS)
  - **Auth :** Supabase Auth (Email/Google)
  - **Storage :** Pour les images des biens
  - **Edge Functions :** Logique métier sensible (paiements, webhooks)

### 5.3 Base de Données (PostgreSQL)

```sql
-- Tables principales

-- Users (étend la table auth.users de Supabase)
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('locataire', 'proprietaire', 'agence', 'admin')),
  avatar_url TEXT,
  city TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) NOT NULL,
  type TEXT NOT NULL,
  city TEXT NOT NULL,
  commune TEXT NOT NULL,
  price_gnf BIGINT NOT NULL,
  deposit BIGINT,
  description TEXT,
  status TEXT DEFAULT 'active',
  images_url TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) NOT NULL,
  tenant_id UUID REFERENCES users(id) NOT NULL,
  budget_gnf BIGINT NOT NULL,
  status TEXT DEFAULT 'new',
  professional_status TEXT,
  desired_duration TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('starter', 'pro', 'agency')),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  amount_gnf BIGINT NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('orange_money', 'mtn_momo', 'stripe')),
  status TEXT DEFAULT 'pending',
  reference TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6️⃣ Sécurité 🔐

- Authentification via Supabase Auth (gère les hash, JWT)
- **Row Level Security (RLS)** dans PostgreSQL : isolation des données par utilisateur
- Validation stricte des inputs (frontend + backend)
- Rate limiting sur les endpoints critiques
- Headers CORS configurés
- Sauvegardes automatiques quotidiennes
- HTTPS en production

---

## 7️⃣ UX/UI 🎨

- **Identité :** Design sobre et professionnel (bleu profond #1e3a8a, vert #10b981, blanc)
- **Typographie :** Inter ou Roboto (lisibilité optimale)
- **Composants :** Design system cohérent
- **Optimisation réseau :** Images compressées, skeletons, offline first
- **Support :** Français (principal), possibilité d'ajouter anglais/soussou/poular plus tard

---

## 8️⃣ Modèle Économique 💰

- **SaaS B2B** : Revenus basés sur les abonnements mensuels des professionnels
- **Freemium :** Compte "Locataire" gratuit, compte "Professionnel" avec période d'essai (14 jours)
- **Coûts opérationnels :**
  - Hébergement Supabase (Pro)
  - Stockage images
  - Notifications push
  - Frais de transaction mobile money (~1-2%)

---

## 9️⃣ Performance & Scalabilité ⚡

- **Objectif :** Support de 5000 utilisateurs actifs en année 1
- **Temps de réponse API :** < 500ms
- **Optimisations :**
  - Images via CDN Supabase
  - Pagination (flat lists)
  - Mise en cache React Query
  - Indexation SQL optimisée
  - Lazy loading des composants

---

## 🔟 Roadmap 🗺

### Phase 1 – MVP (Mois 1-2)
- [x] Authentification (Email/Google)
- [x] Publication de biens
- [x] Formulaire de lead
- [x] Dashboard professionnel basique
- [x] Profils utilisateurs

### Phase 2 – Monétisation (Mois 3-4)
- [ ] Intégration Orange Money/MTN MoMo
- [ ] Système d'abonnements
- [ ] Déblocage des contacts
- [ ] Notifications push
- [ ] Statistiques basiques

### Phase 3 – Scale & Optimisation (Mois 5-6)
- [ ] Lead scoring automatique
- [ ] Matching intelligent
- [ ] Analytics avancés (taux conversion, LTV)
- [ ] Version web (PWA)
- [ ] Internationalisation

---

## 📊 KPIs & Analytics

- Taux de conversion lead → contact
- Nombre moyen de leads par bien/mois
- Taux de rénovation des abonnements
- LTV (Life Time Value) par client
- Rétention B2B à 3/6/12 mois
- Temps moyen de réponse aux leads

---

## 🛠 Maintenance & Support

- Monitoring : Sentry (erreurs frontend), Supabase Logs
- Uptime : 99.5% minimum
- Sauvegardes : Quotidiennes, chiffrées
- Support : Email + WhatsApp Business (pour les pros)
- Mises à jour : Patches sécurité immédiats, releases mensuelles

---

## 📌 Conclusion stratégique

**LOUMA est un SaaS B2B immobilier spécialisé dans la génération de leads qualifiés en Guinée.**

Ce n'est pas :
- ❌ Une marketplace classique
- ❌ Une app communautaire
- ❌ Une simple vitrine

C'est :
- ✅ Un outil professionnel monétisable
- ✅ Orienté efficacité et revenus
- ✅ Adapté au marché local (paiements mobile, low bandwidth)
- ✅ Scalable techniquement (React Native + Supabase)

