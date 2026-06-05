# Breakprout Dev Start Guide

## Stack technique :

* **Backend** : Python 3.14+, FastAPI, SQLAlchemy (asynchrone), Alembic, PostgreSQL 18.4 (asyncpg).
* **Frontend** : React, TypeScript, Tailwind CSS, Vite.
* **AI** : C++.
* **Infra** : Docker, Nginx.

## Outils de dev :
- GitHub pour le contrôle de version et la gestion du projet.
- **UV** pour la gestion des paquets Python (remplace pip/poetry).
- **Ruff** pour le linting et formatage Python.

---

## Démarrage rapide (Getting Started)

Consultez le guide de démarrage détaillé du serveur dans le [README du serveur](file:///Users/nicolasroy/Documents/Cour/42/breakprout/server/README.md).

### 1. Initialiser le Backend (Mode hybride de dev)
Depuis la racine du projet :
```bash
# Lancer la base de données PostgreSQL
docker compose -f infra/docker-compose.yml up db -d

# Configurer l'environnement virtuel et lancer le serveur en local
cd server
uv venv --python 3.14
uv sync
uv run uvicorn app.main:app --reload
```
*L'API sera disponible sur `http://localhost:8000` et la documentation interactive sur `http://localhost:8000/docs`.*

### 2. Lancer tout le Backend sous Docker (Idéal pour le dev Frontend)
Depuis la racine du projet :
```bash
docker compose -f infra/docker-compose.yml up --build -d
```
