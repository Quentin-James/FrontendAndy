# 🎮 E-Sport Betting Platform - Application Angular Complète

> Plateforme de paris e-sport en Angular .
> Voire le Maquette.MD pour les améliorations, pourquoi Angular et pourquoi SOLID.

---

## Vue d'ensemble

Cette application est une **plateforme complète de paris e-sport** permettant aux utilisateurs de:

- 📊 Consulter les matchs e-sport (League of Legends, Valorant, etc.)
- 💰 Placer des paris sur leurs équipes favorites
- 📈 Suivre leurs statistiques et gains
- 👑 Accéder à un panel d'administration complet (pour les admins)

## Fonctionnalités

### Authentification & Autorisation

- ✅ **Connexion/Déconnexion** avec JWT (JSON Web Token)
- ✅ **Inscription** de nouveaux utilisateurs
- ✅ **Guards** de protection des routes (AuthGuard, AdminGuard)
- ✅ **Interceptors HTTP** pour automatiser l'ajout du token
- ✅ **Gestion du profil** utilisateur avec mise à jour du solde en temps réel

### Pages Publiques (Accessibles à tous)

- ✅ **Page d'accueil** avec redirection selon le rôle
- ✅ **Liste des matchs** avec filtres (Programmés / En cours / Terminés)
- ✅ **Détails d'un match** avec informations complètes
- ✅ **Calcul automatique** des cotes et gains potentiels

### Espace Utilisateur (Authentifié)

- ✅ **Placer un pari** avec vérification du solde
- ✅ **Mes paris** avec historique et statuts
- ✅ **Profil utilisateur** avec statistiques détaillées
- ✅ **Gestion du solde** (Dépôt / Retrait)
- ✅ **Historique des transactions** complet

### 👑 Panel Admin (Rôle admin uniquement)

- ✅ **Dashboard** avec statistiques globales
- ✅ **Gestion des équipes** (CRUD + Upload de logos)
- ✅ **Gestion des matchs** (Création, modification, scores)
- ✅ **Gestion des joueurs** (CRUD + Recherche)
- ✅ **Gestion des tournois** (CRUD + Filtres)
- ✅ **Gestion des utilisateurs** (Liste, modification, suppression)
- ✅ **Supervision des paris** (Vue d'ensemble de tous les paris)
- ✅ **Résolution manuelle des paris** (Marquer comme gagné/perdu/annulé)

### Fonctionnalités avancées

- ✅ **Signals Angular** pour la réactivité
- ✅ **Standalone Components** (pas de NgModules)
- ✅ **Recherche et filtres** avancés
- ✅ **Résolution automatique des paris** (matchs terminés)
- ✅ **Paris en direct** (Live Betting)

---

## Architecture

### Principes de conception

L'application suit une **architecture en couches** inspirée de **Clean Architecture**:

```
┌─────────────────────────────────────────┐
│         PRESENTATION LAYER              │
│    (Components, Templates, Styles)      │
├─────────────────────────────────────────┤
│         APPLICATION LAYER               │
│     (Services, State Management)        │
├─────────────────────────────────────────┤
│         DOMAIN LAYER                    │
│    (Models, Interfaces, DTOs)           │
├─────────────────────────────────────────┤
│         INFRASTRUCTURE LAYER            │
│  (HTTP, Guards, Interceptors)           │
└─────────────────────────────────────────┘
```

## 🚀 Installation

### Prérequis

- **Node.js** 22
- **Angular CLI** 20

```bash
# Installer Angular CLI (si nécessaire)
npm install -g @angular/cli@17
```

### Étapes d'installation

```bash

## Utilisation

### Comptes de test

| Rôle  | Email           | Mot de passe |
| ----- | --------------- | ------------ |
| Admin | `test@test.com` | `123456`     |
| User  | `user@test.com` | `123456`     |

### Workflow utilisateur

1. **S'inscrire** ou **Se connecter**
2. Consulter la **liste des matchs**
3. Sélectionner un match et **placer un pari**
4. Voir **Mes Paris** pour suivre les résultats
5. Consulter son **Profil** pour les statistiques

### Workflow administrateur

1. Se connecter avec un compte **admin**
2. Accéder au **Dashboard Admin**
3. **Créer un tournoi** (ex: "Worlds 2026")
4. **Créer des équipes** (ex: "T1", "G2")
5. **Créer des joueurs** et les assigner aux équipes
6. **Créer un match** entre deux équipes
7. **Modifier le statut** du match (scheduled → live → finished)
8. **Superviser les paris** des utilisateurs

---

## Structure du projet

```

AndyFrontend/
├── src/
│ ├── app/
│ │ ├── core/ # Services, Guards, Interceptors
│ │ │ ├── guards/
│ │ │ │ ├── auth.guard.ts
│ │ │ │ └── admin.guard.ts
│ │ │ ├── interceptors/
│ │ │ │ └── auth.interceptor.ts
│ │ │ ├── models/ # Interfaces & DTOs
│ │ │ │ ├── user.model.ts
│ │ │ │ ├── bet.model.ts
│ │ │ │ ├── match.model.ts
│ │ │ │ └── ...
│ │ │ └── services/ # Services métier
│ │ │ ├── auth.service.ts
│ │ │ ├── bet.service.ts
│ │ │ ├── match.service.ts
│ │ │ ├── match-scheduler.service.ts
│ │ │ └── ...
│ │ ├── features/ # Composants par fonctionnalité
│ │ │ ├── auth/
│ │ │ │ ├── login/
│ │ │ │ └── register/
│ │ │ ├── admin/
│ │ │ │ ├── admin-dashboard/
│ │ │ │ ├── admin-teams/
│ │ │ │ ├── admin-matches/
│ │ │ │ ├── admin-players/
│ │ │ │ ├── admin-tournaments/
│ │ │ │ └── admin-users/
│ │ │ ├── bets/
│ │ │ │ ├── my-bets/
│ │ │ │ └── place-bet/
│ │ │ ├── matches/
│ │ │ │ └── match-list/
│ │ │ ├── profile/
│ │ │ │ └── user-profile/
│ │ │ └── home/
│ │ ├── shared/ # Composants réutilisables
│ │ │ └── components/
│ │ │ └── navbar/
│ │ ├── app.component.ts # Composant racine
│ │ ├── app.config.ts # Configuration de l'app
│ │ └── app.routes.ts # Définition des routes
│ ├── environments/ # Configuration environnements
│ │ ├── environment.ts
│ │ └── environment.prod.ts
│ ├── assets/ # Images, fonts, etc.
│ ├── index.html
│ └── styles.scss # Styles globaux
├── PROJECT-STRUCTURE.md # Architecture détaillée
├── angular.json
├── package.json
└── tsconfig.json

````

---

##  Technologies utilisées

### Frontend

| Technologie    | Version  | Description                       |
| -------------- | -------- | --------------------------------- |
| **Angular**    | 17+      | Framework principal               |
| **TypeScript** | 5.0+     | Langage de programmation          |
| **RxJS**       | 7.8+     | Programmation réactive            |
| **Signals**    | Built-in | Gestion d'état réactive (Angular) |

### Outils de développement

- **Angular CLI** - Génération de code, build, dev server
- **ESLint** - Linting du code TypeScript
- **Prettier** - Formatage automatique
- **Git** - Gestion de version

### API Backend

- **NestJS** 10+ (voir [AndyBackend](../Backend/))
- **PostgreSQL** - Base de données
- **Swagger** - Documentation API (http://localhost:3000/api)

---

## 🎯 Principes SOLID appliqués

### S - Single Responsibility Principle

Chaque service a **une seule responsabilité**:

- `AuthService` → Gestion authentification uniquement
- `BetService` → Gestion des paris + calculs
- `MatchService` → CRUD matchs
- `UserService` → Gestion utilisateurs

### O - Open/Closed Principle

- Services extensibles via **interfaces**
- Composants réutilisables (card, table)
- **Interceptors modulaires**

### L - Liskov Substitution Principle

- **Interfaces respectées** dans toute l'app
- Guards interchangeables

### I - Interface Segregation Principle

- Interfaces **spécifiques** par domaine (`CreateBetDto`, `UpdateMatchDto`)
- Pas d'interfaces monolithiques

### D - Dependency Inversion Principle

- **Injection de dépendances** Angular
- Services injectés via constructeurs

---

## 🔌 API & Backend

### Endpoints principaux

| Endpoint         | Méthode | Description             |
| ---------------- | ------- | ----------------------- |
| `/auth/login`    | POST    | Connexion               |
| `/auth/profile`  | GET     | Profil utilisateur      |
| `/users`         | GET     | Liste utilisateurs      |
| `/bets`          | POST    | Créer un pari           |
| `/bets/user/:id` | GET     | Paris d'un utilisateur  |
| `/matches`       | GET     | Liste matchs            |
| `/matches/:id`   | GET     | Détails match           |
| `/teams`         | GET     | Liste équipes           |
| `/players`       | GET     | Liste joueurs           |
| `/tournaments`   | GET     | Liste tournois          |
| `/transactions`  | GET     | Historique transactions |


### Authentification

Toutes les requêtes authentifiées nécessitent un **JWT Token**:

```typescript
// Ajouté automatiquement par AuthInterceptor
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
````

---

## 📚 Guides & Documentation

### Documentation externe

- 🅰️ [Angular Official Docs](https://angular.dev)
- 📖 [RxJS Documentation](https://rxjs.dev)
- 🎯 [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📖 Notions de cours

Cette application illustre les concepts Angular suivants:

### 1. **Standalone Components** (Nouveauté Angular 14+)

**Concept**: Composants autonomes sans besoin de `NgModule`.

**Exemple dans le projet**:

```typescript
@Component({
  selector: "app-navbar",
  standalone: true, // ← Standalone
  imports: [CommonModule, RouterLink], // ← Imports directs
  templateUrl: "./navbar.component.html",
})
export class NavbarComponent {}
```

**Avantages**:

- ✅ Plus simple à comprendre
- ✅ Moins de code boilerplate
- ✅ Lazy loading plus facile

**Cours associé**: [→ Standalone Components Guide](./docs/cours/01-standalone-components.md)

---

### 2. **Signals Angular** (Nouveauté Angular 16+)

**Concept**: Alternative à RxJS pour la réactivité, plus performante.

**Exemple dans le projet**:

```typescript
export class MyBetsComponent {
  bets = signal<Bet[]>([]);           // ← Signal (état réactif)

  loadBets(): void {
    this.betService.getMyBets().subscribe(data => {
      this.bets.set(data);             // ← Mise à jour du signal
    });
  }
}

// Template
<p>Total: {{ bets().length }}</p>     // ← Lecture du signal
```

**Avantages**:

- ✅ Pas de `.subscribe()` / `.unsubscribe()`
- ✅ Performance optimisée (change detection)
- ✅ Syntaxe plus simple

**Cours associé**: [→ Angular Signals Deep Dive](./docs/cours/02-angular-signals.md)

---

### 3. **Dependency Injection (DI)**

**Concept**: Injection de dépendances pour découpler le code.

**Exemple dans le projet**:

```typescript
@Injectable({
  providedIn: "root", // ← Singleton global
})
export class BetService {
  constructor(private http: HttpClient) {} // ← Injection
}

// Utilisation dans un composant
export class PlaceBetComponent {
  constructor(
    private betService: BetService, // ← Injection automatique
    private authService: AuthService
  ) {}
}
```

**Cours associé**: [→ Dependency Injection](./docs/cours/03-dependency-injection.md)

---

### 4. **Reactive Forms**

**Concept**: Formulaires réactifs pilotés par le code TypeScript.

**Exemple dans le projet**:

```typescript
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe(/*...*/);
    }
  }
}
```

**Cours associé**: [→ Reactive Forms](./docs/cours/04-reactive-forms.md)

---

### 5. **Guards & Route Protection**

**Concept**: Protéger l'accès aux routes selon des conditions.

**Exemple dans le projet**:

```typescript
// auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;  // ✅ Accès autorisé
  }

  router.navigate(['/login']);
  return false;   // ❌ Redirection
};

// Utilisation dans routes
{
  path: 'bets/my-bets',
  component: MyBetsComponent,
  canActivate: [authGuard]  // ← Guard appliqué
}
```

**Cours associé**: [→ Route Guards](./docs/cours/05-route-guards.md)

---

### 6. **HTTP Interceptors**

**Concept**: Middleware pour intercepter les requêtes HTTP.

**Exemple dans le projet**:

```typescript
// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
```

**Cours associé**: [→ HTTP Interceptors](./docs/cours/06-http-interceptors.md)

---

### 7. **RxJS Operators**

**Concept**: Opérateurs pour transformer les Observables.

**Exemple dans le projet**:

```typescript
this.http.get<Match[]>(this.apiUrl).pipe(
  map((matches) => this.updatePastMatchesStatus(matches)), // ← Transformation
  tap((matches) => console.log("Loaded:", matches)), // ← Side effect
  catchError((error) => {
    // ← Gestion erreur
    console.error(error);
    return of([]);
  })
);
```

**Cours associé**: [→ RxJS Operators](./docs/cours/07-rxjs-operators.md)

---

### 8. **Services & State Management**

**Concept**: Centraliser la logique métier et l'état.

**Exemple dans le projet**:

```typescript
@Injectable({ providedIn: "root" })
export class AuthService {
  currentUser = signal<User | null>(null); // ← État global
  isAuthenticated = signal<boolean>(false);

  login(email: string, password: string) {
    return this.http.post<LoginResponse>("/auth/login", { email, password }).pipe(
      tap((response) => {
        localStorage.setItem("access_token", response.access_token);
        this.currentUser.set(response.user); // ← Mise à jour état
        this.isAuthenticated.set(true);
      })
    );
  }
}
```

**Cours associé**: [→ State Management](./docs/cours/08-state-management.md)

---

### 9. **Template Syntax (Control Flow)**

**Concept**: Nouvelles directives de contrôle (`@if`, `@for`)

**Exemple dans le projet**:

```html
<!-- Ancienne syntaxe -->
<div *ngIf="user">{{ user.name }}</div>
<div *ngFor="let bet of bets">{{ bet.amount }}</div>

<!-- Nouvelle syntaxe (Angular 17+) -->
@if (user) {
<div>{{ user.name }}</div>
} @for (bet of bets; track bet.id) {
<div>{{ bet.amount }}</div>
}
```

**Cours associé**: [→ Template Control Flow](./docs/cours/09-template-control-flow.md)

---

### 10. **Lazy Loading & Code Splitting**

**Concept**: Charger les modules à la demande.

**Exemple dans le projet**:

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: "admin",
    loadComponent: () => import("./features/admin/admin-layout/admin-layout.component").then((m) => m.AdminLayoutComponent), // ← Chargé uniquement si accès /admin
    children: [
      {
        path: "dashboard",
        loadComponent: () => import("./features/admin/admin-dashboard/admin-dashboard.component").then((m) => m.AdminDashboardComponent),
      },
    ],
  },
];
```

**Cours associé**: [→ Lazy Loading](./docs/cours/10-lazy-loading.md)

---

## 🎓 Ressources d'apprentissage

### Tutoriels recommandés

1. **Angular Official Tutorial** - https://angular.dev/tutorials
2. **RxJS Learning Path** - https://www.learnrxjs.io/
3. **TypeScript Deep Dive** - https://basarat.gitbook.io/typescript/

### Vidéos

- [Angular Crash Course](https://www.youtube.com/watch?v=3qBXWUpoPHo) - Traversy Media
- [RxJS Tutorial](https://www.youtube.com/watch?v=2LCo926NFLI) - Fireship

### Livres

- **"Pro Angular"** - Adam Freeman
- **"Angular Development with TypeScript"** - Yakov Fain

---

## 🐛 Problèmes connus & Solutions

### 1. Erreur CORS

**Problème**: `Access-Control-Allow-Origin` error

**Solution**:

```typescript
// Backend NestJS - main.ts
app.enableCors({
  origin: "http://localhost:4200",
  credentials: true,
});
```

### 2. Token expiré

**Problème**: 401 Unauthorized après quelques heures

**Solution**: Implémenter refresh token (TODO)

### 3. Solde non mis à jour

**Problème**: Le solde ne s'affiche pas après dépôt

**Solution**: Forcer la mise à jour du signal

```typescript
this.authService.currentUser.set({ ...user, balance: newBalance });
this.cdr.detectChanges();
```

### Standards de code

- ✅ Utiliser **Prettier** pour le formatage
- ✅ Suivre **Angular Style Guide**
- ✅ Écrire des **commentaires JSDoc**
- ✅ Ajouter des **tests** pour les nouvelles fonctionnalités

---
