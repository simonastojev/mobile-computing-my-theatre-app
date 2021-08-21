import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminUsersPage } from './admin-users.page';

const routes: Routes = [
  {
    path: '',
    component: AdminUsersPage
  },
  {
    path: ':userId',
    loadChildren: () => import('./user-details/user-details.module').then( m => m.UserDetailsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminUsersPageRoutingModule {}
