import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ListadoComponent } from './components/listado/listado.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { LoginComponent } from './components/login/login.component';
import { VistaPreviaComponent } from './components/vista-previa/vista-previa.component';

  const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'listado', component: ListadoComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'login', component: LoginComponent},
  { path: 'vista-previa', component: VistaPreviaComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
