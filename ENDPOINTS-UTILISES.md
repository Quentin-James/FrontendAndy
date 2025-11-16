# 📡 Endpoints API Utilisés dans la Codebase

> Analyse complète de tous les appels API effectués par l'application Angular

---

## 🔐 Authentication Service (`auth.service.ts`)

**Base URL**: `${environment.apiUrl}/auth`

| Endpoint        | Méthode | Description                     | Fichier           | Ligne |
| --------------- | ------- | ------------------------------- | ----------------- | ----- |
| `/auth/login`   | `POST`  | Connexion utilisateur           | `auth.service.ts` | 23    |
| `/auth/logout`  | `POST`  | Déconnexion utilisateur         | `auth.service.ts` | 63    |
| `/auth/profile` | `GET`   | Récupération profil utilisateur | `auth.service.ts` | 76    |
| `/auth/refresh` | `POST`  | Rafraîchissement du token       | `auth.service.ts` | 91    |

---

## 👥 User Service (`user.service.ts`)

**Base URL**: `${environment.apiUrl}/users`

| Endpoint                                     | Méthode  | Description                    | Fichier           | Ligne |
| -------------------------------------------- | -------- | ------------------------------ | ----------------- | ----- |
| `/users`                                     | `GET`    | Liste de tous les utilisateurs | `user.service.ts` | 20    |
| `/users/:id`                                 | `GET`    | Détails d'un utilisateur       | `user.service.ts` | 28    |
| `/users/search/email?email={email}`          | `GET`    | Recherche par email            | `user.service.ts` | 36    |
| `/users/search/username?username={username}` | `GET`    | Recherche par username         | `user.service.ts` | 45    |
| `/users/:id/profile`                         | `GET`    | Profil public avec stats       | `user.service.ts` | 54    |
| `/users/leaderboard/top`                     | `GET`    | Classement top parieurs        | `user.service.ts` | 62    |
| `/users`                                     | `POST`   | Créer un utilisateur           | `user.service.ts` | 70    |
| `/users/:id`                                 | `PATCH`  | Mettre à jour un utilisateur   | `user.service.ts` | 78    |
| `/users/:id/balance`                         | `PATCH`  | Mettre à jour le solde         | `user.service.ts` | 86    |
| `/users/:id`                                 | `DELETE` | Supprimer un utilisateur       | `user.service.ts` | 94    |

**Également appelé depuis**:

- `auth.service.ts` ligne 56 (POST `/users` pour inscription)

---

## 🎯 Bet Service (`bet.service.ts`)

**Base URL**: `${environment.apiUrl}/bets`

| Endpoint               | Méthode  | Description                     | Fichier          | Ligne |
| ---------------------- | -------- | ------------------------------- | ---------------- | ----- |
| `/bets`                | `GET`    | Liste de tous les paris (Admin) | `bet.service.ts` | 22    |
| `/bets/:id`            | `GET`    | Détails d'un pari               | `bet.service.ts` | 30    |
| `/bets/user/:userId`   | `GET`    | Paris d'un utilisateur          | `bet.service.ts` | 38    |
| `/bets/match/:matchId` | `GET`    | Paris sur un match              | `bet.service.ts` | 46    |
| `/bets`                | `POST`   | Créer un pari                   | `bet.service.ts` | 54    |
| `/bets/:id`            | `PATCH`  | Mettre à jour un pari           | `bet.service.ts` | 75    |
| `/bets/:id`            | `DELETE` | Supprimer un pari               | `bet.service.ts` | 83    |

**🎯 Résolution automatique des paris** :

- Quand un match passe en `finished` avec un `winner_id`, tous les paris `pending` sont automatiquement résolus
- Paris sur l'équipe gagnante → statut `won`
- Paris sur l'équipe perdante → statut `lost`
- Déclencheurs :
  - ✅ **Manuel** : Mise à jour admin d'un match → `admin-matches.component.ts`
  - ✅ **Automatique** : Vérification toutes les 5 min → `match-scheduler.service.ts`

**Utilisé dans les composants**:

- `admin-bets.component.ts` - `getAllBets()`
- `my-bets.component.ts` - `getMyBets(userId)`
- `place-bet.component.ts` - `createBet(data)`
- `admin-matches.component.ts` - `resolveBets(matchId, winnerId)` (résolution automatique)
- `match-scheduler.service.ts` - `resolveBets()` (vérification périodique)

---

## ⚔️ Match Service (`match.service.ts`)

**Base URL**: `${environment.apiUrl}/matches`

| Endpoint                          | Méthode  | Description              | Fichier            | Ligne |
| --------------------------------- | -------- | ------------------------ | ------------------ | ----- |
| `/matches`                        | `GET`    | Liste de tous les matchs | `match.service.ts` | 24    |
| `/matches/:id`                    | `GET`    | Détails d'un match       | `match.service.ts` | 35    |
| `/matches/status?status={status}` | `GET`    | Filtrer par statut       | `match.service.ts` | 46    |
| `/matches`                        | `POST`   | Créer un match           | `match.service.ts` | 60    |
| `/matches/:id`                    | `PUT`    | Mettre à jour un match   | `match.service.ts` | 68    |
| `/matches/:id`                    | `DELETE` | Supprimer un match       | `match.service.ts` | 81    |

**Mise à jour automatique du statut**:

- Appel interne `PUT /matches/:id` pour changer statut (ligne 119)

**Utilisé dans les composants**:

- `match-list.component.ts` - `getAllMatches()`, `getMatchesByStatus()`
- `admin-matches.component.ts` - CRUD complet
- `place-bet.component.ts` - `getMatchById(id)`

---

## 🏆 Team Service (`team.service.ts`)

**Base URL**: `${environment.apiUrl}/teams`

| Endpoint                           | Méthode  | Description                 | Fichier           | Ligne |
| ---------------------------------- | -------- | --------------------------- | ----------------- | ----- |
| `/teams`                           | `GET`    | Liste de toutes les équipes | `team.service.ts` | 22    |
| `/teams/:id`                       | `GET`    | Détails d'une équipe        | `team.service.ts` | 30    |
| `/teams/search?name={name}`        | `GET`    | Recherche par nom           | `team.service.ts` | 38    |
| `/teams/region?region={region}`    | `GET`    | Filtrer par région          | `team.service.ts` | 47    |
| `/teams`                           | `POST`   | Créer équipe (JSON)         | `team.service.ts` | 56    |
| `/teams`                           | `POST`   | Créer équipe (FormData)     | `team.service.ts` | 67    |
| `/teams/:id`                       | `PUT`    | Mettre à jour une équipe    | `team.service.ts` | 81    |
| `/teams/:id`                       | `DELETE` | Supprimer une équipe        | `team.service.ts` | 89    |
| `/teams/:teamId/players`           | `POST`   | Ajouter un joueur           | `team.service.ts` | 97    |
| `/teams/:teamId/players/:playerId` | `DELETE` | Retirer un joueur           | `team.service.ts` | 108   |

**Utilisé dans les composants**:

- `admin-teams.component.ts` - CRUD complet + upload logo
- `match-list.component.ts` - Affichage logos équipes

---

## 👤 Player Service (`player.service.ts`)

**Base URL**: `${environment.apiUrl}/players`

| Endpoint                                 | Méthode  | Description               | Fichier             | Ligne |
| ---------------------------------------- | -------- | ------------------------- | ------------------- | ----- |
| `/players`                               | `GET`    | Liste de tous les joueurs | `player.service.ts` | 22    |
| `/players/:id`                           | `GET`    | Détails d'un joueur       | `player.service.ts` | 30    |
| `/players/search?name={name}`            | `GET`    | Recherche par nom         | `player.service.ts` | 38    |
| `/players/nationality?nationality={nat}` | `GET`    | Filtrer par nationalité   | `player.service.ts` | 47    |
| `/players`                               | `POST`   | Créer un joueur           | `player.service.ts` | 56    |
| `/players/:id`                           | `PUT`    | Mettre à jour un joueur   | `player.service.ts` | 64    |
| `/players/:id`                           | `DELETE` | Supprimer un joueur       | `player.service.ts` | 72    |

**Utilisé dans les composants**:

- `admin-players.component.ts` - CRUD complet + filtres

---

## 🏅 Tournament Service (`tournament.service.ts`)

**Base URL**: `${environment.apiUrl}/tournaments`

| Endpoint                              | Méthode  | Description                | Fichier                 | Ligne |
| ------------------------------------- | -------- | -------------------------- | ----------------------- | ----- |
| `/tournaments`                        | `GET`    | Liste de tous les tournois | `tournament.service.ts` | 24    |
| `/tournaments/:id`                    | `GET`    | Détails d'un tournoi       | `tournament.service.ts` | 32    |
| `/tournaments/status?status={status}` | `GET`    | Filtrer par statut         | `tournament.service.ts` | 43    |
| `/tournaments/game?game={game}`       | `GET`    | Filtrer par jeu            | `tournament.service.ts` | 54    |
| `/tournaments`                        | `POST`   | Créer un tournoi           | `tournament.service.ts` | 65    |
| `/tournaments/:id`                    | `PUT`    | Mettre à jour un tournoi   | `tournament.service.ts` | 79    |
| `/tournaments/:id`                    | `DELETE` | Supprimer un tournoi       | `tournament.service.ts` | 90    |

**Utilisé dans les composants**:

- `admin-tournaments.component.ts` - CRUD complet + gestion statuts

---

## 💳 Transaction Service (`transaction.service.ts`)

**Base URL**: `${environment.apiUrl}/transactions`

| Endpoint                     | Méthode  | Description                      | Fichier                  | Ligne |
| ---------------------------- | -------- | -------------------------------- | ------------------------ | ----- |
| `/transactions`              | `GET`    | Liste de toutes les transactions | `transaction.service.ts` | 20    |
| `/transactions/:id`          | `GET`    | Détails d'une transaction        | `transaction.service.ts` | 28    |
| `/transactions/user/:userId` | `GET`    | Transactions d'un utilisateur    | `transaction.service.ts` | 36    |
| `/transactions`              | `POST`   | Créer une transaction            | `transaction.service.ts` | 44    |
| `/transactions/:id`          | `DELETE` | Supprimer une transaction        | `transaction.service.ts` | 52    |

**Utilisé dans les composants**:

- `user-profile.component.ts` - Affichage historique transactions
- `admin-users.component.ts` - Gestion transactions

---

## 📊 Statistiques d'Utilisation

### Par Service

| Service          | Nombre d'endpoints | Méthodes                 | Composants utilisant                       |
| ---------------- | ------------------ | ------------------------ | ------------------------------------------ |
| **Auth**         | 4                  | GET, POST                | `login`, `navbar`, `profile`               |
| **Users**        | 10                 | GET, POST, PATCH, DELETE | `admin-users`, `auth`                      |
| **Bets**         | 7                  | GET, POST, PATCH, DELETE | `admin-bets`, `my-bets`, `place-bet`       |
| **Matches**      | 6                  | GET, POST, PUT, DELETE   | `match-list`, `admin-matches`, `place-bet` |
| **Teams**        | 10                 | GET, POST, PUT, DELETE   | `admin-teams`, `match-list`                |
| **Players**      | 7                  | GET, POST, PUT, DELETE   | `admin-players`                            |
| **Tournaments**  | 7                  | GET, POST, PUT, DELETE   | `admin-tournaments`                        |
| **Transactions** | 5                  | GET, POST, DELETE        | `user-profile`, `admin-users`              |

### Total

- **56 endpoints différents**
- **8 services HTTP**
- **4 méthodes HTTP** (GET, POST, PUT/PATCH, DELETE)
- **Authentification JWT** sur 48 endpoints (85%)

---

## 🔍 Endpoints par Méthode HTTP

### GET (Lecture) - 28 endpoints
