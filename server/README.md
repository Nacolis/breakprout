# Breakprout - Backend Server

Ce projet est le serveur backend du jeu de Breakthrough multijoueur. Il est construit avec **Python 3.14.5**, **FastAPI**, **SQLAlchemy** (asynchrone), **Alembic**, et **PostgreSQL 18.4**.

---

## 🛠️ Choix technologiques & Modules

* **Python 3.14 & UV** : Utilisation de la version la plus récente de Python propulsée par le gestionnaire de paquets ultrarapide **UV**. Il compile le bytecode pour de meilleures performances et gère un environnement virtuel robuste.
* **FastAPI** : Framework de choix pour les performances asynchrones élevées (idéal pour le multijoueur), la validation automatique avec Pydantic, et la documentation OpenAPI interactive auto-générée.
* **SQLAlchemy (Asyncio) & asyncpg** : Connexion asynchrone complète à la base de données PostgreSQL pour éviter tout blocage d'I/O lors de requêtes concurrentes.
* **PostgreSQL 18.4-alpine** : Image de base de données relationnelle moderne et isolée dans un conteneur léger.
* **Alembic** : Outil pour gérer et versionner les migrations de base de données de manière asynchrone.
* **pwdlib[argon2]** : Bibliothèque moderne pour le hachage sécurisé des mots de passe (remplaçant avantageux de `passlib` qui est obsolète en Python 3.14).
* **PyJWT[crypto]** : Génération et décodage sécurisés de jetons JWT pour l'authentification.
* **python-multipart** : Support pour l'analyse des requêtes de formulaires (requis pour l'authentification standard OAuth2 de FastAPI).
* **Ruff** : Linter et formateur Python extrêmement rapide pour maintenir une base de code propre.

---

## 📂 Architecture du Projet

L'architecture est structurée de manière modulaire :
```
server/
├── app/
│   ├── api/
│   │   ├── deps.py             # Dépendances FastAPI (ex. session DB, get_current_user)
│   │   └── v1/
│   │       ├── __init__.py     # Coordinateur des routes API
│   │       ├── auth.py         # Endpoints d'authentification (register, token)
│   │       ├── games.py        # Endpoints de gestion de partie (créer, rejoindre, lister)
│   │       └── websockets.py   # Connexion WebSocket en temps réel pour le jeu
│   ├── core/
│   │   ├── config.py           # Configuration de l'application via Pydantic Settings
│   │   ├── database.py         # Moteur et sessions asynchrones SQLAlchemy
│   │   └── security.py         # Cryptage (JWT et hashs Argon2)
│   ├── models/
│   │   ├── base.py             # Base déclarative SQLAlchemy
│   │   ├── user.py             # Modèle de base de données User
│   │   └── game.py             # Modèle de base de données Game
│   ├── schemas/
│   │   ├── user.py             # Schémas de validation Pydantic (User)
│   │   └── game.py             # Schémas de validation Pydantic (Game)
│   ├── services/
│   │   └── connection_manager.py # Gestionnaire de sockets et broadcast en temps réel
│   └── main.py                 # Point d'entrée principal (FastAPI app & Middleware CORS)
├── migrations/                 # Dossier des migrations de base de données Alembic
├── .dockerignore               # Évite d'inclure le venv local dans l'image Docker
├── .env / .env.example         # Variables d'environnement
├── .python-version             # Version python cible (3.14.5)
├── alembic.ini                 # Configuration d'Alembic
├── Dockerfile                  # Build Docker multi-stage optimisé pour le serveur
└── pyproject.toml              # Fichier de dépendances UV
```

---

## 🚀 Guide de Développement & Démarrage

### Scénario A : Pour les développeurs Frontend (Tout dans Docker)
Si vous ne développez pas sur le backend et souhaitez simplement avoir le serveur fonctionnel avec sa base de données pour brancher votre interface :

1. **Lancer les services :**
   Depuis la racine du projet (contenant le dossier `infra/`) :
   ```bash
   docker compose -f infra/docker-compose.yml up --build -d
   ```
2. **Accéder à l'API :**
   * URL de base : `http://localhost:8000`
   * Endpoint de santé : [http://localhost:8000/health](http://localhost:8000/health)
   * Swagger interactif (Documentation de l'API) : [http://localhost:8000/docs](http://localhost:8000/docs)
3. **Arrêter les services :**
   ```bash
   docker compose -f infra/docker-compose.yml down
   ```

---

### Scénario B : Pour les développeurs Backend (Mode hybride & Debugging)
C'est le mode recommandé pour développer le serveur, car il offre un autoreload instantané et un débogage natif avec l'IDE.

1. **Lancer UNIQUEMENT la base de données dans Docker :**
   Depuis la racine du projet :
   ```bash
   docker compose -f infra/docker-compose.yml up db -d
   ```
2. **Configurer l'environnement virtuel local :**
   Allez dans le dossier `server/` :
   ```bash
   cd server
   ```
   Créez l'environnement virtuel et installez les dépendances :
   ```bash
   uv venv --python 3.14
   uv sync
   ```
3. **Lancer l'API en local avec autoreload :**
   Depuis le dossier `server/` :
   ```bash
   uv run uvicorn app.main:app --reload
   ```
   *Note : Votre fichier `.env` local est configuré par défaut pour se connecter à la base de données exposée sur `localhost:5432`.*

---

## 🗄️ Gestion des Migrations (Alembic)

Les migrations doivent être gérées en local pour être facilement générées et appliquées.

* **Créer une nouvelle migration automatique (après avoir modifié un modèle SQLAlchemy) :**
  Depuis le dossier `server/` :
  ```bash
  uv run alembic revision --autogenerate -m "description_de_la_modification"
  ```
* **Appliquer les migrations sur la base de données :**
  Depuis le dossier `server/` :
  ```bash
  uv run alembic upgrade head
  ```

---

## 🧹 Qualité de Code & Formatage

Ce projet utilise `ruff` pour le linting et le formatage.

* **Vérifier le code (Linter) :**
  ```bash
  uv run ruff check .
  ```
* **Formater le code automatiquement :**
  ```bash
  uv run ruff format .
  ```
