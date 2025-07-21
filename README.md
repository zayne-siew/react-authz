# react-authz

This project explores authorization implementations in a standard ReactJS app

## Installation

1. Set up a local `.env` file from the `.env.example` file with all the relevant variables.

2. Run the Docker containers via `docker compose up -d`.

3. Set up the PostgreSQL database via `bun db:push`.

4. Set up the OpenFGA authorization model via `bun openfga:init`.

5. Finally, pull the database schema via `bun db:typegen`.
