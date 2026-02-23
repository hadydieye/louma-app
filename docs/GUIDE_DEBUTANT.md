# 📖 Guide du Débutant : Lancer Louma

Ce guide t'explique comment lancer l'application étape par étape, même si tu n'as jamais fait de code !

## 1. Vérification de la Base de Données
L'application a besoin de **PostgreSQL** pour fonctionner. 
Sur ton système (Parrot OS), elle est normalement déjà configurée et tourne en arrière-plan.

## 2. Lancer l'Application
Le moyen le plus simple est d'utiliser une seule commande qui lance tout (le "cerveau" backend et l'interface frontend).

1. Ouvrez un terminal dans le dossier `Louma-App`.
2. Tapez cette commande :
   ```bash
   npm run dev:all
   ```
3. Laisse le terminal ouvert. Tant que ce texte défile, l'app est "vivante".

## 3. Voir le Résultat (Le Rendu)

### Dans ton Navigateur (Web)
1. Ouvre Chrome ou Firefox.
2. Tape l'adresse suivante : **[http://localhost:8081](http://localhost:8081)**
3. Félicitations ! Tu vois l'interface de Louma.

### Sur ton Téléphone (Mobile)
1. Installe l'application **Expo Go** (disponible sur l'App Store ou Google Play).
2. Ton téléphone et ton ordi doivent être sur le **même réseau WiFi**.
3. Dans le terminal où tu as lancé `npm run dev:all`, un gros **Code QR** est apparu.
4. Scanne ce code avec l'appareil photo de ton téléphone (ou via l'app Expo Go).
5. L'app se charge sur ton mobile !

## 4. Comment s'inscrire ?
Une fois sur l'app (Web ou Mobile) :
- Clique sur **Profil** (en bas à droite).
- Clique sur l'onglet **Inscription**.
- Remplis tes infos et choisis ton rôle.

---
💡 **Astuce** : Pour tout arrêter, retourne dans le terminal et appuie sur les touches `Ctrl` + `C` en même temps.
