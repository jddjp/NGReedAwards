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
    this.getUserData().subscribe(data => {
      //if local storage is not null
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        this.userUid = userData.uid;
        console.log(userData);
      } else {
        this.userUid = undefined;
        console.log('No user data found in localStorage');
      }
      // console.log(localStorage.d)
      // if(localStorage.d){
      //  this.userUid = JSON.parse(localStorage.d);
      //   console.log(this.userUid)
      // } else {
      //   this.userUid = undefined;
      // }

      if(data) {
        console.log(data)
        this.userData = data.filter(item => item.uid === this.userUid);
        //get user rol from userData
        console.log("=====>DATA");
        console.log(this.userData[0])

        if( console.log(this.userData[0])==undefined){
          console.log('Datos undefined')
        }
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

  //get current user data
  // getUserRole(){
  //   //get user id from local storage
  //   let uid = JSON.parse(localStorage.d).uid;
  //   //get user data from firestore
  //   const userRef = doc(this.afs, 'usuarios/' + uid);


  // }

  logout(){
      this.variablesGL.removeCredential();
  }

  // logoutAdmin(){
  //     this.variablesGL.removeCredentialAdmin();
  // }

}
