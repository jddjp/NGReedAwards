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

get Usuario() {
  const data = localStorage.getItem('x');
  if (!data) return null;

  try {
    const parsed = JSON.parse(data);
    return parsed.uid; 
  } catch (e) {
    console.error("Error al parsear localStorage.x:", e);
    return null;
  }
}
}
