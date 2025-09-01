import { Component, Input, OnInit } from '@angular/core';
import { collection, collectionData, doc, Firestore } from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from 'src/config/config.service';
import { VariablesService } from '../../../services/variablesGL.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
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

  getUserData() {
    const itemsCollection = collection(this.afs,'usuarios');
    return collectionData(itemsCollection);
  }

  init() {

    //if local storage is not null
    if(localStorage.x){
      this.userUid = JSON.parse(localStorage.x).uid;
    } else {
      this.userUid = undefined;
    }
    this.getUserData().subscribe(data => {
      if(data) {
        this.userData  = doc(this.afs, 'usuarios/' +    this.userUid);
        //get user rol from userData
        console.log("=====>DATA",     this.userData);
        console.log(this.userData[0]?.rol);
        if(this.userData[0]?.rol){
          this.currentUser = this.userData[0].rol;
          console.log("=====>currentUser");
          console.log(this.currentUser );
        }

      }
    },
    err => {
      this.toastr.error('Hubo un problema al obtener la información, intentelo más tarde...','Error')
    }
    );
  }



  logout(){
      this.variablesGL.removeCredential();
  }

  logoutAdmin(){
      this.variablesGL.removeCredentialAdmin();
  }

}
