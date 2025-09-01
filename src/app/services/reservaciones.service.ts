
import { DatePipe } from '@angular/common';
import { VariablesService } from './variablesGL.service';
import { ReservacionModel } from '../models/reservacion.model';

import { Injectable } from '@angular/core';
import { getFirestore, collection, addDoc, getDoc, deleteDoc, doc, updateDoc, DocumentData, CollectionReference, onSnapshot, QuerySnapshot, query, orderBy, where, DocumentReference, getDocs } from 'firebase/firestore';
import { collectionChanges, collectionData, Firestore } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { initializeApp } from "firebase/app";
@Injectable({
  providedIn: 'root'
})
export class reservacionService {
  db: Firestore;
  categoriaCol: CollectionReference<DocumentData>;
  private updatedSnapshot = new Subject<QuerySnapshot<DocumentData>>();
  obsr_UpdatedSnapshot = this.updatedSnapshot.asObservable();
  listareservaciones: ReservacionModel[] = [];
  pipe = new DatePipe('en-US');
  constructor(
    private afs: Firestore,
    private variablesGL: VariablesService,
  ){
    this.db = getFirestore();
    this.categoriaCol = collection(this.db, 'reservaciones');
   // Get Realtime Data
   onSnapshot(this.categoriaCol, (snapshot) => {
    this.updatedSnapshot.next(snapshot);
  }, (err) => {
    console.log(err);
  })
  }

  async addreservacion(reservacion: ReservacionModel){
    reservacion.fechaCreacion = this.pipe.transform(Date.now(), 'dd/MM/yyyy, h:mm:ss a');
    await addDoc(collection(this.afs,'reservaciones'), reservacion)
    .then(docRef => {
      console.log('La Reservacion se grabo con el ID: ', docRef.id);
      this.variablesGL.endProcessreservacion.next(docRef.id);
    })
    .catch(error => {
      console.log('La Reservacion no se grabo: ', error);
      this.variablesGL.endProcessreservacion.next('');
    });
  }

  async updatereservacion(updatereservacion: ReservacionModel){
    const db = getFirestore();
    // const cityRef = doc(db, 'reservaciones', 'updatereservacion.id');
    // setDoc(cityRef, { capital: true }, { merge: true });

    const reservacionesRef = doc(db, "reservaciones", updatereservacion.id);
    //console.log('datatatata ', getDoc(washingtonRef));

    await updateDoc(reservacionesRef, {
      // titulo: updatereservacion.titulo,
      // categoria: updatereservacion.categoria,
      // nominado: updatereservacion.nominado,
      // descripcion: updatereservacion.descripcion,
      // fileLogoEmpresa: updatereservacion.fileLogoEmpresa,
      // organizacion:updatereservacion.organizacion,
      // responsable:updatereservacion.responsable,
      // telefono:updatereservacion.telefono,
      // pais:updatereservacion.pais,
      // rsInstagram: updatereservacion.rsInstagram,
      // rsTwitter: updatereservacion.rsTwitter,
      // rsFacebook: updatereservacion.rsFacebook,
      // rsYoutube: updatereservacion.rsYoutube,
      // fileCesionDerechos: updatereservacion.fileCesionDerechos,
      // fileCartaIntencion: updatereservacion.fileCartaIntencion,
      // materialMultimedia: updatereservacion.materialMultimedia,
      // fileBaucher: updatereservacion.fileBaucher,
      // pagarCon:updatereservacion.pagarCon,
      // statuspago:updatereservacion.statuspago,
      // idpago:updatereservacion.idpago,
      montopago:updatereservacion.montopago,
      uid:updatereservacion.uid,
      fechaCreacion: updatereservacion.fechaCreacion,
      fechaActualizacion: this.pipe.transform(Date.now(), 'dd/MM/yyyy, h:mm:ss a')
    });
  }

  async updateStatusPagoreservacion(updatereservacion: ReservacionModel){
    const db = getFirestore();
    // const cityRef = doc(db, 'reservaciones', 'updatereservacion.id');
    // setDoc(cityRef, { capital: true }, { merge: true });

    const reservacionesRef = doc(db, "reservaciones", updatereservacion.id);
    //console.log('datatatata ', getDoc(washingtonRef));

    await updateDoc(reservacionesRef, {
      statuspago:updatereservacion.statuspago,
    });
  }

  async deletereservacion(deletereservacion: ReservacionModel){

    const db = getFirestore();
    const reservacionRef = doc(db, "reservaciones", deletereservacion.id);

    await deleteDoc(reservacionRef);
  }

  async getreservaciones(){
    this.listareservaciones = [];
    let uid = JSON.parse(localStorage.x).uid;
    const itemsCollection = collection(this.afs,'reservaciones'); //where('uid', '==', uid)
    // return collectionData(query(itemsCollection, where("uid", "==", uid)));
    const q = query(itemsCollection, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
         //console.log(doc.data().LugaresComprados)
          let b: ReservacionModel={
            id: doc.data().id,
            LugaresComprados: doc.data().LugaresComprados,
            codigotiket: doc.data().codigotiket,
            peticionpaypal:doc.data().peticionpaypal,
            respuestapaypal:doc.data().respuestapaypal,
            idpagopaypal:doc.data().idpagopaypal,
            statuspago:doc.data().statuspago,
            descripcionpago:doc.data().descripcionpago,
            montopago:doc.data().montopago,
            uid: doc.data().uid,
            fechaCreacion:doc.data().fechaCreacion,
            fechaActualizacion: doc.data().fechaActualizacion,
            Nombrecomprador: doc.data().Nombrecomprador,
            fileBaucher: doc.data().fileBaucher,
            pagarCon: doc.data().pagarCon,
            platoFuerte: doc.data().platoFuerte
          }

        this.listareservaciones.push(b)

        // );
        //console.log(doc.id, " => ", doc.data());
    });
    return this.listareservaciones;
  }

  async getAllreservaciones(){
    this.listareservaciones = [];
    let uid = JSON.parse(localStorage.x).uid;
    const itemsCollection = collection(this.afs,'reservaciones'); //where('uid', '==', uid)
    // return collectionData(query(itemsCollection, where("uid", "==", uid)));
    const q = query(itemsCollection);
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        // this.listareservaciones.push({
        //     id: doc.id,
        //     titulo: doc.data().titulo,
        //     categoria: doc.data().categoria,
        //     nominado: doc.data().nominado,
        //     descripcion: doc.data().descripcion,
        //     fileLogoEmpresa: doc.data().fileLogoEmpresa,
        //     organizacion:doc.data().organizacion,
        //     responsable:doc.data().responsable,
        //     telefono:doc.data().telefono,
        //     pais:doc.data().pais,
        //     rsInstagram: doc.data().rsInstagram,
        //     rsTwitter: doc.data().rsTwitter,
        //     rsFacebook: doc.data().rsFacebook,
        //     rsYoutube: doc.data().rsYoutube,
        //     fileCesionDerechos: doc.data().fileCesionDerechos,
        //     fileCartaIntencion: doc.data().fileCartaIntencion,
        //     materialMultimedia: doc.data().materialMultimedia,
        //     fileBaucher: doc.data().fileBaucher,
        //     pagarCon:doc.data().pagarCon,
        //     statuspago:doc.data().statuspago,
        //     idpago:doc.data().idpago,
        //     montopago:doc.data().montopago,
        //     uid:doc.data().uid,
        //     fechaCreacion: doc.data().fechaCreacion,
        //     fechaActualizacion: doc.data().fechaActualizacion
        // });
        //console.log(doc.id, " => ", doc.data());
    });
    return this.listareservaciones;
  }


  getReservacionesAdmin(){
    const categoriasCollection = collection(this.afs, 'reservaciones');
    return collectionData(query(categoriasCollection));
  }
}
