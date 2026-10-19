import { Routes } from '@angular/router';
import { GroupDetailComponent } from './pages/group-detail/group-detail.component';
import { GroupListComponent } from './pages/group-list/group-list.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'groups' },
  { path: 'groups', component: GroupListComponent },
  { path: 'groups/:id', component: GroupDetailComponent },
  { path: '**', redirectTo: 'groups' },
];
