import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  perfilForm: FormGroup;
  esEdicion: boolean = false;

  constructor(private fb: FormBuilder) {
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
    this.esEdicion = !!token;
    
    if (this.esEdicion) {
      this.cargarDatosUsuario();
    } else {
      // En registro, la clave es requerida
      this.perfilForm.get('clave')?.setValidators([Validators.required, Validators.minLength(4)]);
      this.perfilForm.get('clave')?.updateValueAndValidity();
    }
  }

  cargarDatosUsuario() {
    // TODO: Cargar datos del usuario logueado
    console.log('Cargando datos del usuario...');
  }

  guardarPerfil() {
    if (this.perfilForm.valid) {
      console.log('Datos del formulario:', this.perfilForm.value);
      // TODO: Llamar al servicio para guardar
    } else {
      console.log('Formulario inválido');
      this.marcarCamposComoTouched();
    }
  }

  marcarCamposComoTouched() {
    Object.keys(this.perfilForm.controls).forEach(key => {
      this.perfilForm.get(key)?.markAsTouched();
    });
  }
}