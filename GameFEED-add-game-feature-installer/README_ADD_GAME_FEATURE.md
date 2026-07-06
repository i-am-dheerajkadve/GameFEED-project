# GameFEED Add Game Feature Installer

This ZIP is made for your repository:

```bash
https://github.com/i-am-dheerajkadve/GameFEED-project.git
```

It adds the missing frontend UI for adding a new game.

## What it changes

Only this file is modified:

```bash
frontend/src/App.jsx
```

The backend does not need changes because your API already has:

```http
POST /api/games
```

and your frontend API service already has:

```js
gameService.addGame(data)
```

## How to use in WSL / Ubuntu

Go to your project root folder:

```bash
cd /mnt/c/Users/dheer/videos/projects/gamesphere
```

Copy or extract this ZIP inside that folder.

Then run:

```bash
node apply-add-game-feature.js
```

Then start the application:

```bash
docker compose up --build
```

Or if you are using your second compose file:

```bash
docker compose -f docker-compose1.yml up --build
```

Open:

```text
http://localhost:3000
```

Login or register, then click **Add Game** from the header.

## Backup

Before changing your file, the script automatically creates:

```bash
frontend/src/App.jsx.backup-before-add-game
```

If something goes wrong, restore it:

```bash
cp frontend/src/App.jsx.backup-before-add-game frontend/src/App.jsx
```
