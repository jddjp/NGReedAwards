import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { NominacionService } from 'src/app/services/nominacion.service';

@Component({
  selector: 'app-codigos-descuento',
  templateUrl: './codigos-descuento.component.html',
  styleUrls: ['./codigos-descuento.component.css']
})
export class CodigosDescuentoComponent implements OnInit {
  codigosDescuento: any[] = [];
  codigoForm: FormGroup;
  submitted = false;
  loading = true;
  visible = false;
  edit = false;
  codigoSeleccionado: any;

  constructor(
    private fb: FormBuilder,
    private nominacionService: NominacionService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getCodigos();
  }

  initForm() {
    this.codigoForm = this.fb.group({
      codigo: ['', [Validators.required]],
      descuento: [0, [Validators.required, Validators.min(0)]],
      precioFinal: [0, [Validators.required, Validators.min(0)]],
      activo: [true]
    });
  }

  getCodigos() {
    this.nominacionService.getCodigosDescuento().subscribe((data: any[]) => {
      this.codigosDescuento = data || [];
      this.loading = false;
    });
  }

  openNew() {
    this.codigoSeleccionado = null;
    this.edit = false;
    this.visible = true;
    this.submitted = false;
    this.codigoForm.reset({
      codigo: '',
      descuento: 0,
      precioFinal: 0,
      activo: true
    });
  }

  hideDialog() {
    this.visible = false;
    this.edit = false;
    this.codigoForm.reset();
  }

  async add() {
    this.submitted = true;

    if (this.codigoForm.invalid) {
      this.toastr.info('Todos los campos son requeridos', 'Espera');
      return;
    }

    const data = {
      codigo: this.codigoForm.value.codigo.trim().toUpperCase(),
      descuento: Number(this.codigoForm.value.descuento),
      precioFinal: Number(this.codigoForm.value.precioFinal),
      activo: this.codigoForm.value.activo ?? true
    };

    await this.nominacionService.addCodigoDescuento(data);
    this.toastr.success('Código guardado correctamente', 'Éxito');
    this.visible = false;
    this.codigoForm.reset();
    this.submitted = false;
  }

  editar(codigo: any) {
    this.codigoSeleccionado = codigo;
    this.edit = true;
    this.codigoForm.patchValue({
      codigo: codigo.codigo,
      descuento: codigo.descuento,
      precioFinal: codigo.precioFinal,
      activo: codigo.activo !== false
    });
  }

  async update() {
    this.submitted = true;

    if (this.codigoForm.invalid || !this.codigoSeleccionado) {
      this.toastr.info('Verifica los datos del código', 'Espera');
      return;
    }

    const data = {
      codigo: this.codigoForm.value.codigo.trim().toUpperCase(),
      descuento: Number(this.codigoForm.value.descuento),
      precioFinal: Number(this.codigoForm.value.precioFinal),
      activo: this.codigoForm.value.activo ?? true
    };

    await this.nominacionService.updateCodigoDescuento(this.codigoSeleccionado.id, data);
    this.toastr.success('Código actualizado correctamente', 'Éxito');
    this.edit = false;
    this.codigoForm.reset();
    this.submitted = false;
  }

  delete(codigo: any) {
    this.confirmationService.confirm({
      message: `¿Deseas eliminar el código ${codigo.codigo}?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.nominacionService.deleteCodigoDescuento(codigo.id);
        this.toastr.success('Código eliminado', 'Éxito');
      }
    });
  }
}
