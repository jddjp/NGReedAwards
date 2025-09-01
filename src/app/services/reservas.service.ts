
import { DatePipe } from '@angular/common';
import { VariablesService } from './variablesGL.service';
import { ReservacionModel } from '../models/reservacion.model';

import { Injectable } from '@angular/core';
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  DocumentData,
  CollectionReference,
  onSnapshot,
  QuerySnapshot,
  query,
  orderBy,
  where,
  DocumentReference,
  getDocs,
} from 'firebase/firestore';
import { collectionChanges, collectionData, Firestore } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { initializeApp } from "firebase/app";
import { ReservaModel } from '../models/reservar.model';
@Injectable({
  providedIn: 'root',
})
export class ReservasService {
  db: Firestore;
  reservaColl: CollectionReference<DocumentData>;
  private updatedSnapshot = new Subject<QuerySnapshot<DocumentData>>();
  obsr_UpdatedSnapshot = this.updatedSnapshot.asObservable();
  listareservaciones: ReservacionModel[] = [];
  pipe = new DatePipe('en-US');
  constructor(private afs: Firestore, private variablesGL: VariablesService) {
    this.db = getFirestore();
    this.reservaColl = collection(this.db, 'reservas');
    onSnapshot(
      this.reservaColl,
      (snapshot) => {
        this.updatedSnapshot.next(snapshot);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  async addreservacion(reserva: ReservaModel) {
    // reservacion.fechaCreacion = this.pipe.transform(Date.now(), 'dd/MM/yyyy, h:mm:ss a');
    await addDoc(collection(this.afs, 'reservas'), reserva)
      .then((docRef) => {
        console.log('La Reservacion se grabo con el ID: ', docRef.id);
        //this.variablesGL.endProcessreservacion.next(docRef.id);
      })
      .catch((error) => {
        console.log('La Reservacion no se grabo: ', error);
        //this.variablesGL.endProcessreservacion.next('');
      });
  }

  async updateReserva(invitation) {
    console.log(invitation);
    await updateDoc(doc(this.afs, 'reservas', invitation.uid), invitation)
      .then((docRef) => {
        //console.log('El cupon se actualizo exitosamente');
      })
      .catch((error) => {
        //console.log('El cupon no se grabo: ', error);
      });
  }

  async updatereservacion(updatereservacion: ReservacionModel) {
    const db = getFirestore();
    const reservacionesRef = doc(db, 'reservas', updatereservacion.id);
    await updateDoc(reservacionesRef, {
      montopago: updatereservacion.montopago,
      uid: updatereservacion.uid,
      fechaCreacion: updatereservacion.fechaCreacion,
      fechaActualizacion: this.pipe.transform(
        Date.now(),
        'dd/MM/yyyy, h:mm:ss a'
      ),
    });
  }

  async updateStatusPagoreservacion(updatereservacion: ReservacionModel) {
    const db = getFirestore();
    const reservacionesRef = doc(db, 'reservas', updatereservacion.id);
    await updateDoc(reservacionesRef, {
      statuspago: updatereservacion.statuspago,
    });
  }

  async deletereservacion(deletereservacion: ReservacionModel) {
    const db = getFirestore();
    const reservacionRef = doc(db, 'reservas', deletereservacion.uid);
    await deleteDoc(reservacionRef);
  }

  async getreservaciones() {
    this.listareservaciones = [];
    let uid = JSON.parse(localStorage.x).uid;
    const itemsCollection = collection(this.afs, 'reservas');
    const q = query(itemsCollection, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      let b: ReservacionModel = {
        id: doc.data().id,
        LugaresComprados: doc.data().LugaresComprados,
        codigotiket: doc.data().codigotiket,
        peticionpaypal: doc.data().peticionpaypal,
        respuestapaypal: doc.data().respuestapaypal,
        idpagopaypal: doc.data().idpagopaypal,
        statuspago: doc.data().statuspago,
        descripcionpago: doc.data().descripcionpago,
        montopago: doc.data().montopago,
        uid: doc.data().uid,
        fechaCreacion: doc.data().fechaCreacion,
        fechaActualizacion: doc.data().fechaActualizacion,
        Nombrecomprador: doc.data().Nombrecomprador,
        fileBaucher: doc.data().fileBaucher,
        pagarCon: doc.data().pagarCon,
        platoFuerte: doc.data().platoFuerte,
      };

      this.listareservaciones.push(b);
    });
    return this.listareservaciones;
  }

  async getAllreservaciones() {
    this.listareservaciones = [];
    let uid = JSON.parse(localStorage.x).uid;
    const itemsCollection = collection(this.afs, 'reservas');

    const q = query(itemsCollection);
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {});
    return this.listareservaciones;
  }

  async getReservacionesAdmin() {
    const snapshot = await getDocs(this.reservaColl);

    var reservas = [];
    snapshot.forEach((doc) => {
      //reservas.push({ ...doc.data(), id: doc.id });
      reservas.push({ ...doc.data(),uid:doc.id});

    });
    return reservas;
    //return collectionData(query(categoriasCollection));
  }
}
