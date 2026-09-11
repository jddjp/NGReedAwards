import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { reservacionService } from 'src/app/services/reservaciones.service';
import { UsuarioService } from 'src/app/services/usuarios.service';
import { DocumentData, QuerySnapshot } from 'firebase/firestore';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { ExcelService } from 'src/app/services/excel.service';
import { ConfirmationService } from 'primeng/api';
import { ReservacionModel } from 'src/app/models/reservacion.model';
import { VariablesService } from 'src/app/services/variablesGL.service';
import { SafeUrl } from '@angular/platform-browser';

// import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-reservacions',
  templateUrl: './reservaciones.component.html',
  styleUrls: ['./reservaciones.component.css']
})
export class ReservacionesComponent implements OnInit, OnDestroy {
  @ViewChild('reservacionPDF') reservacionElement!: ElementRef;
  public qrCodeDownloadLink: SafeUrl = "";

  piezasPorreservacion: any = [
    {id:'', nombre:'',pago: 0, total: 0}
  ];

  reservacionCollectiondata: any = [
    {LugaresComprados:'',
    codigotiket:'',
    descripcionpago:'',
    fechaActualizacion:'',
    fechaCreacion:'',
    id:'',
    idpagopaypal:'',
    montopago:'',
    statuspago:'',
  }
  ];
  reservacionForm: FormGroup;
  submitted: boolean;
  loading: boolean =true
  showTemplatePDF: boolean = false;
  dataToString: string = '';

  visible: boolean;
  reservacionModelDialog: boolean;
  reservacionModel: any;
  idModel: any = [
    {id:'', nombre:''}
  ];;

  excel:any;



  visibleDe:boolean= false;
  id: any;

  aniosDisponibles: string[] = [];
  selectedAnio: string = '';
  searchLugares: string = '';
  reservacionCollectionFiltrada: any[] = [];

  subscriptionStatusTemplatePDF: Subscription;

  constructor(
    private firebaseServiceUsuarios: UsuarioService,
    private firebaseServiceReservacion: reservacionService,

    private fb: FormBuilder,
    private toastr: ToastrService,
    private exporExcel: ExcelService,
    private variablesGL: VariablesService,
    private confirmationService: ConfirmationService,
  ) {

    this.subscriptionStatusTemplatePDF = variablesGL.statusTemplateRservacionPDF.subscribe( status => {
      this.showTemplatePDF = status;
    });

  }


  ngOnInit(): void {
    this.initForm();
    this.get();
     this.firebaseServiceReservacion.obsr_UpdatedSnapshot.subscribe((snapshot) => {
      this.updatereservacionCollection(snapshot);
   })
  }

  ngOnDestroy(): void {
    if(this.subscriptionStatusTemplatePDF){
      this.subscriptionStatusTemplatePDF.unsubscribe();
    }
  }

  initForm() {
    this.reservacionForm = this.fb.group({
      id: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      // fechaFin: ['', [Validators.required]],

    })
  }

  async add() {
    this.submitted = true;
    // this.visible = false
    if (this.reservacionForm.valid) {

          const { id,nombre} = this.reservacionModel;
          await this.firebaseServiceReservacion.addreservacion( this.reservacionModel);
          console.log('dd');
          this.reservacionForm.reset()

this.visible = false


    } else {

      this.toastr.info('Todos los Campos son requeridos!!', 'Espera');
      this.visible = true

    }

this.submitted = false
  }


   async get() {
      console.log("get2")
      this.firebaseServiceReservacion.getReservacionesAdmin().subscribe((data) => {
        console.log(data)
        this.reservacionCollectiondata = data;
        this.actualizarFiltroAnio();

       if(data[0]){
         let dataString = [
           'INFORMACION DE TU COMPRA',
           'Lugares Comprados:' + data[0].LugaresComprados,
           'Total de la compra:$'+ data[0].montopago + ' US',
           'Ticket de compra: '+ data[0].codigotiket,
           'Estatus de Pago: '+ data[0].descripcionpago,
           'Fecha de compra: '+ data[0].fechaCreacion,
           'Nombrecomprador: '+ data[0].Nombrecomprador,
         ]
         this.dataToString = JSON.stringify(dataString);
         console.log('datatostring ', this.dataToString);

       }

        this.loading= false
      });

   }


   updatereservacionCollection(snapshot: QuerySnapshot<DocumentData>) {
     this.reservacionCollectiondata = [];
     snapshot.docs.forEach((student) => {
       this.reservacionCollectiondata.push({ ...student.data(), id: student.id });
     })
     this.actualizarFiltroAnio();
   }

   getYear(fecha: string): string {
     if (!fecha) return '';
     const m = (fecha as string).match(/\d{2}\/\d{2}\/(\d{4})/);
     if (m) return m[1];
     const f = (fecha as string).match(/\b(19|20)\d{2}\b/);
     return f ? f[0] : '';
   }

   actualizarFiltroAnio() {
     const anios = new Set<string>();
     this.reservacionCollectiondata.forEach((r: any) => {
       const y = this.getYear(r.fechaCreacion);
       if (y) anios.add(y);
     });
     this.aniosDisponibles = Array.from(anios).sort((a, b) => +b - +a);
     this.filtrarPorAnio();
   }

    filtrarPorAnio() {
      let data = [...this.reservacionCollectiondata];
      if (this.selectedAnio) data = data.filter((r: any) => this.getYear(r.fechaCreacion) === this.selectedAnio);
      if (this.searchLugares && this.searchLugares.trim()) {
        const term = this.searchLugares.trim().toLowerCase();
        data = data.filter((r: any) => (r.LugaresComprados ?? '').toString().toLowerCase().includes(term));
      }
      this.reservacionCollectionFiltrada = data;
    }

    limpiarFiltroAnio() {
      this.selectedAnio = '';
      this.filtrarPorAnio();
    }

    limpiarFiltroLugares() {
      this.searchLugares = '';
      this.filtrarPorAnio();
    }

    limpiarFiltros() {
      this.selectedAnio = '';
      this.searchLugares = '';
      this.filtrarPorAnio();
    }

  async delete(docId: any) {
    console.log(docId);
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar la Reservacion  '+ docId.Nombrecomprador + '?',
      header: 'Confirmacion',
      icon: 'pi pi-exclamation-triangle',

      accept: () => {

          this.firebaseServiceReservacion.deletereservacion(docId.id);
      }
  });
  }
edit: boolean = false
  editar(reservacion: any) {
    this.reservacionModel = { ...reservacion }
    this.edit = true

  }
  update() {
this.firebaseServiceReservacion.updatereservacion(this.reservacionModel);
this.edit= false
  }

  openNew() {
    this.reservacionModel = { id: '', nombre: ''}
    this.visible = true;
    this.submitted = false;
    this.reservacionForm.reset()

  }
  hideDialog() {
    this.visibleDe = false;
    this.visible = false;
    this.edit = false
    this.submitted = false;
  }

  import(key:any){
    console.log(key);

  }

   Excel() {
     var reportExcel = [];
     const source = (this.selectedAnio || this.searchLugares) ? this.reservacionCollectionFiltrada : this.reservacionCollectiondata;
     this.firebaseServiceUsuarios.getusuarios().subscribe((usuarios) => {
       source.forEach((reservacion) => {
        //console.log(reservacion);
        usuarios.forEach((usuario) => {
         if (usuario.uid === reservacion.uid){
         reportExcel.push({"#":reservacion.id, "LUGARES_COMPRADOS": reservacion.LugaresComprados, "CODIGO_TICKET" : reservacion.codigotiket,
          "DESCRIPCION_CODIGO" : reservacion.descripcionpago, "FECHA_CREACION" : reservacion.fechaCreacion,"FECHA_ACTUALIZACION": reservacion.fechaActualizacion, "MONTO_PAGO": reservacion.montopago,
          "ESTATUS_PAGO": reservacion.statuspago, "ID_PAGO_PAYPAL" : reservacion.idpagopaypal, "NOMBRE_USUARIO" : usuario.firstName,"APELLIDO_USUARIO" : usuario.lastName,"EMAIL_USUARIO": usuario.email, "TELEFONO": usuario.phone
          });
          console.log(usuario);
         }

        });
      });

      this.exporExcel.reservaciones(reportExcel);
    });

  }

  onChangeURL(url: SafeUrl) {
    this.qrCodeDownloadLink = url;
    // console.log('qr ', this.qrCodeDownloadLink);

  }

  downloadPdfReservacion(reservacion: ReservacionModel){
      this.variablesGL.statusTemplateRservacionPDF.next(true);
      setTimeout(() => {
        let tmpl = {...this.reservacionElement};
        console.log('template ', tmpl);
        this.variablesGL.generateReservacionPDF(reservacion, this.reservacionElement);
      }, 100);
  }
}
