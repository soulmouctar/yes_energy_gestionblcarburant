# Plan d'Implémentation - Application Fullstack Laravel 8 & React (gestion_bl_carburant)

Développement d'une application web professionnelle et hautement sécurisée pour la gestion des Bons de Livraison (BL) de carburants (Essence et Gasoil), organisée en deux répertoires principaux à la racine du projet : `backend_carburant` (API REST Laravel 8) et `front_carburant` (SPA React + Vite + Tailwind CSS).

---

## 1. Configurations Techniques Clés

- **Framework Backend** : Laravel 8 (`laravel/laravel:^8.0`)
- **Version PHP** : PHP 8.2 (Compatible avec Laravel 8)
- **Base de Données** : MySQL 8 local (phpMyAdmin)
  - **Host** : `127.0.0.1` / `localhost`
  - **Port** : `3306`
  - **Nom de la BD** : `gestion_bl`
  - **Utilisateur** : `root`
  - **Mot de passe** : *(aucun - vide)*
- **Frontend** : React 18 avec Vite, Tailwind CSS, Lucide Icons, Axios, Recharts/Chart.js, XLSX, HTML2Canvas / Printable A4.

---

## 2. Architecture & Sécurité Élevée

### Backend API (`backend_carburant` - Laravel 8)
- **Authentification Sanctum** : Jetons API (Bearer Tokens) sécurisés pour les requêtes React.
- **Contrôle d'Accès par Rôles (RBAC)** : 
  - `Admin` : Accès total (CRUD complet, administration des utilisateurs, journal d'audit).
  - `Exploitation` : Création, modification, consultation et liquidation des BL.
  - `Consultation` : Lecture seule sur l'ensemble du système.
- **Validation Stricte des Données** : Form Request Classes isolées (`BlStoreRequest`, `BlUpdateRequest`, etc.) avec sanitisation et règles de validation explicites.
- **Mesures de Sécurité Avancées** :
  - Protections contre les injections SQL (Requêtes préparées Eloquent).
  - En-têtes HTTP de sécurité (X-Frame-Options, X-Content-Type-Options, Anti-XSS).
  - Rate Limiting pour contrer les attaques de force brute.
  - Middleware CORS configuré spécifiquement pour le serveur frontend React.
- **Journalisation des Activités (`activity_logs`)** : Enregistrement automatique en base MySQL de chaque création, modification, suppression ou liquidation.

### Frontend SPA (`front_carburant` - React + Vite)
- **Gestion de Session Sécurisée** : `AuthContext` React gérant l'état de l'utilisateur et son rôle.
- **Intercepteurs Axios** : Injection automatique du token Bearer et gestion centralisée des erreurs `401 Unauthorized`, `403 Forbidden`, `422 Validation` avec Toasts interactifs.
- **Routes Protégées (Protected Routes)** : Filtre les accès aux pages selon le rôle de l'utilisateur.

---

## 3. Périmètre Fonctionnel (basé sur `fichier_projet.txt`)

1. **Authentification** : Ecran de connexion sécurisé avec sélection/aperçu des 3 rôles de test.
2. **Tableau de Bord Decisionnel** :
   - Cartes KPI : Total BL, Volume Essence (L), Volume Gasoil (L), Total Volume (L), BL Liquidés, BL En cours, Camions actifs.
   - Graphique interactif de l'évolution mensuelle des volumes (Essence vs Gasoil).
   - Répartition par destination et top transporteurs.
   - Tableau des derniers BL enregistrés.
3. **Gestion des Bons de Livraison (BL)** :
   - Génération automatique des numéros BL (ex: `BL-2026-0001`).
   - Saisie et édition avec choix réactif du camion, chauffeur, client, transporteur, destination.
   - Statuts : `En cours`, `Livré`, `Liquidé`, `Annulé`.
   - Vue Fiche BL récapitulative officielle A4 avec QR Code de contrôle visuel et option d'impression direct.
4. **Gestion des Référentiels (CRUD Complète)** :
   - **Camions** : Immatriculation, Capacité, Marque, Type de Citerne, Transporteur, État, Assurance, Visite technique.
   - **Chauffeurs** : Nom, Téléphone, Numéro permis, Expiration permis, Transporteur.
   - **Clients** : Nom, Téléphone, Adresse, Personne de contact, Historique des volumes.
   - **Destinations** : Nom, Région, Distance, Cumul livraisons Essence/Gasoil.
   - **Transporteurs** : Nom, Responsable, Téléphone, Adresse, Flotte de camions.
5. **Module de Liquidation Administrative** :
   - Suivi des BL en attente de liquidation vs liquidés.
   - Liquidation individuelle ou groupée (bulk) avec date et observations.
6. **Rapports & Exports** :
   - Filtres par période, client, destination, produit, transporteur.
   - Synthèse statistique et graphiques dynamiques.
   - Exports au format Excel / CSV et impression PDF.
7. **Administration & Journal d'Audit** :
   - Gestion des comptes utilisateurs.
   - Historique complet des actions (Audit Trail).

---

## 4. Schéma de la Base de Données `gestion_bl` (MySQL)

- `users` : `id`, `name`, `email`, `password`, `role` (`admin`, `exploitation`, `consultation`), `remember_token`, `timestamps`
- `transporteurs` : `id`, `nom`, `responsable`, `telephone`, `adresse`, `timestamps`
- `camions` : `id`, `immatriculation`, `marque`, `capacite`, `type_citerne`, `transporteur_id` (FK), `etat`, `date_assurance`, `date_visite`, `timestamps`
- `chauffeurs` : `id`, `nom`, `telephone`, `numero_permis`, `expiration_permis`, `transporteur_id` (FK), `timestamps`
- `clients` : `id`, `nom`, `telephone`, `adresse`, `contact`, `timestamps`
- `destinations` : `id`, `nom`, `region`, `distance`, `timestamps`
- `bl` : `id`, `numero_bl`, `date_bl`, `camion_id` (FK), `chauffeur_id` (FK), `client_id` (FK), `destination_id` (FK), `transporteur_id` (FK), `produit` (`Essence`, `Gasoil`), `quantite`, `prix_transport`, `date_livraison`, `date_liquidation`, `statut` (`En cours`, `Livré`, `Liquidé`, `Annulé`), `observation`, `created_by` (FK), `updated_by` (FK), `timestamps`
- `activity_logs` : `id`, `user_id` (FK), `action`, `table_name`, `record_id`, `details`, `created_at`

---

## 5. Structure des Répertoires

```
/gestion_bl_carburant
 ├── fichier_projet.txt
 ├── PLAN_DEVELOPPEMENT.md
 ├── backend_carburant/        [NEW] Laravel 8 API (Connecté à MySQL `gestion_bl`)
 └── front_carburant/          [NEW] Application React SPA (Vite + Tailwind CSS)
```
