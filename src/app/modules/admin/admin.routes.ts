import { Routes } from '@angular/router';
import { NotFoundComponent } from '../../not-found/not-found.component';
import { LoginAdminComponent } from '../../auth/admin/login-admin/login-admin.component';
import { HomeComponent } from './home/home.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { ConvocatoriasComponent } from './convocatorias/convocatorias.component';
import { JuecesComponent } from './jueces/jueces.component';
import { NominacionesComponent } from './nominaciones/nominaciones.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { AuthGuard } from 'src/config/auth.guard';
import { EvaluacionNominacionesComponent } from './evaluacion-nominaciones/evaluacion-nominaciones.component';
import { MensajesContactoComponent } from './mensajes-contacto/mensajes-contacto.component';
import { CategoriasNComponent } from './categoriasN/categoriasn.component';
import { CodigosDescuentoComponent } from './codigos-descuento/codigos-descuento.component';
export const adminRoutes: Routes = [
    { path: 'login', component: LoginAdminComponent },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'categoriasN', component: CategoriasNComponent, canActivate: [AuthGuard] },
    { path: 'categorias', component: CategoriasComponent, canActivate: [AuthGuard] },
    { path: 'convocatorias', component: ConvocatoriasComponent, canActivate: [AuthGuard] },
    { path: 'evaluacion-nominaciones', component: EvaluacionNominacionesComponent, canActivate: [AuthGuard] },
    { path: 'jueces', component: JuecesComponent, canActivate: [AuthGuard] },
    { path: 'nominaciones', component: NominacionesComponent, canActivate: [AuthGuard] },
    { path: 'mensajes-contacto', component: MensajesContactoComponent, canActivate: [AuthGuard] },
    { path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard] },
    { path: 'codigos-descuento', component: CodigosDescuentoComponent, canActivate: [AuthGuard] },
    // { path: 'not-found', component: NotFoundComponent },
    { path: '**', redirectTo: 'login' }
];
