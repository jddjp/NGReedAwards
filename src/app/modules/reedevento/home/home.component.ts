import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { ElementRef, ViewChild } from '@angular/core';
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
export class HomeComponent implements OnInit {

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

  mesas = [
    { id: 'A2', type: 'M', precio: 7200, x: 40, y: 80 },
    { id: 'B2', type: 'M', precio: 7200, x: 1120, y: 80 },
    { id: 'C2', type: 'M', precio: 7200, x: 40, y: 270 },
    { id: 'D2', type: 'M', precio: 7200, x: 1120, y: 270 },
    { id: 'E1', type: 'M', precio: 7300, x: 40, y: 460 },
    { id: 'F1', type: 'M', precio: 7300, x: 220, y: 400 },
    { id: 'G1', type: 'M', precio: 7300, x: 940, y: 400 },
    { id: 'H1', type: 'M', precio: 7300, x: 1120, y: 460 },
    { id: 'J1', type: 'M', precio: 7300, x: 760, y: 500 },
    { id: 'K3', type: 'U', precio: 7100, x: 40, y: 650 },
    { id: 'I1', type: 'M', precio: 7300, x: 400, y: 500 },
    { id: 'L3', type: 'U', precio: 7100, x: 220, y: 590 },
    { id: 'M2', type: 'M', precio: 7200, x: 580, y: 600 },
    { id: 'N3', type: 'U', precio: 7100, x: 940, y: 590 },
    { id: 'O3', type: 'U', precio: 7100, x: 1120, y: 650 },
    { id: 'P3', type: 'U', precio: 7100, x: 400, y: 680 },
    { id: 'Q3', type: 'U', precio: 7100, x: 760, y: 680 },
    { id: 'R3', type: 'U', precio: 7100, x: 40, y: 840 },
    { id: 'S3', type: 'U', precio: 7100, x: 220, y: 780 },
    { id: 'T3', type: 'U', precio: 7100, x: 580, y: 780 },
    { id: 'U3', type: 'U', precio: 7100, x: 940, y: 780 },
    { id: 'V3', type: 'U', precio: 7100, x: 1120, y: 840 },
    { id: 'W3', type: 'U', precio: 7100, x: 220, y: 970 },
    { id: 'X3', type: 'U', precio: 7100, x: 760, y: 970 },
    { id: 'Y3', type: 'U', precio: 7100, x: 940, y: 970 },
  ];

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

        console.log(this.userData[0])


      }
    },
    );
    this.getLugares();
    this.clock = this.source.subscribe(t => {
      this.now = new Date();
    });

  }
  ngOnInit(): void {
    Swal.fire(
      'Importante',
      'Realizar el proceso de reserva en PC para tener una mejor experiencia',
      'info'
    )
  }

  async getLugares() {
    await this.lugaresService.getLugares().subscribe((data) => {
      this.lugares = data

      this.StatusCargaLugares = true;

      this.lugaresDisponibles = []
      for (let dato of data) {
        let lug: boleto = { idLugar: dato['idLugar'], precio: dato['precio'], comprado: dato['comprado'], apartado: dato['apartado'], hora: dato['fecha'] }
        this.lugaresDisponibles.push(lug)
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
      let ref: ElementRef<HTMLInputElement> = toArray.find(el => el?.nativeElement?.id == lugar.idLugar)
      if (lugar.apartado || lugar.comprado) {
        if (lugar.comprado) {

          ref?.nativeElement?.setAttribute('style', this.enableColor)
        }
        else {

          if (lugar.apartado) {
            if (!lugar.comprado && this.diferencia > 2) {
              this.cancelarApartado(lugar)
              ref?.nativeElement?.setAttribute('style', this.enableColor)
            }
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


      for (let boleto of this.componetesSeleccionados) {
        let newBoleto = { "idLugar": boleto?.nativeElement?.id, "precio": "660USD", "comprado": false, "apartado": false, "hora": this.now.toLocaleString('en-US') }
        let estatus = this.lugaresService.getLugaresPagados(newBoleto)


      }



      this.visibleSidebar2 = true;
      if (this.targetVip === 'VIP1') {
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
      }
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
    let disponiblidad = this.lugaresDisponibles.find(el => el.idLugar == idMesa + "1")
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
        ref.nativeElement.setAttribute('style', this.selectedColor)
      }
      else {
        ref.nativeElement.setAttribute('style', this.unselectedColor)
      }

    }
  }
  showBasicDialog() {
    this.displayBasic = true;
  }

  addedLugares() {
    var mesa = "B2"
    for (let i = 0; i < 11; i++) {
      console.log(mesa + i)
      this.lugaresService.addLugar(mesa + i, true, true, '', '575');
    }
  }

  updateLugar() {
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
  }

    async putNewLugar() {
    function generarCombinaciones(ids: string[], numeros: string[]): string[] {
      const combinaciones: string[] = [];
      for (let i = 0; i < ids.length; i++) {
        for (let j = 0; j < numeros.length; j++) {
          combinaciones.push(ids[i] + numeros[j]);
        }
      }
      return combinaciones;
    }

    const mesasId = [
      'A2',
      'B2',
      'C2',
      'D2',
      'E1',
      'F1',
      'G1',
      'H1',
      'I1',
      'J1',
      'K3',
      'L3',
      'M2',
      'N3',
      'O3',
      'P3',
      'Q3',
      'R3',
      'S3',
      'T3',
      'U3',
      'V3',
      'W3',
      'X3',
      'Y3'
    ];

    const chair = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    const combinacionesGeneradas = generarCombinaciones(mesasId, chair);

    combinacionesGeneradas.forEach(combinacion => {
      {
        if (combinacion[1] === '1') {
          this.lugaresService.addLugar(combinacion, false, false, '', '7300');
          //console.log(combinacion);
        }
        if (combinacion[1] === '2') {
          this.lugaresService.addLugar(combinacion, false, false, '', '7200');
          //console.log(combinacion);

        }
        if (combinacion[1] === '3') {
          this.lugaresService.addLugar(combinacion, false, false, '', '7100');
          //console.log(combinacion);
        }

      }
    })

  }

}
