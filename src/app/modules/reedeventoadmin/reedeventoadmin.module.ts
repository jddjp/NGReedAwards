import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ReedEventoAdminRoutingModule } from './reedeventoadmin-routing.module';

//MODULOS PERZONALIZADOS
import { SharedModule } from 'src/app/shared/shared.module';

import { SidebarModule } from 'primeng/sidebar';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { SliderModule } from 'primeng/slider';
import { MultiSelectModule } from 'primeng/multiselect';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { FileUploadModule } from 'primeng/fileupload';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { ConfirmationService } from 'primeng/api';
import { ReedEventoAdminComponent } from './reedeventoadmin.component';
import { HomeComponent } from './home/home.component';
import { MensajesContactoComponent } from './mensajes-contacto/mensajes-contacto.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ReservacionesComponent } from './reservaciones/reservaciones.component';

import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
//QR
import { QRCodeModule } from 'angularx-qrcode';
import { ReservasComponent } from './reservas/reservas.component';
import { LugaresComponent } from './lugares/lugares.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ReedEventoAdminRoutingModule,
        SharedModule,
        //PrimeNG
        ToastModule,
        DropdownModule,
        SidebarModule,
        TableModule,
        TableModule,
        CalendarModule,
        SliderModule,
        DialogModule,
        MultiSelectModule,
        ContextMenuModule,
        DropdownModule,
        ToastModule,
        TooltipModule,
        ProgressBarModule,
        FileUploadModule,
        ToolbarModule,
        RatingModule,
        FormsModule,
        RadioButtonModule,
        InputNumberModule,
        ConfirmDialogModule,
        InputTextareaModule,
        QRCodeModule
    ],
    providers: [ConfirmationService],
    declarations: [
        ReedEventoAdminComponent,
        HomeComponent,
        MensajesContactoComponent,
        UsuariosComponent,
        ReservacionesComponent,
        ReservasComponent,
        LugaresComponent,
    ]
})
export class ReedEventoAdminModule { }
