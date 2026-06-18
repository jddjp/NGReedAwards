import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';

//MODULOS PERZONALIZADOS
import { AuthModule } from '../../auth/auth.module';
import { AdminRoutingModule } from './admin-routing.module';

import { AdminComponent } from './admin.component';
import { SharedModule } from '../../shared/shared.module';
import { HomeComponent } from './home/home.component';
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
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { InputTextareaModule } from 'primeng/inputtextarea';
import {KnobModule} from 'primeng/knob';
import { ButtonModule } from 'primeng/button';
import { CategoriasComponent } from './categorias/categorias.component';
import { ConvocatoriasComponent } from './convocatorias/convocatorias.component';
import { JuecesComponent } from './jueces/jueces.component';
import { NominacionesComponent } from './nominaciones/nominaciones.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { EvaluacionNominacionesComponent } from './evaluacion-nominaciones/evaluacion-nominaciones.component';
import { MensajesContactoComponent } from './mensajes-contacto/mensajes-contacto.component';
import { CodigosDescuentoComponent } from './codigos-descuento/codigos-descuento.component';

//PrimeNG
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { SplitButtonModule } from 'primeng/splitbutton';

import { ChipModule } from "primeng/chip";

import {PickListModule} from 'primeng/picklist';

import { InputTextModule } from 'primeng/inputtext';

import { AddNominacionAdminComponent } from './nominaciones/add-nominacion/add-nominacion.component';
import { CategoriasNComponent } from './categoriasN/categoriasn.component';
import { CheckboxModule } from 'primeng/checkbox';
import { ListboxModule } from 'primeng/listbox';
import { TagModule } from 'primeng/tag';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AuthModule,
        AdminRoutingModule,
        SharedModule,
        //PrimeNG
        ToastModule,
        CardModule,
        DropdownModule,
        SplitButtonModule,
        SidebarModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        TableModule,
        CalendarModule,
        SliderModule,
        DialogModule,
        MultiSelectModule,
        ContextMenuModule,
        DropdownModule,
        ButtonModule,
        ToastModule,
        InputTextModule,
        ProgressBarModule,
        FileUploadModule,
        ToolbarModule,
        RatingModule,
        FormsModule,
        RadioButtonModule,
        InputNumberModule,
        ConfirmDialogModule,
        InputTextareaModule,
        ChipModule,
        KnobModule,
        PickListModule,
        CheckboxModule,
        ListboxModule,
        TagModule,
    ],  providers: [ConfirmationService],
    declarations: [
        AdminComponent,
        HomeComponent,
        CategoriasNComponent,
        CategoriasComponent,
        ConvocatoriasComponent,
        JuecesComponent,
        NominacionesComponent,
        UsuariosComponent,
        EvaluacionNominacionesComponent,
        MensajesContactoComponent,
        AddNominacionAdminComponent,
        CodigosDescuentoComponent,
    ]
})
export class AdminModule { }
