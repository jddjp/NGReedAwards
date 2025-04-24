import { Component, OnInit } from '@angular/core';
import { getFirestore, provideFirestore, orderBy } from '@angular/fire/firestore';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { query } from 'firebase/firestore';
import { Table } from 'primeng/table';
import { ConvocatoriasService } from 'src/app/services/convocatoria.service';
// import { CategoriasService } from "./shared/categorias.service";
import { CategoriasService } from '../../../services/categorias.service';
import { CategoriaModel } from '../../../models/categoria.model';
import { Router } from '@angular/router';
import { VariablesService } from '../../../services/variablesGL.service';
import { ConfigService } from 'src/config/config.service';
import { newArray } from '@angular/compiler/src/util';
// providers: [CategoriasService]

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent implements OnInit {

  categoria = {
    id: '',
    nombre: ''
  }


  categorias: any;
  categoriasFilters: any;
  categoriasN: any;
  convocatorias: any;
  loading: boolean = true;
  selectedCategoria: CategoriaModel;
  visibleSide: boolean = false;
  accion: string = "";
  categoriaNSelected : any
  categorieName = ""
  selectedCategories : any;
  constructor(
    private router: Router,
    public configService: ConfigService,
    private variablesGL: VariablesService,
    private categoriasService: CategoriasService,
    private convocatoriasService: ConvocatoriasService,
  ) {
   this.getCategorias();
    //this.getConvocatorias();
   }

  ngOnInit(): void {
    this.getCategorias();
    this.getCategoriasN();
  }

  async getCategoriasN(){
    this.categoriasService.getCategoriasN().subscribe( (data) => {
      this.categoriasN = data;
      ///console.log("-----CATEGORIAS N")
      //console.log('data categorias ', this.categoriasN);
      this.loading = false;
    }, err => {
      this.categoriasN = [];
      this.loading = false;
    });
  }

  async getCategorias(){
    this.categoriasService.getCategorias().subscribe( (data) => {
      this.categorias = data;
      this.categoriasFilters = data
      this.loading = false;
    }, err => {
      this.categorias = [];
      this.loading = false;
    });
  }

  async getConvocatorias(){
    this.convocatoriasService.getConvocatorias().subscribe( (data) => {
      this.convocatorias = data;
      console.log('data convocatorias ', this.categorias);
    });
  }

  clear(table: Table) {
    table.clear();
  }

  addNominacion(event){
   console.log('this.configService.Usuario---->',this.configService.Usuario)
    if(  this.configService.Usuario != null &&
      this.configService.Usuario !== 'undefined'){
      this.variablesGL.preloadCategoria.next(this.selectedCategoria);
      this.accion = 'agregar';
      this.visibleSide = true;
    }else{
      this.router.navigate(["/portal/login"])
    }
  }

  fetchNominacion(){
    this.visibleSide = false;
    this.accion = '';
    this.router.navigate(["/portal/mis-nominaciones"]);
  }

  async onChange(event) {
  this.loading = true
  var newLista = []
    if(event.value != undefined && event.value != null){
      var categorie = this.categoriasN.filter(cat => {
        if(cat.id == this.categoriaNSelected){
          return cat
        }
      })
      this.categorieName = ""
      this.categoriasFilters = []
    }
    else{
      this.categoriasFilters = this.categorias
    }

    if(categorie == undefined){
      return
    }
    var subcategories = categorie[0].subcategorias
    if(subcategories != null){
      for(let i = 0; subcategories.length > i ; i++){
        await this.categoriasService.getCategoriaId( subcategories[i]).then(re =>{
          newLista.push(re.data())
         })
        }
    }
    this.categoriasFilters = []
    this.categoriasFilters = newLista
    this.selectedCategories = this.categoriasFilters
    this.loading = false
  }

  onChangeInput(event){

    if(this.categorieName != "" && this.categoriaNSelected == undefined){


      this.categoriasFilters = this.categorias.filter(cat =>{
        if(cat.nombre.toLocaleLowerCase().includes(this.categorieName.toLocaleLowerCase())){
          return cat
        }
      })
    }
    else{
      console.log("CATEGORIA SELECCIONADA")
      var pivoteFilter = []
      if(this.selectedCategories == undefined){
        return
      }
      pivoteFilter = this.selectedCategories.filter(cat => {
        if(cat.nombre.toLocaleLowerCase().includes(this.categorieName.toLocaleLowerCase())){
          return cat
        }
      })

      if(pivoteFilter.length != 0){
        this.categoriasFilters = pivoteFilter
      }
    }
  }
  //filtro:string = ""
  partesResaltadas(texto: string): { resaltado: boolean, texto: string }[] {
    if (!this.categorieName) {
      return [{ resaltado: false, texto }];
    }

    const partes = texto.split(new RegExp(`(${this.categorieName})`, 'gi'));
    return partes.map(part => ({
      resaltado: part.toLowerCase() === this.categorieName.toLowerCase(),
      texto: part
    }));
  }

}
