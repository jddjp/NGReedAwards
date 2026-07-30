
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
 // lugares2026: CollectionReference<DocumentData>;
  private updatedSnapshot = new Subject<QuerySnapshot<DocumentData>>();
  obsr_UpdatedSnapshot = this.updatedSnapshot.asObservable();

  id: any;
  constructor(private toastr: ToastrService, private firestore: Firestore) {
    this.db = getFirestore();
    this.categoriaCol = collection(this.db, 'lugares2026');
    //this.lugares2026 = collection(this.db, 'lugares2026');
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
    const categoriasCollection = collection(this.firestore, 'lugares2026');
    return collectionData(
      query(categoriasCollection, orderBy('idLugar', 'asc'))
    );
  }

  getLugaresPagados(boleto: boleto) {
    const categoriasCollection = collection(this.firestore, 'lugares2026');

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
          collection(this.db, 'lugares2026/'),
          where('idLugar', '==', boleto.idLugar)
        )
      );
      querySnapshot.forEach((doc) => {
        this.id = doc.id;
      });
      const docRef = doc(this.db, 'lugares2026/' + this.id);
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
          collection(this.db, 'lugares2026/'),
          where('idLugar', '==', boleto.idLugar)
        )
      );
      querySnapshot.forEach((doc) => {
        this.id = doc.id;
      });
      const docRef = doc(this.db, 'lugares2026/' + this.id);
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
          collection(this.db, 'lugares2026/'),
          where('idLugar', '==', boleto.idLugar)
        )
      );
      querySnapshot.forEach((doc) => {
        this.id = doc.id;
      });
      const docRef = doc(this.db, 'lugares2026/' + this.id);
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
          collection(this.db, 'lugares2026/'),
          where('idLugar', '==', boleto.idLugar)
        )
      );
      querySnapshot.forEach((doc) => {
        this.id = doc.id;
      });
      const docRef = doc(this.db, 'lugares2026/' + this.id);
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
        collection(this.db, 'lugares2026/'),
        where('idLugar', '==', boleto.idLugar)
      )
    );
    querySnapshot.forEach((doc) => {
      this.id = doc.id;
    });
    const docRef = doc(this.db, 'lugares2026/' + this.id);
    await updateDoc(docRef, { idLugar, apartado, comprado, fecha });
  }

 getLugares2026() {
    const categoriasCollection = collection(this.firestore, 'lugares2026');
    return collectionData(
      query(categoriasCollection, orderBy('idLugar', 'asc'))
    );
  }

  getLugaresPorMesa(idMesa: string) {
    const categoriasCollection = collection(this.firestore, 'lugares2026');
    return collectionData(
      query(categoriasCollection, where('idMesa', '==', idMesa))
    );
  }

  getMesas2026() {
    const mesasCollection = collection(this.firestore, 'mesa2026');
    return collectionData(
      query(mesasCollection, orderBy('orden', 'asc'))
    );
  }

  async addLugar2026(
    idLugar: string,
    apartado: boolean,
    comprado: boolean,
    fecha: string,
    precio: string,
    type: string,
    idMesa?: string
  ) {
    const lugares2026Col = collection(this.db, 'lugares2026');
    const docData: any = {
      idLugar,
      apartado,
      comprado,
      fecha,
      precio,
      type,
    };
    if (idMesa) {
      docData.idMesa = idMesa;
    }
    await addDoc(lugares2026Col, docData);
    return '';
  }

  async addMesa2026(
    id: string,
    type: string,
    precio: string,
    x: number,
    y: number,
    orden: number
  ) {
    const mesa2026Col = collection(this.db, 'mesa2026');
    await addDoc(mesa2026Col, {
      id,
      type,
      precio,
      x,
      y,
      orden,
    });
    return '';
  }

  async updateMesa2026(
    id: string,
    updates: { type?: string; precio?: string; x?: number; y?: number; orden?: number }
  ) {
    const querySnapshot = await getDocs(
      query(
        collection(this.db, 'mesa2026/'),
        where('id', '==', id)
      )
    );

    let docId: string | null = null;
    querySnapshot.forEach((doc) => {
      docId = doc.id;
    });

    if (!docId) {
      throw new Error(`Mesa no encontrada: ${id}`);
    }

    const docRef = doc(this.db, 'mesa2026/' + docId);
    await updateDoc(docRef, updates);
    return '';
  }

  async updateLugar2026Status(idLugar: string, updates: { apartado?: boolean; comprado?: boolean; fecha?: string; precio?: string; }) {
    const querySnapshot = await getDocs(
      query(
        collection(this.db, 'lugares2026/'),
        where('idLugar', '==', idLugar)
      )
    );

    querySnapshot.forEach((doc) => {
      this.id = doc.id;
    });

    if (!this.id) {
      throw new Error(`Lugar no encontrado: ${idLugar}`);
    }

    const docRef = doc(this.db, 'lugares2026/' + this.id);
    await updateDoc(docRef, updates);
    this.id = null;
  }
}




