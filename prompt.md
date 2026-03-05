# 🚀 Prompts de Finalisation Louma-App

Ce fichier contient les prompts structurés pour implémenter les fonctionnalités manquantes de Louma-App (React Native Expo / Node.js Express / Drizzle ORM).

---

## 🏗️ PROMPT 1 : Système d'Upload Cloudinary (Backend & Base)

**Contexte :** Nous devons remplacer les images Unsplash par un vrai stockage cloud.
**Objectif :** Intégrer Cloudinary dans le backend et créer un hook d'upload côté frontend.

**Instructions :**
1. **Backend :** 
   - Installe `cloudinary` et `multer`.
   - Crée un fichier `backend/server/services/uploadService.ts` pour gérer l'envoi d'images vers Cloudinary (dossier 'louma/properties' et 'louma/avatars').
   - Ajoute une route `POST /api/upload` protégée par authentification qui accepte un fichier `image` et retourne l'URL sécurisée.
2. **Frontend :** 
   - Installe `expo-image-picker`.
   - Crée un hook `frontend/lib/useImageUpload.ts` qui gère la sélection d'une image (galerie ou caméra) et l'upload vers notre API `/api/upload`.
   - Le hook doit retourner `{ uploadImage, isUploading, imageUrl, error }`.

---

## 📈 PROMPT 2 : Score de Complétion du Profil

**Contexte :** Nous voulons inciter les utilisateurs à remplir leur profil.
**Objectif :** Calculer dynamiquement le score de complétion côté backend et l'afficher graphiquement côté frontend.

**Instructions :**
1. **Backend :** 
   - Modifie `backend/server/services/authService.ts` pour qu'à chaque `updateProfile`, le champ `completion_percent` soit recalculé.
   - Attribue 12.5% pour chacun des champs suivants s'ils sont remplis : `fullName`, `phone`, `email`, `avatar`, `commune`, `profession`, `householdSize`, `budget`.
2. **Frontend :** 
   - Dans `frontend/app/(tabs)/profile.tsx`, ajoute un composant visuel (Progress Bar) affichant le pourcentage récupéré de l'utilisateur.
   - Ajoute le support de l'upload d'Avatar dans `frontend/components/ProfileEditModal.tsx` en utilisant le hook d'upload créé précédemment.
   - Affiche l'avatar réel de l'utilisateur s'il existe, sinon garde l'icône par défaut.

---

## 🔔 PROMPT 3 : Notifications Push (Expo SDK)

**Contexte :** Les propriétaires doivent être alertés des nouveaux leads en temps réel.
**Objectif :** Enregistrer les tokens push et envoyer des notifications lors des interactions.

**Instructions :**
1. **Database & API :** 
   - Modifie `shared/schema.ts` pour ajouter une colonne `pushToken: text` à la table `users`.
   - Crée une route `PATCH /api/auth/push-token` pour enregistrer le token de l'appareil.
2. **Backend Service :** 
   - Installe `expo-server-sdk`.
   - Crée `backend/server/services/notificationService.ts` pour envoyer des notifications push.
   - Modifie `leadService.ts` pour qu'à la création d'un nouveau lead, une notification soit envoyée au propriétaire du bien : *"Nouveau Lead ! [Nom] est intéressé par votre bien [Titre]"*.
3. **Frontend :** 
   - Installe `expo-notifications` et `expo-device`.
   - Crée un `frontend/lib/NotificationProvider.tsx` pour demander les permissions au login et envoyer le token au backend via la nouvelle route.

---

## 🏠 PROMPT 4 : Intégration Finale des Images (Propriétés)

**Contexte :** Les annonces doivent maintenant utiliser les vraies images.
**Objectif :** Lier le système d'upload aux annonces immobilières.

**Instructions :**
1. **Frontend :** 
   - Crée un composant `frontend/components/ImageUploaderGrid.tsx` permettant d'uploader plusieurs images pour une annonce.
   - Le composant doit permettre de définir laquelle est l'image principale (`isMain`).
2. **Backend :** 
   - Assure-toi que `backend/server/services/imageService.ts` est utilisé pour enregistrer les URLs Cloudinary dans la table `property_images` après chaque upload réussi côté client.
   - Vérifie que la suppression d'une image dans l'UI supprime également l'entrée en base de données (et idéalement sur Cloudinary via l'uploadService).
