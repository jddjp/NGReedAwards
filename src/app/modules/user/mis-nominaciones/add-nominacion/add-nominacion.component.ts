import Swal from 'sweetalert2'
import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FileItem } from 'src/app/models/img.model';
import { PaisesService } from 'src/app/services/paises.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VariablesService } from 'src/app/services/variablesGL.service';
import { NominacionService } from 'src/app/services/nominacion.service';
import { CargaImagenesService } from 'src/app/services/cargaImagenes.service';
import { CategoriasService } from 'src/app/services/categorias.service';
import { CategoriaModel } from '../../../../models/categoria.model';
import { NominacionModel } from '../../../../models/nominacion.model';

declare var paypal;

@Component({
  selector: 'app-add-nominacion',
  templateUrl: './add-nominacion.component.html',
  styleUrls: ['./add-nominacion.component.css']
})
export class AddNominacionComponent implements OnInit, OnDestroy {

  @ViewChild('paypal', { static: false }) paypalElement: ElementRef;

  @Input() accion: string;
  @Input() nominacionEditar: any;
  @Output() fetchNominaciones: EventEmitter<boolean> = new EventEmitter<boolean>()
  producto = {
    descripcion: 'Compra por Nominacion de Reedlatino',
    precio: 152.00
  };

  // codigosDescuento = [
  //   // { codigo: 'AICODI20', descuento: 20 },
  //   // { codigo: 'REED20DESC', descuento: 20 },
  //   // { codigo: 'ANUNREED2024', descuento: 20 },
  //   // { codigo: 'REED20QROMPIO', descuento: 20 },
  //   // { codigo: 'REED20CORMPIO', descuento: 20 },
  //   // { codigo: 'REED20PUEEDO', descuento: 20 },
  //   // { codigo: 'REED20PUEMPIO', descuento: 20 },
  //   // { codigo: 'REED20NLEDO', descuento: 20 },
  //   // { codigo: 'REED20CHIEDO', descuento: 20 },
  //   // { codigo: 'REED20ATIZMPIO', descuento: 20 },
  //   // { codigo: 'REED20HUIXMPIO', descuento: 20 },
  //   // { codigo: 'REED20GTOEDO', descuento: 20 },
  //   // { codigo: 'REED20LEONMPIO', descuento: 20 },
  //   // { codigo: 'REED20NAUMPIO', descuento: 20 },
  //   // { codigo: 'REED20BUAPEDU', descuento: 20 },
  //   // { codigo: 'REED20QROOEDO', descuento: 20 },
  //   // { codigo: 'REED20TAMEDO', descuento: 20 },
  //   // { codigo: 'REED20ISTRATEGY ', descuento: 20 },
  //   // { codigo: 'REED20SANMARTIN', descuento: 20 },
  //   // { codigo: 'REED20ASOTA', descuento: 20 },
  //   // { codigo: 'REED20ACEDENO', descuento: 20 },
  //   // { codigo: 'REED20ADNA', descuento: 20 },
  //   // { codigo: 'REED20ELIAS', descuento: 20 },
  //   // { codigo: 'REED20COLB', descuento: 20 },
  //   // { codigo: 'REED20ROLC', descuento: 20 },
  //   // { codigo: 'REED20ROLC', descuento: 20 },
  //   // { codigo: 'REED20BT', descuento: 20 },
  //   // { codigo: 'REED20AVILL', descuento: 20 },
  //   // { codigo: 'REED20MASS', descuento: 20 },
  //   // { codigo: 'REED20GUTTI', descuento: 20 },
  //   // { codigo: 'REED20HEU', descuento: 20 },
  //   // { codigo: 'REED20PAN', descuento: 20 },
  //   // { codigo: 'REED20ACH', descuento: 20 },
  //   // { codigo: 'REED20GCE', descuento: 20 },
  //   // { codigo: 'REED20MEJ', descuento: 20 },
  //   // { codigo: 'REED20RUB', descuento: 20 },
  //   // { codigo: 'REED20POLI', descuento: 20 },
  //   // { codigo: 'REED20POLI', descuento: 20 },
  // ];
  codigoDesc: string = '';
  descuentoAplicado: boolean = false;

  nominacionForm: FormGroup;
  submitted: boolean;
  guardando: boolean = false;
  categorias: any[] = [];
  paises: any[] = [];
  filesSave: any[] = [];
  archivos: FileItem[] = [];
  fileLogo: FileList;
  fileCDerechos: FileList;
  fileCIntencion: FileList;
  fileMMultimedia: FileList;
  addOnlyOneFileMultimedia: boolean = false;
  fileBaucher: FileList;
  agregarLogo: boolean = true;
  agregarFileCDerechos: boolean = true;
  agregarFileCIntencion: boolean = true;
  agregarFilesMultimedia: boolean = true;
  agregarFileBaucher: boolean = true;
  preloadCategoria: CategoriaModel;
  disabledPaypal: boolean = true;
  codigosDescuento: any[] = [];
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private paisesService: PaisesService,
    private variablesGL: VariablesService,
    private nominacionService: NominacionService,
    private categoriasService: CategoriasService,
    private cargaImagenesFBService: CargaImagenesService,
    private cdr: ChangeDetectorRef
  ) {
    this.getCategorias();
    this.getPaises();
    this.getCodigosDescuento();
  }
 
  getCodigosDescuento() {
  this.nominacionService.getCodigosDescuento().subscribe((data: any[]) => {
    console.log('data codigos descuento ', data);
    this.codigosDescuento = data || [];
  });
}


  ngAfterViewInit() {
    this.initPaypalButtons();
  }
  initPaypalButtons() {
    paypal
      .Buttons({
        createOrder: (data, actions) => {

          return actions.order.create({
            purchase_units: [
              {
                description: this.producto.descripcion + "Nominado:" + this.nominacionForm.get('nominado').value,
                amount: {
                  currency_code: 'USD',
                  value: this.producto.precio
                }
              }
            ]
          });
        },
        onApprove: async (data, actions) => {
          this.guardando = true;
          const order = await actions.order.capture();
          this.nominacionForm.controls['statuspago'].setValue("Pago Realizado");
          this.nominacionForm.controls['idpago'].setValue(JSON.stringify(order));

          this.crearNominacionPago();


        },
        onError: err => {
          this.nominacionForm.controls['statuspago'].setValue("Pago No Realizado");
          this.nominacionForm.controls['idpago'].setValue(JSON.stringify(err));
          // console.log(err);
          //   this.pagoRealizado = false;

        }
      })
      .render(this.paypalElement.nativeElement);
  }


  ngOnInit(): void {
    this.initForm();

    // Función auxiliar para actualizar PayPal
    const updatePaypalStatus = () => {
      const isValid =
        this.nominacionForm.get('titulo')?.valid &&
        this.nominacionForm.get('categoria')?.valid &&
        this.nominacionForm.get('nominado')?.valid &&
        this.nominacionForm.get('descripcion')?.valid &&
        this.nominacionForm.get('fileLogoEmpresa')?.valid &&
        this.nominacionForm.get('organizacion')?.valid &&
        this.nominacionForm.get('responsable')?.valid &&
        this.nominacionForm.get('telefono')?.valid &&
        this.nominacionForm.get('pais')?.valid &&
        this.nominacionForm.get('rsInstagram')?.valid &&
        this.nominacionForm.get('rsTwitter')?.valid &&
        this.nominacionForm.get('rsFacebook')?.valid &&
        this.nominacionForm.get('rsYoutube')?.valid &&
        this.nominacionForm.get('fileCesionDerechos')?.valid &&
        this.nominacionForm.get('fileCartaIntencion')?.valid &&
        this.nominacionForm.get('fileMaterialMultimedia')?.valid;

      this.disabledPaypal = !isValid;
      console.log('✅ PayPal Status Updated - Enabled:', !this.disabledPaypal);
    };

    // Ejecutar una vez al cargar
    setTimeout(() => {
      updatePaypalStatus();
    }, 100);

    // Escuchar cambios después
    this.nominacionForm.valueChanges.subscribe(() => {
      updatePaypalStatus();
    });
  }

  ngOnDestroy(): void {
    this.variablesGL.preloadCategoria.next(null);
  }

  getCategorias() {
    this.categoriasService.getCategorias().subscribe((data) => {
      console.log('data categorias ', data)
      if (data.length > 0) {
        this.categorias = data;
        this.preloadCategoria = this.variablesGL.preloadCategoria.getValue();
        if (this.preloadCategoria) {
          this.nominacionForm.patchValue({
            categoria: this.preloadCategoria.nombre,
          });
        }
        //console.log('data categorias ', this.categorias);
        if (this.accion == 'editar') {
          this.agregarLogo = false;
          this.agregarFileCDerechos = false;
          this.agregarFileCIntencion = false;
          this.agregarFilesMultimedia = false;
          this.agregarFileBaucher = false;
          this.setValueForm();
        }
      }
    });
  }

  getPaises() {
    this.paisesService.getPaises().subscribe((data: any) => {
      if (data.length > 0) {
        this.paises = data.sort((a, b) => a.name.common - b.name.common);
        //console.log('data content paises ordenados', this.paises);
      }
    });
  }

  initForm() {
    this.nominacionForm = this.fb.group({
      titulo: ['', [Validators.required]],
      categoria: ['', [Validators.required]],
      nominado: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      fileLogoEmpresa: ['', [Validators.required]],
      organizacion: ['', [Validators.required]],
      responsable: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      pais: ['', [Validators.required]],
      rsInstagram: ['', [Validators.required]],
      rsTwitter: ['', [Validators.required]],
      rsFacebook: ['', [Validators.required]],
      rsYoutube: ['', [Validators.required]],
      fileCesionDerechos: ['', [Validators.required]],
      fileCartaIntencion: ['', [Validators.required]],
      fileMaterialMultimedia: ['', [Validators.required]],
      fileBaucher: ['', []],
      pagarCon: ['', [Validators.required]],
      statuspago: ['', []],
      idpago: ['', []],
    });
  }

  setValueForm() {
    let searchCat = this.categorias.find(x => x.nombre == this.nominacionEditar.categoria);
    // console.log('CATEGORIA ENCONTRADA ', searchCat, this.nominacionEditar.categoria, this.categorias.length);

    setTimeout(() => {
      this.nominacionForm.patchValue({
        titulo: this.nominacionEditar.titulo,
        categoria: searchCat?.nombre ? searchCat.nombre : '',
        nominado: this.nominacionEditar.nominado,
        descripcion: this.nominacionEditar.descripcion,
        fileLogoEmpresa: this.nominacionEditar?.fileLogoEmpresa?.url ? 'ya cargo archivo' : '',
        organizacion: this.nominacionEditar.organizacion,
        responsable: this.nominacionEditar.responsable,
        telefono: this.nominacionEditar.telefono,
        pais: this.nominacionEditar.pais,
        rsInstagram: this.nominacionEditar.rsInstagram,
        rsTwitter: this.nominacionEditar.rsTwitter,
        rsFacebook: this.nominacionEditar.rsFacebook,
        rsYoutube: this.nominacionEditar.rsYoutube,
        fileCesionDerechos: this.nominacionEditar?.fileCesionDerechos?.url ? 'ya cargo archivo' : '',
        fileCartaIntencion: this.nominacionEditar?.fileCartaIntencion?.url ? 'ya cargo archivo' : '',
        fileMaterialMultimedia: this.nominacionEditar.materialMultimedia,
        fileBaucher: this.nominacionEditar?.fileBaucher?.url ? 'ya cargo archivo' : '',
        pagarCon: this.nominacionEditar.pagarCon,
        statuspago: this.nominacionEditar.statuspago,
        idpago: this.nominacionEditar.idpago,
      });
    }, 100);
  }

  async crearNominacionPago() {
    if (this.accion == 'agregar' && !this.nominacionForm.valid) {

      Swal.fire({
        title: 'Por favor espera...',
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.guardando = true;


      //console.log("ACCION AGREGAR");
      const dataNominacion: NominacionModel = {
        id: Date.now().toString(),
        titulo: this.nominacionForm.get('titulo').value,
        categoria: this.nominacionForm.get('categoria').value,
        nominado: this.nominacionForm.get('nominado').value,
        descripcion: this.nominacionForm.get('descripcion').value,
        fileLogoEmpresa: [],
        organizacion: this.nominacionForm.get('organizacion').value,
        responsable: this.nominacionForm.get('responsable').value,
        telefono: this.nominacionForm.get('telefono').value,
        pais: this.nominacionForm.get('pais').value,
        rsInstagram: this.nominacionForm.get('rsInstagram').value,
        rsTwitter: this.nominacionForm.get('rsTwitter').value,
        rsFacebook: this.nominacionForm.get('rsFacebook').value,
        rsYoutube: this.nominacionForm.get('rsYoutube').value,
        fileCesionDerechos: [],
        fileCartaIntencion: [],
        materialMultimedia: [],
        // fileBaucher: { idFile: imgSave.find(x => x.fileMapped == 'FileBaucher').idDoc, url: imgSave.find(x => x.fileMapped == 'FileBaucher').url },
        fileBaucher: '',
        pagarCon: this.nominacionForm.get('pagarCon').value,
        statuspago: this.nominacionForm.get('statuspago').value,
        idpago: this.nominacionForm.get('idpago').value,
        montopago: this.producto.precio.toString(),
        uid: JSON.parse(localStorage.d).uid,
        fechaCreacion: "",
        fechaActualizacion: "",
        evaluacion: ""
      };


      this.nominacionService.addNominacion(dataNominacion);


      this.variablesGL.endProcessNominacion.subscribe(endProcessNominacion => {
        if (endProcessNominacion != '' && endProcessNominacion != null) {
          this.toastr.success('Nominación creada con exito!!', 'Success');
          this.submitted = false;
          this.guardando = false;
          this.nominacionForm.reset();
          this.archivos = [];
          console.log("END PROCESS CREATE");
          this.variablesGL.endProcessCargaCompleta.next(null);
          this.variablesGL.endProcessNominacion.next(null);
          this.fetchNominaciones.emit(true);
          Swal.close();
        } else if (endProcessNominacion == '') {
          Swal.close();
          this.toastr.error('Hubo un error al guardar la nominacion!', 'Error');
          this.submitted = false;
          this.guardando = false;
        }

      });


    } else if (this.accion == 'editar' && !this.nominacionForm.valid) {

      let dataNominacion = {
        id: this.nominacionEditar.id,
        titulo: this.nominacionForm.get('titulo').value,
        categoria: this.nominacionForm.get('categoria').value,
        nominado: this.nominacionForm.get('nominado').value,
        descripcion: this.nominacionForm.get('descripcion').value,
        fileLogoEmpresa: this.agregarLogo ? { idFile: this.filesSave.find(x => x.fileMapped == 'FileLogoEmpresa').idDoc, url: this.filesSave.find(x => x.fileMapped == 'FileLogoEmpresa').url } : this.nominacionEditar.fileLogoEmpresa,
        organizacion: this.nominacionForm.get('organizacion').value,
        responsable: this.nominacionForm.get('responsable').value,
        telefono: this.nominacionForm.get('telefono').value,
        pais: this.nominacionForm.get('pais').value,
        rsInstagram: this.nominacionForm.get('rsInstagram').value,
        rsTwitter: this.nominacionForm.get('rsTwitter').value,
        rsFacebook: this.nominacionForm.get('rsFacebook').value,
        rsYoutube: this.nominacionForm.get('rsYoutube').value,
        fileCesionDerechos: this.agregarFileCDerechos ? { idFile: this.filesSave.find(x => x.fileMapped == 'FileCesionDerechos').idDoc, url: this.filesSave.find(x => x.fileMapped == 'FileCesionDerechos').url } : this.nominacionEditar.fileCesionDerechos,
        fileCartaIntencion: this.agregarFileCIntencion ? { idFile: this.filesSave.find(x => x.fileMapped == 'FileCartaIntencion').idDoc, url: this.filesSave.find(x => x.fileMapped == 'FileCartaIntencion').url } : this.nominacionEditar.fileCartaIntencion,
        materialMultimedia: this.agregarFilesMultimedia ? this.setFilesMultimedia() : this.nominacionEditar.materialMultimedia,
        fileBaucher: this.filesSave.find(x => x.fileMapped == 'FileBaucher') ? { idFile: this.filesSave.find(x => x.fileMapped == 'FileBaucher').idDoc, url: this.filesSave.find(x => x.fileMapped == 'FileBaucher').url } : this.nominacionEditar.fileBaucher,
        pagarCon: this.nominacionForm.get('pagarCon').value,
        statuspago: this.nominacionForm.get('statuspago').value,
        idpago: this.nominacionForm.get('idpago').value,
        montopago: this.nominacionEditar.montopago,
        uid: JSON.parse(localStorage.d).uid,
        fechaCreacion: this.nominacionEditar.fechaCreacion,
        fechaActualizacion: "",
        evaluacion: ""
      }


      await this.nominacionService.updateNominacion(dataNominacion);
      this.toastr.success('Nominación actualizada con exito!!', 'Success');
      console.log("END PROCESS UPDATE");
      this.fetchNominaciones.emit(true);

      this.submitted = false;
      this.guardando = false;
      this.nominacionForm.reset();
      this.archivos = [];
      Swal.close();

      this.variablesGL.endProcessCargaCompleta.next(null);
      this.variablesGL.endProcessNominacion.next(null);
    } else {
      if (this.nominacionForm.valid) {

        Swal.fire({
          title: 'Por favor espera...',
          allowEscapeKey: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.guardando = true;

        if (this.accion == 'agregar') {
          this.archivos = [];
          this.setListaArchivos(this.fileLogo, "FileLogoEmpresa");
          this.setListaArchivos(this.fileCDerechos, "FileCesionDerechos");
          this.setListaArchivos(this.fileCIntencion, "FileCartaIntencion");
          this.setListaArchivos(this.fileMMultimedia, "FileMaterialMultimedia");

          if (this.fileBaucher) {
            this.setListaArchivos(this.fileBaucher, "FileBaucher");
            console.log('file baucher ', this.fileBaucher);
          }
          else {

            if (this.nominacionForm.get('pagarCon').value != 'paypal') {
              this.toastr.warning('No seleccionaste un archivo de baucher', 'Atención');
            }
            //return;
          }
          //Carga las imagenes solo si no se han cargado
          if (!this.variablesGL.endProcessCargaCompleta.value) {
            this.cargaImagenesFBService.upload(this.archivos, this.nominacionForm.get('categoria').value, this.nominacionForm.get('nominado').value);
          }
        } else {
          //Si no desea modificar ningun archivo se salta el upload
          if (!this.agregarLogo && !this.agregarFileCDerechos && !this.agregarFileCIntencion && !this.agregarFilesMultimedia && !this.agregarFileBaucher) {
            this.variablesGL.endProcessCargaCompleta.next(true);
          }
          //Si desea modificar algun archivo lo carga
          else {
            this.archivos = [];
            if (this.agregarLogo) {
              this.setListaArchivos(this.fileLogo, "FileLogoEmpresa");
            }
            if (this.agregarFileCDerechos) {
              this.setListaArchivos(this.fileCDerechos, "FileCesionDerechos");
            }
            if (this.agregarFileCIntencion) {
              this.setListaArchivos(this.fileCIntencion, "FileCartaIntencion");
            }
            if (this.agregarFilesMultimedia) {
              this.setListaArchivos(this.fileMMultimedia, "FileMaterialMultimedia");
            }
            if (this.agregarFileBaucher) {
              if (this.fileBaucher) {
                this.setListaArchivos(this.fileBaucher, "FileBaucher");
              }
            }
            //Carga las imagenes solo si no se han cargado
            if (this.archivos.length > 0) {
              this.cargaImagenesFBService.upload(this.archivos, this.nominacionForm.get('categoria').value, this.nominacionForm.get('nominado').value);
              //console.log("Entro a cargar los archivos al actualizar ", this.archivos.length);
            } else {
              this.variablesGL.endProcessCargaCompleta.next(true);
            }
          }
        }

        this.variablesGL.endProcessCargaCompleta.subscribe(endProcessUpload => {
          //Aqui ya terminó de subir los archivos al storage y agregar las url a firestore
          if (endProcessUpload) {
            if (this.archivos.length > 0) {
              this.toastr.success(this.archivos.length + ' Archivos cargados con exito!!', 'Success');
            }
            if (this.accion == 'agregar') {
              this.saveDataNominacion();
              //console.log("ACCION AGREGAR");
            } else {
              this.updateDataNominacion();
              //console.log("ACCION EDITAR");
            }
          }
        });
      }


    }


  }
  crearNominacion() {
    this.submitted = true;


    if (this.nominacionForm.valid) {

      Swal.fire({
        title: 'Por favor espera...',
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.guardando = true;

      if (this.accion == 'agregar') {
        this.archivos = [];
        this.setListaArchivos(this.fileLogo, "FileLogoEmpresa");
        this.setListaArchivos(this.fileCDerechos, "FileCesionDerechos");
        this.setListaArchivos(this.fileCIntencion, "FileCartaIntencion");
        this.setListaArchivos(this.fileMMultimedia, "FileMaterialMultimedia");

        if (this.fileBaucher) {
          this.setListaArchivos(this.fileBaucher, "FileBaucher");
          console.log('file baucher ', this.fileBaucher);
        }
        else {

          if (this.nominacionForm.get('pagarCon').value != 'paypal') {
            this.toastr.warning('No seleccionaste un archivo de baucher', 'Atención');
          }
          //return;
        }
        //Carga las imagenes solo si no se han cargado
        if (!this.variablesGL.endProcessCargaCompleta.value) {
          this.cargaImagenesFBService.upload(this.archivos, this.nominacionForm.get('categoria').value, this.nominacionForm.get('nominado').value);
        }
      } else {
        //Si no desea modificar ningun archivo se salta el upload
        if (!this.agregarLogo && !this.agregarFileCDerechos && !this.agregarFileCIntencion && !this.agregarFilesMultimedia && !this.agregarFileBaucher) {
          this.variablesGL.endProcessCargaCompleta.next(true);
        }
        //Si desea modificar algun archivo lo carga
        else {
          this.archivos = [];
          if (this.agregarLogo) {
            this.setListaArchivos(this.fileLogo, "FileLogoEmpresa");
          }
          if (this.agregarFileCDerechos) {
            this.setListaArchivos(this.fileCDerechos, "FileCesionDerechos");
          }
          if (this.agregarFileCIntencion) {
            this.setListaArchivos(this.fileCIntencion, "FileCartaIntencion");
          }
          if (this.agregarFilesMultimedia) {
            this.setListaArchivos(this.fileMMultimedia, "FileMaterialMultimedia");
          }
          if (this.agregarFileBaucher) {
            if (this.fileBaucher) {
              this.setListaArchivos(this.fileBaucher, "FileBaucher");
            }
          }
          //Carga las imagenes solo si no se han cargado
          if (this.archivos.length > 0) {
            this.cargaImagenesFBService.upload(this.archivos, this.nominacionForm.get('categoria').value, this.nominacionForm.get('nominado').value);
            //console.log("Entro a cargar los archivos al actualizar ", this.archivos.length);
          } else {
            this.variablesGL.endProcessCargaCompleta.next(true);
          }
        }
      }

      this.variablesGL.endProcessCargaCompleta.subscribe(endProcessUpload => {
        //Aqui ya terminó de subir los archivos al storage y agregar las url a firestore
        if (endProcessUpload) {
          if (this.archivos.length > 0) {
            this.toastr.success(this.archivos.length + ' Archivos cargados con exito!!', 'Success');
          }
          if (this.accion == 'agregar') {
            this.saveDataNominacion();
            //console.log("ACCION AGREGAR");
          } else {
            this.updateDataNominacion();
            //console.log("ACCION EDITAR");
          }
        }
      });
    }


  }

  saveDataNominacion() {
    let imgSave = this.cargaImagenesFBService.idsImageSave;
    let imgError = this.cargaImagenesFBService.idsImageErr;
    if (imgError.length && imgError.length > 0) {
      imgError.forEach(imgErr => {
        this.toastr.error('Hubo un error al cargar este archivo! :(' + imgErr.img.nombre, 'Error');
      });
      this.archivos = [];
      this.variablesGL.endProcessCargaCompleta.next(false);
    } else {
      const dataNominacion: NominacionModel = {
        id: Date.now().toString(),
        titulo: this.nominacionForm.get('titulo').value,
        categoria: this.nominacionForm.get('categoria').value,
        nominado: this.nominacionForm.get('nominado').value,
        descripcion: this.nominacionForm.get('descripcion').value,
        fileLogoEmpresa: { idFile: imgSave.find(x => x.fileMapped == 'FileLogoEmpresa').idDoc, url: imgSave.find(x => x.fileMapped == 'FileLogoEmpresa').url },
        organizacion: this.nominacionForm.get('organizacion').value,
        responsable: this.nominacionForm.get('responsable').value,
        telefono: this.nominacionForm.get('telefono').value,
        pais: this.nominacionForm.get('pais').value,
        rsInstagram: this.nominacionForm.get('rsInstagram').value,
        rsTwitter: this.nominacionForm.get('rsTwitter').value,
        rsFacebook: this.nominacionForm.get('rsFacebook').value,
        rsYoutube: this.nominacionForm.get('rsYoutube').value,
        fileCesionDerechos: { idFile: imgSave.find(x => x.fileMapped == 'FileCesionDerechos').idDoc, url: imgSave.find(x => x.fileMapped == 'FileCesionDerechos').url },
        fileCartaIntencion: { idFile: imgSave.find(x => x.fileMapped == 'FileCartaIntencion').idDoc, url: imgSave.find(x => x.fileMapped == 'FileCartaIntencion').url },
        materialMultimedia: imgSave.filter(x => x.fileMapped == 'FileMaterialMultimedia').map((data) => { return { idFile: data.idDoc, url: data.url } }),
        // fileBaucher: { idFile: imgSave.find(x => x.fileMapped == 'FileBaucher').idDoc, url: imgSave.find(x => x.fileMapped == 'FileBaucher').url },
        fileBaucher: imgSave.find(x => x.fileMapped == 'FileBaucher') ? { idFile: imgSave.find(x => x.fileMapped == 'FileBaucher').idDoc, url: imgSave.find(x => x.fileMapped == 'FileBaucher').url } : '',
        pagarCon: this.nominacionForm.get('pagarCon').value,
        statuspago: this.nominacionForm.get('statuspago').value,
        idpago: this.nominacionForm.get('idpago').value,
        montopago: this.producto.precio.toString(),
        uid: JSON.parse(localStorage.d).uid,
        fechaCreacion: "",
        fechaActualizacion: "",
        evaluacion: ""
      };

      if (dataNominacion.titulo && dataNominacion.nominado && dataNominacion.descripcion) {
        this.nominacionService.addNominacion(dataNominacion);
      }

      this.variablesGL.endProcessNominacion.subscribe(endProcessNominacion => {
        if (endProcessNominacion != '' && endProcessNominacion != null) {
          this.toastr.success('Nominación creada con exito!!', 'Success');
          this.submitted = false;
          this.guardando = false;
          this.nominacionForm.reset();
          this.archivos = [];
          console.log("END PROCESS CREATE");
          this.variablesGL.endProcessCargaCompleta.next(null);
          this.variablesGL.endProcessNominacion.next(null);
          this.fetchNominaciones.emit(true);
          Swal.close();
        } else if (endProcessNominacion == '') {
          Swal.close();
          this.toastr.error('Hubo un error al guardar la nominacion!', 'Error');
          this.submitted = false;
          this.guardando = false;
        }
      });
    }
  }

  async updateDataNominacion() {
    this.filesSave = [];
    this.filesSave = this.cargaImagenesFBService.idsImageSave;
    let imgError = this.cargaImagenesFBService.idsImageErr;
    if (imgError.length && imgError.length > 0) {
      imgError.forEach(imgErr => {
        this.toastr.error('Hubo un error al cargar este archivo! :(' + imgErr.img.nombre, 'Error');
      });
      this.archivos = [];
      this.variablesGL.endProcessCargaCompleta.next(false);
    } else {
      let dataNominacion = {
        id: this.nominacionEditar.id,
        titulo: this.nominacionForm.get('titulo').value,
        categoria: this.nominacionForm.get('categoria').value,
        nominado: this.nominacionForm.get('nominado').value,
        descripcion: this.nominacionForm.get('descripcion').value,
        fileLogoEmpresa: this.agregarLogo ? { idFile: this.filesSave.find(x => x.fileMapped == 'FileLogoEmpresa').idDoc, url: this.filesSave.find(x => x.fileMapped == 'FileLogoEmpresa').url } : this.nominacionEditar.fileLogoEmpresa,
        organizacion: this.nominacionForm.get('organizacion').value,
        responsable: this.nominacionForm.get('responsable').value,
        telefono: this.nominacionForm.get('telefono').value,
        pais: this.nominacionForm.get('pais').value,
        rsInstagram: this.nominacionForm.get('rsInstagram').value,
        rsTwitter: this.nominacionForm.get('rsTwitter').value,
        rsFacebook: this.nominacionForm.get('rsFacebook').value,
        rsYoutube: this.nominacionForm.get('rsYoutube').value,
        fileCesionDerechos: this.agregarFileCDerechos ? { idFile: this.filesSave.find(x => x.fileMapped == 'FileCesionDerechos').idDoc, url: this.filesSave.find(x => x.fileMapped == 'FileCesionDerechos').url } : this.nominacionEditar.fileCesionDerechos,
        fileCartaIntencion: this.agregarFileCIntencion ? { idFile: this.filesSave.find(x => x.fileMapped == 'FileCartaIntencion').idDoc, url: this.filesSave.find(x => x.fileMapped == 'FileCartaIntencion').url } : this.nominacionEditar.fileCartaIntencion,
        materialMultimedia: this.agregarFilesMultimedia ? this.setFilesMultimedia() : this.nominacionEditar.materialMultimedia,
        fileBaucher: this.filesSave.find(x => x.fileMapped == 'FileBaucher') ? { idFile: this.filesSave.find(x => x.fileMapped == 'FileBaucher').idDoc, url: this.filesSave.find(x => x.fileMapped == 'FileBaucher').url } : this.nominacionEditar.fileBaucher,
        pagarCon: this.nominacionForm.get('pagarCon').value,
        statuspago: this.nominacionForm.get('statuspago').value,
        idpago: this.nominacionForm.get('idpago').value,
        montopago: this.nominacionEditar.montopago,
        uid: JSON.parse(localStorage.d).uid,
        fechaCreacion: this.nominacionEditar.fechaCreacion,
        fechaActualizacion: "",
        evaluacion: ""
      }

      if (dataNominacion.titulo && dataNominacion.nominado && dataNominacion.descripcion) {
        await this.nominacionService.updateNominacion(dataNominacion);
        this.toastr.success('Nominación actualizada con exito!!', 'Success');
        console.log("END PROCESS UPDATE");
        this.fetchNominaciones.emit(true);
      } else {
        console.log('********** datos vacios, que no deberian ir... ******************');
      }
      this.submitted = false;
      this.guardando = false;
      this.nominacionForm.reset();
      this.archivos = [];
      Swal.close();

      this.variablesGL.endProcessCargaCompleta.next(null);
      this.variablesGL.endProcessNominacion.next(null);

    }
  }

  onFileSelected(event: any, fileMapped: string) {
    switch (fileMapped) {
      case "FileLogoEmpresa":
        if (event.target.files.length > 0) {
          console.log(event.target.files);

          if (this._archivoPuedeSerCargado(event.target.files[0])) {
            this.fileLogo = event.target.files;
            this.nominacionForm.get('fileLogoEmpresa').setValue("ya cargo archivo");
          } else {
            event.target.files = null;
            this.toastr.error("Solo puedes cargar imagenes como logo de la organización", "Error");
            this.nominacionForm.get('fileLogoEmpresa').reset();
          }
        } else {
          this.fileLogo = null;
          this.nominacionForm.get('fileLogoEmpresa').reset();
        }
        break;
      case "FileCesionDerechos":
        if (event.target.files.length > 0) {
          this.fileCDerechos = event.target.files;
          this.nominacionForm.get('fileCesionDerechos').setValue("ya cargo archivo");
        } else {
          this.fileCDerechos = null;
          this.nominacionForm.get('fileCesionDerechos').reset();
        }
        break;
      case "FileCartaIntencion":
        if (event.target.files.length > 0) {
          this.fileCIntencion = event.target.files;
          this.nominacionForm.get('fileCartaIntencion').setValue("ya cargo archivo");
        } else {
          this.fileCIntencion = null;
          this.nominacionForm.get('fileCartaIntencion').reset();
        }
        break;
      case "FileMaterialMultimedia":
        if (event.target.files.length > 0) {
          this.fileMMultimedia = event.target.files;
          this.nominacionForm.get('fileMaterialMultimedia').setValue("ya cargo archivo");
        } else {
          this.fileMMultimedia = null;
          this.nominacionForm.get('fileMaterialMultimedia').reset();
        }
        break;
      case "FileBaucher":
        this.agregarFileBaucher = true;
        if (event.target.files.length > 0) {
          this.fileBaucher = event.target.files;
          this.nominacionForm.get('fileBaucher').setValue("ya cargo archivo");
        } else {
          this.fileBaucher = null;
          console.log("fileBaucher", this.fileBaucher);
          this.nominacionForm.get('fileBaucher').reset();
        }
        break;
    }
  }

  setListaArchivos(archivosLista: FileList, fileMapped) {
    this._extraerArchivos(archivosLista, fileMapped);
    //console.log('lista archivos ', this.archivos);
  }

  private _extraerArchivos(archivosLista: FileList, fileMapped: string) {
    //console.log(archivosLista);

    for (const propiedad in Object.getOwnPropertyNames(archivosLista)) {
      const archivoTemp = archivosLista[propiedad];
      if (fileMapped == "FileLogoEmpresa") {
        if (this._archivoPuedeSerCargado(archivoTemp)) {
          const newArchivo = new FileItem(archivoTemp);
          newArchivo.fileMapped = fileMapped;
          this.archivos.push(newArchivo);
        } else {
          this.toastr.error("Solo puedes cargar imagenes como logo de la organización", "Error");
        }
      } else {
        const newArchivo = new FileItem(archivoTemp);
        newArchivo.fileMapped = fileMapped;
        this.archivos.push(newArchivo);
      }
    }
  }

  cambiarArchivo(fileMapped: string) {
    this.addandSetArchivosAlert();
    this.setTypeArchivo(fileMapped);
  }

  setTypeArchivo(fileMapped: string) {
    switch (fileMapped) {
      case 'FileLogoEmpresa':
        this.agregarLogo = true;
        this.nominacionForm.get('fileLogoEmpresa').reset();
        break;
      case 'FileCesionDerechos':
        this.agregarFileCDerechos = true;
        this.nominacionForm.get('fileCesionDerechos').reset();
        break;
      case 'FileCartaIntencion':
        this.agregarFileCIntencion = true;
        this.nominacionForm.get('fileCartaIntencion').reset();
        break;
      case 'FileMaterialMultimedia':
        this.agregarFilesMultimedia = true;
        this.nominacionForm.get('fileMaterialMultimedia').reset();
        break;
      case 'FileBaucher':
        this.agregarFileBaucher = true;
        this.nominacionForm.get('fileBaucher').setValue('');
        break;
    }
  }

  private _archivoPuedeSerCargado(archivo: File): boolean {
    if (this.esImagen(archivo.type)) {
      return true;
    } else {
      return false;
    }
  }
  private esImagen(tipoArchivo: string): boolean {
    return (tipoArchivo === '' || tipoArchivo === undefined) ? false : tipoArchivo.startsWith('image');
  }

  addandSetArchivosAlert() {
    Swal.fire({
      title: 'Agregar uno o Cargar todos?',
      text: `Agregar uno: Agregará los archivos que selecciones a los ya cargados.
       Cargar todos: Eliminará los archivos ya cargados por los que selecciones.`,
      allowOutsideClick: false,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3c3174',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Agregar Uno!',
      cancelButtonText: 'Cargar Todos!',
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Agregar Uno');
        this.addOnlyOneFileMultimedia = true;
      } else {
        console.log('Cargar Todos');
        this.addOnlyOneFileMultimedia = false;
      }
    });
  }

  setFilesMultimedia() {
    let archivos: any[];

    if (this.addOnlyOneFileMultimedia) {//Agregará los archivos que selecciones a los ya cargados
      archivos = this.nominacionEditar.materialMultimedia;
      this.filesSave.filter(x => x.fileMapped == 'FileMaterialMultimedia').forEach((data) => {
        if (!archivos.find(z => z.idFile == data.idDoc)) {
          archivos.push({ idFile: data.idDoc, url: data.url });
        }
      });
    } else {//Eliminará los archivos ya cargados por los que selecciones.
      archivos = this.filesSave.filter(x => x.fileMapped == 'FileMaterialMultimedia').map((data) => { return { idFile: data.idDoc, url: data.url } });
    }
    return archivos;

  }


 aplicarDescuento() {
    const codigo = this.codigoDesc.trim().toUpperCase();

    const existeCodigoDesc = this.codigosDescuento.find(
      x => x.codigo?.trim()?.toUpperCase() === codigo && x.activo !== false
    );

    if (!existeCodigoDesc) {
      this.toastr.error('Código de descuento no válido o inactivo', 'Error!');
      return;
    }

    const precioFinal = Number(existeCodigoDesc.precioFinal);

    if (!isFinite(precioFinal) || precioFinal < 0) {
      this.toastr.error('El código tiene un precio final inválido', 'Error!');
      return;
    }

    this.producto.precio = precioFinal;
    this.toastr.success('Descuento aplicado', 'Éxito!');
    this.descuentoAplicado = true;
  }
}
