import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth, signInWithEmailAndPassword,   } from '@angular/fire/auth';
import { ToastrService } from 'ngx-toastr';
import { ErrorService } from 'src/app/services/error.service';
import { Router } from '@angular/router';
import { ProfileUser } from 'src/app/models/user';



@Component({
  selector: 'app-login-user',
  templateUrl: './login-user.component.html',
  styleUrls: ['./login-user.component.css']
})
export class LoginUserEventoComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder,
              private auth: Auth,
              private toastr: ToastrService,
              private _errorService: ErrorService,
              private router: Router) {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    })
  }

  ngOnInit(): void {
  }

  login() {
    const usuario = this.loginForm.get('usuario').value;
    const password = this.loginForm.get('password').value;
    this.loading = true;
    signInWithEmailAndPassword(this.auth, usuario, password)
      .then((userCredential) => {

        if (userCredential.user?.emailVerified) {
          this.toastr.success('Bienvenido', 'Login correcto');
          localStorage.x = JSON.stringify(userCredential.user);
          // this.setLocalStorage(userCredential.user);
          this.router.navigate(['/reedevento/home']);
        } else {
          this.toastr.error('El usuario no ha verificado su cuenta', 'Error');
          this.router.navigate(['/reedevento/verificarCorreo']);
        }
        this.loading = false;
      })
      .catch((error) => {
        this.loading = false;
        const errorCode = error.code;
        const errorMessage = error.message;
        this.toastr.error(this._errorService.error(error.code),'Oops, error');
        this.loginForm.reset();
      })
  }


  setLocalStorage(user: any) {
    const usuario: ProfileUser = {
      uid: user.uid,
      email: user.email
    }

    localStorage.setItem('user', JSON.stringify(usuario));
  }


}
