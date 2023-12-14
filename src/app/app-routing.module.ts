import { NgModule } from '@angular/core';
import {
  PreloadAllModules,
  Router,
  RouterModule,
  Routes,
} from '@angular/router';
import { AuthGuard } from './services/auth-guard.service';
const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./modules/myapp1/myapp1.module').then((m) => m.Myapp1Module),
    canActivate: [AuthGuard],
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.module').then((m) => m.AuthModule),
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor(private router: Router) {}
}
