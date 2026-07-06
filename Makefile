NAME		=	Breakprout

BACK_PATH	=	server/

FRONT_PATH	=	frontend/

COMPOSE	    =	docker compose -f infra/docker-compose.yml

NPM			=	cd $(FRONT_PATH) && npm

UV			=	cd $(BACK_PATH) && uv

RED		   :=	\033[1;31m
GREEN	   :=	\033[1;32m
BLUE	   :=	\033[1;34m
RESET	   :=	\033[0m

all: $(NAME)

$(NAME):
	@printf "$(BLUE)Installing frontend dependencies...$(RESET)\n"
	@$(NPM) install

	@printf "$(BLUE)Building images and Starting containers...$(RESET)\n"
	@$(COMPOSE) up --build --quiet-build -d

	@printf "$(BLUE)Installing backend dependencies...$(RESET)\n"
	@$(UV) sync

	@printf "$(BLUE)Updating database tables...$(RESET)\n"
	@$(UV) run alembic upgrade head

	@printf "$(GREEN)Breakprout Ready ✔$(RESET)\n"

up:
	@printf "$(BLUE)Starting Breakprout...$(RESET)\n"
	@$(COMPOSE) up -d
	@printf "$(GREEN)Breakprout Ready ✔$(RESET)\n"

stop:
	@printf "$(RED)Stopping Breakprout...$(RESET)\n"
	@$(COMPOSE) stop
	@printf "$(RED)Breakprout Stopped.$(RESET)\n"

down:
	@printf "$(RED)Cleaning up Breakprout...$(RESET)\n"
	@$(COMPOSE) down
	@printf "$(RED)Breakprout Cleaned.$(RESET)\n"

restart: down up

logs:
	@docker logs $(s)

ps:
	@$(COMPOSE) ps

fclean:
	@printf "$(RED)Cleaning up Breakprout...$(RESET)\n"
	@$(COMPOSE) down -v --rmi all
	@printf "$(RED)Breakprout Cleaned.$(RESET)\n"

re: fclean all

help:
	@echo "Commands :"
	@echo "  make			Start project"
	@echo "  make up		Start containers"
	@echo "  make stop		Stop containers"
	@echo "  make down		Remove containers"
	@echo "  make restart		Restart project"
	@echo "  make logs s=<service>	Show logs from service"
	@echo "  make ps		Show running containers"
	@echo "  make fclean		Full clean project"
	@echo "  make re		Reset and start project"

.PHONY: $(NAME) all up stop down restart logs ps fclean re
