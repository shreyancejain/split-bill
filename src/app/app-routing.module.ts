import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PersonComponent } from './person/person.component';
import { PersonListComponent } from './person-list/person-list.component'; // <== add the imports!
import { BalanceSheetComponent } from './balance-sheet/balance-sheet.component';

const routes: Routes = [
  { path: 'person/:name', component: PersonComponent },
  { path: 'balance-sheet', component: BalanceSheetComponent },
  {
    path: 'person',
    component: PersonListComponent
  },
  {
    path: '',
    redirectTo: '/person',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/person'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
