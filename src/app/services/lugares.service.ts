
import { Injectable } from '@angular/core';
import { DocumentData } from '@angular/fire/compat/firestore';
import { collectionData, CollectionReference, Firestore, QuerySnapshot,query,orderBy } from '@angular/fire/firestore';
import { addDoc, collection, doc, getDocs, getFirestore, onSnapshot, updateDoc, where } from 'firebase/firestore';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { boleto } from '../modules/reedevento/home/pago/pago.component';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class LugaresService {
  db: Firestore;
  categoriaCol: CollectionReference<DocumentData>;
  private updatedSnapshot = new Subject<QuerySnapshot<DocumentData>>();
  obsr_UpdatedSnapshot = this.updatedSnapshot.asObservable();

  id: any;
  constructor(private toastr: ToastrService, private firestore: Firestore) {
    this.db = getFirestore();
    this.categoriaCol = collection(this.db, 'lugares');
    /*onSnapshot(
      this.categoriaCol,
      (snapshot) => {
        this.updatedSnapshot.next(snapshot);
      },
      (err) => {
        console.log(err);
      }
    );*/
  }

  getLugares() {
    const categoriasCollection = collection(this.firestore, 'lugares');
    return collectionData(
      query(categoriasCollection, orderBy('idLugar', 'asc'))
    );
  }

  getLugaresPagados(boleto: boleto) {
    const categoriasCollection = collection(this.firestore, 'lugares');

    return collectionData(
      query(
        categoriasCollection,
        where('idLugar', '==', boleto.idLugar),
        orderBy('idLugar', 'asc')
      )
    );
  }

  async addLugar(
    idLugar: string,
    apartado: boolean,
    comprado: boolean,
    fecha: string,
    precio: string
  ) {
    await addDoc(this.categoriaCol, {
      idLugar,
      apartado,
      comprado,
      fecha,
      precio,
    });
    return '';
  }

  async updatelugarPagado(boletos: boleto[]) {
    for (let boleto of boletos) {
      let idLugar = boleto.idLugar;
      let apartado = true;
      let fecha =   new Date().toLocaleString('en-US');
      let comprado = true;
      const querySnapshot = await getDocs(
        query(
          collection(this.db, 'lugares/'),
          where('idLugar', '==', boleto.idLugar)
        )
      );
      querySnapshot.forEach((doc) => {
        this.id = doc.id;
      });
      const docRef = doc(this.db, 'lugares/' + this.id);
      await updateDoc(docRef, { idLugar, apartado, fecha, comprado });
    }
    return this.toastr.warning(
      'Reservacion valida durante 5 min!!',
      'Seleccionar forma de pago'
    );
  }

  async updatelugarApartado(boletos: boleto[]) {
    for (let boleto of boletos) {
      let idLugar = boleto.idLugar;
      let apartado = true;
      let fecha = boleto.hora;
      const querySnapshot = await getDocs(
        query(
          collection(this.db, 'lugares/'),
          where('idLugar', '==', boleto.idLugar)
        )
      );
      querySnapshot.forEach((doc) => {
        this.id = doc.id;
      });
      const docRef = doc(this.db, 'lugares/' + this.id);
      await updateDoc(docRef, { idLugar, apartado, fecha });
    }
    return this.toastr.warning(
      'Reservacion valida durante 5 min!!',
      'Seleccionar forma de pago'
    );
  }

  async updatelugarApartadoV2(boletos: boleto[]) {
    for (let boleto of boletos) {
      let idLugar = boleto.idLugar;
      let apartado = boleto.apartado;
      let comprado  = false
      //let fecha = boleto.hora;
      const querySnapshot = await getDocs(
        query(
          collection(this.db, 'lugares/'),
          where('idLugar', '==', boleto.idLugar)
        )
      );
      querySnapshot.forEach((doc) => {
        this.id = doc.id;
      });
      const docRef = doc(this.db, 'lugares/' + this.id);
      await updateDoc(docRef, { idLugar, apartado,comprado, });
    }
    return this.toastr.warning(
      'Reservacion valida durante 5 min!!',
      'Seleccionar forma de pago'
    );
  }


  async cancelarLugar(boletos: boleto[]) {
    for (let boleto of boletos) {
      let idLugar = boleto.idLugar;
      let apartado = false;
      let comprado = false;
      let fecha = null;
      const querySnapshot = await getDocs(
        query(
          collection(this.db, 'lugares/'),
          where('idLugar', '==', boleto.idLugar)
        )
      );
      querySnapshot.forEach((doc) => {
        this.id = doc.id;
      });
      const docRef = doc(this.db, 'lugares/' + this.id);
      await updateDoc(docRef, { idLugar, apartado, comprado, fecha });
    }
  }

  async cancelarLugarAparatdo(boleto: boleto) {
    let idLugar = boleto.idLugar;
    let apartado = false;
    let comprado = false;
    let fecha = null;
    const querySnapshot = await getDocs(
      query(
        collection(this.db, 'lugares/'),
        where('idLugar', '==', boleto.idLugar)
      )
    );
    querySnapshot.forEach((doc) => {
      this.id = doc.id;
    });
    const docRef = doc(this.db, 'lugares/' + this.id);
    await updateDoc(docRef, { idLugar, apartado, comprado, fecha });
  }
}




