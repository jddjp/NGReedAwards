import { Injectable } from '@angular/core';
import { getFirestore, collection, addDoc, getDoc, deleteDoc, doc, updateDoc, DocumentData, CollectionReference, onSnapshot, QuerySnapshot, query, orderBy, where, DocumentReference, getDocs } from 'firebase/firestore';
import { collectionChanges, collectionData, Firestore } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { initializeApp } from "firebase/app";
@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  db: Firestore;
  categoriaCol: CollectionReference<DocumentData>;
  private updatedSnapshot = new Subject<QuerySnapshot<DocumentData>>();
  obsr_UpdatedSnapshot = this.updatedSnapshot.asObservable();
  
 id:any
  constructor(
    private toastr: ToastrService,
    private firestore: Firestore
  ){
   
    this.db = getFirestore();
    this.categoriaCol = collection(this.db, 'categoriasN');
   // Get Realtime Data
   onSnapshot(this.categoriaCol, (snapshot) => {
    this.updatedSnapshot.next(snapshot);
  }, (err) => {
    console.log(err);
  })


  
}
  
  //Ya estaba ---Nominaciones
  getCategorias(){
    const categoriasCollection = collection(this.firestore, 'categoriasN');
    return collectionData(query(categoriasCollection, orderBy("id", "asc")));
  }

  async existsCategory(id:string) {
      const ref = doc(this.db, 'categorias', id);
      const docSnap = await getDoc(ref);
      if(docSnap.exists()){
        return true
      }
      return false;
  }

  //Ya estaba ---Nominaciones
  async getSubCategorias(){
    let data = [];
    const categoriasCollection = collection(this.firestore, 'categorias');
    const q = query(categoriasCollection, orderBy("nombre", "asc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      data.push({
        uid: doc.id,
        ...doc.data()
      })
    });
    return data;
  }

  //Ya estaba---Nominaciones
  getexcel(exc: any){
    // await addDoc(this.categoriaCol, {id, nombre})
  }
  
  async addcategoria(id:number, nombre: string, activo: number, subcategorias: any) {
    await addDoc(this.categoriaCol, {
      id,
      nombre,
      activo,
      subcategorias
    })
    return this.toastr.success('Registro Guardado  con exito!!', 'Exito');
  }
  
  async deletecategoria(id: string) {
    const querySnapshot = await getDocs(query(collection(this.db, "categoriasN/"), where("id", "==", id)));
querySnapshot.forEach((doc) => {
  this.id = doc.id
})
const docRef = doc(this.db, 'categoriasN/'+ this.id)
  deleteDoc(docRef)
  return    this.toastr.error('Registro Eliminado con exito!!','Advertencia');
  }
  
  async updatecategoria(id: number, nombre: any, activo: any, subcategorias: any) {
    const querySnapshot = await getDocs(query(collection(this.db, "categoriasN/"), where("id", "==", id)));
    querySnapshot.forEach((doc) => {
      this.id = doc.id
    })
    const docRef = doc(this.db, 'categoriasN/'+ this.id);
    await updateDoc( docRef, { id, nombre, activo, subcategorias })
    return this.toastr.warning('Registro Actualizado con exito!!','Actualizacion'); 
  }
  
  


    
  
  }
  

