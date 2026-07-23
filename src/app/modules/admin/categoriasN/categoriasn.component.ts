import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentData, QuerySnapshot } from 'firebase/firestore';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService, SelectItemGroup } from 'primeng/api';
import { NominacionModel } from 'src/app/models/nominacion.model';
import { CategoriasService } from 'src/app/services/categoriasn.service';
import { ExcelService } from 'src/app/services/excel.service';
import { NominacionService } from 'src/app/services/nominacion.service';
import { UsuarioService } from 'src/app/services/usuarios.service';

interface City {
  name: string,
  code: string
}

// import { Subject } from 'rxjs/Subject';
@Component({
  selector: 'app-categorias',
  templateUrl: './categoriasn.component.html',
  styleUrls: ['./categoriasn.component.css']
})
export class CategoriasNComponent implements OnInit {

  // ----------------------
  subcategories: any[] = [];
  subcategoriesByCat: any[] = [];
  selectedCategorias: any[] = [];
  subcategoryMap: Record<string, string> = {};

  // ----------------------
  piezasPorCategoria: any = [
    {id:'', nombre:'',pago: 0, total: 0}
  ];

  categoriaCollectiondata: any = [
    {id:'', nombre:''}
  ];
  categoriaForm: FormGroup;
  submitted: boolean;
  loading: boolean =true

  visible: boolean;
  categoriaModelDialog: boolean;
  categoriaModel: any;
  idModel: any = [
    {id:'', nombre:''}
  ];;

  excel:any;



  visibleDe:boolean= false;
  id: any;




  constructor(

    private firebaseService: CategoriasService,
    private firebaseServiceNominacion: NominacionService,
    private firebaseServiceUsuarios: UsuarioService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private exporExcel: ExcelService,
    private confirmationService: ConfirmationService
  ) {
  }


  async ngOnInit(): Promise<void> {
    await this.initForm();
    this.get();
    this.firebaseService.obsr_UpdatedSnapshot.subscribe((snapshot) => {
      this.updatecategoriaCollection(snapshot);
    });
  }

  async initForm() {
    this.categoriaForm = this.fb.group({
      id: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      activo: ['', []],
      subcategorias: [[], []],
      // fechaFin: ['', [Validators.required]],
    });
    this.subcategories = await this.firebaseService.getSubCategorias();
    this.subcategories.sort((a, b) => {
      const parseNum = (value: any) => {
        const num = Number(value);
        if (!Number.isNaN(num)) {
          return num;
        }
        const digits = String(value).match(/\d+/);
        return digits ? Number(digits[0]) : Number.MAX_SAFE_INTEGER;
      };

      const aValue = parseNum(a.id ?? a.nombre);
      const bValue = parseNum(b.id ?? b.nombre);
      if (aValue !== bValue) {
        return aValue - bValue;
      }
      return String(a.nombre ?? a.id).localeCompare(String(b.nombre ?? b.id));
    });
    this.subcategoriesByCat = [];
  }

  async add() {
    
    console.log("-----------------");
    console.log(this.categoriaForm);
    console.log(this.selectedCategorias);
    this.submitted = true;
    // this.visible = false
    console.log(this.categoriaForm.value);
    
    if (this.categoriaForm.valid) {

          const { id,nombre, activo} = this.categoriaModel;
          let subcategorias = [];
          this.selectedCategorias.map((item) =>{
            subcategorias.push(item.uid);
          });

          await this.firebaseService.addcategoria(id ,nombre, this.categoriaForm.value.activo, subcategorias);
          console.log('dd');
          this.categoriaForm.reset()
          // this.categoria.titulo = "";
          // this.categoria.fechaInicio = "";
          // this.categoria.fechaFin = "";
this.visible = false


    } else {

      this.toastr.info('Todos los Campos son requeridos!!', 'Espera');
      this.visible = true
      // this.categoriaCollectiondata.reset()
    }
    // this.convocatoriaModelDialog = false;
    // this.convocatoriaModel;
this.submitted = false
  }


  async get() {
    this.firebaseService.getCategorias().subscribe((data) => {
      this.categoriaCollectiondata = data;
      
    
      this.loading= false
    });
    //this.updatecategoriaCollection(snapshot);
  }


  updatecategoriaCollection(snapshot: QuerySnapshot<DocumentData>) {
    this.categoriaCollectiondata = [];
    snapshot.docs.forEach((student) => {
      this.categoriaCollectiondata.push({ ...student.data(), id: student.id });
    })
  }

  async delete(docId: any) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar la categoria  '+ docId.nombre + '?',
      header: 'Confirmacion',
      icon: 'pi pi-exclamation-triangle',

      accept: () => {

          this.firebaseService.deletecategoria(docId.id);
      }
  });
  }
edit: boolean = false
  editar(categoria: any) {
    this.selectedCategorias = [];
    if (Array.isArray(categoria.subcategorias) && categoria.subcategorias.length > 0) {
      this.selectedCategorias = categoria.subcategorias
        .map((id: any) => this.subcategories.find((item) => item.uid === id))
        .filter((item) => item);
      this.categoriaForm.patchValue({ subcategorias: this.selectedCategorias });
    } else {
      this.selectedCategorias = [];
      this.categoriaForm.patchValue({ subcategorias: [] });
    }
    this.categoriaModel = { ...categoria };
    if (typeof this.categoriaForm.value.activo !== 'undefined') {
      this.categoriaForm.patchValue({ activo: categoria.activo });
    } else {
      this.categoriaForm.patchValue({ activo: '' });
    }
    this.edit = true;


    // console.log(this.categoriaModel);
    // console.log(this.id.id);


  }
  update() {
    const selectedItems = this.categoriaForm.value.subcategorias || [];
    const subcategorias = selectedItems.map((item: any) => item.uid);
    this.categoriaModel.subcategorias = subcategorias;
    //console.log(this.categoriaModel);
    this.firebaseService.updatecategoria(this.categoriaModel.id, this.categoriaModel.nombre, this.categoriaForm.value.activo, subcategorias);
    this.edit = false;
  }

  onSubcategoryChange(event: any) {
    if (event && event.value) {
      this.selectedCategorias = event.value;
      this.categoriaForm.patchValue({ subcategorias: event.value });
      console.log('Selected subcategories:', this.selectedCategorias);
    }
  }



  Excel() {


      this.exporExcel.categoria(this.categoriaCollectiondata);


  }

  async getUsersForReport() {
    var usuarios2 = [];
     await this.firebaseServiceUsuarios.getusuarios().subscribe((data) => {
      usuarios2 = data;
      //console.log(data);

    return usuarios2;
    });
    return usuarios2;
  }

  async GenereteReportMasterExcel(){
    var nominaciones = [];
    var usuarios = [];


    await this.firebaseServiceNominacion.getAllNominaciones().then((data) => {
      nominaciones = data;
      this.firebaseServiceUsuarios.getusuarios().subscribe((data) => {
        usuarios = data;

        var piezasPorCategoria = this.ExcelPiezasPorCategoria(nominaciones);
        var piezasInscritas = this.ExcelPiezasInscritas(usuarios,nominaciones);
        var usuariosConPiezasInscritas = this.ExcelUsuariosConPiezasInscritas(usuarios,nominaciones);
        var usuariosSinPiezasInscritas = this.ExcelUsuariosSinPiezasInscritas(usuarios,nominaciones);
        var ordenesPagadas = this.ExcelOrdenesPagadas(usuarios,nominaciones);
        var ordenesNoPagadas = this.ExcelOrdenesNoPagadas(usuarios,nominaciones);
        this.exporExcel.piezasPorCategoria(piezasPorCategoria, piezasInscritas, usuariosConPiezasInscritas,usuariosSinPiezasInscritas,ordenesPagadas,ordenesNoPagadas);
        });

    });


  }

  ExcelPiezasPorCategoria(nominaciones) {
    //var nominaciones = [];

    //this.getUsersForReport();

    //await this.firebaseServiceNominacion.getAllNominaciones().then((data) => {

      //nominaciones = data;


      /*Reporte piezas por categoria*/
      this.categoriaCollectiondata.forEach((category) => {
        var countCategories = 0;
        var countPagadas = 0
        nominaciones.forEach((nominacion) => {
          if (nominacion.categoria == category.nombre) {
            console.log("-----------" );
            countCategories++;

            if (nominacion.statuspago == "Pago Realizado" || nominacion.statuspago == "pagado") {
              countPagadas++;
            }
          }
        })

        if(countCategories == countPagadas){
          this.piezasPorCategoria.push(Object.assign(category, {total:countCategories, pago:"Pagada"}));
        }

        if(countCategories != countPagadas && countCategories > 0){
          this.piezasPorCategoria.push(Object.assign(category, {total:countCategories, pago:"Pago pendiente"}));
        }

        if(countCategories == 0){
          this.piezasPorCategoria.push(Object.assign(category, {total:countCategories, pago:"Pago pendiente"}));
        }
      });

      return this.piezasPorCategoria;
    //});
   return this.piezasPorCategoria;
  }

  ExcelPiezasInscritas(usuarios, nominaciones) {
    
    var piezasInscritas = [];
    
    nominaciones.forEach((nominacion, index) => {
      var tieneUsuario = false;
      

      var materialMultimedia = nominacion.materialMultimedia;
      let video
      let png
      let jpg
      let jpeg
      let pdf
      let audio
      var lastMethodPay = "";
      if(typeof materialMultimedia == 'undefined'){
        
        


      }else{
       var valor = materialMultimedia.map(function(data){
    return data
    
      })
       const video = valor?.filter(e => e.url && e.url.includes('.video')) ?? [];
       const png = valor?.filter(e => e.url && e.url.includes('.png')) ?? [];
       const jpg = valor?.filter(e => e.url && e.url.includes('.jpg')) ?? [];
       const pdf = valor?.filter(e => e.url && e.url.includes('.pdf')) ?? [];
       const jpeg = valor?.filter(e => e.url && e.url.includes('.jpeg')) ?? [];
       const audio = valor?.filter(e => e.url && e.url.includes('.audio')) ?? [];
      }
      var idCat = this.categoriaCollectiondata.map(function(data){
        return data
      })
      
      let idCa = idCat.filter(e => e.nombre.includes(nominacion.categoria))
      var idCategoria = idCa.map(function(data){
        return data.id
      })
      lastMethodPay = nominacion.pagarCon;
      
      for(var i = 0; i < usuarios.length; i++){
        if (nominacion.uid == usuarios[i].uid) {
          
          tieneUsuario = true;
          //piezasInscritas.push(new Object({"#":index, "ID_USUARIO": usuarios[i].uid, "NOMBRE": usuarios[i].firstName, "APELLIDO": usuarios[i].lastName,"CORREO": usuarios[i].email, "TELEFONO": usuarios[i].phone,"PAGO": nominacion.statuspago, "ID_PIEZA": nominacion.id, "NOMBRE_DE_LA_PIEZA": nominacion.titulo, "EMPRESA": nominacion.organizacion, "FECHA_DE_NOMINACIÓN": nominacion.fechaCreacion, 'MEDIO_DE_PAGO':lastMethodPay, "NUM_VIDEO": video.length,"NUM_IMAGENES": png.length+jpg.length+jpeg.length, "NUM_AUDIO": audio.length, "NUM_DOCS": pdf.length, "CATEGORIA": idCategoria.join(), "NOMBRE_CATEGORIA": nominacion.categoria, "Pais": nominacion.pais, "Nominado": nominacion.nominado}));
          piezasInscritas.push(new Object({
            "#": index,
            "ID_USUARIO": usuarios[i].uid,
            "NOMBRE": usuarios[i].firstName,
            "APELLIDO": usuarios[i].lastName,
            "CORREO": usuarios[i].email,
            "TELEFONO": usuarios[i].phone,
            "PAGO": nominacion.statuspago,
            "ID_PIEZA": nominacion.id,
            "NOMBRE_DE_LA_PIEZA": nominacion.titulo,
            "DESCRIPCION": nominacion.descripcion,
            "EMPRESA": nominacion.organizacion,
            "RESPONSABLE": nominacion.responsable,
            "FECHA_DE_NOMINACIÓN": nominacion.fechaCreacion,
            "MEDIO_DE_PAGO": lastMethodPay,
            "NUM_VIDEO": video ? video.length : 0,
            "NUM_IMAGENES": (png ? png.length : 0) + (jpg ? jpg.length : 0) + (jpeg ? jpeg.length : 0),
            "NUM_AUDIO": audio ? audio.length : 0,
            "NUM_DOCS": pdf ? pdf.length : 0,
            "CATEGORIA": idCategoria.join(),
            "NOMBRE_CATEGORIA": nominacion.categoria,
            "Pais": nominacion.pais,
            "Nominado": nominacion.nominado,
            "Fecha Actualizacion": nominacion.fechaActualizacion
          }));
          
          break;
        }
      }

      if(tieneUsuario == false){
        piezasInscritas.push(new Object({
          "#":index, "ID_USUARIO": "", 
          "NOMBRE": "NO SE ENCONTRO USUARIO", 
          "APELLIDO": "",
          "CORREO": "", 
          "TELEFONO": "",
          "PAGO": nominacion.statuspago,
          "ID_PIEZA": nominacion.id, 
          "NOMBRE_DE_LA_PIEZA": nominacion.titulo,
          "DESCRIPCION": nominacion.descripcion,
          "EMPRESA": nominacion.organizacion, 
          "RESPONSABLE": nominacion.responsable,
          "FECHA_DE_NOMINACIÓN": nominacion.fechaCreacion,
          'MEDIO_DE_PAGO':"", 
          "NUM_VIDEO": "",
          "NUM_IMAGENES": "",
          "NUM_AUDIO": "",
          "NUM_DOCS": "",
          "CATEGORIA": "",
          "NOMBRE_CATEGORIA": nominacion.categoria,
          "Pais": nominacion.pais,
          "Nominado": nominacion.nominado,
          "Fecha Actualizacion": nominacion.fechaActualizacion
                  }));
      }
      
    });
    
    return piezasInscritas;
  }
  

  ExcelUsuariosConPiezasInscritas(usuarios, nominaciones) {
    var piezasInscritas = [];

      usuarios.forEach((usuario,index) => {
      var num_nominaciones = 0;
        nominaciones.forEach((nominacion) => {
        if (nominacion.uid == usuario.uid) {
          // console.log(nominacion);

         if (num_nominaciones == 0) {
          piezasInscritas.push(new Object({"#":index, "ID_USUARIO": usuario.uid, "NOMBRE": usuario.firstName, "APELLIDO": usuario.lastName,"CORREO": usuario.email, "TELEFONO": usuario.phone,"FECHA_DE_NOMINACIÓN": nominacion.fechaCreacion}));
         }
          num_nominaciones++;
        }
      });
    })
    return piezasInscritas;
  }

  ExcelUsuariosSinPiezasInscritas(usuarios, nominaciones) {
    var piezasInscritas = [];

      usuarios.forEach((usuario,index) => {
      var num_nominaciones = 0;
        nominaciones.forEach((nominacion) => {
        if (nominacion.uid == usuario.uid) {
          num_nominaciones++;
        }
      });
      if(num_nominaciones == 0){
        piezasInscritas.push(new Object({"#":index, "ID_USUARIO": usuario.uid, "NOMBRE": usuario.firstName, "APELLIDO": usuario.lastName,"CORREO": usuario.email, "TELEFONO": usuario.phone,"FECHA_DE_NOMINACIÓN": ""}));
      }
    })
    return piezasInscritas;
  }

  ExcelOrdenesPagadas(usuarios, nominaciones) {
    var piezasInscritas = [];
      var indexPiezasEncontradas = 0;
      usuarios.forEach((usuario,index) => {
      var num_nominaciones = 0;
      var total_pagado = 0;
      var lastMethodPay = "";
      var estadoPago = ""
      var Vaoucher = "Vaoucher"
      var cat = '';
      var lastNominacion = new NominacionModel();
      // console.log(usuario.uid);
        nominaciones.forEach((nominacion) => {
          
        if (nominacion.uid == usuario.uid && (nominacion.statuspago == "Pago Realizado" || nominacion.statuspago == "pagado")) {
          console.log(nominacion.uid);
          num_nominaciones++;
          total_pagado += parseInt(nominacion.montopago);
          lastMethodPay = nominacion.pagarCon;
          estadoPago = nominacion.statuspago
          lastNominacion = nominacion;
        }else{

          // console.log(nominacion.uid, usuario.uid);
        }
      });
      if(num_nominaciones > 0){

        indexPiezasEncontradas++;
        piezasInscritas.push(new Object({
          "#":indexPiezasEncontradas,
           "ID_USUARIO": usuario.uid,
          "NOMBRE": usuario.firstName,
          "APELLIDO": usuario.lastName,
          "CORREO": usuario.email,
          "TELEFONO": usuario.phone,
          "ESTADO":estadoPago,
          "NUM_PIEZAS":num_nominaciones,
          "TOTAL_USD":"",
          "COIN":"",
          "TOTAL_MXM":"$" +total_pagado,
          "COIN_2":"MXM", 
          "FECHA_DE_PAGO": lastNominacion.fechaCreacion,
          "FECHA_ACTUALIZACION": lastNominacion.fechaActualizacion,
          "ULTIMA_NOMINACION_PAGADA":lastNominacion.titulo, 
          "CATEGORIA_DE_LA_ULTIMA_NOMINACION_PAGADA":lastNominacion.categoria, 
          "DESCRIPCION_DE_NOMINACION_PAGADA": lastNominacion.descripcion,
          "CATEGORIA_DE_NOMINACION_PAGADA":lastNominacion.categoria, 
          "RESPONSABLE_DE_LA_NOMINACION": lastNominacion.responsable,
          "DATA":"",
          "MEDIO_DE_PAGO":lastMethodPay}));
      }
    });
    this.AddExcelOrdenesPagadasSinUser(nominaciones, usuarios,piezasInscritas);
    return piezasInscritas;
  }

  AddExcelOrdenesPagadasSinUser(nominaciones, usuarios,piezasInscritas){
   var lengtPiezasInscritas = piezasInscritas.length;
   var contarPiezasSinUser = 0;
    nominaciones.forEach((nominacion) => {
    var tieneUsuario = false;
      usuarios.forEach((usuario) => {
        if (nominacion.uid == usuario.uid) {
          tieneUsuario = true;
        }
      });
      if(tieneUsuario == false){
        if(nominacion.statuspago == "Pago Realizado" || nominacion.statuspago == "pagado"){
        contarPiezasSinUser++;
          piezasInscritas.push(new Object({"#":lengtPiezasInscritas + contarPiezasSinUser, "ID_USUARIO": "", "NOMBRE": "NO SE ENCONTRO USUARIO", "APELLIDO": "","CORREO": "", "TELEFONO": "","ESTADO":nominacion.statuspago,"NUM_PIEZAS":"1", "TOTAL_USD":"","COIN":"","TOTAL_MXM":"$" + nominacion.montopago,"COIN_2":"MXM", "FECHA_DE_PAGO": "","DATA":"","MEDIO_DE_PAGO":""}));
        }
      }
    });
  }

  ExcelOrdenesNoPagadas(usuarios, nominaciones) {
    var lastNominacion = new NominacionModel();
    var piezasInscritas = [];

      usuarios.forEach((usuario,index) => {
      var num_nominaciones = 0;
      var total_pagado = 0;
      var lastState = "";
      var estadoPago = ""
        nominaciones.forEach((nominacion) => {
        if (nominacion.uid == usuario.uid && (nominacion.statuspago == "" || nominacion.statuspago == "" )) {
          // nominacion.uid == usuario.uid && (nominacion.statuspago != "Pago Realizado" || nominacion.statuspago != "pagado"
          num_nominaciones++;
          total_pagado += parseInt(nominacion.montopago);
          lastState = nominacion.statuspago;
          estadoPago = nominacion.statuspago;
          
          lastNominacion = nominacion;
        }
      });
      if(num_nominaciones > 0){
        piezasInscritas.push(new Object({
          "#":index, 
          "ID_USUARIO": usuario.uid, 
          "NOMBRE": usuario.firstName,
          "APELLIDO": usuario.lastName,
          "CORREO": usuario.email, 
          "TELEFONO": usuario.phone,
          "ESTADO":estadoPago,
          "NUM_PIEZAS":num_nominaciones, 
          "TOTAL":"$" +total_pagado,
          "FECHA_DE_PAGO": lastNominacion.fechaCreacion,
          "FECHA_ACTUALIZACION": lastNominacion.fechaActualizacion,
          "ULTIMA_NOMINACION_PAGADA":lastNominacion.titulo, 
          "CATEGORIA_DE_LA_ULTIMA_NOMINACION_PAGADA":lastNominacion.categoria, 
          "DESCRIPCION_DE_NOMINACION_PAGADA": lastNominacion.descripcion,
          "CATEGORIA_DE_NOMINACION_PAGADA":lastNominacion.categoria, 
          "RESPONSABLE_DE_LA_NOMINACION": lastNominacion.responsable,}));
      }
    })
    return piezasInscritas;
  }

  openNew() {
    this.categoriaModel = { id: '', nombre: '', activo: ''}
    this.visible = true;
    this.submitted = false;
    this.categoriaForm.reset()

  }
  hideDialog() {
    this.visibleDe = false;
    this.visible = false;
    this.edit = false
    this.submitted = false;
    this.selectedCategorias = [];
  }






  import(key:any){
    //  this.firebaseService.addcategoria(this.keys);
    console.log(key);

  }
}
