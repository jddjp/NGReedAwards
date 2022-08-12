import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc, getFirestore } from '@angular/fire/firestore';
import { doc, getDocs, query, where } from 'firebase/firestore';
import { ReservacionModel } from '../models/reservacion.model';
import { VariablesService } from './variablesGL.service';

@Injectable({
  providedIn: 'root'
})
export class reservacionService {
  listareservaciones: ReservacionModel[] = [];
  pipe = new DatePipe('en-US');
  constructor(
    private afs: Firestore,
    private variablesGL: VariablesService,
  ){
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
    let uid = JSON.parse(localStorage.d).uid;
    const itemsCollection = collection(this.afs,'reservaciones'); //where('uid', '==', uid)
    // return collectionData(query(itemsCollection, where("uid", "==", uid)));
    const q = query(itemsCollection, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        // this.listareservaciones.push({
        //     id: doc.id,
        // });
        //console.log(doc.id, " => ", doc.data());
    });
    return this.listareservaciones;
  }

  async getAllreservaciones(){
    this.listareservaciones = [];
    let uid = JSON.parse(localStorage.d).uid;
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
}
