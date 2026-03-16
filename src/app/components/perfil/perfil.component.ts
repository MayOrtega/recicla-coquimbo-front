import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RecicladorService } from '../../services/reciclador.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  perfilForm: FormGroup;
  esEdicion: boolean = false;
  cargando: boolean = false;
  datosCargados: boolean = false;
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private recicladorService: RecicladorService,
    private router: Router
  ) {
    this.perfilForm = this.createForm();
  }

  ngOnInit() {
    this.checkUsuarioLogueado();
  }

  createForm(): FormGroup {
    return this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', Validators.required],
      instagram: [''],
      materiales: ['', Validators.required],
      retiroDomicilio: [false],
      email: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.minLength(4)]]
    });
  }

  checkUsuarioLogueado() {
    const token = localStorage.getItem('token');
    console.log('🔐 Token encontrado:', !!token);
    
    if (token) {
      this.esEdicion = true;
      console.log('👤 MODO EDICIÓN - Cargando datos...');
      this.configurarFormEdicion();
      this.cargarDatosUsuario();
    } else {
      this.esEdicion = false;
      console.log('👤 MODO REGISTRO - Formulario listo');
      this.configurarFormRegistro();
      this.datosCargados = true; // En registro, mostrar formulario inmediatamente
    }
  }

  configurarFormEdicion() {
    this.perfilForm.get('clave')?.clearValidators();
    this.perfilForm.get('clave')?.setValidators([Validators.minLength(4)]);
    this.perfilForm.get('clave')?.updateValueAndValidity();
    // this.perfilForm.get('email')?.disable(); // Temporalmente comentado para pruebas
  }

  configurarFormRegistro() {
    this.perfilForm.get('clave')?.setValidators([Validators.required, Validators.minLength(4)]);
    this.perfilForm.get('clave')?.updateValueAndValidity();
    this.perfilForm.get('email')?.enable();
  }

  cargarDatosUsuario() {
    this.cargando = true;
    this.datosCargados = false;
    console.log('🔄 Solicitando datos del usuario...');
    
    this.recicladorService.getMiPerfil().subscribe({
      next: (reciclador) => {
        console.log('✅ Datos recibidos del backend:', reciclador);
        
        // Precargar el formulario con los datos
        this.perfilForm.patchValue({
          nombre: reciclador.nombre || '',
          apellido: reciclador.apellido || '',
          telefono: reciclador.telefono || '',
          instagram: reciclador.instagram || '',
          materiales: this.formatearMateriales(reciclador.materiales),
          retiroDomicilio: reciclador.retiroDomicilio || false,
          email: reciclador.email || ''
        });
        
        console.log('✅ Formulario actualizado:', this.perfilForm.value);
        this.cargando = false;
        this.datosCargados = true;
      },
      error: (error) => {
        console.error('❌ Error cargando perfil:', error);
        this.mostrarMensaje('Error al cargar el perfil. Intenta recargar la página.', 'error');
        this.cargando = false;
        this.datosCargados = true; // Mostrar formulario aunque falle
      }
    });
  }

  formatearMateriales(materiales: any): string {
    if (Array.isArray(materiales)) {
      return materiales.join(', ');
    } else if (typeof materiales === 'string') {
      return materiales;
    } else {
      return '';
    }
  }

// guardarPerfil() {
//   if (this.perfilForm.valid) {
//     this.cargando = true;
    
//     const formData = { ...this.perfilForm.value };
    
//     // Convertir materiales de string a array
//     if (typeof formData.materiales === 'string') {
//       formData.materiales = formData.materiales
//         .split(',')
//         .map((material: string) => material.trim())
//         .filter((material: string) => material.length > 0);
//     }
    
//     // Si está en modo edición y no se envió clave, eliminar el campo
//     if (this.esEdicion && !formData.clave) {
//       delete formData.clave;
//     }

//     console.log('📤 Enviando datos:', formData);

//     this.recicladorService.guardarPerfil(formData).subscribe({
//       next: (response) => {
//         this.cargando = false;
//         console.log('✅ Respuesta del servidor:', response);
        
//         if (this.esEdicion) {
//           this.mostrarMensaje('✅ ¡Perfil actualizado exitosamente! Mostrando vista previa...', 'success');
          
//           // Redirigir a vista previa después de 2 segundos
//           setTimeout(() => {
//             this.router.navigate(['/vista-previa'], { 
//               state: { reciclador: response.reciclador } 
//             });
//           }, 2000);
//         } else {
//           localStorage.setItem('token', response.token);
//           this.mostrarMensaje('🎉 ¡Registro exitoso! Mostrando vista previa...', 'success');
          
//           setTimeout(() => {
//             this.router.navigate(['/vista-previa'], { 
//               state: { reciclador: response.reciclador } 
//             });
//           }, 2000);
//         }
//       },
//       error: (error) => {
//         this.cargando = false;
//         console.error('❌ Error guardando perfil:', error);
        
//         const mensajeError = error.error?.error || 'Error al guardar el perfil';
//         this.mostrarMensaje(mensajeError, 'error');
//       }
//     });
//   } else {
//     this.marcarCamposComoTouched();
//     this.mostrarMensaje('Por favor completa todos los campos requeridos', 'error');
//   }
// }
guardarPerfil() {
  if (this.perfilForm.valid) {
    this.cargando = true;
    
    // Obtener los datos del formulario
    const datosReciclador = {
      ...this.perfilForm.value,
      esEdicion: this.esEdicion
    };
    
    // GUARDAR EN EL SERVICIO antes de navegar
    this.recicladorService.setRecicladorTemporal(datosReciclador);
    
    // Redirigir a vista previa inmediatamente
    this.router.navigate(['/vista-previa']);
    
    this.cargando = false;
  } else {
    this.marcarCamposComoTouched();
  }
}

private marcarCamposComoTouched() {
  Object.keys(this.perfilForm.controls).forEach(key => {
    const control = this.perfilForm.get(key);
    control?.markAsTouched();
  });
}


  eliminarCuenta() {
    if (!this.esEdicion) return; // Por seguridad

    const confirmar = window.confirm(
      '¿Estás seguro de que quieres eliminar tu cuenta?\nEsta acción es irreversible y tu perfil ya no aparecerá en el listado.'
    );
    
    if (!confirmar) return;

    this.cargando = true;
    
    // Extraer el ID desde el token
    const usuario = this.recicladorService.getUsuarioFromToken();
    const idUsuario = usuario?.id;

    if (!idUsuario) {
      this.cargando = false;
      this.mostrarMensaje('Error de sesión. Intenta iniciar sesión nuevamente.', 'error');
      return;
    }

    this.recicladorService.eliminarCuenta(idUsuario).subscribe({
      next: (response) => {
        this.cargando = false;
        alert('Tu cuenta ha sido eliminada exitosamente. ¡Gracias por tu colaboración!');
        this.recicladorService.logout();
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error eliminando cuenta:', error);
        this.mostrarMensaje('Hubo un error al eliminar tu cuenta.', 'error');
      }
    });
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error') {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    
    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }

}