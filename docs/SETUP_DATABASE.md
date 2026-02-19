# 🗄️ Guide Complet : Configuration Base de Données PostgreSQL

## 📋 Prérequis

### 1. PostgreSQL Installé
```bash
# Vérifier si PostgreSQL est installé
psql --version

# Si non installé (Ubuntu/Debian) :
sudo apt update
sudo apt install postgresql postgresql-contrib

# Si non installé (macOS avec Homebrew) :
brew install postgresql
brew services start postgresql
```

### 2. Créer la Base de Données
```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE louma_db;

# Créer l'utilisateur
CREATE USER louma_user WITH PASSWORD 'votre_mot_de_passe';

# Donner les droits à l'utilisateur
GRANT ALL PRIVILEGES ON DATABASE louma_db TO louma_user;

# Quitter PostgreSQL
\q
```

## 🔧 Configuration Variables d'Environnement

### 1. Créer le fichier .env
```bash
cd backend
cp .env.example .env
```

### 2. Éditer le fichier .env
```bash
nano .env
# OU avec VS Code
code .env
```

### 3. Contenu du fichier .env
```env
# Database Configuration
DATABASE_URL=postgresql://louma_user:votre_mot_de_passe@localhost:5432/louma_db

# Server Configuration
NODE_ENV=development
PORT=5000

# JWT Configuration
JWT_SECRET=votre-secret-jet-tres-securise-ici
JWT_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:3000
```

## 🚀 Démarrage

### 1. Pousser le Schéma
```bash
cd backend
npm run db:push
```

### 2. Démarrer le Serveur
```bash
npm run dev
```

## 🧪 Test de Connexion

### Vérifier la connexion
```bash
# Test direct avec psql
psql postgresql://louma_user:votre_mot_de_passe@localhost:5432/louma_db

# Vous devriez voir : louma_db=>
```

### Test avec l'API
```bash
# Dans un autre terminal
curl http://localhost:5000/api/properties

# Devrait retourner : {"success": true, "data": [], "pagination": {...}}
```

## 🚨 Dépannage

### Erreur : "FATAL: database 'louma_db' does not exist"
```bash
# Créer la base de données
sudo -u postgres createdb louma_db
```

### Erreur : "FATAL: password authentication failed for user 'louma_user'"
```bash
# Réinitialiser le mot de passe
sudo -u postgres psql
ALTER USER louma_user WITH PASSWORD 'nouveau_mot_de_passe';
```

### Erreur : "Connection refused"
```bash
# Vérifier si PostgreSQL tourne
sudo systemctl status postgresql

# Démarrer PostgreSQL
sudo systemctl start postgresql
```

### Erreur : "Permission denied"
```bash
# Donner les droits corrects
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE louma_db TO louma_user;
```

## 🐳 Alternative : Docker

Si vous préférez Docker :

### 1. docker-compose.yml
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: louma_db
      POSTGRES_USER: louma_user
      POSTGRES_PASSWORD: votre_mot_de_passe
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 2. Lancer Docker
```bash
docker-compose up -d
```

### 3. .env pour Docker
```env
DATABASE_URL=postgresql://louma_user:votre_mot_de_passe@localhost:5432/louma_db
```

## 📱 Vérification Finale

### 1. Démarrer le backend
```bash
cd backend
npm run dev
```

### 2. Tester l'API
```bash
# Liste des propriétés (vide au début)
curl http://localhost:5000/api/properties

# Créer une propriété
curl -X POST http://localhost:5000/api/properties \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Appartement test",
    "type": "Appartement",
    "commune": "Ratoma",
    "quartier": "Almamya",
    "bedrooms": 2,
    "bathrooms": 1,
    "priceGNF": 2500000,
    "description": "Superbe appartement..."
  }'
```

## ✅ Checklist Finale

- [ ] PostgreSQL installé et démarré
- [ ] Base de données `louma_db` créée
- [ ] Utilisateur `louma_user` créé avec mot de passe
- [ ] Droits accordés à l'utilisateur
- [ ] Fichier `.env` créé avec la bonne URL
- [ ] `npm run db:push` exécuté avec succès
- [ ] Backend démarré sans erreur
- [ ] API répond sur `http://localhost:5000`

Une fois tout coché, votre backend sera 100% fonctionnel ! 🎉
