import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecicladorService } from 'src/app/services/reciclador.service';

@Component({
  selector: 'app-vista-previa',
  templateUrl: './vista-previa.component.html',
  styleUrls: ['./vista-previa.component.css']
})
export class VistaPreviaComponent implements OnInit {
  reciclador: any = null;
  esEdicion: boolean = false;
  perfilForm: FormGroup;
  cargando: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private recicladorService: RecicladorService 
  ) {
    // Inicializar el formulario completo con todos los campos
    this.perfilForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      clave: [''],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', Validators.required],
      instagram: [''],
      materiales: ['', Validators.required],
      retiroDomicilio: [false, Validators.required]
    });
  }

  ngOnInit() {
    this.cargando = true;
    
    // Obtener datos del reciclador desde el servicio
    this.reciclador = this.recicladorService.getRecicladorTemporal();
    
    console.log('Datos recibidos en vista previa:', this.reciclador); // Para debug
    
    if (!this.reciclador) {
      console.warn('No se recibieron datos del reciclador. Redirigiendo al home.');
      this.router.navigate(['/']);
      return;
    }
    
    // Determinar si es edición basado en los datos recibidos
    this.esEdicion = this.reciclador.esEdicion || false;
    
    // Rellenar el formulario con todos los datos del reciclador
    this.perfilForm.patchValue({
      email: this.reciclador.email || '',
      clave: '********', // Placeholder para la clave
      nombre: this.reciclador.nombre || '',
      apellido: this.reciclador.apellido || '',
      telefono: this.reciclador.telefono || '',
      instagram: this.reciclador.instagram || '',
      materiales: this.reciclador.materiales || '',
      retiroDomicilio: this.reciclador.retiroDomicilio || false
    });

    // Deshabilitar todos los campos para solo lectura en vista previa
    this.perfilForm.disable();
    
    this.cargando = false;
  }

  volverAHome() {
    // Limpiar datos temporales al salir
    this.recicladorService.clearRecicladorTemporal();
    this.router.navigate(['/']);
  }

  editarDeNuevo() {
    // Navegar de vuelta al formulario - los datos ya están en el servicio
    this.router.navigate(['/perfil']);
  }

  confirmarPerfil() {
    this.cargando = true;
    
    // Preparar datos para enviar a la API (sin el campo esEdicion)
    const datosParaGuardar = { ...this.reciclador };
    delete datosParaGuardar.esEdicion; // Remover campo interno
    
    console.log('Enviando datos a la API:', datosParaGuardar);
    
    // Usar el servicio para guardar en la API
    this.recicladorService.guardarPerfil(datosParaGuardar).subscribe({
      next: (response) => {
        this.cargando = false;
        console.log('Perfil guardado exitosamente:', response);
        
        // Mostrar mensaje de éxito
        alert('¡Perfil confirmado exitosamente!');
        
        // Limpiar datos temporales
        this.recicladorService.clearRecicladorTemporal();
        
        // Redirigir al home
        this.router.navigate(['/'], {
          queryParams: { registroExitoso: 'true' }
        });
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al guardar el perfil:', error);
        
        // Mostrar mensaje de error
        alert('Error al guardar el perfil. Por favor, intenta nuevamente.');
        
        // Opcional: Redirigir a edición en caso de error
        // this.router.navigate(['/perfil']);
      }
    });
  }

  // Método para formatear el valor de retiroDomicilio
  getRetiroDomicilioTexto(): string {
    const retiro = this.perfilForm.get('retiroDomicilio')?.value;
    return retiro ? 'Sí, hago retiro a domicilio' : 'No, recibo en mi ubicación';
  }

  // Método para obtener el ícono de retiroDomicilio
  getRetiroDomicilioIcono(): string {
    const retiro = this.perfilForm.get('retiroDomicilio')?.value;
    return retiro ? 'bi-truck' : 'bi-house';
  }

  // Método para obtener la clase de color de retiroDomicilio
  getRetiroDomicilioClase(): string {
    const retiro = this.perfilForm.get('retiroDomicilio')?.value;
    return retiro ? 'text-success' : 'text-secondary';
  }

  // Método auxiliar para mostrar/ocultar secciones si no hay datos
  tieneDatos(): boolean {
    return this.reciclador && !this.cargando;
  }

  // Lifecycle hook para limpiar datos si el componente se destruye
  ngOnDestroy() {
    // Opcional: Limpiar datos si quieres que se remueva al salir
    // this.recicladorService.clearRecicladorTemporal();
  }
}