import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from 'src/config/auth.guard';
import { LoginUserEventoComponent } from '../../auth/userEvento/login-user/login-user.component';
import { MisLugaresComponent} from './mis-lugares/mis-lugares.component';
import { MiInformacionComponent } from './mi-informacion/mi-informacion.component';
import { ContactoComponent } from './contacto/contacto.component';
import { RegistroUserEventoComponent } from '../../auth/userEvento/registro-user/registro-user.component';
import { RecuperarPasswordEventoComponent } from '../../auth/userEvento/recuperar-password/recuperar-password.component';
import { VerificarCorreoComponent } from '../../auth/userEvento/verificar-correo/verificar-correo.component';

export const reedeventoRoutes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'mis-lugares', component: MisLugaresComponent, canActivate: [AuthGuard] },
    { path: 'mi-informacion', component: MiInformacionComponent, canActivate: [AuthGuard] },
    { path: 'contacto', component: ContactoComponent },
    { path: 'login', component: LoginUserEventoComponent },
    { path: 'registro', component: RegistroUserEventoComponent },
    { path: 'recuperarPassword', component: RecuperarPasswordEventoComponent },
    { path: 'verificarCorreo', component: VerificarCorreoComponent },
    { path: '**', redirectTo: 'login' }
];
