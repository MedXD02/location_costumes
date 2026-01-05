<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Costumes disponibles</title>
    <style>
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background: #f5f5f5; text-align: left; }
        .header { text-align: center; margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Costumes disponibles</h1>
        <p>Liste des costumes publiés et disponibles — Prix par jour</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Taille</th>
                <th>Prix / jour</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
        @forelse($costumes as $c)
            <tr>
                <td>{{ $c->name }}</td>
                <td>{{ $c->category }}</td>
                <td>{{ $c->size }}</td>
                <td>{{ number_format($c->price_per_day, 2, ',', ' ') }} €</td>
                <td style="vertical-align: top;">{{ Str::limit($c->description, 200) }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="5">Aucun costume disponible.</td>
            </tr>
        @endforelse
        </tbody>
    </table>

</body>
</html>
