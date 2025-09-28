import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecicladorService {
  private apiUrl = 'http://localhost:5000/api/recicladores';

  constructor(private http: HttpClient) { }

  // Obtener todos los recicladores (público)
  getRecicladores(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Crear nuevo reciclador (registro)
  crearReciclador(datos: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, datos);
  }

  // Formulario unificado (registro O actualización)
  guardarPerfil(datos: any): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<any>(`${this.apiUrl}/perfil`, datos, { headers });
  }

  // Obtener perfil del usuario logueado
  getMiPerfil(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<any>(`${this.apiUrl}/mi-perfil`, { headers });
  }

  // Login tradicional (si lo necesitas)
  login(credenciales: any): Observable<any> {
    return this.http.post<any>('http://localhost:5000/api/auth/login', credenciales);
  }
}