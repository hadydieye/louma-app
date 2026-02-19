# 🔐 API Authentification - Guide Complet

## 📡 Endpoints d'Authentification

### 1. Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "Mamadou Diallo",
  "phone": "+224 622 12 34 56",
  "password": "password123",
  "email": "mamadou@email.com",
  "role": "OWNER"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-123",
      "fullName": "Mamadou Diallo",
      "phone": "+224622123456",
      "email": "mamadou@email.com",
      "role": "OWNER",
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

### 2. Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "+224 622 12 34 56",
  "password": "password123"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-123",
      "fullName": "Mamadou Diallo",
      "phone": "+224622123456",
      "role": "OWNER",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Connexion réussie"
}
```

### 3. Rafraîchir le Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 4. Obtenir le Profil
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 5. Changer le Mot de Passe
```http
POST /api/auth/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

### 6. Demander Réinitialisation
```http
POST /api/auth/request-password-reset
Content-Type: application/json

{
  "phone": "+224 622 12 34 56"
}
```

### 7. Réinitialiser le Mot de Passe
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "resetToken": "eyJhbGciOiJIUzI1NiIs...",
  "newPassword": "newpassword456"
}
```

## 🔒 Utilisation des Tokens

### Format Authorization Header
```http
Authorization: Bearer <votre_token_jwt>
```

### Durée de Validité
- **Access Token** : 7 jours (configurable)
- **Refresh Token** : 30 jours

### Rôles Disponibles
- `TENANT` : Locataire
- `OWNER` : Propriétaire
- `AGENCY` : Agence immobilière

## 🧪 Tests avec curl

### Inscription
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "phone": "+224 622 12 34 56",
    "password": "password123",
    "role": "TENANT"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+224 622 12 34 56",
    "password": "password123"
  }'
```

### Accès Protégé
```bash
# D'abord se connecter pour obtenir le token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+224 622 12 34 56", "password": "password123"}' \
  | jq -r '.data.token')

# Utiliser le token pour accéder aux routes protégées
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 🚨 Codes d'Erreur

| Code | Message | Description |
|-------|----------|-------------|
| 400 | "Le nom complet, le téléphone et le mot de passe sont requis" | Champs manquants |
| 400 | "Format du numéro de téléphone invalide" | Téléphone non guinéen |
| 400 | "Le mot de passe doit contenir au moins 8 caractères" | Mot de passe trop court |
| 400 | "Un utilisateur avec ce numéro de téléphone existe déjà" | Compte déjà existant |
| 401 | "Token d'authentification requis" | Pas de token fourni |
| 401 | "Numéro de téléphone ou mot de passe incorrect" | Identifiants invalides |
| 403 | "Token invalide ou expiré" | Token expiré/mauvais |
| 403 | "Permissions insuffisantes" | Rôle non autorisé |

## 🔧 Configuration

### Variables d'Environnement
```env
JWT_SECRET=votre-secret-jet-tres-securise-ici
JWT_REFRESH_SECRET=votre-secret-refresh-tres-securise-ici
JWT_EXPIRES_IN=7d
```

### Validation des Numéros
Les numéros de téléphone doivent suivre le format guinéen :
- `+224 622 12 34 56`
- `00224 622 12 34 56`
- `622 12 34 56`

## 📱 Intégration Frontend

### React Native / Expo
```javascript
// Connexion
const login = async (phone, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, password }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Sauvegarder les tokens
      await AsyncStorage.setItem('token', data.data.token);
      await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
  }
};

// Requête authentifiée
const fetchProperties = async () => {
  const token = await AsyncStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/properties', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
};
```

### Axios Interceptor
```javascript
import axios from 'axios';

// Créer une instance axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor pour ajouter le token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor pour rafraîchir le token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403) {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const response = await axios.post('/auth/refresh', {
            refreshToken,
          });
          
          const { token, refreshToken: newRefreshToken } = response.data.data;
          
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
          
          // Réessayer la requête originale
          error.config.headers.Authorization = `Bearer ${token}`;
          return axios.request(error.config);
        } catch (refreshError) {
          // Rediriger vers login
          await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
          // navigation.navigate('Login');
        }
      }
    }
    
    return Promise.reject(error);
  }
);
```

## 🛡️ Sécurité

### Bonnes Pratiques
1. **HTTPS en production** : Toujours utiliser HTTPS
2. **Secrets forts** : Utiliser des secrets JWT robustes
3. **Validation côté client** : Valider avant envoi
4. **Gestion des erreurs** : Ne jamais exposer les détails
5. **Rate limiting** : Limiter les tentatives de connexion

### Tokens
- Les tokens sont signés avec HMAC-SHA256
- Inclusion de `iss` (issuer) et `aud` (audience)
- Support des refresh tokens pour éviter les reconnexions

### Mots de Passe
- Hashage avec bcrypt (cost factor 12)
- Minimum 8 caractères requis
- Validation côté serveur et client
