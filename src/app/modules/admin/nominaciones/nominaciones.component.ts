import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import { NominacionModel } from 'src/app/models/nominacion.model';
import { NominacionService } from 'src/app/services/nominacion.service';
import * as XLSX from 'xlsx';
import { ExcelService } from 'src/app/services/excel.service';
import { UsuarioService } from '../../../services/usuarios.service';
import { ChipModule } from 'primeng/chip';

import { CategoriasService } from 'src/app/services/categorias.service';
import { getApp } from '@angular/fire/app';
import { Observable } from 'rxjs';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from '@angular/fire/storage';

import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-nominaciones',
  templateUrl: './nominaciones.component.html',
  styleUrls: ['./nominaciones.component.css'],
})
export class NominacionesComponent implements OnInit {
  visibleSide: boolean;
  accion: string = '';
  nominacionEditar: NominacionModel;
  selectedNominacion: NominacionModel;
  loading: boolean = true;
  listNominaciones: any[] = [];
  usuarios: any[] = [];
  body: any;
  cols: any;
  // notifFunction: (data: any) => Observable<any>;
  constructor(
    private firebaseService: CategoriasService,
    private toastr: ToastrService,
    private nominacionesService: NominacionService,
    private usuariosService: UsuarioService,
    private exportExcel: ExcelService
  ) {
    /*this.notifFunction = httpsCallableData(functions, 'sendEmailNotification', {
      timeout: 3_000,
    });*/
    this.usuariosService.getusuarios().subscribe((data) => {
      this.usuarios = data;
      //console.log('usuarios ', this.usuarios);
      this.getNominaciones();
    });
    this.body = document.body;
    this.cols = [
      { field: 'statuspago', header: 'Estatus Pago', filter: 'statuspago' },
      { field: 'fechapago', header: 'Fecha Pago', filter: 'fechapago' },
      { field: 'pagarCon', header: 'Tipo Pago Pago', filter: 'pagarCon' },
      { field: 'titulo', header: 'Titulo', filter: 'titulo' },
      { field: 'nominado', header: 'Nominado', filter: 'nominado' },
      { field: 'categoria', header: 'Categoría', filter: 'categoria' },
      {
        field: 'fechaCreacion',
        header: 'Fecha Creación',
        filter: 'fechaCreacion',
      },
      {
        field: 'fechaActualizacion',
        header: 'Fecha Actualización',
        filter: 'fechaActualizacion',
      },
      // { field: 'displayName', header: 'Usuario Nombre', filter: 'usuario.displayName'},
      { field: 'email', header: 'Usuario Correo', filter: 'usuario.email' },
      { field: 'idpago', header: 'Id Pago', filter: 'idpago' },
    ];
  }

  ngOnInit(): void {}

  async getNominaciones() {
    this.listNominaciones = await this.nominacionesService.getAllNominaciones();
    if (this.listNominaciones.length > 0) {
      this.listNominaciones = this.listNominaciones;
      this.listNominaciones.forEach((item) => {
        let usuario = this.usuarios.find((x) => x.uid == item.uid);
        item.usuario = usuario;
      });
    }
    if (this.listNominaciones.length == 0) {
      this.listNominaciones = null;
    }
    this.loading = false;
    console.log('data ', this.listNominaciones);
  }

  vistaPrevia(nominacion) {
    if (nominacion.mostrarMas) {
      nominacion.mostrarMas = false;
    } else {
      nominacion.mostrarMas = true;
    }
  }

  async eliminarNominacion(nominacion: NominacionModel) {
    Swal.fire({
      title: 'Desea Eliminar Ésta Nominación?',
      text: 'Ésta accion no se podrá revertir ni cambiar',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3c3174',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Eliminar!',
      denyButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.nominacionesService.deleteNominacion(nominacion);
        this.toastr.success('Nominación eliminada!!', 'Success');
        this.getNominaciones();
      }
    });
  }

  async enviarNotificacion(nominacion: any) {
    Swal.fire({
      title: 'Desea Enviar notificación de ésta Nominación?',
      text: '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3c3174',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Enviar',
      denyButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        var correo: any = {
          correo: '',
        };
        correo.correo = nominacion.usuario.email;
        correo.mensaje = this.mensajeCorreo(nominacion);
        correo.subject = nominacion.titulo;
        correo.titulo = 'NOMINACION';
        this.nominacionesService.sendEmail(correo).subscribe((response) => {
          if (response.exito) {
            this.toastr.success('Mensaje enviado Correctamente', 'Correcto');
          } else {
           this.toastr.error(response.mensaje, 'Error');
          }
        });
      }
    });
  }

  mensajeCorreo(nominacion: any): string {
    var mensaje = `<html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Notificación de Sistema</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
          }
          .container {
              width: 80%;
              margin: 0 auto;
              background: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
              background: #000000;
              color: #fff;
              padding: 10px;
              text-align: center;
              border-radius: 8px 8px 0 0;
          }
          .content {
              margin: 20px 0;
          }
          .footer {
              text-align: center;
              font-size: 0.9em;
              color: #777;
          }
          a {
              color: #007BFF;
              text-decoration: none;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>REED AWARDS</h1>
          </div>
          <div class="content">
              <p>Hola <strong>${nominacion.nominado}</strong>,</p>
              <p>Te informamos de la <strong>Nominación</strong> a ${nominacion.titulo}</p>
              <p>Ha sido nominado a la categoria ${nominacion.categoria}<p>
              <ul>
                  <li><strong>Fecha y Hora:</strong> ${nominacion.fechaCreacion}</li>
                  <li><strong>Descripción:</strong> ${nominacion.titulo}</li>
              </ul>
              <p>Para más información, visita nuestro sitio web o contacta a soporte.</p>
              <p><a href="https://panel.reedlatino.com/portal/inicio">Visita el soporte</a></p>
          </div>
          <div class="footer">
              <p>Gracias por tu atención.</p>
          </div>
      </div>
  </body>
  </html>`;

    return mensaje;
  }

  editarNominacion(nominacion: NominacionModel) {
    this.accion = 'editar';
    this.nominacionEditar = nominacion;
    this.visibleSide = true;
  }

  async fetchNominacion() {
    await this.getNominaciones();
    this.visibleSide = false;
    this.accion = null;
    this.nominacionEditar = null;
  }

  /* INICIA DESCARGA MASIVA DE MULTIMEDIA */
  fileNameFromUrl(url) {
    var matches = url.match(/\/([^\/?#]+)[^\/]*$/);
    if (matches.length > 1) {
      matches[1] = decodeURIComponent(matches[1]);
      return matches[1].substring(6);
    }
    return null;
  }

  async getAllFiles() {
    const firebaseApp = getApp();
    const storage = getStorage(firebaseApp, 'gs://rewards-latino.appspot.com');

    this.firebaseService.getCategorias().subscribe(async (data) => {
      console.log('----------');
      var zip = new JSZip();
      console.log(data.length);

      if (data.length > 1) {
        for (var i = 1; i < 20; i++) {
          var categorias = zip.folder(data[i].nombre);
          console.log(data[i]);
          console.log(this.listNominaciones.length);
          for (var j = 0; j < this.listNominaciones.length; j++) {
            console.log(j);
            if (this.listNominaciones[j].categoria == data[i].nombre) {
              console.log(this.listNominaciones[j]);

              var nominacion = categorias.folder(
                this.listNominaciones[j].titulo
              );

              for (
                var k = 0;
                k < this.listNominaciones[j].materialMultimedia.length;
                k++
              ) {
                var blob = await this.makeRequest(
                  'get',
                  this.listNominaciones[j].materialMultimedia[k].url
                ).then(async (blob) => {
                  if (blob != null) {
                    nominacion.file(
                      this.fileNameFromUrl(
                        this.listNominaciones[j].materialMultimedia[k].url
                      ),
                      //'smile.jpg',
                      blob,
                      { base64: true }
                    );
                    console.log(blob);
                  }
                });
              }

              //    console.log(multimedia.url);
              /* }
                }
              );*/
            }
          }
        }
      }

      zip.generateAsync({ type: 'blob' }).then(function (content) {
        // see FileSaver.js
        saveAs(content, 'backup.zip');
      });
    });
  }

  makeRequest(method, url) {
    return new Promise<Blob>(async function (resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = (event) => {
        const blob = xhr.response;

        resolve(blob);
      };
      xhr.onerror = (e) => {
        resolve(null);
      };
      xhr.open('GET', url);
      xhr.send();
    });
  }

  makeRequestEncode(method, url) {
    return new Promise<Blob>(async function (resolve, reject) {
      console.log('------------url makeRequestEncode');
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = (event) => {
        const blob = xhr.response;
        resolve(blob);
      };
      xhr.onerror = (e) => {
        resolve(null);
      };
      xhr.open('GET', encodeURI(url));
      xhr.send();

      console.log(url);
    });
  }

  downloadFile(urlFile, name_file) {
    console.log(urlFile.slice(0, urlFile.indexOf('?')));
    //var newUrl = urlFile.slice(0, urlFile.indexOf('?'));

    // const firebaseApp = getApp();
    //const storage = getStorage(firebaseApp, 'gs://rewards-latino.appspot.com');
    //const httpsReference = ref(storage, newUrl);

    //getDownloadURL(httpsReference)
    // .then((url) => {
    // This can be downloaded directly:
    console.log('URL RESOINSE');

    //console.log(url);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', urlFile, true);
    xhr.responseType = 'blob';
    xhr.onload = (event) => {
      const blob = xhr.response;

      /* var zip = new JSZip();

          var img = zip.folder('images');
          img.file('smile.png', blob, { base64: true });
          zip.generateAsync({ type: 'blob' }).then(function (content) {
            // see FileSaver.js
            saveAs(content, 'backup.zip');
          });*/

      saveAs(blob, name_file);
      console.log(blob);
    };
    xhr.send();
    // })
    //.catch((error) => {});
  }

  toDataUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }

  /* FIN  DESCARGA MASIVA DE MULTIMEDIA */

  excel() {
    this.exportExcel.nomina(this.listNominaciones);
  }
}
