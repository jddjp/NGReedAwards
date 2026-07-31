import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { ElementRef, ViewChild } from '@angular/core';
import { AfterViewInit, HostListener } from '@angular/core';
import { Console } from 'console';
import { boleto } from './pago/pago.component';
import { LugaresService } from 'src/app/services/lugares.service';
import { ComponentFixtureAutoDetect } from '@angular/core/testing';
import { map, Observable, shareReplay, timer } from 'rxjs';
import { DatePipe } from '@angular/common'
import Swal from 'sweetalert2';
import { collection, collectionData, Firestore, } from "@angular/fire/firestore";
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild('stageWrap') stageWrap: ElementRef<HTMLDivElement>;
  escalaEscenario = 1;
  mesaDialog: any = null;
  visibleDialogMesa = false;
  targetVip = ''
  sillas: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
  styleOBJ = { 'background': "RGB(217, 222, 224)" }
  toggle = true;
  status = "Enable";
  componetesSeleccionados: ElementRef[] = [];
  txt2 = "De la mesa A a la D son venta mesas completas";
  @ViewChildren('MyRef') inputsArray: QueryList<ElementRef>
  selectedColor = 'background-color:rgb(143, 191, 22)'
  unselectedColor = 'background-color:rgb(0, 0, 0)&:hover:{background: rgb(211, 202, 26)}'
  enableColor = 'background-color:rgb(255, 6, 6)'
  tableSelectedColor = 'rgb(143, 191, 22)'
  tableEnableColor = 'rgb(255, 6, 6)'
  disbledColor = ''
  defaultColor = ''
  styleClickOn = ''
  visibleSidebar2 = false
  displayBasic: boolean;
  boletosSeleccionados: boleto[] = []
  cargando = false
  lugares: any
  lugaresDisponibles: boleto[] = []
  clock: any;
  source = timer(0, 1000);
  end: any;
  now: Date;
  diferencia: number;
  mesa: boolean = true;
  StatusCargaLugares: boolean = false;
  userData: any;
  mesaParaComprar = []
  mesas = [
    { id: 'A1', type: 'M', precio: '7200 USD', x: 140, y: 100 },
    { id: 'B1', type: 'M', precio: '7200 USD', x: 340, y: 100 },
    { id: 'C1', type: 'M', precio: '7200 USD', x: 540, y: 100 },
    { id: 'D1', type: 'M', precio: '7200 USD', x: 740, y: 100 },
    { id: 'E1', type: 'M', precio: '7300 USD', x: 940, y: 100 },
    { id: 'F1', type: 'M', precio: '7300 USD', x: 140, y: 300 },
    { id: 'G1', type: 'M', precio: '7300 USD', x: 340, y: 300 },
    { id: 'H1', type: 'M', precio: '7300 USD', x: 540, y: 300 },
    { id: 'J1', type: 'M', precio: '7300 USD', x: 740, y: 300 },
    { id: 'K1', type: 'M', precio: '7100 USD', x: 940, y: 300 },
    { id: 'I1', type: 'M', precio: '7300 USD', x: 140, y: 500 },
    { id: 'L1', type: 'M', precio: '7100 USD', x: 340, y: 500 },
    { id: 'M1', type: 'M', precio: '7200 USD', x: 540, y: 500 },
    { id: 'N1', type: 'M', precio: '7100 USD', x: 740, y: 500 },
    { id: 'O1', type: 'M', precio: '7100 USD', x: 940, y: 500 },
    { id: 'P1', type: 'U', precio: '700 USD Individual', x: 140, y: 700 },
    { id: 'Q1', type: 'U', precio: '700 USD Individual', x: 340, y: 700 },
    { id: 'R1', type: 'U', precio: '700 USD Individual', x: 540, y: 700 },
    { id: 'S1', type: 'U', precio: '700 USD Individual', x: 740, y: 700 },
    { id: 'T1', type: 'U', precio: '700 USD Individual', x: 940, y: 700 },
    { id: 'U1', type: 'U', precio: '700 USD Individual', x: 140, y: 900 },
    { id: 'V1', type: 'U', precio: '700 USD Individual', x: 340, y: 900 },
    { id: 'W1', type: 'U', precio: '700 USD Individual', x: 540, y: 900 },
    { id: 'X1', type: 'U', precio: '700 USD Individual', x: 740, y: 900 },
    { id: 'Y1', type: 'U', precio: '700 USD Individual', x: 940, y: 900 },
    { id: 'Z1', type: 'U', precio: '700 USD Individual', x: 140, y: 1100 },
    { id: 'A2', type: 'U', precio: '7200 USD', x: 140, y: 1100 },
    { id: 'B2', type: 'U', precio: '7200 USD', x: 340, y: 1100 },
    { id: 'C2', type: 'U', precio: '7200 USD', x: 540, y: 1100 },
    { id: 'D2', type: 'U', precio: '7200 USD', x: 740, y: 1100 },
    { id: 'E2', type: 'U', precio: '7300 USD', x: 940, y: 1100 },
  ];
  soldout = false;
  constructor(
    private lugaresService: LugaresService,
    public datepipe: DatePipe,
    private afs: Firestore,
    private toastr: ToastrService
  ) {
    this.getUserData().subscribe(data => {
      if (data) {

        const d = localStorage.getItem('x');
        const user = d ? JSON.parse(d) : null;

        this.userData = data.filter(item => item.uid === user?.uid);

        //console.log(this.userData[0])


      }
    },
    );
    if (!this.soldout) {
        this.getLugares();
        this.clock = this.source.subscribe(t => {
        this.now = new Date();
      });
    }
  

  }
  ngOnInit(): void {
    if (!this.soldout) {
    Swal.fire(
      'Importante',
      'Realizar el proceso de reserva en PC para tener una mejor experiencia',
      'info'
    )}
  }

  ngAfterViewInit(): void {
    this.setEscalaEscenario();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.setEscalaEscenario();
  }

  setEscalaEscenario(): void {
    const ancho = this.stageWrap?.nativeElement?.clientWidth;
    if (ancho) {
      this.escalaEscenario = Math.min(1, ancho / 1024);
    }
  }

  seleccionarMesa(mesa: any) {
    this.mesaDialog = mesa;
    this.visibleDialogMesa = true;
  }

  getEstadoSilla(idLugar: string): string {
    const disp = this.lugaresDisponibles.find(el => el.idLugar == idLugar);
    if (disp && (disp.comprado || disp.apartado)) {
      return 'ocupada';
    }
    const sel = this.componetesSeleccionados.find(el => el?.nativeElement?.id == idLugar);
    if (sel) {
      return 'seleccionada';
    }
    return 'disponible';
  }

  seleccionarSillaDialog(idLugar: string) {
    if (this.mesaDialog?.type == 'M') {
      this.comprarMesaDialog();
      return;
    }
    const disp = this.lugaresDisponibles.find(el => el.idLugar == idLugar);
    if (!disp || disp.comprado || disp.apartado) {
      return;
    }
    this.selectedAsiento(idLugar);
  }

  comprarMesaDialog() {
    if (!this.mesaDialog) {
      return;
    }
    const disp = this.lugaresDisponibles.find(el => el.idLugar == this.mesaDialog.id + '1');
    if (!disp || disp.comprado || disp.apartado) {
      return;
    }
    this.comprarMesa(this.mesaDialog.id, 'VIP1');
  }

  async getLugares() {
    await this.lugaresService.getLugares().subscribe((data) => {
      this.lugares = data
      this.StatusCargaLugares = true;

      this.lugaresDisponibles = []
      for (let dato of data) {

      const idLugar: string = dato['idLugar'] ?? '';
      //const prefijos = ['R3', 'S3', 'W3', 'P3', 'T3', 'Q3', 'U3', 'V3', 'X3', 'Y3'];
      
      let precio = dato['precio'];
      /*if (prefijos.some(pref => idLugar.startsWith(pref))) {
        precio = 700;
      }*/

      let lug: boleto = {
        idLugar: idLugar,
        precio: precio,
        comprado: dato['comprado'],
        apartado: dato['apartado'],
        hora: dato['fecha']
      };

      this.lugaresDisponibles.push(lug);
      }

      this.initLugares()
      this.cargando = true
    }, err => {

    });

  }
  initLugares() {
    let toArray = this.inputsArray.toArray()
    for (let lugar of this.lugaresDisponibles) {
      if (lugar.hora) {
        let f = lugar.hora.toString()
        let newDate = new Date(f);
        this.diferencia = (this.now.getTime() - newDate.getTime()) / 60000;
      }

      if(lugar.hora == null || lugar.hora == undefined || lugar.hora == ''){
        //console.log("Lugar sin hora: ", lugar.idLugar);
      }
      let ref: ElementRef<HTMLInputElement> = toArray.find(el => el?.nativeElement?.id == lugar.idLugar)
      if (lugar.apartado || lugar.comprado) {
        
        if (lugar.comprado) {

          ref?.nativeElement?.setAttribute('style', this.enableColor)
          //console.log
          //console.log(lugar.idLugar)
          var type = this.mesas.find(el => el.id == lugar.idLugar.substring(0, 2))
         // console.log(type)
           if (type.type == 'M') {
              let mesaRef: ElementRef<HTMLInputElement> = toArray.find(el => el?.nativeElement?.id == type.id)
             if (mesaRef?.nativeElement) {
               mesaRef.nativeElement.style.background = this.tableEnableColor
             }
           }
         // return
        }
        else {
         
          if (lugar.apartado) {
            if(lugar.comprado){
              return
            }
            if (!lugar.comprado && this.diferencia > 2) {
              this.cancelarApartado(lugar)
              ref?.nativeElement?.setAttribute('style', this.enableColor)
            }
            console.log(lugar)
            ref?.nativeElement?.setAttribute('style', this.enableColor)
          }
        }

      }
      else {
        ref?.nativeElement?.setAttribute('style', this.unselectedColor)
      }

    }

  }

  selectedAsiento(item) {
    console.log(item);

    let disponiblidad = this.lugaresDisponibles.find(el => el.idLugar == item)
    if (!disponiblidad.comprado && !disponiblidad.apartado) {

      let toArray = this.inputsArray.toArray()
      let ref: ElementRef<HTMLInputElement> = toArray.find(el => el?.nativeElement?.id == item)
      let status = this.componetesSeleccionados.find(el => el?.nativeElement?.id == ref?.nativeElement?.id)

      if (!status) {
        this.componetesSeleccionados.push(ref)
        ref.nativeElement.setAttribute('style', this.selectedColor)

      }
      else {

        this.componetesSeleccionados = this.componetesSeleccionados.filter(item => item?.nativeElement?.id != ref?.nativeElement?.id)
        ref.nativeElement.setAttribute('style', this.unselectedColor)
      }
    }



  }

  getUserData() {
    const itemsCollection = collection(this.afs, 'usuarios');
    return collectionData(itemsCollection);
  }


  cancelarApartado(boleto: boleto) {
    console.log("cancelar apartado")
    this.lugaresService.cancelarLugarAparatdo(boleto)
  }

  realizarCompra() {
    console.log(localStorage.x)
      const d = localStorage.getItem('x');
    if (d == undefined) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Debe Iniciar Sesion!',

      })

      return
    }

    if (!this.userData[0].firstName) {
      Swal.fire(
        'Importante',
        'Perfil de usuario, aún requiere información para poder comprar tus boletos',
        'info'
      )

      return
    }


    if (this.componetesSeleccionados.length > 0) {

      this.boletosSeleccionados = []
      for (let boleto of this.componetesSeleccionados) {
        
        let idMesa = boleto?.nativeElement?.id

        var silla  = this.lugaresDisponibles.find(el => el.idLugar == idMesa)
        console.log(silla);
        this.boletosSeleccionados.push(silla)
        //this.boletosSeleccionados = this.lugaresDisponibles.filter(el => el.idLugar.startsWith(idMesa))
        //let newBoleto = { "idLugar": boleto?.nativeElement?.id, "precio": "660USD", "comprado": false, "apartado": false, "hora": this.now.toLocaleString('en-US') }
       // let estatus = this.lugaresService.getLugaresPagados(newBoleto)


      }



      this.visibleSidebar2 = true;
     // this.boletosSeleccionados = []
     /* if (this.targetVip === 'VIP1') {
        for (let boleto of this.componetesSeleccionados) {
          let newBoleto = { "idLugar": boleto?.nativeElement?.id, "precio": "700USD", "comprado": false, "apartado": false, "hora": this.now.toLocaleString('en-US') }
          this.boletosSeleccionados.push(newBoleto)
        }
      } else if (this.targetVip === 'VIP2') {
        for (let boleto of this.componetesSeleccionados) {
          let newBoleto = { "idLugar": boleto?.nativeElement?.id, "precio": "690USD", "comprado": false, "apartado": false, "hora": this.now.toLocaleString('en-US') }
          this.boletosSeleccionados.push(newBoleto)
        }
      } else if (this.targetVip === 'VIP3') {
        for (let boleto of this.componetesSeleccionados) {
          let newBoleto = { "idLugar": boleto?.nativeElement?.id, "precio": "670USD", "comprado": false, "apartado": false, "hora": this.now.toLocaleString('en-US') }
          this.boletosSeleccionados.push(newBoleto)
        }
      } else {
        for (let boleto of this.componetesSeleccionados) {
          let newBoleto = { "idLugar": boleto?.nativeElement?.id, "precio": "660USD", "comprado": false, "apartado": false, "hora": this.now.toLocaleString('en-US') }
          this.boletosSeleccionados.push(newBoleto)
        }
      }*/

      this.boletosSeleccionados.forEach(element => {
        element.hora = this.now.toLocaleString('en-US')
      })
      console.log(this.boletosSeleccionados);
      this.actualizarBoleto()

    }
    else {
      this.displayBasic = true;
    }

  }

  unseled() {
    this.boletosSeleccionados = []
    this.componetesSeleccionados = []
  }
  cancelarCompra() {

    for (let item of this.inputsArray) {

      item?.nativeElement?.setAttribute('style', this.unselectedColor)
    }
    this.componetesSeleccionados = []
    this.boletosSeleccionados = []
  }

  actualizarBoleto() {
    this.lugaresService.updatelugarApartado(this.boletosSeleccionados)

  }

  comprarMesa(idMesa, target: string) {
    console.log(idMesa);
    //this.boletosSeleccionados = []
    let disponiblidad = this.lugaresDisponibles.find(el => el.idLugar == idMesa + "1")
    
   //console.log(mesaCompleta);
    //console.log(disponiblidad);
    if (!disponiblidad.comprado && !disponiblidad.apartado) {
      let toArray = this.inputsArray.toArray()
      let colorMesa = false
      for (let silla of this.sillas) {
        let item = idMesa + silla
        let ref: ElementRef<HTMLInputElement> = toArray.find(el => el?.nativeElement?.id == item)
        let status = this.componetesSeleccionados.find(el => el?.nativeElement?.id == ref?.nativeElement?.id)
        if (!status) {
          this.componetesSeleccionados.push(ref)
          ref.nativeElement.setAttribute('style', this.selectedColor)
          colorMesa = true
          this.targetVip = target
        }
        else {
          this.componetesSeleccionados = this.componetesSeleccionados.filter(item => item?.nativeElement?.id != ref?.nativeElement?.id)
          ref.nativeElement.setAttribute('style', this.unselectedColor)
          colorMesa = false
        }

      }
      let ref: ElementRef<HTMLInputElement> = toArray.find(el => el?.nativeElement?.id == idMesa)
      if (colorMesa) {
        ref.nativeElement.style.background = this.tableSelectedColor
      }
      else {
        ref.nativeElement.style.background = ''
      }

    }
   // console.log(this.boletosSeleccionados);
  }
  showBasicDialog() {
    this.displayBasic = true;
  }

  /*addedLugares() {
    var mesa = "B2"
    for (let i = 0; i < 11; i++) {
      console.log(mesa + i)
      this.lugaresService.addLugar(mesa + i, true, true, '', '575');
    }
  }*/

  /*updateLugar() {
    var boletos = []
    var mesa = 'C2';
    for (let i = 1; i < 11; i++) {
      var updateBoleto = new boleto();
      updateBoleto.idLugar = mesa + i;
      updateBoleto.apartado = false
      updateBoleto.comprado = false;
      updateBoleto.precio = '575'
      boletos.push(updateBoleto)
    }
    console.log(boletos)
    this.lugaresService.updatelugarApartadoV2(boletos);
  }*/

    async putNewLugar() {
      const seatNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
      const promises = [];

      for (const mesa of this.mesas) {
        for (const seat of seatNumbers) {
          const idLugar = `${mesa.id}${seat}`;
          promises.push(this.lugaresService.addLugar2026(idLugar, false, false, '', mesa.precio, mesa.type, mesa.id));
        }
      }

      await Promise.all(promises);
      Swal.fire('Registro completo', 'Todos los lugares han sido guardados en la base de datos.', 'success');
    }

  insertAllMesas() {
    const subscription = this.lugaresService.getMesas2026().subscribe(async (existingMesas: any[]) => {
      const existingIds = new Set(existingMesas.map((mesa) => mesa.id?.toString().toUpperCase()));
      const promises = this.mesas
        .map((mesa, index) => ({ mesa, orden: index + 1 }))
        .filter((item) => !existingIds.has(item.mesa.id.toUpperCase()))
        .map((item) =>
          this.lugaresService.addMesa2026(
            item.mesa.id,
            item.mesa.type,
            item.mesa.precio,
            item.mesa.x,
            item.mesa.y,
            item.orden
          )
        );

      subscription.unsubscribe();

      if (promises.length === 0) {
        Swal.fire('Sin cambios', 'Ya existen todas las mesas en mesa2026.', 'info');
        return;
      }

      await Promise.all(promises);
      Swal.fire('Mesas guardadas', 'Todas las mesas se insertaron en mesa2026.', 'success');
    });
  }

}
