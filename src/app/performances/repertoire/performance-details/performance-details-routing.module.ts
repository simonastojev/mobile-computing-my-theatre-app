import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerformanceDetailsPage } from './performance-details.page';

const routes: Routes = [
  {
    path: '',
    component: PerformanceDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerformanceDetailsPageRoutingModule {}
