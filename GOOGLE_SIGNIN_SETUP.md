# 🔐 Guide d'intégration Google Sign-In

Ce guide explique comment configurer Google Sign-In pour l'app LOUMA.

---

## 📋 Étapes de configuration

### 1️⃣ **Google Cloud Console - Créer un projet**

1. Va sur [Google Cloud Console](https://console.cloud.google.com/)
2. Clique sur **"Sélectionner un projet"** > **"Nouveau projet"**
3. Nomme ton projet (ex: "LOUMA Mobile")
4. Clique **"Créer"**

### 2️⃣ **Activer l'API Google Identity**

1. Dans le projet, va à **"APIs et Services"** > **"Bibliothèque"**
2. Cherche **"Google Identity"** ou **"Google Sign-In"**
3. Clique dessus et appuie sur **"Activer"**

### 3️⃣ **Créer des identifiants OAuth**

1. Va à **"APIs et Services"** > **"Identifiants"**
2. Clique sur **"+ Créer des identifiants"** > **"ID client OAuth"**
3. Choisis le type d'application : **"Application multiplateforme"** ou **"Android"**
4. Remplis les informations :

#### Pour **Android** :
- **Package name** : Le Bundle ID de ton app Expo  
  - Par défaut dans Expo : `host.exp.exponent` (à vérifier dans `app.json`)
  - Ou personnalisé via `expo.android.package` dans `app.json`
  
- **Certificat SHA-1** : 
  ```bash
  # Pour Expo, utilise le certificat debug (development)
  EXPO_DEBUG_CERTIFICATE_SHA1=<voir ci-dessous>
  ```

### 4️⃣ **Obtenir le SHA-1 Certificate Fingerprint**

Une fois l'app créée en Expo, récupère le SHA-1 :

```bash
# Depuis le dossier frontend
eas credentials

# Ou pour le développement local :
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Ou regarde dans la console Expo Go - le SHA-1 s'affiche la première fois que tu lances l'app via :

```bash
npm start
```

### 5️⃣ **Copier ton Google Client ID**

Une fois créés, tu reçois un **Client ID** qui ressemble à :
```
123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### 6️⃣ **Configurer Supabase Auth**

1. Va dans ton **Supabase Dashboard**
2. **Authentication** > **Providers**
3. Cherche **Google** et active-le
4. Remplis :
   - **Client ID** (depuis Google Cloud)
   - **Client Secret** (depuis Google Cloud Identifiants)
5. Sauvegarde

### 7️⃣ **Ajouter les variables d'environnement**

Dans le dossier `frontend`, crée un fichier `.env` (en copiant `.env.example`) :

```bash
cp .env.example .env
```

Puis édite `.env` et remplis :

```env
EXPO_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ta_cle_anon
EXPO_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### 8️⃣ **Installer les dépendances**

```bash
cd frontend
npm install
```

---

## 🚀 **Tester Google Sign-In**

### Sur Android avec Expo Go

```bash
npm start
# Scanne le QR code avec Expo Go
# Appuie sur "Connexion avec Google"
```

### Avec Expo Go App

L'app devrait rediriger vers l'écran de sélection de compte Google, puis revenir à l'app une fois connecté.

---

## ⚙️ **Dépannage**

### Erreur : `GoogleAuthRequest is not defined`
- Vérifie que `expo-auth-session` est installée
- Réinstalle : `npm install expo-auth-session`

### Erreur : `EXPO_PUBLIC_GOOGLE_CLIENT_ID is not defined`
- Vérifie que le `.env` exists et contient `EXPO_PUBLIC_GOOGLE_CLIENT_ID`
- Redémarre le serveur Expo : `npm start -c`

### Google Sign-In ne redirige pas
- Vérifie que le SHA-1 certificate est correct dans Google Cloud Console
- Réinitialise les identifiants si nécessaire

### Erreur d'authentification Supabase
- Vérifie que Google est activé dans **Supabase Dashboard**
- Vérifie que le Client ID et Secret sont corrects

---

## 📱 **Configuration app.json**

Pour un bundle ID personnalisé, ajoute dans `app.json` :

```json
{
  "expo": {
    "android": {
      "package": "com.louma.app"
    },
    "scheme": "louma"
  }
}
```

Puis utilise `com.louma.app` comme **package name** dans Google Cloud.

---

## 🔗 **Ressources utiles**

- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google Auth](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

## ✅ **Checklist rapide**

- [ ] Projet créé dans Google Cloud Console
- [ ] API Google Identity activée
- [ ] Identifiants OAuth créés (Android)
- [ ] SHA-1 certificate fourni
- [ ] Client ID et Secret copiés
- [ ] Supabase Auth configuré avec Google
- [ ] Variables `.env` remplies
- [ ] Dépendances installées (`npm install`)
- [ ] App testée sur Expo Go
- [ ] Google Sign-In fonctionne ✨
