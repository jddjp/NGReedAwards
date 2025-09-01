import { Injectable, ElementRef } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Toast } from '../shared/models/toast.model';
import { SwalModel } from 'src/app/shared/models/swal.model';
import { FormGroup } from '@angular/forms';
import { CategoriaModel } from '../models/categoria.model';
import { ReservacionModel } from '../models/reservacion.model';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class VariablesService {

  showSideUser = new Subject<boolean>();
  showSideBar = new Subject<boolean>();
  changeTipoMenu = new Subject<boolean>();

  toastLogin = new BehaviorSubject<Toast>(null);
  toast = new BehaviorSubject<Toast>(null);
  swal = new BehaviorSubject<SwalModel>(null);
  pagina = new BehaviorSubject<string>("");
  endProcessCargaCompleta = new BehaviorSubject<boolean>(false);
  endProcessNominacion = new BehaviorSubject<string>(null);
  endProcessContacto = new BehaviorSubject<string>(null);
  preloadCategoria = new BehaviorSubject<CategoriaModel>(null);
  endProcessreservacion = new BehaviorSubject<string>(null);
  statusTemplateRservacionPDF = new BehaviorSubject<boolean>(null);

  constructor(
    private router: Router
  ) {
  }

  getStatusPantalla(): number {
    let width = window.screen.width;

    if (width < 640) return 1;
    else if (width > 640 && width < 769) return 10;
    else return 17;
  }

  removeCredential() {
    localStorage.x = "";
    localStorage.clear();
    location.reload();
    this.router.navigate(['/'], { replaceUrl: true });
  }

  removeCredentialAdmin() {
    localStorage.x = "";
    localStorage.clear();
    location.reload();
    this.router.navigate(['/admin/login'], { replaceUrl: true });
  }

  removeCredentialAdminEvento() {
    localStorage.x = "";
    localStorage.clear();
    location.reload();
    this.router.navigate(['/reedeventoadmin/login'], { replaceUrl: true });
  }

  getDataTable(data: any): any {
    let arregloCols: any[] = [];
    let headers = Object.keys(data[0]);

    headers.map(h => {
      if (h.substring(0,2).toLowerCase() != "id"){
        arregloCols.push({
            field: h,
            header: h
        });
      }
    });

    let arregloRows: any[] = [];
    data.map((row) => {
      let x: any = [];
      headers.map((h) => {
          x[h] = row[h];
      });
      arregloRows.push(x)
    });

    return { cols: arregloCols, rows: arregloRows };
  }

  checkPassword(group: FormGroup): any {
    const pass = group.controls.password?.value;
    const confirmPassword = group.controls.repetirPassword?.value;
    return pass === confirmPassword ? null : { notSame: true };
  }

  getWidthDocument(){
    let width = window.screen.width;
    let widthDocument = Math.trunc((width * 460) / 1366) + (width < 1920 ? 7 : 14);
    // width = 1920 -> 660
    // width = 1366 -> 460
    if(width == 1366){
      widthDocument = 460;
    }else if (width == 1920){
      widthDocument = 660;
    }
    console.log('width pantalla: '+width+' --> ', widthDocument);
    return widthDocument;
  }

  generateReservacionPDF(lugar: any, templateElement: any): void {
    console.log(lugar)
    let widthDocument = this.getWidthDocument();

    Swal.fire({
        title: 'Por favor espera...',
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
    });

    setTimeout(() => {

      html2canvas(templateElement.nativeElement, { scale: 4 }).then((canvas) => {
        const imageGeneratedFromTemplate = canvas.toDataURL('image/png');
      const fileWidth = widthDocument;
      const generatedImageHeight = (canvas.height * fileWidth) / canvas.width;

      let PDF = new jsPDF('p', 'mm', 'a4');
      PDF.addImage(imageGeneratedFromTemplate, 'PNG', 0, 5,  210, 297);
      PDF.html(templateElement.nativeElement.innerHTML);
      PDF.text(lugar.uid.toString(),7,72);//Folio
      PDF.text(lugar.empresa.toString(),7,88);//Comprador
      PDF.text("",110,86);//Costo
      PDF.text(lugar.uid.toString(),7,278);//Folio
      PDF.text(lugar.empresa.toString(),7,293);//Comprador
      PDF.text("",110,288);//Costo
      // PDF.link(55, 231, 44, 7, { url: 'https://bit.ly/3KsUcLv' });//url left
      // PDF.link(160, 231, 44, 7, { url: 'https://bit.ly/3PKjSUy' });//url rigth
      // PDF.textWithLink('https://bit.ly/3KsUcLv', 55, 230,{ url: 'https://bit.ly/3KsUcLv' });
      // PDF.textWithLink('https://bit.ly/3PKjSUy', 160, 230,{ url: 'https://bit.ly/3PKjSUy' });
      PDF.save('reed-latino-reservacion.pdf');
      setTimeout(() => {
          Swal.close();
          this.statusTemplateRservacionPDF.next(false);
          Swal.fire({
            icon: 'success',
            title: 'PDF Generado Correctamente!',
            showConfirmButton: false,
            timer: 2000
          });
        }, 400);
      });

    }, 600);

  }
}
