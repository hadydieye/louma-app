# LOUMA Backend

API REST Express/TypeScript pour la plateforme immobilière guinéenne.

## 🖥️ Technologies

- **Express 5.0.1** avec TypeScript
- **PostgreSQL** avec Drizzle ORM
- **Zod** pour la validation des données
- **WebSocket** pour la messagerie temps réel

## 🚀 Démarrage

### Installation
```bash
npm install
```

### Développement
```bash
npm run dev          # Serveur de développement
```

### Production
```bash
npm run build        # Build TypeScript
npm start           # Serveur production
```

### Base de données
```bash
npm run db:push      # Synchroniser schéma
npm run db:generate  # Générer migrations
npm run db:migrate   # Appliquer migrations
npm run db:studio    # Drizzle Studio
```

## 📡 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion

### Propriétés
- `GET /api/properties` - Lister les propriétés
- `GET /api/properties/:id` - Détail propriété
- `POST /api/properties` - Créer propriété
- `PUT /api/properties/:id` - Modifier propriété
- `DELETE /api/properties/:id` - Supprimer propriété

### Utilisateurs
- `GET /api/users/profile` - Profil utilisateur
- `PUT /api/users/profile` - Modifier profil
- `GET /api/users/:id/properties` - Propriétés utilisateur

### Favoris
- `GET /api/favorites` - Liste favoris
- `POST /api/favorites` - Ajouter favori
- `DELETE /api/favorites/:id` - Supprimer favori

## 🗄️ Base de Données

### Tables principales
- `users` - Utilisateurs
- `properties` - Propriétés
- `favorites` - Favoris
- `messages` - Messagerie
- `reviews` - Avis

### Schéma
Le schéma est défini dans `../shared/schema.ts` et partagé avec le frontend.

## 🔧 Configuration

Variables d'environnement:
```env
DATABASE_URL=postgresql://...
NODE_ENV=development
PORT=5000
JWT_SECRET=...
```

## 📂 Structure

```
backend/
├── server/
│   ├── index.ts        # Point d'entrée
│   ├── routes.ts       # Routes API
│   └── storage.ts      # Configuration stockage
├── drizzle.config.ts   # Configuration Drizzle
└── package.json        # Dépendances backend
```
