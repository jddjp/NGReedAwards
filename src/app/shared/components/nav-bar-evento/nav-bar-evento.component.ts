import { Component, Input, OnInit } from '@angular/core';
import { collection, collectionData, doc, docData, Firestore } from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from 'src/config/config.service';
import { VariablesService } from '../../../services/variablesGL.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-nav-bar-evento',
  templateUrl: './nav-bar-evento.component.html',
  styleUrls: ['./nav-bar-evento.component.css']
})
export class NavBarEventoComponent implements OnInit {
  currentUser: any;
  userData: any;
  // uid = JSON.parse(localStorage.x).uid;
  //get uid from local storage or parse undefined is its null
  // uid = JSON.parse(localStorage.x) ? JSON.parse(localStorage.x).uid : undefined;
  userUid: any;
  @Input() type: string;
  constructor(
    public configService: ConfigService,
    private variablesGL: VariablesService,
    private afs: Firestore,
    private toastr: ToastrService
  ) {
    this.init();
  }

  ngOnInit(): void {
  }

  getUserData(uid: string): Observable<any> {
    const userDocRef = doc(this.afs, `usuarios/${uid}`);
    return docData(userDocRef);
  }

  init() {

    //if local storage is not null
    if(localStorage.x){
      this.userUid = JSON.parse(localStorage.x).uid;
    } else {
      this.userUid = undefined;
    }
if( this.userUid!=undefined){
    this.getUserData(this.userUid).subscribe(data => {
      this.userData = data;
      console.log(  this.userData )
      if(this.userData[0]?.rol){
        this.currentUser = this.userData[0].rol;
      }
    });
}
    // this.getUserData( this.userUid).subscribe(data => {
    //   if(data) {
    //    // this.userData = data.filter(item => item.uid === this.userUid);
    //     this.userData = doc(this.afs, 'usuarios/' + this.userUid);
    //     console.log(  )
    //     //get user rol from userData
    //     if(this.userData[0]?.rol){
    //       this.currentUser = this.userData[0].rol;
    //     }

    //   }
    // },
    // err => {
    //   this.toastr.error('Hubo un problema al obtener la información, intentelo más tarde...','Error')
    // }
    // );
  }

  //get current user data
  // getUserRole(){
  //   //get user id from local storage
  //   let uid = JSON.parse(localStorage.x).uid;
  //   //get user data from firestore
  //   const userRef = doc(this.afs, 'usuarios/' + uid);


  // }

  logout(){
      this.variablesGL.removeCredential();
  }

  logoutAdmin(){
      this.variablesGL.removeCredentialAdminEvento();
  }

}
