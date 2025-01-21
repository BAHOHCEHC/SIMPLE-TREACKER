import { Routes } from '@angular/router';
import { ClientsPageComponent } from './clients-page/clients-page.component';
import { TasksComponent } from './clients-page/tasks/tasks.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'clients', // Или любой другой маршрут по умолчанию
    pathMatch: 'full',
  },
  {
    path: 'clients',
    component: ClientsPageComponent,
    children: [
      {
        path: ':id',
        component: TasksComponent,
      },
    ],
  }
];
