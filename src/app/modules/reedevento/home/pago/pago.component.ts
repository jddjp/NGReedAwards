import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { SafeUrl } from "@angular/platform-browser"
import { PrintingService } from 'src/app/services/Print.service';
import {DialogModule} from 'primeng/dialog';
import { LugaresService } from 'src/app/services/lugares.service';
import { timer } from 'rxjs';
import { reservacionService } from 'src/app/services/reservaciones.service';
import { ReservacionModel } from '../../../../models/reservacion.model';
import { collection, doc, Firestore, getDoc, getFirestore, setDoc } from "@angular/fire/firestore";
import { collectionData } from '@angular/fire/firestore';
import { FileItem } from '../../../../models/img.model';
import { CargaImagenesService } from 'src/app/services/cargaImagenes.service';
import { VariablesService } from 'src/app/services/variablesGL.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Console } from 'console';
export class boleto {
  idLugar: String;
  precio: String;
  comprado:Boolean;
  apartado:Boolean;
  hora:String;
    constructor(){
    this.idLugar = "";
    this.precio = '';
    this.comprado=false;
    this.apartado=false;
    this.hora=""

  }
}

declare var paypal;
@Component({
  selector: 'app-pago',
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.css']
})
export class PagoComponent implements OnInit {
  @ViewChild('paypal', { static: true }) paypalElement: ElementRef;
  @ViewChild('reservacionPDF') reservacionElement!: ElementRef;

  @Input() boletosSeleccionados:boleto[];
  @Output() fetchNominaciones: EventEmitter<boolean> = new EventEmitter<boolean>()

  cols: any[];
  nombres:any[];
  boletos: boleto[]=[];
  archivos: FileItem[] = [];
  boleto:boleto={idLugar:"A1",precio:"700 USD",comprado:false,apartado:false,hora:""}
  public grabber = false;
  // comidaOpcion1 = "Short Rib, espuma de bernesesa, pure de papa al tartufo y textura de papa";
  // comidaOpcion2 = "Salmón glaseado, risotto de tomate ahumado, tierra de parmesano y tomate seco";
  comidaOpcion1 = "No disponible";
  //comidaOpcion2 = "Salmón glaseado, risotto de tomate ahumado, tierra de parmesano y tomate seco";
  comidaOpcionSelected = "";
  userData: any;
  uid = JSON.parse(localStorage.x).uid;
  constructor(    private printingService: PrintingService,
                  private lugaresService:LugaresService,
                  private reservacionService: reservacionService,
                  private afs: Firestore,
                  private cargaImagenesFBService: CargaImagenesService,
                  private variablesGL: VariablesService,
    ) {
      this.getUserData();

    }
  total = 0
  totalPorcentaje=0
  totalParcial=0
  //QR
  public qrCodeDownloadLink: SafeUrl = "";
  dataToString:any;
  data: any;
 //Status Pago
  statuspago : boolean = false;
  lugaresAdquiridos = '' ;
  codigotiket  = '' ;
  tiempo=true;
  timeLeft: number = 300;
  time:string=''
  interval;
  //Datos del comprador
  nombrecomprador  = '' ;
  correocomprador  = '' ;
//Tipo de pago
opcionSeleccionado:any;
  pagarCon : any;
  ngOnInit(): void { paypal
    .Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              description: 'Reservacion ReedAwards 2024:'+this.codigotiket,
              amount     :{
                moneda: 'US',
                value        : this.total
              }
            }
          ]
        })
      },
      onApprove: async (data, actions) => {
        // console.log(data)
        const order = await actions.order.capture();
        // console.log(order.id);
        // console.log(order.status);
        // console.log(order.purchase_units);
        if(order.status=='COMPLETED'){
          this.statuspago=true;
          this.lugaresService.updatelugarPagado(this.boletosSeleccionados)
          this.tiempo=false;
          clearInterval(this.interval);

        }
        if(this.comidaOpcionSelected == ""){
          this.comidaOpcionSelected = this.comidaOpcion1;
        }
        const dataReservacion: ReservacionModel = {
          id: Date.now().toString(),
          LugaresComprados: this.lugaresAdquiridos,
          codigotiket:this.codigotiket,
          peticionpaypal:data,
          respuestapaypal:JSON.stringify(order),
          idpagopaypal:order.id,
          statuspago: this.statuspago ==true ? 'pagado':'No pagado',
          descripcionpago: this.statuspago ==true ? 'pagado':'No pagado',
          montopago: this.total,
          uid: JSON.parse(localStorage.x).uid,
          fechaCreacion: "",
          fechaActualizacion: "",
          Nombrecomprador:this.nombrecomprador,
          fileBaucher: null,
          pagarCon: "paypal",
          platoFuerte: this.comidaOpcionSelected
        };
        this.reservacionService.addreservacion(dataReservacion);


      },
      onError: err =>{
        console.log(err);

      }
    })
    .render( this.paypalElement.nativeElement );

    this.variablesGL.endProcessCargaCompleta.subscribe(endProcessUpload => {
      //Aqui ya terminó de subir los archivos al storage y agregar las url a firestore
      if(endProcessUpload){
        if(this.archivos.length > 0){
          let imgSave = this.cargaImagenesFBService.idsImageSave;
          this.statuspago=true;
          this.lugaresService.updatelugarPagado(this.boletosSeleccionados)
          this.tiempo=false;
          clearInterval(this.interval);
          if(this.comidaOpcionSelected == ""){
            this.comidaOpcionSelected = this.comidaOpcion1;
          }
          const dataReservacion: ReservacionModel = {
            id: Date.now().toString(),
            LugaresComprados: this.lugaresAdquiridos,
            codigotiket:this.codigotiket,
            peticionpaypal:null,
            respuestapaypal:null,
            idpagopaypal:null,
            statuspago: this.statuspago == true ? 'pagado':'No pagado',
            descripcionpago: this.statuspago ==true ? 'pagado':'No pagado',
            montopago: this.total,
            uid: JSON.parse(localStorage.x).uid,
            fechaCreacion: "",
            fechaActualizacion: "",
            Nombrecomprador:this.nombrecomprador,
            pagarCon: "swift",
            fileBaucher: imgSave.find(x => x.fileMapped == 'FileBaucher') ? { idFile: imgSave.find(x => x.fileMapped == 'FileBaucher').idDoc, url: imgSave.find(x => x.fileMapped == 'FileBaucher').url } : '',
            platoFuerte: this.comidaOpcionSelected
          };
          this.reservacionService.addreservacion(dataReservacion);
        }
      }else{
        console.error("Error al guardar el baucher *******");

      }
    });

    //console.log(this.boletosSeleccionados)
    this.llenarTabla();
    this.cols = [
      { field: 'idLugar', header: 'Lugar' },
      { field: 'precio', header: 'Precio' },
    ];
    this.nombres = [
      { field: 'idLugar', header: '' },
      { field: 'precio', header: '' },
    ];

    this.tiempo=true

    this.showTime()

    this.getUserData().subscribe(data => {
      if(data) {
        this.userData = data.filter(item => item.uid === this.uid);
       this.nombrecomprador  = this.userData[0].firstName+ " "+this.userData[0].lastName
       this.correocomprador= this.userData[0].email;
      }
    },
    err => {
    }
    );

  }

  getUserData() {
    const itemsCollection = collection(this.afs,'usuarios');
    return collectionData(itemsCollection);
  }

   showTime(){
    this.interval = setInterval(() => {
      if(this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.interval);
        this.lugaresService.cancelarLugar(this.boletosSeleccionados)
        this.tiempo=false

      }
      this.time=this.secondsToString(this.timeLeft)

    },1000)



  }

  secondsToString(seconds) {

    let minute = Math.floor((seconds / 60) % 60);
    let mins= (minute < 10)? '0' + minute : minute;
    let second = seconds % 60;
    let secondS = (second < 10)? '0' + second : second;
    return  mins + ':' + secondS;
  }


  ngOnDestroy() {
    clearInterval(this.interval);
    //console.log(this.statuspago)
    this.getLugares(this.boletosSeleccionados)
    this.fetchNominaciones.emit(true)
    //// validar si se hizo el pago

  }

  calcularPrecio() {
    let sum = 0
    // for(let boleto of this.boletosSeleccionados) {
    //   console.log(boleto)
    //   sum += Number(boleto.precio.toString().replace(' USD',''))
    // }
    console.log(this.boletosSeleccionados)
    // for(let i = 0; this.boletosSeleccionados.length > i; i++) {
    //   sum += Number(this.boletosSeleccionados[i].precio.substring(0, 3))
    // }

    return this.boletosSeleccionados.reduce((acc, boleto) => acc + Number(boleto.precio), 0);
    //return sum
  }

  llenarTabla() {

    this.boletos = this.boletosSeleccionados
    this.totalParcial = this.calcularPrecio()
    this.totalPorcentaje=(this.calcularPrecio())*.05
    this.total=this.totalParcial+this.totalPorcentaje
    this.lugaresAdquiridos=this.boletos.map(x=>x.idLugar).join(",");
    this.codigotiket='REED24'+this.lugaresAdquiridos.replace(",","")+this.uid;

     this.data = [
      'INFORMACION DE TU COMPRA',
      'Nombre: '+  this.nombrecomprador,
      'Lugares Comprados:' + this.lugaresAdquiridos,
      'Total de la compra:$'+this.total +'US',
      'Correo del comprados: '+ this.correocomprador,
      'Correo del comprados: '+this.codigotiket,

    ]
     this.dataToString = JSON.stringify(this.data);
  }
  vaciarDatos() {

  }
  fetchNominacion() {

    console.log("actualizar")
  }

   // Re-enable, when a method to download images has been implemented
   onChangeURL(url: SafeUrl) {
    this.qrCodeDownloadLink = url;
  }
  capturar() {
    // Pasamos el valor seleccionado a la variable verSeleccion
    this.pagarCon = this.opcionSeleccionado;
    console.log('Tipo de pago=>'+   this.pagarCon);
}

  lugaresPagados:boleto[]=[]
  async getLugares(boleto:boleto[]){
    await this.lugaresService.getLugaresPagados(boleto[0]).subscribe( (data) => {



     for (let dato of data){
       let lug:boleto={idLugar:dato['idLugar'],precio:dato['precio'],comprado:dato['comprado'],apartado:dato['apartado'],hora:dato['fecha']}
       this.lugaresPagados.push(lug)
     }

     for(let l of this.lugaresPagados){
        if(!l.comprado){
          this.lugaresService.cancelarLugar(this.boletosSeleccionados)
        }
     }

   }, err => {

   });

 }


 onFileSelected(event: any, fileMapped: string){
  if(event.target.files.length>0){
    event.target.files;
    let archivosLista: FileList = event.target.files;
    for (const propiedad in Object.getOwnPropertyNames(archivosLista)) {
     const archivoTemp = archivosLista[propiedad];

     const newArchivo = new FileItem(archivoTemp);
     newArchivo.fileMapped = fileMapped;
     this.archivos.push(newArchivo);
    }

    this.cargaImagenesFBService.upload(this.archivos);

  }
}

public generatePDF(): void {

  let widthDocument = this.variablesGL.getWidthDocument();

  html2canvas(this.reservacionElement.nativeElement, { scale: 3 }).then((canvas) => {
  const imageGeneratedFromTemplate = canvas.toDataURL('image/png');
  const fileWidth = widthDocument;
  const generatedImageHeight = (canvas.height * fileWidth) / canvas.width;
  let PDF = new jsPDF('p', 'mm', 'a4',);
  PDF.addImage(imageGeneratedFromTemplate, 'PNG', 0, 5, fileWidth, generatedImageHeight,);
  PDF.html(this.reservacionElement.nativeElement.innerHTML);
  PDF.text(this.codigotiket.toString(),7,68);//Folio
  PDF.text(this.nombrecomprador.toString(),7,86);//Comprador
  PDF.text(this.total.toString(),110,86);//Costo
  PDF.text(this.codigotiket.toString(),7,269);//Folio
  PDF.text(this.nombrecomprador.toString(),7,288);//Comprador
  PDF.text(this.total.toString(),110,288);//Costo
  PDF.link(55, 231, 44, 7, { url: 'https://bit.ly/3KsUcLv' });//url left
  PDF.link(160, 231, 44, 7, { url: 'https://bit.ly/3PKjSUy' });//url rigth
  PDF.textWithLink('https://bit.ly/3KsUcLv', 55, 230,{ url: 'https://bit.ly/3KsUcLv' });
  PDF.textWithLink('https://bit.ly/3PKjSUy', 160, 230,{ url: 'https://bit.ly/3PKjSUy' });
  PDF.save('reed-latino-reservacion.pdf');
  });

}

}
