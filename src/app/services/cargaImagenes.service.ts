import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, addDoc } from '@angular/fire/firestore';
//import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
//import { uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FileItem, ImageModel } from '../models/img.model';
import { getApp } from '@angular/fire/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { VariablesService } from './variablesGL.service';

@Injectable({
  providedIn: 'root'
})
export class CargaImagenesService {
  private carpetaImagenes = 'files';
  public idsImageSave: any[] = [];
  public idsImageErr: any[] = [];
  public archivosUpload: FileItem[] = []
  constructor(
    private afs: Firestore,
    private variablesGL: VariablesService,
  ) {}

  getImages(){
    const itemsCollection = collection(this.afs,'items');
    return collectionData(itemsCollection);
  }

  addImage(img: ImageModel, file: FileItem){
    //this.itemsCollection.add(img)
    addDoc(collection(this.afs,'img'), img)
    .then(docRef => {
      console.log('El archivo se grabo con el ID: ', docRef.id);
      this.idsImageSave.push({ fileMapped: img.fileMapped, idDoc: docRef.id, url: img.url });
      file.subiendo = false;
      this.validaEndUpload();
    })
    .catch(error => {
      console.log('El archivo no se grabo: ', error);
      this.idsImageErr.push({img: img, err: error});
    });
  }

  upload(files: FileItem[]){
    this.idsImageSave = [];
    this.idsImageErr = [];
    const firebaseApp = getApp();
    const storage = getStorage(firebaseApp, 'gs://rewards-latino.appspot.com');
    this.archivosUpload = files;
    for(const file of files){

      file.subiendo = true;
      if(file.progreso >= 100){
        continue;
      }

      const storageRef = ref(storage, `${this.carpetaImagenes}/${file.nombreArchivo}`);

      const uploadTask = uploadBytesResumable(storageRef, file.archivo);

      // Register three observers:
      // 1. 'state_changed' observer, called any time the state changes
      // 2. Error observer, called on failure
      // 3. Completion observer, called on successful completion
      uploadTask.on('state_changed',
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          file.progreso = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          //console.log('Upload is ' + file.progreso + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        },
        (error) => {
          // Handle unsuccessful uploads
          console.log("error en subir las imagenes");
        },
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            //console.log('File available at', downloadURL);
            file.url = downloadURL;

            this.addImage({
              nombre: file.nombreArchivo,
              url: file.url,
              fileMapped: file.fileMapped,
              uid: JSON.parse(localStorage.x).uid
            }, file);

            //this.validaEndUpload();

          });
        }
      );
    }
  }

  validaEndUpload(){
    let restantes = 0;
    this.archivosUpload.forEach(file => {
        if(file.subiendo == true){
          restantes++;
        }
    });

    if(restantes == 0){
        console.log('La carga de Archivos en Storage y en Store ha terminado...');
        this.variablesGL.endProcessCargaCompleta.next(true);
    }

  }
}
