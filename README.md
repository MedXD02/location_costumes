# Location Costumes

Projet full‑stack de **location de costumes** :
- **Backend** : API REST Laravel (auth, costumes, locations, admin)
- **Mobile** : application React Native (Expo) pour consulter et louer

## Structure

- `backend/` : API Laravel
- `mobile/` : app Expo/React Native

## Prérequis

- PHP + Composer
- MySQL (ou un serveur compatible) pour la base de données
- Node.js + npm
- Expo Go (si test sur téléphone)

## Démarrage rapide

### 1) Backend (Laravel)

Depuis `backend/` :

```bash
composer install
```

Créer le fichier `.env` à partir de l’exemple :

- Windows (PowerShell) :

```powershell
Copy-Item env.example.txt .env
```

Puis :

```bash
php artisan key:generate
php artisan migrate --seed
```

Lancer le serveur (recommandé pour un téléphone : écouter sur le réseau) :

```bash
php artisan serve --host 0.0.0.0 --port 8000
```

Identifiants de test (seed) :
- Admin : `admin@test.com` / `password123`
- Client : `client@test.com` / `password123`

### 2) Mobile (Expo)

Depuis `mobile/` :

```bash
npm install
npx expo start
```

Configurer l’URL de l’API dans `mobile/src/api.js` :
- En dev, remplace `http://192.168.100.10:8000/api/v1` par l’IP locale de ton PC (ex: `http://192.168.1.20:8000/api/v1`).

Notes :
- Si tu testes sur téléphone, le PC et le téléphone doivent être sur le même Wi‑Fi.
- Vérifie le pare‑feu Windows (port `8000`).

## Endpoints (aperçu)

Préfixe : `/api/v1`
- Auth : `POST /login`, `POST /register`, `POST /logout`
- Costumes : `GET /costumes`, `GET /costumes/{id}`, `GET /costumes/categories`
- Locations : `GET /rentals`, `POST /rentals`, `PATCH /rentals/{id}/cancel`

