*This project has been created as part of the 42 curriculum by niroy, hugmonch, dkittaya, rdomange.*

# Description

Breakprout is a web application based on the Breakthrough game, which lets users play against users with ELO system or an AI. This project is developed as part of the 42 curriculum as ft_transcendence project. The goal of this project is to build an entire application of our choice by ourselves, that requires a frontend, a backend and a database.

# Team Information

* **Technical Lead** - `niroy`
	- Defines technical architecture.
	- Makes technology stack decisions.
	- Ensures code quality and best practices.
	- Reviews critical code changes.

* **Project Manager** - `hugmonch`
	- Organizes team meetings and planning sessions.
	- Tracks progress and deadlines.
	- Ensures team communication.
	- Manages risks and blockers.

* **Product Owner** - `dkittaya`
	- Maintains the product backlog.
	- Makes decisions on features and priorities.
	- Validates completed work.
	- Communicates with stakeholders (evaluators, peers).

* **Developer** - `rdomange` 
	- Write code for assigned features.
	- Participate in code reviews.
	- Test their implementations.
	- Document their work.

## Project Management

* **Team organization** 
	- Tasks were distributed since the start of the project and meetings organized atleast once a week.

* **Tools used for project management and communication**
	- GitHub
	- Discord

---

# Technical Stack

## Frontend

* **Node.js & npm**: JavaScript runtime environment and dependency manager used to install and run the frontend.

* **Vite**: A modern build tool and ultra-fast development server that provides hot reloading and optimized compilation of the frontend project.

* **React**: The main library used to build the user interface using modular, reactive components.

* **TypeScript**: A type-safe language based on JavaScript, used to improve maintainability and reduce development errors.

* **Tailwind CSS**: A utility-first CSS framework used to style components directly in markup, ensuring a consistent design system without writing custom CSS.

## Backend

* **Python 3.14 & UV**: Uses the latest version of Python, powered by the ultra-fast package manager **UV**. It compiles bytecode for better performance and manages a robust virtual environment.

* **FastAPI**: The framework of choice for high asynchronous performance (ideal for multiplayer), automatic validation with Pydantic, and auto-generated interactive OpenAPI documentation.

* **SQLAlchemy (Asyncio) & asyncpg**: Full asynchronous connection to the PostgreSQL database to prevent I/O blocking during concurrent queries.

* **Alembic**: A tool for managing and versioning database migrations asynchronously.

## Database

* **PostgreSQL 18.4-alpine**: A modern, containerized relational database image in a lightweight container.

### Database Schema

This project uses a relational database composed of three main tables: users, games, and moves.
It models a turn-based game system where users play matches and each move is recorded.

 **Users Table** :
| Column          | Type    | Constraints     | Description                |
| --------------- | ------- | --------------- | -------------------------- |
| id              | Integer | Primary Key     | Unique user identifier     |
| username        | String  | Unique, indexed | Login / display name       |
| hashed_password | String  | Not null        | Secure password hash       |
| mmr           | Integer | Not null        | Player progression or rank |
| avatar_path | String | | Store path of player avatar | 
| intra_id | Integer | | Store intra id from oauth | 



---

**Games table** :
| Column          | Type     | Constraints              | Description                         |
| --------------- | -------- | ------------------------ | ----------------------------------- |
| id              | Integer  | Primary Key              | Unique game identifier              |
| player_white_id | Integer  | FK → users.id            | White player                        |
| player_black_id | Integer  | FK → users.id            | Black player                        |
| current_turn    | String   | Not null                 | Indicates whose turn it is          |
| status          | String   | Not null                 | Game state (e.g. ongoing, finished) |
| winner_id       | Integer  | FK → users.id (nullable) | Winner of the game                  |
| grid_size       | Integer  | Not null                 | Board size                          |
| created_at      | DateTime | Not null                 | Game creation timestamp             |
| updated_at      | DateTime | Not null                 | Last update timestamp               |

---
 **Moves table** :
| Column      | Type     | Constraints     | Description                |
| ----------- | -------- | --------------- | -------------------------- |
| id          | Integer  | Primary Key     | Unique move identifier     |
| game_id     | Integer  | FK → games.id   | Related game               |
| move_number | Integer  | Unique per game | Sequential move order      |
| player_id   | Integer  | FK → users.id   | Player who played the move |
| from_cell   | String   | Not null        | Starting position          |
| to_cell     | String   | Not null        | Destination position       |
| played_at   | DateTime | Not null        | Timestamp of the move      |

---

* This schema is designed for:
	- turn-based multiplayer gameplay
	- full match history tracking
	- replay / analysis of games
	- scalable user ranking system

---

# Features

* Turn-based multiplayer game
	- Breakthrough game

* AI bot
	- Minimax algorithm with alpha/beta pruning optimization

* Game
	- Able to reconnect to a game
	- Show move possibilities

* Game options
	- Customizable grid size
	- Different AI difficulties

* User interaction
	- Friends
	- Chat
	- Private message
	- Profile
	- Spectator mode
	- History
	- MMR

* Authentication
	- Username / Password
	- OAuth

* Remote players
	- Play on different devices on the same network

* Reverse Proxy
	- Nginx

* QOL
	- Search bar for games
	- Filter bar for games
	- Responsiveness
	- UI themes dark/light

---

# Modules

To validate this project, we must reach a total of 14 pts. Each major module counts as 2 pts and each minor module counts as 1 pt.

* **Major modules** :
	- Use a framework for both the frontend and backend. `hugmonch` `niroy` `dkittaya` `rdomange`
	- Implement real-time features using WebSockets or similar technology. `niroy`
	- Allow users to interact with other users. `hugmonch` `niroy`
	- Standard user management and authentication. `hugmonch` `niroy`
	- Introduce an AI Opponent for games. `dkittaya`
	- Implement a complete web-based game where users can play against each other. `hugmonch` `niroy` `dkittaya` `rdomange`
	- Remote players — Enable two players on separate computers to play the same game in real-time. `hugmonch` `niroy`

* **Minor modules** :
	- Use an ORM for the database. `niroy`
	- A complete notification system for all creation, update, and deletion actions. `hugmonch`
	- Real-time collaborative features. `hugmonch` `niroy`
	- Custom-made design system with reusable components, including a proper color palette, typography, and icons. `hugmonch`
	- Implement advanced search functionality with filters, sorting, and pagination. `dkittaya` `hugmonch`
	- Support for additional browsers. `hugmonch`
	- Game statistics and match history. `hugmonch` `rdomange`
	- Implement remote authentication with OAuth 2.0. `hugmonch` `niroy`
	- Game customization options. `hugmonch`
	- Implement spectator mode for games. `hugmonch`

Everything is adding up to 24 points.

---

# Individual Contributions

Individual contributions were shared across the team based on the project modules. `hugmonch` focused on the frontend and user experience, user interaction, authentication, notifications, design system, advanced search, browser support, game statistics, OAuth 2.0 integration, game customization, and spectator mode. `niroy` worked primarily on backend development, real-time communication with WebSockets, user interaction, authentication, remote multiplayer, ORM integration, collaborative features, and OAuth 2.0. `dkittaya` was responsible for developing the AI opponent and also contributed to the web-based game implementation and advanced search functionality. `rdomange` contributed to the core web-based game implementation, the game statistics , ranking module and nginx integration. Together, these contributions covered a total of 24 project points, exceeding the required 14 points for project validation.

---

# Project Structure

```
.
├── Dev_start.md
├── Makefile
├── README.md
├── frontend
│   ├── Dockerfile
│   ├── index.html
│   ├── node_modules
│   ├── package-lock.json
│   ├── package-lock.json.bak
│   ├── package.json
│   ├── public
│   ├── src
│   ├── tsconfig.json
│   ├── tsconfig.tsbuildinfo
│   └── vite.config.ts
├── infra
│   ├── docker-compose.yml
│   └── nginx
└── server
    ├── Dockerfile
    ├── README.md
    ├── ai_bot
    ├── alembic.ini
    ├── app
    ├── migrations
    ├── pyproject.toml
    └── uv.lock
```

---

# Instructions

## (DEV) Requirements

* Git
* Make
* npm
* Docker and Docker Compose
* uv

## Requirements

* Git
* Docker and Docker Compose
---

## Installation

* Clone project :

```
git clone https://github.com/Nacolis/breakprout
```

* Create an `.env`file as follow in breakprout/server/.env or use the `.env.exemple` file :

```
# App Configuration
PROJECT_NAME="Breakprout Server"
DEBUG=true
API_V1_STR="/api/v1"

# Security
SECRET_KEY="change_me_to_something_very_secret_and_secure"
ACCESS_TOKEN_EXPIRE_MINUTES=11520  # 8 days

DATABASE_URL="postgresql+asyncpg://postgres:postgres@db:5432/breakprout"

# 42 OAuth Credentials
FOURTYTWO_CLIENT_ID="your_42_client_id"
FOURTYTWO_CLIENT_SECRET="your_42_client_secret"
FOURTYTWO_REDIRECT_URI="https://localhost/api/v1/auth/42/callback"
```

## Running the application

* Run the application :
```
make
```

* Stop the application :
```
make down
```

* Clean the application :
```
make fclean
```

* For more commands :
```
make help
```

---

# Resources

* **Node.js & npm**
	- https://nodejs.org/docs/latest/api/
	- https://docs.npmjs.com

* **Vite**
	- https://vite.dev/guide/

* **React**
	- https://react.dev/learn

* **TypeScript**
	- https://www.typescriptlang.org/docs/

* **Tailwind CSS**
	- https://tailwindcss.com/docs

* **Python & UV**
	- https://docs.python.org/3/
	- https://docs.astral.sh/uv/

* **FastAPI**
	- https://fastapi.tiangolo.com

* **SQLAlchemy (Asyncio) & asyncpg**
	- https://docs.sqlalchemy.org/en/21/orm/extensions/asyncio.html
	- https://magicstack.github.io/asyncpg/current/

* **Alembic**
	- https://alembic.sqlalchemy.org/en/latest/

* **PostgreSQL**
	- https://www.postgresql.org/docs/current/index.html

---

# AI Usage

AI tools were used as a learning and documentation aid, but not to automatically generate the final project code.

AI assistance was used for:

* Understanding web development standards
* Learning different technologies used
* Clarifying technical stack behavior
* Debugging specific issues
* Generating examples for documentation and testing

All architectural decisions, implementation, debugging, and testing were performed manually by the project authors.

---

# Authors

- Nicolas Roy `niroy`
- Hugo Monchatre `hugmonch`
- Denis Kittayaso `dkittaya`
- Romain Domange `rdomange`

---

# License

This project was developed as part of the 42 School curriculum and is intended for educational purposes.
