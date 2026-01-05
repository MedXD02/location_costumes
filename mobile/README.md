# Application Mobile - Location de Costumes

Application React Native développée avec Expo pour la consultation et la location de costumes.

## Fonctionnalités

- ✅ Consultation du catalogue de costumes
- ✅ Recherche et filtrage par catégorie
- ✅ Détails des costumes
- ✅ Gestion des locations
- ✅ Interface utilisateur moderne et intuitive

## Structure

```
mobile/
├── App.js                 # Point d'entrée de l'application
├── src/
│   ├── config/
│   │   └── api.js        # Configuration de l'API
│   ├── services/
│   │   └── api.js        # Services API
│   └── screens/
│       ├── HomeScreen.js
│       ├── CostumeListScreen.js
│       ├── CostumeDetailScreen.js
│       └── RentalScreen.js
```

## Démarrage

```bash
npm install
npx expo start
```

## Configuration API

Modifiez `src/config/api.js` pour pointer vers votre API Laravel.

Pour un appareil physique, utilisez l'adresse IP locale de votre machine au lieu de `localhost`.


