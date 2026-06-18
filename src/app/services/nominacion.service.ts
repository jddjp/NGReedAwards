import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc, doc } from '@angular/fire/firestore';
import { getDocs, query, where, getFirestore } from 'firebase/firestore';
import { NominacionModel } from '../models/nominacion.model';
import { VariablesService } from './variablesGL.service';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NominacionService {


 
  getCodigosDescuento() {
    const ref = collection(this.afs, 'codigosDescuento');
    return collectionData(ref, { idField: 'id' });
  }

  async addCodigoDescuento(codigo: any) {
    const ref = collection(this.afs, 'codigosDescuento');
    await addDoc(ref, codigo);
  }

  async updateCodigoDescuento(id: string, codigo: any) {
    const ref = doc(this.afs, 'codigosDescuento', id);
    await updateDoc(ref, codigo);
  }

  async deleteCodigoDescuento(id: string) {
    const ref = doc(this.afs, 'codigosDescuento', id);
    await deleteDoc(ref);
  }
 
  listaNominaciones: NominacionModel[] = [];
  pipe = new DatePipe('en-US');
  constructor(
    private afs: Firestore,
    private variablesGL: VariablesService,
    private http: HttpClient
  ) {}



  async addNominacion(nominacion: NominacionModel) {
    nominacion.fechaCreacion = this.pipe.transform(
      Date.now(),
      'dd/MM/yyyy, h:mm:ss a'
    ) || '';
    await addDoc(collection(this.afs, 'nominaciones'), nominacion)
      .then((docRef) => {
        console.log('La nominacion se grabo con el ID: ', docRef.id);
        this.variablesGL.endProcessNominacion.next(docRef.id);
      })
      .catch((error) => {
        console.log('La nominacion no se grabo: ', error);
        this.variablesGL.endProcessNominacion.next('');
      });
  }

  async updateNominacion(updateNominacion: NominacionModel) {
    const db = getFirestore();
    const nominacionesRef = doc(db, 'nominaciones', updateNominacion.id || '');
    //console.log('datatatata ', getDoc(washingtonRef));

    await updateDoc(nominacionesRef, {
      titulo: updateNominacion.titulo,
      categoria: updateNominacion.categoria,
      nominado: updateNominacion.nominado,
      descripcion: updateNominacion.descripcion,
      fileLogoEmpresa: updateNominacion.fileLogoEmpresa,
      organizacion: updateNominacion.organizacion,
      responsable: updateNominacion.responsable,
      telefono: updateNominacion.telefono,
      pais: updateNominacion.pais,
      rsInstagram: updateNominacion.rsInstagram,
      rsTwitter: updateNominacion.rsTwitter,
      rsFacebook: updateNominacion.rsFacebook,
      rsYoutube: updateNominacion.rsYoutube,
      fileCesionDerechos: updateNominacion.fileCesionDerechos,
      fileCartaIntencion: updateNominacion.fileCartaIntencion,
      materialMultimedia: updateNominacion.materialMultimedia,
      fileBaucher: updateNominacion.fileBaucher,
      pagarCon: updateNominacion.pagarCon,
      statuspago: updateNominacion.statuspago,
      idpago: updateNominacion.idpago,
      montopago: updateNominacion.montopago,
      uid: updateNominacion.uid,
      fechaCreacion: updateNominacion.fechaCreacion,
      fechaActualizacion: this.pipe.transform(
        Date.now(),
        'dd/MM/yyyy, h:mm:ss a'
      ),
      //fechapago: updateNominacion.fechapago,
      evaluacion: updateNominacion.evaluacion,
    });
  }

  async updateStatusPagoNominacion(updateNominacion: NominacionModel) {
    const db = getFirestore();
    const nominacionesRef = doc(db, 'nominaciones', updateNominacion.id || '');
    //console.log('datatatata ', getDoc(washingtonRef));

    await updateDoc(nominacionesRef, {
      statuspago: updateNominacion.statuspago,
      fechapago: updateNominacion.fechapago,
    });
  }

  async deleteNominacion(deleteNominacion: NominacionModel) {
    const db = getFirestore();
    const nominacionRef = doc(db, 'nominaciones', deleteNominacion.id || '');

    await deleteDoc(nominacionRef);
  }

  async getNominaciones() {
    this.listaNominaciones = [];
    let uid = JSON.parse(localStorage.d).uid;
    const itemsCollection = collection(this.afs, 'nominaciones'); //where('uid', '==', uid)
    // return collectionData(query(itemsCollection, where("uid", "==", uid)));
    const q = query(itemsCollection, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      this.listaNominaciones.push({
        id: doc.id,
        titulo: doc.data().titulo,
        categoria: doc.data().categoria,
        nominado: doc.data().nominado,
        descripcion: doc.data().descripcion,
        fileLogoEmpresa: doc.data().fileLogoEmpresa,
        organizacion: doc.data().organizacion,
        responsable: doc.data().responsable,
        telefono: doc.data().telefono,
        pais: doc.data().pais,
        rsInstagram: doc.data().rsInstagram,
        rsTwitter: doc.data().rsTwitter,
        rsFacebook: doc.data().rsFacebook,
        rsYoutube: doc.data().rsYoutube,
        fileCesionDerechos: doc.data().fileCesionDerechos,
        fileCartaIntencion: doc.data().fileCartaIntencion,
        materialMultimedia: doc.data().materialMultimedia,
        fileBaucher: doc.data().fileBaucher,
        pagarCon: doc.data().pagarCon,
        statuspago: doc.data().statuspago,
        idpago: doc.data().idpago,
        fechapago: doc.data().fechapago,
        montopago: doc.data().montopago,
        uid: doc.data().uid,
        fechaCreacion: doc.data().fechaCreacion,
        fechaActualizacion: doc.data().fechaActualizacion,
        evaluacion: doc.data().evaluacion,
      });
      //console.log(doc.id, " => ", doc.data());
    });
    return this.listaNominaciones;
  }

  async getAllNominaciones() {
    this.listaNominaciones = [];
    let uid = JSON.parse(localStorage.d).uid;
    const itemsCollection = collection(this.afs, 'nominaciones'); //where('uid', '==', uid)
    // return collectionData(query(itemsCollection, where("uid", "==", uid)));
    const q = query(itemsCollection);
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      this.listaNominaciones.push({
        id: doc.id,
        titulo: doc.data().titulo,
        categoria: doc.data().categoria,
        nominado: doc.data().nominado,
        descripcion: doc.data().descripcion,
        fileLogoEmpresa: doc.data().fileLogoEmpresa,
        organizacion: doc.data().organizacion,
        responsable: doc.data().responsable,
        telefono: doc.data().telefono,
        pais: doc.data().pais,
        rsInstagram: doc.data().rsInstagram,
        rsTwitter: doc.data().rsTwitter,
        rsFacebook: doc.data().rsFacebook,
        rsYoutube: doc.data().rsYoutube,
        fileCesionDerechos: doc.data().fileCesionDerechos,
        fileCartaIntencion: doc.data().fileCartaIntencion,
        materialMultimedia: doc.data().materialMultimedia,
        fileBaucher: doc.data().fileBaucher,
        pagarCon: doc.data().pagarCon,
        statuspago: doc.data().statuspago,
        idpago: doc.data().idpago,
        fechapago: doc.data().fechapago,
        montopago: doc.data().montopago,
        uid: doc.data().uid,
        fechaCreacion: doc.data().fechaCreacion,
        fechaActualizacion: doc.data().fechaActualizacion,
        evaluacion: doc.data().evaluacion,
      });
      //console.log(doc.id, " => ", doc.data());
    });
    return this.listaNominaciones;
  }

  async getAllNominacionesFilterCategorias(filter: string[]) {
    this.listaNominaciones = [];
    let uid = JSON.parse(localStorage.d).uid;
    const itemsCollection = collection(this.afs, 'nominaciones'); //where('uid', '==', uid)

    console.log(filter.length == 0);
    if (filter.length == 0) {
      filter = [''];
    }

    // return collectionData(query(itemsCollection, where("uid", "==", uid)));
    const q = query(itemsCollection, where('categoria', 'in', filter));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      this.listaNominaciones.push({
        id: doc.id,
        titulo: doc.data().titulo,
        categoria: doc.data().categoria,
        nominado: doc.data().nominado,
        descripcion: doc.data().descripcion,
        fileLogoEmpresa: doc.data().fileLogoEmpresa,
        organizacion: doc.data().organizacion,
        responsable: doc.data().responsable,
        telefono: doc.data().telefono,
        pais: doc.data().pais,
        rsInstagram: doc.data().rsInstagram,
        rsTwitter: doc.data().rsTwitter,
        rsFacebook: doc.data().rsFacebook,
        rsYoutube: doc.data().rsYoutube,
        fileCesionDerechos: doc.data().fileCesionDerechos,
        fileCartaIntencion: doc.data().fileCartaIntencion,
        materialMultimedia: doc.data().materialMultimedia,
        fileBaucher: doc.data().fileBaucher,
        pagarCon: doc.data().pagarCon,
        statuspago: doc.data().statuspago,
        idpago: doc.data().idpago,
        fechapago: doc.data().fechapago,
        montopago: doc.data().montopago,
        uid: doc.data().uid,
        fechaCreacion: doc.data().fechaCreacion,
        fechaActualizacion: doc.data().fechaActualizacion,
        evaluacion: doc.data().evaluacion,
      });
      //console.log(doc.id, " => ", doc.data());
    });
    return this.listaNominaciones;
  }

  sendEmail(correo : any): Observable<any> {
    //console.log(mensaje);
   
    return this.http
      .post<any>(
        'https://pos-api.uniformeshuitzil.com:9110/Roles/Correo',
        correo
      )
      .pipe(map((res) => res));
  }
}
