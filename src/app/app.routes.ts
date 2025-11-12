import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'matches',
    loadComponent: () =>
      import('./features/matches/match-list/match-list.component').then(
        (m) => m.MatchListComponent
      ),
  },
  // Routes paris utilisateurs
  {
    path: 'bets',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'my-bets',
        pathMatch: 'full', // ← Redirection SEULEMENT si path vide
      },
      {
        path: 'my-bets',
        loadComponent: () =>
          import('./features/bets/my-bets/my-bets.component').then(
            (m) => m.MyBetsComponent
          ),
      },
      {
        path: 'place/:id',
        loadComponent: () =>
          import('./features/bets/place-bet/place-bet.component').then(
            (m) => m.PlaceBetComponent
          ),
      },
    ],
  },

  // Routes Admin (DOIVENT être AVANT le wildcard)
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './features/admin/admin-dashboard/admin-dashboard.component'
          ).then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'bets',
        loadComponent: () =>
          import('./features/admin/bets/admin-bets.component').then(
            (m) => m.AdminBetsComponent
          ),
      },
      {
        path: 'teams',
        loadComponent: () =>
          import('./features/admin/admin-teams/admin-teams.component').then(
            (m) => m.AdminTeamsComponent
          ),
      },
      {
        path: 'matches',
        loadComponent: () =>
          import('./features/admin/admin-matches/admin-matches.component').then(
            (m) => m.AdminMatchesComponent
          ),
      },
      {
        path: 'players',
        loadComponent: () =>
          import('./features/admin/admin-players/admin-players.component').then(
            (m) => m.AdminPlayersComponent
          ),
      },
      {
        path: 'tournaments',
        loadComponent: () =>
          import(
            './features/admin/admin-tournaments/admin-tournaments.component'
          ).then((m) => m.AdminTournamentsComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/admin-users/admin-users.component').then(
            (m) => m.AdminUsersComponent
          ),
      },
    ],
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/user-profile/user-profile.component').then(
        (m) => m.UserProfileComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
