# Guide d'Utilisation des Commandes LOUMA

## 🚀 Comment Démarrer le Projet

### Étape 1: Installation des dépendances

Ouvrez votre terminal dans le dossier principal du projet (`louma-app/`) :

```bash
# Commande pour installer TOUTES les dépendances
npm run install:all
```

**Ce que fait cette commande :**
- Installe les dépendances du dossier racine
- Puis va dans `frontend/` et installe les dépendances React Native
- Enfin va dans `backend/` et installe les dépendances Express

### Étape 2: Démarrer le Backend

Dans le même terminal, ou un nouveau terminal :

```bash
# Option 1: Depuis la racine
npm run dev:backend

# Option 2: En allant directement dans le dossier backend
cd backend
npm run dev
```

**Résultat attendu :**
```
express server serving on port 5000
```

### Étape 3: Démarrer le Frontend

Ouvrez un **NOUVEAU TERMINAL** (gardez le backend qui tourne) :

```bash
# Option 1: Depuis la racine
npm run dev:frontend

# Option 2: En allant directement dans le dossier frontend
cd frontend
npm run expo:dev
```

**Résultat attendu :**
```
Metro waiting on exp://192.168.x.x:8081
```

## 🎯 Commande la Plus Simple

Si vous voulez tout démarrer d'un coup :

```bash
npm run dev:all
```

**Attention :** Cette commande démarre frontend ET backend dans le même terminal. Pour arrêter, utilisez `Ctrl + C`.

## 📱 Accéder à l'Application

### Sur Mobile
1. Installez l'app **Expo Go** sur votre téléphone
2. Scannez le QR code qui apparaît dans le terminal
3. L'application se chargera automatiquement

### Sur Web
1. Ouvrez votre navigateur
2. Allez à l'adresse affichée (généralement `http://localhost:8081`)

## 🔧 Gestion de la Base de Données

### Synchroniser le schéma
```bash
npm run db:push
```
**Quand l'utiliser ?** Après avoir modifié les fichiers de schéma dans `shared/schema.ts`

### Ouvrir Drizzle Studio
```bash
npm run db:studio
```
**À quoi ça sert ?** Interface web pour voir et modifier votre base de données

## 🏗️ Build pour Production

### Build Frontend
```bash
npm run build:frontend
```

### Build Backend
```bash
npm run build:backend
```

### Build Complet
```bash
npm run build:all
```

## 🗄️ Base de Données - Guide Complet

### 📋 Étape 1: Installer PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install postgresql postgresql-contrib

# macOS avec Homebrew
brew install postgresql && brew services start postgresql

# Vérifier l'installation
psql --version
```

### 📋 Étape 2: Créer la Base de Données
```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base et l'utilisateur
CREATE DATABASE louma_db;
CREATE USER louma_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE louma_db TO louma_user;

# Quitter
\q
```

### 📋 Étape 3: Configurer les Variables
```bash
cd backend
cp .env.example .env
nano .env  # Éditer avec vos informations
```

**Contenu du .env :**
```env
DATABASE_URL=postgresql://louma_user:votre_mot_de_passe@localhost:5432/louma_db
NODE_ENV=development
PORT=5000
JWT_SECRET=votre-secret-securise
```

### 📋 Étape 4: Initialiser la Base de Données
```bash
npm run db:push  # Créer les tables
```

### 📋 Étape 5: Démarrer le Backend
```bash
npm run dev
```

> 📖 **Guide détaillé** : Voir `docs/SETUP_DATABASE.md` pour le dépannage complet

## 📋 Résumé des Commandes Essentielles

| Commande | Usage | Description |
|----------|------|-------------|
| `npm run install:all` | Une fois au début | Installe toutes les dépendances |
| `npm run dev:backend` | Pour développer | Démarre le serveur backend |
| `npm run dev:frontend` | Pour développer | Démarre l'application mobile |
| `npm run dev:all` | Pour développer | Démarre les deux en même temps |
| `npm run db:push` | Quand vous modifiez la BDD | Synchronise la base de données |

## 🚨 Problèmes Courants

### "Command not found: npm"
**Solution :** Installez Node.js depuis [nodejs.org](https://nodejs.org)

### "Port 5000 déjà utilisé"
**Solution :** Arrêtez l'autre processus ou changez le port dans `backend/server/index.ts`

### "Expo ne se connecte pas"
**Solution :** Vérifiez que votre téléphone et ordinateur sont sur le même réseau WiFi

## 💡 Conseils

1. **Gardez 2 terminaux ouverts** : un pour le backend, un pour le frontend
2. **Le backend doit tourner en premier** avant de lancer le frontend
3. **Sauvegardez souvent** votre travail
4. **Utilisez `npm run db:push`** après chaque modification de schéma

---

## 🆘 Besoin d'Aide ?

Si vous avez des questions :
1. Vérifiez que vous êtes dans le bon dossier (`louma-app/`)
2. Assurez-vous que Node.js est installé (`node --version`)
3. Regardez les messages d'erreur dans le terminal
