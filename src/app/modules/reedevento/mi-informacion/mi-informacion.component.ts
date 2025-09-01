import { Component, OnInit } from '@angular/core';
import {  EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VariablesService } from '../../../services/variablesGL.service';
import { collection, doc, Firestore, getDoc, getFirestore, setDoc } from "@angular/fire/firestore";
import { collectionData } from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mi-informacion',
  templateUrl: './mi-informacion.component.html',
  styleUrls: ['./mi-informacion.component.css']
})
export class MiInformacionComponent implements OnInit {

  formMiInformacion: FormGroup;
  submitedF1: boolean;
  formContrasena: FormGroup;
  submitedF2: boolean;
  loading: boolean = false;
  phoneNational = '^((\\+52-?)|0)?[0-9]{10}$';
  phoneInternational = /^[\(]?[\+]?(\d{2}|\d{3})[\)]?[\s]?((\d{6}|\d{8})|(\d{3}[\*\.\-\s]){3}|(\d{2}[\*\.\-\s]){4}|(\d{4}[\*\.\-\s]){2})|\d{8}|\d{10}|\d{12}$/;
  // formMiInformacion = new FormGroup({
  //   uid: new FormControl(''),
  //   firstName: new FormControl(''),
  //   lastName: new FormControl(''),
  //   phone: new FormControl(''),
  // })
  uid = JSON.parse(localStorage.x).uid;
  userData: any;
  constructor(
    private fb: FormBuilder,
    private variablesGL: VariablesService,
    // private auth: Auth,
    private afs: Firestore,
    private toastr: ToastrService
  ) {
    this.getUserData();
   }

  ngOnInit(): void {
    this.initForms();
  }

  getUserData() {
    const itemsCollection = collection(this.afs,'usuarios');
    return collectionData(itemsCollection);
  }

  initForms(){
    this.getUserData().subscribe(data => {
      if(data) {
        this.userData = data.filter(item => item.uid === this.uid);
        this.loading = false;
        this.formMiInformacion.patchValue({ ...this.userData[0] });

      }
    },
    err => {
      this.toastr.error('Hubo un problema al obtener las nominaciones, intentelo más tarde...','Error')
      this.loading = false;
    }
    );

    this.formMiInformacion = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(this.phoneInternational)]],
      // address: ['', [Validators.required]],
    })

    this.formContrasena = this.fb.group({
      contrasenaActual: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repetirPassword: ['' ],
    },{validator: this.variablesGL.checkPassword})
  }

  async updateInfo(value: any){
    this.loading = true;
    this.submitedF1 = true;
    console.log('content form info ', this.formMiInformacion);
      if(this.formMiInformacion.valid){
        let uid = JSON.parse(localStorage.x).uid;
        const db = getFirestore();
        //get current user email
        const user = await getAuth().currentUser;
        const userEmail = user.email;
        //get user role from this.userData
        const userRole = this.userData[0].rol;
        console.log('userRole', userRole);

        await setDoc(doc(db, 'usuarios', uid),{
            uid: uid,
            email: userEmail,
            firstName: value.firstName,
            lastName: value.lastName,
            displayName: value.firstName,
            phone: value.phone,
            address: '',
            photoURL: '',
            rol: userRole,
        });
        this.toastr.success('Información actualizada correctamente','Éxito')
        this.loading = false;
      } else {
        this.toastr.error('Por favor, verifique los campos marcados en rojo','Error')
        this.loading = false;
      }
  }

  async updatePassword(){
    this.submitedF2 = true;
      if(this.formContrasena.valid){
        const auth = getAuth();
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, this.formContrasena.value.contrasenaActual);
        await reauthenticateWithCredential(user, credential).then(() => {
        console.log('reautenticado');
          //update password
           updatePassword(user, this.formContrasena.value.password).then(async () => {
            console.log('contrasena actualizada');
            this.toastr.success('Contraseña actualizada correctamente','Éxito')
            const newCredential = EmailAuthProvider.credential(user.email, this.formContrasena.value.password)
            await reauthenticateWithCredential(user, newCredential).then(() => {
              console.log('reautenticado');
            })
          }).catch(err => {
            console.log(err);
            this.toastr.error('Hubo un problema al actualizar la contraseña, intentelo más tarde...','Error')
          })

        }).catch((error) => {
          console.log('error', error);
          this.toastr.error('Contraseña actual incorrecta','Error')
        });
      }
  }

}
