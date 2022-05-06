import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, getFirestore } from '@angular/fire/firestore';
import { doc, getDocs, query, where } from 'firebase/firestore';
import { ContactoModel } from '../shared/models/contacto.model';
import { VariablesService } from './variablesGL.service';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  listaNominaciones: ContactoModel[] = [];
  constructor(
    private afs: Firestore,
    private variablesGL: VariablesService,
  ){
  }

  async addNominacion(contacto: ContactoModel){
    await addDoc(collection(this.afs,'mensajesContacto'), contacto)
    .then(docRef => {
      console.log('El CONTACTO se grabo con el ID: ', docRef.id);
      this.variablesGL.endProcessNominacion.next(docRef.id);
    })
    .catch(error => {
      console.log('EL CONTACTO no se grabo: ', error);
      this.variablesGL.endProcessNominacion.next('');
    });
  }


  // async updateNominacion(updateNominacion: ContactoModel){
  //   const db = getFirestore();
  //   // const cityRef = doc(db, 'nominaciones', 'updateNominacion.id');
  //   // setDoc(cityRef, { capital: true }, { merge: true });

  //   const washingtonRef = doc(db, "nominaciones", updateNominacion.id);
    //console.log('datatatata ', getDoc(washingtonRef));

  //   await updateDoc(washingtonRef, {
  //     titulo: updateNominacion.titulo,
  //     categoria: updateNominacion.categoria,
  //     nominado: updateNominacion.nominado,
  //     descripcion: updateNominacion.descripcion,
  //     fileLogoEmpresa: updateNominacion.fileLogoEmpresa,
  //     organizacion:updateNominacion.organizacion,
  //     responsable:updateNominacion.responsable,
  //     telefono:updateNominacion.telefono,
  //     pais:updateNominacion.pais,
  //     rsInstagram: updateNominacion.rsInstagram,
  //     rsTwitter: updateNominacion.rsTwitter,
  //     rsFacebook: updateNominacion.rsFacebook,
  //     rsYoutube: updateNominacion.rsYoutube,
  //     fileCesionDerechos: updateNominacion.fileCesionDerechos,
  //     fileCartaIntencion: updateNominacion.fileCartaIntencion,
  //     materialMultimedia: updateNominacion.materialMultimedia,
  //     fileBaucher: updateNominacion.fileBaucher,
  //     pagarCon:updateNominacion.pagarCon,
  //     statuspago:updateNominacion.statuspago,
  //     idpago:updateNominacion.idpago,
  //     montopago:updateNominacion.montopago,
  //     uid:updateNominacion.uid
  //   });
  // }

  // async getNominaciones(){
  //   this.listaNominaciones = [];
  //   let uid = JSON.parse(localStorage.d).uid;
  //   const itemsCollection = collection(this.afs,'nominaciones'); //where('uid', '==', uid)
  //   // return collectionData(query(itemsCollection, where("uid", "==", uid)));
  //   const q = query(itemsCollection, where("uid", "==", uid));
  //   const querySnapshot = await getDocs(q);
  //   querySnapshot.forEach((doc) => {
  //       // doc.data() is never undefined for query doc snapshots
  //       this.listaNominaciones.push({
  //           id: doc.id,
  //           titulo: doc.data().titulo,
  //           categoria: doc.data().categoria,
  //           nominado: doc.data().nominado,
  //           descripcion: doc.data().descripcion,
  //           fileLogoEmpresa: doc.data().fileLogoEmpresa,
  //           organizacion:doc.data().organizacion,
  //           responsable:doc.data().responsable,
  //           telefono:doc.data().telefono,
  //           pais:doc.data().pais,
  //           rsInstagram: doc.data().rsInstagram,
  //           rsTwitter: doc.data().rsTwitter,
  //           rsFacebook: doc.data().rsFacebook,
  //           rsYoutube: doc.data().rsYoutube,
  //           fileCesionDerechos: doc.data().fileCesionDerechos,
  //           fileCartaIntencion: doc.data().fileCartaIntencion,
  //           materialMultimedia: doc.data().materialMultimedia,
  //           fileBaucher: doc.data().fileBaucher,
  //           pagarCon:doc.data().pagarCon,
  //           statuspago:doc.data().statuspago,
  //           idpago:doc.data().idpago,
  //           montopago:doc.data().montopago,
  //           uid:doc.data().uid
  //       });
  //       //console.log(doc.id, " => ", doc.data());
  //   });
  //   return this.listaNominaciones;
  // }

}