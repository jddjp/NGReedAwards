import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { AUTO_STYLE } from '@angular/animations';
@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor(
    private toastr: ToastrService
  ) { }
  usuarios(user){
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(user, {header:['address', 'email', 'displayName', 'firstName', 'lastName', 'phone', 'photoURL', 'rol', 'uid']});

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'usuarios');
    XLSX.writeFile(wb, 'usuarios.xlsx')
    return this.toastr.success('Exportado con exito!!', 'Exito');

  }
categoria(categri){

const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(categri, {header:['id', 'nombre', 'pago', 'total']});
let objectMaxLength = [];
    for (let i = 0; i < categri.length; i++) {
      let value = <any>Object.values(categri[i]);
      for (let j = 0; j < value.length; j++) {
        if (typeof value[j] == "number") {
          objectMaxLength[j] = 10;
        } else {
          objectMaxLength[j] =
            objectMaxLength[j] >= value[j].length
              ? objectMaxLength[j]
              : value[j].length;
        }
      }
    }
    console.log(objectMaxLength);
ws['!cols'] = [
  {
    width: objectMaxLength[1]
  },
  {
    width: objectMaxLength[0]
  }
]
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'categorias');
    XLSX.writeFile(wb, 'categorias.xlsx')
    return this.toastr.success('Exportado con exito!!', 'Exito');
}

  categoriasSinNominaciones(categorias: any[]) {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(categorias, {
      header: ['id', 'nombre', 'total', 'pago']
    });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CATEGORIAS SIN NOMINACIONES');
    XLSX.writeFile(wb, 'categorias-sin-nominaciones.xlsx');
    return this.toastr.success('Reporte de categorías sin nominaciones exportado con éxito!!', 'Exito');
  }
  convoc(convoc: any){
    console.log(convoc);

    let ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(convoc, { header: ['ID', 'fechaInicio', 'fechaFin'] })
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'convocatorias');
    XLSX.writeFile(wb, 'convocatorias.xlsx')
    return this.toastr.success('Exportado con exito!!', 'Exito');
  }
  nomina(nomin:any){
    let ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(nomin)
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'nominaciones');
    XLSX.writeFile(wb, 'nominaciones.xlsx')
    return this.toastr.success('Exportado con exito!!', 'Exito');
  }
  piezasPorCategoria(piezasPorCategoria:any, piezasInscritas:any, usuariosConPiezasInscritas:any,usuariosSinPiezasInscritas:any, ordenesPagadas:any, ordenesNoPagadas:any){
// console.log('pago', ordenesPagadas);
// console.log('no', ordenesNoPagadas);

    let ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(piezasPorCategoria, {header:['id', 'nombre', 'pago', 'total']});
    let wsPiezasInscritas: XLSX.WorkSheet = XLSX.utils.json_to_sheet(piezasInscritas, {header:['#', 'ID_USUARIO','NOMBRE','APELLIDO','CORREO','TELEFONO','PAGO','ID_PIEZA','NOMBRE_DE_LA_PIEZA','EMPRESA','FECHA_DE_NOMINACIÓN','NUM','NUM_VIDEO','NUM_IMAGENES','NUM_DOCS','CATEGORIA','NOMBRE_CATEGORIA']});
    let wsUsuariosConPiezasInscritas: XLSX.WorkSheet = XLSX.utils.json_to_sheet(usuariosConPiezasInscritas, {header:['#', 'ID_USUARIO','NOMBRE','APELLIDO','CORREO','TELEFONO','FECHA_DE_NOMINACIÓN']});
    let wsUsuariosSinPiezasInscritas: XLSX.WorkSheet = XLSX.utils.json_to_sheet(usuariosSinPiezasInscritas, {header:['#', 'ID_USUARIO','NOMBRE','APELLIDO','CORREO','TELEFONO','FECHA_DE_NOMINACIÓN']});
    let wsOrdenesPagadas: XLSX.WorkSheet = XLSX.utils.json_to_sheet(ordenesPagadas, {header:['#', 'ID_USUARIO','NOMBRE','APELLIDO','CORREO','TELEFONO','ESTADO','NUM_PIEZAS','TOTAL_USD','COIN',,'TOTAL_MXM','COIN_2','FECHA_DE_PAGO','DATA','MEDIO_DE_PAGO','EARLY_BIRD']});
    let wsOrdenesNoPagadas: XLSX.WorkSheet = XLSX.utils.json_to_sheet(ordenesNoPagadas, {header:['#', 'ID_USUARIO','NOMBRE','APELLIDO','CORREO','TELEFONO','ESTADO','NUM_PIEZAS','TOTAL']});

    let objectMaxLength = [];
   /* for (let i = 0; i < piezasPorCategoria.length; i++) {
      let value = <any>Object.values(piezasPorCategoria[i]);
      for (let j = 0; j < value.length; j++) {


        if (typeof value[j] == "number") {
          objectMaxLength[j] = 10;
        } else {
          objectMaxLength[j] =
            objectMaxLength[j] >= value[j].length
              ? objectMaxLength[j]
              : value[j].length;
        }
      }
    }
    //console.log(objectMaxLength);
ws['!cols'] = [
  {
    width: objectMaxLength[3]
  },
  {
    width: objectMaxLength[0]
  }
]*/
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PIEZAS POR CATEGORIA');

    XLSX.utils.book_append_sheet(wb, wsPiezasInscritas, 'PIEZAS INSCRITAS');
    XLSX.utils.book_append_sheet(wb, wsUsuariosConPiezasInscritas, 'USUARIOS CON PIEZAS INSCRITAS');
    XLSX.utils.book_append_sheet(wb, wsUsuariosSinPiezasInscritas, 'USUARIOS SIN PIEZAS INSCRITAS');
    XLSX.utils.book_append_sheet(wb, wsOrdenesPagadas, 'ORDENES PAGADAS');
    XLSX.utils.book_append_sheet(wb, wsOrdenesNoPagadas, 'ORDENES NO PAGADAS');
    XLSX.writeFile(wb, 'ReporteAppWebReedAwards.xlsx')
    return this.toastr.success('Exportado con exito!!', 'Exito');
  }

reservaciones(reservacionesCollection: any){

  let ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(reservacionesCollection, { header: [] })
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'reservaciones');
  XLSX.writeFile(wb, 'reservaciones.xlsx')
  return this.toastr.success('Exportado con exito!!', 'Exito');
}
}
