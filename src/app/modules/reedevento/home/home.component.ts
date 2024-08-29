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
  mesas: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
  mesasVIP: string[][] = [["A", "B", "C", "D", "E"], ["F", "G", "H", "I", "J"]]
  mesasN: string[][] = [["K", "L", "M", "N", "O"], ["P", "Q", "R", "S","T", "U","V", "W","X","Y" ],
  ["Z", "A2", "B2", "C2", "D2", "E2", "F2", "G2", "H2", "I2","J2","K2","L2","M2","N2"]]
  styleOBJ = { 'background': "RGB(217, 222, 224)" }
  toggle = true;
  status = "Enable";
  componetesSeleccionados: ElementRef[] = [];
  // txt1="A partir de esta fila son lugares individuales, \n aunque tambien puedes adquirir si lo prefieres \n mesas completas";
  txt2 = "De la mesa A a la D son venta mesas completas";
  // txt3="Ahora al escoger tú lugar, también puedes escoger entre tu plato fuerte en la cena:";
  // txt4="1.- Short Rib, espuma de bernesesa, pure de papa al tartufo y textura de papa";
  // txt5="2.- Salmón glaseado, risotto de tomate ahumado, tierra de parmesano y tomate seco";
  // txt6="El cual puede ser seleccionado al momento de pagar";


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
  constructor(
    private lugaresService: LugaresService,
    public datepipe: DatePipe,
    private afs: Firestore,
    private toastr: ToastrService
  ) {
    this.getUserData().subscribe(data => {
      if (data) {
        this.userData = data.filter(item => item.uid === JSON.parse(localStorage.d).uid);
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
    console.log(localStorage.d)
    if (localStorage.d == undefined) {
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
      }  else if (this.targetVip === 'VIP3') {
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
    ///console.log(idMesa+"0")
    let disponiblidad = this.lugaresDisponibles.find(el => el.idLugar == idMesa + "1")
    if (!disponiblidad.comprado && !disponiblidad.apartado) {
      let toArray = this.inputsArray.toArray()
      let colorMesa = false
      for (let silla of this.mesas) {
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

  addedLugares(){
    var mesa = "B2"
    for(let i = 0; i < 11 ; i++){
      console.log(mesa+i)
      this.lugaresService.addLugar(mesa + i, true, true, '', '575');
    }
  }

  updateLugar(){
    var boletos  = []
    var mesa = 'C2';
   for (let i = 1; i < 11; i++)
    {
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
}
