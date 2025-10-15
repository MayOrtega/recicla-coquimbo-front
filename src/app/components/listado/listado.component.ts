import { Component, OnInit } from '@angular/core';
import { RecicladorService } from '../../services/reciclador.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.css']
})
export class ListadoComponent implements OnInit {
  recicladores: any[] = [];
  recicladoresFiltrados: any[] = [];
  terminoBusqueda: string = '';
  materialFiltro: string = '';
  cargando: boolean = true;
  error: string = '';

  materialesOptions = [
    { value: 'carton', label: 'Cartón' },
    { value: 'plastico', label: 'Plástico' },
    { value: 'vidrio', label: 'Vidrio' },
    { value: 'metal', label: 'Metal/Latas' },
    { value: 'electronico', label: 'Electrónicos' },
    { value: 'papel', label: 'Papel' },
    { value: 'otros', label: 'Otros' }
  ];

  // 🆕 DICCIONARIO DE VARIANTES PARA CADA MATERIAL
  variantesMateriales: any = {
    'carton': ['carton', 'cartón', 'cartones', 'caja', 'cajas'],
    'plastico': ['plastico', 'plástico', 'plasticos', 'plásticos', 'pet', 'botella', 'botellas'],
    'vidrio': ['vidrio', 'vidrios', 'botella', 'botellas', 'cristal'],
    'metal': ['metal', 'metales', 'aluminio', 'lata', 'latas', 'cobre'],
    'electronico': [
      'electronico', 'electrónico', 'electronicos', 'electrónicos', 'e-waste',
      'notebook', 'laptop', 'computador', 'computadora', 'pc', 'celular', 'smartphone',
      'tablet', 'televisor', 'tv', 'monitor', 'impresora', 'cable', 'cargador',
      'bateria', 'batería', 'pila', 'router', 'modem'
    ],
    'papel': ['papel', 'papeles', 'periódico', 'revista', 'diario']
  };

  constructor(private recicladorService: RecicladorService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarRecicladores();
  }

  cargarRecicladores() {
    this.cargando = true;
    this.error = '';

    this.recicladorService.getRecicladores().subscribe({
      next: (data) => {
        console.log('📦 Datos recibidos:', data);
        data.forEach((reciclador, index) => {
          console.log(`Reciclador ${index + 1}:`, reciclador.nombre, '- Materiales:', reciclador.materiales);
        });
        
        this.recicladores = data;
        this.recicladoresFiltrados = [...data];
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.error = 'Error al cargar los recicladores';
        this.cargando = false;
      }
    });
  }

  filtrarRecicladores() {
    if (!this.recicladores.length) return;

    this.recicladoresFiltrados = this.recicladores.filter(reciclador => {
      const nombreCompleto = `${reciclador.nombre} ${reciclador.apellido}`.toLowerCase();
      const coincideNombre = nombreCompleto.includes(this.terminoBusqueda.toLowerCase());
      
      const coincideMaterial = this.filtrarPorMaterial(reciclador.materiales);
      
      return coincideNombre && coincideMaterial;
    });
  }

  // 🆕 FUNCIÓN MEJORADA PARA FILTRAR POR MATERIAL
  filtrarPorMaterial(materialesReciclador: string[]): boolean {
    if (this.materialFiltro === '') return true;
    
    console.log('🔍 Filtro activo:', this.materialFiltro);
    console.log('📦 Materiales del reciclador:', materialesReciclador);
    
    if (this.materialFiltro === 'otros') {
      // "Otros" = materiales que NO están en ninguna variante conocida
      const tieneOtros = materialesReciclador?.some(material => 
        !this.esMaterialConocido(material.toLowerCase())
      );
      console.log('¿Tiene materiales "otros"?', tieneOtros);
      return tieneOtros;
    } else {
      // 🆕 FILTRO ESPECÍFICO: busca en todas las variantes del material
      const tieneMaterial = materialesReciclador?.some(material => 
        this.coincideConMaterial(material.toLowerCase(), this.materialFiltro)
      );
      console.log('¿Tiene el material buscado?', tieneMaterial);
      return tieneMaterial;
    }
  }

  // 🆕 FUNCIÓN PARA BUSCAR EN VARIANTES
  coincideConMaterial(materialReciclador: string, materialFiltro: string): boolean {
    const variantes = this.variantesMateriales[materialFiltro];
    if (variantes) {
      // Buscar si el material del reciclador coincide con alguna variante
      return variantes.some((variante: string) => 
        materialReciclador.includes(variante.toLowerCase())
      );
    }
    // Fallback: búsqueda directa
    return materialReciclador.includes(materialFiltro.toLowerCase());
  }

  // 🆕 FUNCIÓN PARA DETECTAR SI UN MATERIAL ES "CONOCIDO" (para filtro "otros")
  esMaterialConocido(material: string): boolean {
    // Revisar todas las variantes de todos los materiales
    for (const materialKey in this.variantesMateriales) {
      const variantes = this.variantesMateriales[materialKey];
      if (variantes.some((variante: string) => material.includes(variante.toLowerCase()))) {
        return true;
      }
    }
    return false;
  }

  limpiarNumeroTelefono(telefono: string): string {
    if (!telefono) {
      console.warn('❌ Número de teléfono vacío');
      return '';
    }
    
    let numeroLimpio = telefono.replace(/[^\d\+]/g, '');
    
    console.log('🔧 Número después de limpiar:', numeroLimpio);
    
    if (numeroLimpio.startsWith('+56')) {
      numeroLimpio = numeroLimpio.substring(1);
    }
    
    if (numeroLimpio.length === 9 && numeroLimpio.startsWith('9')) {
      numeroLimpio = '56' + numeroLimpio;
    }
    
    if (numeroLimpio.length === 8 && /^[2-9]/.test(numeroLimpio)) {
      numeroLimpio = '569' + numeroLimpio;
    }
    
    console.log('✅ Número final formateado:', numeroLimpio);
    return numeroLimpio;
  }

  contactarReciclador(reciclador: any, metodo: string = 'whatsapp') {
    switch (metodo) {
      case 'whatsapp':
        this.contactarPorWhatsApp(reciclador);
        break;
      case 'instagram':
        this.contactarPorInstagram(reciclador);
        break;
      case 'email':
        this.enviarEmail(reciclador);
        break;
    }
  }

  contactarPorWhatsApp(reciclador: any) {
    const telefonoLimpio = this.limpiarNumeroTelefono(reciclador.telefono);
    
    const regexChileno = /^569[2-9]\d{7}$/;
    
    if (!regexChileno.test(telefonoLimpio)) {
      alert(`❌ El número ${reciclador.telefono} no tiene formato válido para WhatsApp`);
      return;
    }
    
    const mensaje = `¡Hola ${reciclador.nombre}! 👋\n\nTe contacto desde la app Recicla Coquimbo. Me interesa tu servicio de reciclaje ♻️\n\n¿Podrías contarme más sobre los materiales que reciclas?`;
    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://wa.me/${telefonoLimpio}?text=${mensajeCodificado}`;
    
    window.open(urlWhatsApp, '_blank');
  }

  contactarPorInstagram(reciclador: any) {
    if (!reciclador.instagram) {
      alert('❌ Este reciclador no tiene Instagram registrado');
      return;
    }
    
    const instagramHandle = reciclador.instagram.replace('@', '').trim();
    const urlInstagram = `https://instagram.com/${instagramHandle}`;
    
    window.open(urlInstagram, '_blank');
  }

  enviarEmail(reciclador: any) {
    const asunto = encodeURIComponent('Contacto desde Recicla Coquimbo');
    const cuerpo = encodeURIComponent(`Hola ${reciclador.nombre},\n\nTe contacto desde la app Recicla Coquimbo porque me interesa tu servicio de reciclaje.\n\nSaludos!`);
    const urlEmail = `mailto:${reciclador.email}?subject=${asunto}&body=${cuerpo}`;
    
    window.location.href = urlEmail;
  }

  limpiarFiltros() {
    this.terminoBusqueda = '';
    this.materialFiltro = '';
    this.recicladoresFiltrados = [...this.recicladores];
  }

  get hayFiltrosActivos(): boolean {
    return !!this.terminoBusqueda || !!this.materialFiltro;
  }

   volverAlHome() {
    this.router.navigate(['/']);
  }
}