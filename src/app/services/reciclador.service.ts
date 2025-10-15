import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecicladorService {
  private recicladorData: any;

  // URL del backend en Fly.io
  private apiUrl = 'https://reciclacoquimbo-back-purple-leaf-2895.fly.dev'  
; 

  constructor(private http: HttpClient) { }

  // =============================================
  // MÉTODOS PARA DATOS TEMPORALES (VISTA PREVIA)
  // =============================================

  setRecicladorTemporal(datos: any): void {
    this.recicladorData = datos;
    sessionStorage.setItem('recicladorTemporal', JSON.stringify(datos));
  }

  getRecicladorTemporal(): any {
    if (this.recicladorData) return this.recicladorData;
    const datosSession = sessionStorage.getItem('recicladorTemporal');
    if (datosSession) {
      this.recicladorData = JSON.parse(datosSession);
      return this.recicladorData;
    }
    return null;
  }

  clearRecicladorTemporal(): void {
    this.recicladorData = null;
    sessionStorage.removeItem('recicladorTemporal');
    localStorage.removeItem('recicladorTemporal');
  }

  hasRecicladorTemporal(): boolean {
    return !!this.getRecicladorTemporal();
  }

  // =============================================
  // MÉTODOS PARA LA API
  // =============================================

  getRecicladores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recicladores`);
  }

  crearReciclador(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recicladores`, datos);
  }

  guardarPerfil(datos: any): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.post<any>(`${this.apiUrl}/recicladores/perfil`, datos, { headers });
  }

  getMiPerfil(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/recicladores/mi-perfil`, { headers });
  }

  login(credenciales: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credenciales);
  }

  // =============================================
  // MÉTODOS AUXILIARES
  // =============================================

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    this.clearRecicladorTemporal();
  }

  getUsuarioFromToken(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        email: payload.email,
      };
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }
}
