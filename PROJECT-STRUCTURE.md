# Architecture du Projet - Site de Paris E-sport

## 📋 Principes SOLID Appliqués

### Single Responsibility Principle (SRP)

- Chaque service a une seule responsabilité (AuthService, BetService, MatchService, etc.)
- Les composants ne gèrent que leur UI
- Les guards ne gèrent que l'autorisation

### Open/Closed Principle (OCP)

- Services extensibles via interfaces
- Composants réutilisables (ex: card-component, table-component)
- Interceptors modulaires

### Liskov Substitution Principle (LSP)

- Interfaces respectées dans toute l'app
- Guards interchangeables

### Interface Segregation Principle (ISP)

- Interfaces spécifiques par domaine (UserDto, CreateBetDto, etc.)
- Pas d'interfaces monolithiques

### Dependency Inversion Principle (DIP)

- Injection de dépendances Angular
- Services abstraits injectés

---

## 📁 Structure Complète

```
AndyFrontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── admin.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   ├── models/
│   │   │   │   ├── user.model.ts
│   │   │   │   ├── bet.model.ts
│   │   │   │   ├── match.model.ts
│   │   │   │   ├── team.model.ts
│   │   │   │   ├── player.model.ts
│   │   │   │   ├── tournament.model.ts
│   │   │   │   └── transaction.model.ts
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       ├── user.service.ts
│   │   │       ├── bet.service.ts
│   │   │       ├── match.service.ts
│   │   │       ├── team.service.ts
│   │   │       ├── player.service.ts
│   │   │       ├── tournament.service.ts
│   │   │       └── transaction.service.ts
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── login.component.ts
│   │   │   │   └── register/
│   │   │   │       └── register.component.ts
│   │   │   ├── matches/
│   │   │   │   ├── match-list/
│   │   │   │   │   └── match-list.component.ts
│   │   │   │   └── match-detail/
│   │   │   │       └── match-detail.component.ts
│   │   │   ├── bets/
│   │   │   │   ├── my-bets/
│   │   │   │   │   └── my-bets.component.ts
│   │   │   │   └── place-bet/
│   │   │   │       └── place-bet.component.ts
│   │   │   ├── admin/
│   │   │   │   ├── admin-dashboard/
│   │   │   │   ├── admin-teams/
│   │   │   │   ├── admin-matches/
│   │   │   │   ├── admin-players/
│   │   │   │   ├── admin-tournaments/
│   │   │   │   └── admin-users/
│   │   │   ├── profile/
│   │   │   ├── leaderboard/
│   │   │   └── transactions/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   ├── footer/
│   │   │   │   ├── loader/
│   │   │   │   └── confirm-dialog/
│   │   │   └── pipes/
│   │   │       ├── odds.pipe.ts
│   │   │       └── balance.pipe.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── styles.scss
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 🔄 Flow de l'Application

1. **Auth Flow**

   - User → Login → AuthService → API → JWT Token
   - Token stocké → AuthInterceptor ajoute token aux requêtes
   - AuthGuard protège les routes

2. **Betting Flow**

   - User → Matches → Select Match → Place Bet
   - BetService calcule gains potentiels
   - Confirmation → API → Update Balance

3. **Admin Flow**
   - Admin Login → AdminGuard → Admin Dashboard
   - CRUD Teams/Matches/Players/Tournaments
   - Upload images (FormData)

---

## 🎯 Composants Clés

### Core Services (Responsabilité unique)

- **AuthService**: Gestion auth uniquement
- **BetService**: Gestion paris + calculs
- **MatchService**: CRUD matchs
- **TeamService**: CRUD équipes
- **UserService**: Gestion utilisateurs

### Guards (Protection routes)

- **AuthGuard**: Vérifie JWT
- **AdminGuard**: Vérifie role admin

### Interceptors (Middleware)

- **AuthInterceptor**: Ajoute JWT automatiquement
- **ErrorInterceptor**: Gestion erreurs centralisée

```

---
