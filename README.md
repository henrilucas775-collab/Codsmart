# Kasaina — Gestion des charges

Application de bureau de démonstration construite avec React, Vite et Electron. Les données sont fictives et enregistrées dans le stockage local du poste (`localStorage`). Aucun serveur ou backend n’est requis.

## Développement

Prérequis : Node.js 20 ou supérieur et npm.

```bash
npm install
npm run dev
```

Vite démarre l’interface et Electron ouvre la fenêtre de l’application.

## Générer l’application Windows

Sur un poste Windows, dans le dossier du projet :

```bash
npm install
npm run dist:win
```

Les installateurs NSIS et portables sont déposés dans `release/`. Pour demander uniquement le paquet portable :

```bash
npm run dist:win:portable
```

Le paquet Windows n’est pas inclus ici : l’environnement de création n’a pas pu télécharger toutes les dépendances npm (erreur réseau `ECONNRESET`).

## Fonctionnalités de la maquette

- Tableau de bord avec indicateurs, graphiques, opérations récentes et alertes.
- Modules Forfait, Carburant, Avance, Frais d’expédition, Bonus, Autre et Rapports.
- Recherche, filtres de statut, création/modification/suppression et export CSV.
- Montants en Ariary, affichage responsive et navigation sans rechargement.
- Données sauvegardées localement dans le navigateur / profil Electron.

Les fonctions métier avancées du cahier des charges (carte interactive réelle, synchronisation multi-utilisateur, exports PDF/Excel natifs et connectivité opérateurs) nécessitent des services ou composants complémentaires et ne sont pas simulées comme des intégrations réelles dans cette maquette.
