build:
	docker compose up --build -d

down:
	docker compose down
	docker image prune -a || true