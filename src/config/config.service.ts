import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  baseUrl: string;
  headers = new BehaviorSubject(null);

  constructor(
  ) {
    this.baseUrl = environment.apiService;
  }

  setLocal() {
    let headers = { 'Content-Type': 'application/json' };
    let token = this.Usuario;
    // if (token)
    //   headers['Authorization'] = `Bearer ${token}`;
    // this.headers.next(headers);
  }

  setLoginTime(): void {
    localStorage.setItem('loginTime', new Date().toISOString());
  }

  isLoginExpired(): boolean {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) {
      return true;
    }
    const now = new Date();
    const loginTimeObj = new Date(loginTime);
   // re Verifica si han pasado más de 6 horas (6 * 60 * 60 * 1000 milisegundos)
   // return now.getTime() - loginTimeObj.getTime() > 1 * 60 * 1000;
     return now.getTime() - loginTimeObj.getTime() > 6 * 60 * 60 * 1000;
  }

  get Usuario() {
    //console.log( localStorage.d)
    //return localStorage.d;
    return localStorage.d;
  }
}
