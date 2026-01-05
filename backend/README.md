# Backend API - Location de Costumes

API REST développée avec Laravel pour la gestion de location de costumes.

## Fonctionnalités

- ✅ Gestion des costumes (CRUD)
- ✅ Gestion des locations
- ✅ Filtrage et recherche
- ✅ Vérification de disponibilité
- ✅ Support base de données locale et en ligne

## Structure

```
backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/
│   │           ├── CostumeController.php
│   │           └── RentalController.php
│   └── Models/
│       ├── Costume.php
│       └── Rental.php
├── database/
│   ├── migrations/
│   └── seeders/
└── routes/
    └── api.php
```

## Installation

Voir le `README.md` à la racine du projet pour les instructions complètes.

## Endpoints

### Costumes
- `GET /api/v1/costumes` - Liste tous les costumes
- `GET /api/v1/costumes/{id}` - Détails d'un costume
- `GET /api/v1/costumes/categories` - Liste des catégories

### Locations
- `GET /api/v1/rentals` - Liste toutes les locations
- `POST /api/v1/rentals` - Créer une location
- `GET /api/v1/rentals/{id}` - Détails d'une location
- `PATCH /api/v1/rentals/{id}/cancel` - Annuler une location

## Base de Données

Le projet supporte deux connexions MySQL :
- **Locale** : Pour le développement (`mysql`)
- **En ligne** : Pour la production (`mysql_online`)

Configurez les variables d'environnement dans `.env` pour chaque connexion.


