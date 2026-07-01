COMPOSE := docker compose -f infra/docker-compose.yml

all: up

up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f $(s)

ps:
	$(COMPOSE) ps

fclean:
	$(COMPOSE) down -v --rmi local

.PHONY: up down logs ps fclean
