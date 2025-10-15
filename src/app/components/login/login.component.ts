import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RecicladorService } from '../../services/reciclador.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  cargando: boolean = false;
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' = 'error';

  constructor(
    private fb: FormBuilder,
    private recicladorService: RecicladorService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.cargando = true;
      
      this.recicladorService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.cargando = false;
          localStorage.setItem('token', response.token);
          this.mostrarMensaje('¡Login exitoso! Redirigiendo...', 'success');
          
          setTimeout(() => {
            this.router.navigate(['/perfil']); // Redirigir a edición de perfil
          }, 1500);
        },
        error: (error) => {
          this.cargando = false;
          const mensajeError = error.error?.error || 'Error en el login';
          this.mostrarMensaje(mensajeError, 'error');
        }
      });
    } else {
      this.marcarCamposComoTouched();
      this.mostrarMensaje('Por favor completa todos los campos', 'error');
    }
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error') {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    
    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }

  marcarCamposComoTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}