# 🔐 Guide Administrateur - Esport Bet API

**Version:** 1.0.0  
**Date:** 11/11/2025  
**Base URL:** `http://localhost:3000`  
**Swagger:** `http://localhost:3000/api`

---

## 📋 Table des matières

1. [Compte Administrateur](#compte-administrateur)
2. [Authentification & Profil](#authentification--profil)
3. [Gestion des Utilisateurs](#gestion-des-utilisateurs)
4. [Gestion des Paris](#gestion-des-paris)
5. [Gestion des Matchs](#gestion-des-matchs)
6. [Gestion des Joueurs](#gestion-des-joueurs)
7. [Gestion des Équipes](#gestion-des-équipes)
8. [Gestion des Tournois](#gestion-des-tournois)
9. [Gestion des Transactions](#gestion-des-transactions)
10. [Workflow Complet](#workflow-complet)
11. [Actions Dangereuses](#actions-dangereuses)
12. [Sécurité](#sécurité)

---

## 👤 Compte Administrateur

| Champ            | Valeur          |
| ---------------- | --------------- |
| **Email**        | `test@test.com` |
| **Mot de passe** | `123456`        |
| **Rôle**         | `admin`         |

**⚠️ Note :** Le compte `admin@admin.com` n'existe pas dans la base. Utilisez `test@test.com`.

---

## 🔐 Authentification & Profil

### POST /auth/login

**Se connecter et obtenir un token JWT**

**Body:**

```json
{
  "email": "test@test.com",
  "password": "123456"
}
```

**Réponse 201:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 8,
    "username": "TEST",
    "email": "test@test.com",
    "role": "admin",
    "balance": "0.00"
  }
}
```

### GET /auth/profile

**Voir son profil d'administrateur**

**Headers:**

```
Authorization: Bearer <token>
```

### POST /auth/logout

**Se déconnecter**

**Body:**

```json
{
  "refresh_token": "string"
}
```

---

## 👥 Gestion des Utilisateurs

### GET /users

**✅ Lister tous les utilisateurs**

Voir tous les comptes (admin + users)

**Réponse 200:**

```json
[
  {
    "id": 1,
    "username": "Admin",
    "email": "admin@admin.com",
    "role": "admin",
    "balance": "1000.00",
    "created_at": "2025-10-01T10:00:00.000Z"
  }
]
```

---

### GET /users/:id

**✅ Consulter un utilisateur spécifique**

**Exemple:** `GET /users/5`

---

### POST /users/register

**✅ Créer un nouveau compte**

**Body:**

```json
{
  "username": "NewAdmin",
  "email": "newadmin@example.com",
  "password": "securePassword123",
  "role": "admin"
}
```

**Cas d'usage:**

- Créer des comptes administrateurs supplémentaires
- Créer des comptes utilisateurs

---

### PUT /users/:id

**✅ Modifier un utilisateur**

**Body:**

```json
{
  "username": "UpdatedName",
  "email": "newemail@example.com",
  "balance": "5000.00",
  "role": "admin"
}
```

**Cas d'usage:**

- ✅ Créditer le solde d'un utilisateur
- ✅ Promouvoir un user en admin
- ✅ Modifier email/username
- ⚠️ Ajuster le solde manuellement

---

### DELETE /users/:id

**⚠️ Supprimer un utilisateur (DANGEREUX)**

**Exemple:** `DELETE /users/5`

**Attention:**

- ❌ Suppression définitive du compte
- ❌ Perte de toutes les données associées
- ⚠️ À utiliser pour bannir un utilisateur frauduleux

---

### GET /users/:id/stats

**✅ Consulter les statistiques d'un utilisateur**

**Réponse 200:**

```json
{
  "totalBets": 25,
  "wonBets": 15,
  "lostBets": 8,
  "pendingBets": 2,
  "winRate": 60.0,
  "totalWagered": "1250.00",
  "totalWon": "2100.00",
  "netProfit": "850.00",
  "roi": 68.0
}
```

---

### GET /users/leaderboard/top

**✅ Consulter le classement des meilleurs parieurs**

---

### POST /users/:id/change-password

**✅ Réinitialiser le mot de passe d'un utilisateur**

**Body:**

```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newSecurePass456"
}
```

---

### POST /users/:id/change-email

**✅ Modifier l'email d'un utilisateur**

**Body:**

```json
{
  "newEmail": "newemail@example.com",
  "password": "currentPassword"
}
```

---

## 🎯 Gestion des Paris

### ✅ Endpoints disponibles

- ✅ `POST /bets` - Créer un nouveau pari
- ✅ `GET /bets/user/:userId` - Récupérer les paris d'un utilisateur
- ✅ `GET /bets` - Lister tous les paris (admin uniquement)

### ❌ Endpoints manquants

- ❌ `GET /bets/:id` - Détails d'un pari spécifique
- ❌ `PUT /bets/:id` - Modifier un pari
- ❌ `DELETE /bets/:id` - Supprimer/Annuler un pari

**⚠️ Note importante :** Les utilisateurs **NE PEUVENT PAS** annuler leurs paris une fois placés. Seuls les administrateurs peuvent intervenir sur les paris via la base de données directement.

---

### GET /bets/user/:userId

**✅ Récupérer les paris d'un utilisateur**

**Paramètres:**

- `userId` (number, path) - ID de l'utilisateur

**Headers:**

```
Authorization: Bearer <token>
```

**Réponse 200:**

```json
[
  {
    "id": 1,
    "match_id": 1,
    "team_id": 2,
    "amount": 50,
    "odds": 2.5,
    "status": "pending"
  }
]
```

---

### POST /bets

**✅ Créer un nouveau pari (SEUL ENDPOINT DISPONIBLE)**

**Body:**

```json
{
  "match_id": 1,
  "team_id": 2,
  "amount": 50,
  "odds": 2.5
}
```

**⚠️ Points critiques:**

- Le backend retourne un objet vide `{}` après création (statut 201)
- Le pari est débité du solde immédiatement
- **Aucun moyen de récupérer les paris** via l'API
- Le frontend stocke les paris dans `localStorage`

**Exemple complet (Angular) avec stockage local:**

```typescript
this.betService
  .createBet({
    match_id: 1,
    team_id: 5,
    amount: 50,
    odds: 1.85,
  })
  .subscribe({
    next: (bet) => {
      // Pari créé et sauvegardé dans localStorage
      console.log("✅ Bet created and saved locally");
      this.router.navigate(["/bets/my-bets"]);
    },
    error: (error) => {
      console.error("❌ Error:", error);
    },
  });
```

**À implémenter dans le backend :**

Pour que l'application soit pleinement fonctionnelle, le backend doit ajouter :

1. `GET /bets` - Retourner les paris de l'utilisateur connecté (filtrés par JWT)
2. `GET /bets/:id` - Retourner un pari spécifique
3. `DELETE /bets/:id` - Permettre d'annuler un pari PENDING
4. Le endpoint `POST /bets` doit retourner l'objet `Bet` créé au lieu de `{}`

---

## ⚔️ Gestion des Matchs

### POST /matches

**✅ Créer un nouveau match avec cotes**

**Body:**

```json
{
  "tournament_id": 1,
  "team1_id": 5,
  "team2_id": 7,
  "scheduled_at": "2025-12-25T20:00:00Z",
  "format": "Bo5",
  "odds_team1": 1.85,
  "odds_team2": 2.1
}
```

**⚠️ Note importante sur les cotes:**

- Les cotes doivent être des nombres décimaux (ex: `1.85`, `2.10`)
- Si le backend ne retourne pas les cotes, le frontend utilise des valeurs par défaut :
  - `odds_team1`: `1.85`
  - `odds_team2`: `2.10`
- Les cotes représentent le multiplicateur du gain potentiel
- Exemple : Pari de 100€ sur une cote de 2.10 = gain potentiel de 210€

**Exemples de cotes selon les favoris:**

```json
// Équipe 1 favorite
{
  "odds_team1": 1.45,  // Favori
  "odds_team2": 2.80   // Outsider
}

// Match équilibré
{
  "odds_team1": 1.90,
  "odds_team2": 1.95
}

// Équipe 2 favorite
{
  "odds_team1": 3.50,  // Outsider
  "odds_team2": 1.30   // Grand favori
}
```

**Cas d'usage:**

- Programmer un match entre deux équipes
- Associer le match à un tournoi
- Définir les cotes pour permettre aux utilisateurs de parier

---

### PUT /matches/:id

**✅ Modifier un match (status, scores, cotes, etc.)**

**Mettre à jour les cotes:**

```json
{
  "odds_team1": 1.75,
  "odds_team2": 2.2
}
```

**⚠️ Important :** Les cotes ne peuvent être modifiées que si le match est en status `scheduled`. Une fois le match commencé (`live`), les cotes sont verrouillées.

---

## 👥 Gestion des Joueurs

### GET /players

**✅ Lister tous les joueurs**

---

### GET /players/:id

**✅ Détails d'un joueur**

---

### GET /players/search?name=Faker

**✅ Rechercher des joueurs par nom**

---

### GET /players/nationality?nationality=South%20Korea

**✅ Filtrer par nationalité**

---

### POST /players

**✅ Créer un nouveau joueur**

**Body:**

```json
{
  "name": "Faker",
  "game_tag": "T1 Faker",
  "position": "Mid",
  "birth_date": "1996-05-07",
  "nationality": "South Korea",
  "avatar_url": "https://example.com/faker.jpg"
}
```

---

### PUT /players/:id

**✅ Modifier un joueur**

**Body:**

```json
{
  "position": "Top",
  "nationality": "South Korea"
}
```

---

### DELETE /players/:id

**⚠️ Supprimer un joueur**

**Restrictions:**

- ❌ Impossible si le joueur est assigné à une équipe
- ✅ Retirer d'abord le joueur de toutes les équipes

---

## 🏆 Gestion des Équipes

### GET /teams

**✅ Lister toutes les équipes**

---

### GET /teams/:id

**✅ Détails d'une équipe**

---

### GET /teams/search?name=T1

**✅ Rechercher des équipes**

---

### GET /teams/region?region=EU

**✅ Filtrer par région**

---

### POST /teams

**✅ Créer une nouvelle équipe**

**Body:**

```json
{
  "name": "Team Alpha",
  "logo_url": "alpha.png",
  "region": "EU"
}
```

---

### PUT /teams/:id

**✅ Modifier une équipe**

**Body:**

```json
{
  "name": "Team Alpha Elite",
  "region": "NA"
}
```

---

### DELETE /teams/:id

**⚠️ Supprimer une équipe**

**Restrictions:**

- ❌ Impossible si l'équipe a des matchs programmés

---

## 🏅 Gestion des Tournois

### GET /tournaments

**✅ Lister tous les tournois**

---

### GET /tournaments/:id

**✅ Détails d'un tournoi**

---

### GET /tournaments/status?status=ongoing

**✅ Filtrer par status**

Status: `upcoming`, `ongoing`, `finished`

---

### GET /tournaments/game?game=League%20of%20Legends

**✅ Filtrer par jeu**

---

### POST /tournaments

**✅ Créer un nouveau tournoi**

**Body:**

```json
{
  "name": "Worlds 2026",
  "game": "League of Legends",
  "prize_pool": "2500000.00",
  "start_date": "2026-10-01",
  "end_date": "2026-11-15",
  "logo_url": "worlds2026.png",
  "status": "upcoming"
}
```

---

### PUT /tournaments/:id

**✅ Modifier un tournoi**

**Body:**

```json
{
  "status": "ongoing",
  "prize_pool": "3000000.00"
}
```

---

### DELETE /tournaments/:id

**⚠️ Supprimer un tournoi**

**Restrictions:**

- ❌ Impossible si des matchs sont associés

---

## 💰 Gestion des Transactions & Solde Utilisateur

### ⚠️ IMPORTANT : Mise à jour du solde

Lorsqu'une transaction est créée (dépôt ou retrait), **le solde de l'utilisateur DOIT être mis à jour manuellement** via `PATCH /users/:id/balance`.

**Workflow complet :**

```typescript
// 1. Calculer le nouveau solde
const currentBalance = parseFloat(user.balance); // "400.00" → 400
const amount = 100;
const newBalance = currentBalance + amount; // 500

// 2. Créer la transaction
POST /transactions {
  user_id: 9,
  type: "deposit",
  amount: 100,
  balance_after: 500
}

// 3. Mettre à jour le solde utilisateur
PATCH /users/9/balance {
  balance: 500  // ⚠️ IMPORTANT: Nombre (pas string)
}

// 4. Mettre à jour le signal Angular
this.authService.currentUser.set({
  ...user,
  balance: newBalance.toFixed(2)
});
```

**Points critiques :**

- ✅ Utiliser `PATCH /users/:id/balance` au lieu de `PUT /users/:id`
- ✅ Envoyer `balance` comme **nombre** (ex: `500`, pas `"500.00"`)
- ✅ Le backend retourne l'objet `User` mis à jour
- ✅ Mettre à jour le signal Angular pour affichage immédiat

**Exemple complet (Angular) :**

```typescript
const amount = Number(this.depositForm.value.amount);
const currentBalance = parseFloat(user.balance);
const newBalance = currentBalance + amount;

// 1. Créer transaction
this.transactionService
  .createTransaction({
    user_id: user.id,
    type: "deposit",
    amount: amount,
    balance_after: newBalance,
  })
  .subscribe(() => {
    // 2. Mettre à jour solde via PATCH
    this.userService
      .updateUserBalance(user.id, newBalance) // ← Nombre
      .subscribe((updatedUser) => {
        // 3. Forcer mise à jour signal
        this.authService.currentUser.set({
          ...user,
          balance: updatedUser.balance,
        });
      });
  });
```

---

## 🎮 Workflow Complet d'un Admin

### Étape 1: Créer un tournoi

```bash
POST /tournaments
```

```json
{
  "name": "Worlds 2026",
  "game": "League of Legends",
  "prize_pool": "2500000.00",
  "start_date": "2026-10-01",
  "end_date": "2026-11-15"
}
```

### Étape 2: Ajouter des équipes

```bash
POST /teams → Créer "Team Alpha"
POST /teams → Créer "Team Beta"
```

### Étape 3: Ajouter des joueurs

```bash
POST /players → Créer "Player1" assigné à Team Alpha
POST /players → Créer "Player2" assigné à Team Beta
```

### Étape 4: Créer un match

```bash
POST /matches
```

```json
{
  "tournament_id": 1,
  "team1_id": 1,
  "team2_id": 2,
  "scheduled_at": "2026-10-05T18:00:00Z",
  "format": "Bo5"
}
```

### Étape 5: Démarrer le match

```bash
PUT /matches/1
```

```json
{
  "status": "live"
}
```

### Étape 6: Mettre à jour les scores

```bash
PUT /matches/1
```

```json
{
  "score1": 2,
  "score2": 1
}
```

### Étape 7: Terminer le match

```bash
PUT /matches/1
```

```json
{
  "status": "finished",
  "score1": 3,
  "score2": 2,
  "winner_id": 1
}
```

### Étape 8: Surveiller les paris

```bash
GET /bets → Voir tous les paris sur ce match
GET /users/5/stats → Vérifier les gains des users
```

---

## ⚠️ Actions Dangereuses

| Action                   | Endpoint              | Impact                        | Récupération |
| ------------------------ | --------------------- | ----------------------------- | ------------ |
| Supprimer un utilisateur | `DELETE /users/:id`   | ❌ Perte définitive du compte | Impossible   |
| Supprimer un match       | `DELETE /matches/:id` | ❌ Impossible si paris liés   | Impossible   |
| Supprimer une équipe     | `DELETE /teams/:id`   | ❌ Impossible si matchs liés  | Impossible   |
| Modifier un pari         | `PUT /bets/:id`       | ⚠️ Peut affecter les gains    | Réversible   |
| Créer une transaction    | `POST /transactions`  | 💰 Modification du solde      | Réversible   |

**Recommandations:**

- ✅ Toujours vérifier avant de supprimer
- ✅ Utiliser les filtres pour surveiller l'activité
- ✅ Garder des logs des actions admin
- ⚠️ Ne jamais partager le compte admin

---

## 🔒 Sécurité

### Protection des endpoints

**Actuellement** (⚠️ À améliorer en production):

- Authentification JWT via `@UseGuards(JwtAuthGuard)`
- Token dans le header: `Authorization: Bearer <token>`

**À implémenter pour la production:**

```typescript
// Admin Guard
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}

// Utilisation
@UseGuards(JwtAuthGuard, AdminGuard)
@Delete('/users/:id')
async deleteUser(@Param('id') id: number) {
  // Seulement accessible aux admins
}
```

### Bonnes pratiques

1. ✅ **Toujours utiliser HTTPS en production**
2. ✅ **Changer les mots de passe par défaut**
3. ✅ **Activer les logs d'audit**
4. ✅ **Limiter les tentatives de connexion (rate limiting)**
5. ✅ **Implémenter la vérification 2FA pour les admins**
6. ✅ **Créer des rôles intermédiaires (moderator, support)**
7. ⚠️ **Ne jamais exposer les tokens dans les logs**
8. ⚠️ **Valider toutes les entrées (DTOs)**

---

## 📊 Statistiques & Monitoring

L'admin peut:

- ✅ Consulter le **leaderboard** complet des parieurs
- ✅ Voir les **statistiques de tous les utilisateurs**
- ✅ Surveiller **toutes les transactions financières**
- ✅ Analyser les **paris en temps réel**
- ✅ Détecter les **comportements suspects**
- ✅ Générer des **rapports d'activité**

**Endpoints de monitoring:**

```
GET /users/leaderboard/top
GET /users/:id/stats
GET /transactions
GET /bets
GET /matches/status?status=live
```

---

## 📞 Support

En cas de problème:

- 📧 Support technique: support@esportbet.com
- 📚 Documentation Swagger: http://localhost:3000/api
- 📖 README: ./README.md
- 📄 API Endpoints: ./API-ENDPOINTS.md

---

**Dernière mise à jour:** 11/11/2025  
**Auteur:** Esport Bet Team  
**Version:** 1.0.0
