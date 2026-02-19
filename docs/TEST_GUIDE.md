# 🧪 Guide Complet de Test - LOUMA Backend

## 🎯 État Actuel

✅ **Backend : 80% Terminé**
- PostgreSQL configuré et démarré
- Base de données `louma_db` créée
- Serveur Express sur port 5000
- Authentification JWT implémentée
- API Propriétés complète

## 🚀 Tests à Faire

### 1. Test du Serveur (Déjà ✅)
```bash
# Le backend tourne sur http://localhost:5000
curl http://localhost:5000
# Devrait retourner : "Express server listening on port 5000"
```

### 2. Test de l'API Propriétés

#### Lister les propriétés (vide au début)
```bash
curl -X GET http://localhost:5000/api/properties

# Réponse attendue :
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 0,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

#### Créer une propriété (nécessite authentification)
```bash
# D'abord créer un utilisateur
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Propriétaire",
    "phone": "+224 622 12 34 56",
    "password": "password123",
    "role": "OWNER"
  }'

# Récupérer le token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+224 622 12 34 56",
    "password": "password123"
  }' | jq -r '.data.token')

# Créer une propriété
curl -X POST http://localhost:5000/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Bel appartement à Ratoma",
    "type": "Appartement",
    "commune": "Ratoma",
    "quartier": "Almamya",
    "surfaceM2": 120,
    "totalRooms": 3,
    "bedrooms": 2,
    "bathrooms": 1,
    "furnished": "Meublé",
    "condition": "Bon état",
    "waterSupply": "SEEG fiable",
    "electricityType": "EDG fiable",
    "hasGenerator": false,
    "hasAC": true,
    "hasParking": true,
    "hasSecurity": true,
    "hasInternet": true,
    "hasHotWater": true,
    "accessibleInRain": true,
    "priceGNF": 2500000,
    "preferredCurrency": "GNF",
    "chargesIncluded": false,
    "depositMonths": 2,
    "advanceMonths": 1,
    "negotiable": true,
    "petsAllowed": false,
    "smokingAllowed": false,
    "maxOccupants": 4,
    "availableFrom": "2026-02-20",
    "minDurationMonths": 6,
    "isVerified": false,
    "description": "Superbe appartement moderne dans le quartier d'Almamya, proche de tous les commerces."
  }'
```

### 3. Test de l'Authentification

#### Inscription
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Mamadou Diallo",
    "phone": "+224 622 12 34 57",
    "password": "password123",
    "email": "mamadou@email.com",
    "role": "TENANT"
  }'

# Réponse attendue :
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-...",
      "fullName": "Mamadou Diallo",
      "phone": "+224622123457",
      "email": "mamadou@email.com",
      "role": "TENANT",
      "isActive": true,
      "isVerified": false,
      "completionPercent": 25
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Inscription réussie"
}
```

#### Connexion
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+224 622 12 34 57",
    "password": "password123"
  }'
```

#### Profil Utilisateur
```bash
# Récupérer le token depuis la connexion
TOKEN="votre_token_jwt"

curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Test des Filtres Avancés

#### Filtrer par commune
```bash
curl "http://localhost:5000/api/properties?commune=Ratoma&limit=5"
```

#### Filtrer par type et prix
```bash
curl "http://localhost:5000/api/properties?type=Appartement&minPrice=1000000&maxPrice=3000000"
```

#### Filtres Guinée spécifiques
```bash
curl "http://localhost:5000/api/properties?waterReliable=true&generatorIncluded=true&accessibleInRain=true"
```

#### Recherche texte
```bash
curl "http://localhost:5000/api/properties/search?q=appartement&limit=10"
```

## 📊 Vérification en Base de Données

### Vérifier les tables créées
```bash
# Se connecter à PostgreSQL
psql postgresql://louma_user:password123@localhost:5432/louma_db

# Lister les tables
\dt

# Voir les utilisateurs
SELECT id, fullName, phone, role, created_at FROM users;

# Voir les propriétés
SELECT id, title, type, commune, price_gnf FROM properties;

# Quitter
\q
```

### Compter les enregistrements
```sql
-- Nombre d'utilisateurs
SELECT COUNT(*) FROM users;

-- Nombre de propriétés
SELECT COUNT(*) FROM properties;

-- Propriétés par commune
SELECT commune, COUNT(*) FROM properties GROUP BY commune;
```

## 🧪 Script de Test Automatisé

Créez un fichier `test-api.sh` :
```bash
#!/bin/bash

echo "🧪 Test API LOUMA"
echo "=================="

# Configuration
API_URL="http://localhost:5000"

# Test 1: Serveur actif
echo "1. Test serveur..."
curl -s $API_URL > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Serveur actif"
else
  echo "❌ Serveur inaccessible"
  exit 1
fi

# Test 2: Inscription
echo "2. Test inscription..."
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "phone": "+224 622 12 34 99",
    "password": "password123",
    "role": "TENANT"
  }')

echo $REGISTER_RESPONSE | jq .

# Test 3: Connexion
echo "3. Test connexion..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+224 622 12 34 99",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"

# Test 4: Créer propriété
echo "4. Test création propriété..."
PROPERTY_RESPONSE=$(curl -s -X POST $API_URL/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Appartement test",
    "type": "Appartement",
    "commune": "Ratoma",
    "quartier": "Almamya",
    "bedrooms": 2,
    "bathrooms": 1,
    "priceGNF": 2000000,
    "description": "Description test"
  }')

echo $PROPERTY_RESPONSE | jq .

# Test 5: Lister propriétés
echo "5. Test liste propriétés..."
curl -s "$API_URL/api/properties" | jq .

echo "✅ Tests terminés !"
```

Rendez-le exécutable :
```bash
chmod +x test-api.sh
./test-api.sh
```

## 📱 Test avec Frontend

### Dans React Native/Expo

#### Installation d'Axios
```bash
cd frontend
npm install axios @react-native-async-storage/async-storage
```

#### Créer un service API
```javascript
// services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (phone, password) => {
    const response = await api.post('/auth/login', { phone, password });
    if (response.data.success) {
      await AsyncStorage.setItem('token', response.data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const propertyAPI = {
  getProperties: async (filters = {}) => {
    const response = await api.get('/properties', { params: filters });
    return response.data;
  },
  
  createProperty: async (propertyData) => {
    const response = await api.post('/properties', propertyData);
    return response.data;
  },
  
  searchProperties: async (query) => {
    const response = await api.get('/properties/search', { params: { q: query } });
    return response.data;
  },
};
```

## 🚨 Dépannage

### Erreurs Communes

#### "Cannot connect to database"
```bash
# Vérifier PostgreSQL
sudo systemctl status postgresql

# Vérifier la connexion
psql postgresql://louma_user:password123@localhost:5432/louma_db
```

#### "Token invalide ou expiré"
```bash
# Vérifier le token JWT
echo $TOKEN | jq -R 'split(".") | .[1] | @base64d | fromjson | .exp'

# Nouveau token si besoin
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "votre_refresh_token"}'
```

#### "Port déjà utilisé"
```bash
# Tuer le processus
sudo lsof -ti:5000 | xargs kill -9

# Ou changer de port
export PORT=5001
npm run dev
```

## ✅ Checklist de Validation

- [ ] Serveur Express démarré sur port 5000
- [ ] Connexion PostgreSQL fonctionnelle
- [ ] Tables créées dans la base de données
- [ ] Inscription d'utilisateur fonctionne
- [ ] Connexion et génération de token
- [ ] Création de propriété avec authentification
- [ ] Liste des propriétés avec filtres
- [ ] Recherche texte fonctionne
- [ ] Middleware d'authentification protège les routes
- [ ] Validation des données avec Zod
- [ ] Gestion des erreurs cohérente

## 🎯 Prochaines Étapes

Une fois tous les tests ✅ :

1. **Upload Images** - Gestion multi-fichiers
2. **Gestion Users** - Profiles CRUD complet  
3. **Tests Unitaires** - Jest/Supertest
4. **Documentation API** - Swagger/OpenAPI
5. **Déploiement** - Docker/Cloud

**Le backend est prêt pour l'intégration frontend !** 🚀
