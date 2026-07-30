import { Component, OnInit } from '@angular/core';
import { LugaresService } from 'src/app/services/lugares.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lugares',
  templateUrl: './lugares.component.html',
  styleUrls: ['./lugares.component.css']
})
export class LugaresComponent implements OnInit {
  lugares: any[] = [];
  lugaresAgrupados: { [key: string]: any[] } = {};
  mesas: any[] = [];
  searchTerm = '';
  selectedGrupo: string | null = null;
  selectedMesaDetails: any = null;
  showAddMesaDialog = false;
  showAddLugarDialog = false;

  newMesa = {
    id: '',
    type: 'M',
    precio: '',
    x: null as number | null,
    y: null as number | null,
    orden: null as number | null,
  };

  newLugar = {
    idLugar: '',
    precio: '',
    type: 'U',
  };

  constructor(private lugaresService: LugaresService) { }

  ngOnInit(): void {
    this.loadMesas();
  }

  loadLugaresByMesa(mesaId: string): void {
    this.lugaresService.getLugaresPorMesa(mesaId).subscribe((data: any[]) => {
      this.lugares = data;
      console.log('Lugares cargados para la mesa', mesaId, this.lugares);
      this.groupLugares();
    });
  }

  loadMesas(): void {
    this.lugaresService.getMesas2026().subscribe((data: any[]) => {
      this.mesas = data;
      if (!this.selectedGrupo && data.length > 0) {
        this.selectedGrupo = data[0].id;
      }
      if (this.selectedGrupo && !this.mesas.some(m => m.id === this.selectedGrupo) && this.mesas.length > 0) {
        this.selectedGrupo = this.mesas[0].id;
      }
      this.setSelectedMesaDetails(this.selectedGrupo);
      if (this.selectedGrupo) {
        this.loadLugaresByMesa(this.selectedGrupo);
      }
    });
  }

  get filteredMesas(): any[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.mesas;
    }
    return this.mesas.filter((mesa) => mesa.id.toLowerCase().includes(term));
  }

  groupLugares(): void {
    this.lugaresAgrupados = this.lugares.reduce((groups, lugar) => {
      const groupKey = lugar.idMesa || this.getGroupKey(lugar);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(lugar);
      return groups;
    }, {} as { [key: string]: any[] });

    Object.values(this.lugaresAgrupados).forEach(group => {
      group.sort((a, b) => a.idLugar.localeCompare(b.idLugar, undefined, { numeric: true }));
    });

    const availableGroups = Object.keys(this.lugaresAgrupados);
    if (!this.selectedGrupo) {
      this.selectedGrupo = availableGroups.length > 0 ? availableGroups[0] : null;
    } else if (availableGroups.length > 0 && !availableGroups.includes(this.selectedGrupo)) {
      this.selectedGrupo = availableGroups[0];
    }
  }

  selectGrupo(grupo: string): void {
    this.selectedGrupo = grupo;
    this.setSelectedMesaDetails(grupo);
    this.loadLugaresByMesa(grupo);
  }

  setSelectedMesaDetails(mesaId: string | null): void {
    if (!mesaId) {
      this.selectedMesaDetails = null;
      return;
    }
    const mesa = this.mesas.find((m) => m.id === mesaId);
    this.selectedMesaDetails = mesa ? { ...mesa } : null;
  }

  async saveMesaDetails() {
    if (!this.selectedMesaDetails) {
      return;
    }

    const { id, type, precio, x, y, orden } = this.selectedMesaDetails;
    if (!id || !type || !precio || x == null || y == null || orden == null) {
      Swal.fire('Datos incompletos', 'Completa todos los campos de la mesa', 'warning');
      return;
    }

    await this.lugaresService.updateMesa2026(id, {
      type,
      precio,
      x: Number(x),
      y: Number(y),
      orden: Number(orden),
    });

    const index = this.mesas.findIndex((m) => m.id === id);
    if (index >= 0) {
      this.mesas[index] = { ...this.selectedMesaDetails };
    }

    Swal.fire('Mesa actualizada', `Los detalles de la mesa ${id} se han guardado.`, 'success');
  }

  getSelectedLugares(): any[] {
    return this.selectedGrupo ? this.lugaresAgrupados[this.selectedGrupo] || [] : [];
  }

  async addMesa() {
    const id = this.newMesa.id?.toString().trim().toUpperCase();
    const precio = this.newMesa.precio?.toString().trim();
    const x = Number(this.newMesa.x);
    const y = Number(this.newMesa.y);
    const orden = Number(this.newMesa.orden);

    if (!id || !precio || Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(orden) || !this.newMesa.type) {
      Swal.fire('Datos incompletos', 'Completa todos los campos de la mesa', 'warning');
      return;
    }

    await this.lugaresService.addMesa2026(id, this.newMesa.type, precio, x, y, orden);

    Swal.fire('Mesa creada', `La mesa ${id} se añadió en mesa2026`, 'success');
    this.showAddMesaDialog = false;
    this.loadMesas();

    this.newMesa = {
      id: '',
      type: 'M',
      precio: '',
      x: null,
      y: null,
      orden: null,
    };
  }

  async addLugar() {
    const idLugar = this.newLugar.idLugar?.toString().trim().toUpperCase();
    const precio = this.newLugar.precio?.toString().trim();
    const type = this.newLugar.type?.toString().trim().toUpperCase();

    if (!this.selectedGrupo || !idLugar || !precio || !type) {
      Swal.fire('Datos incompletos', 'Completa todos los campos del lugar', 'warning');
      return;
    }

    const fullIdLugar = `${this.selectedGrupo}${idLugar}`;
    await this.lugaresService.addLugar2026(fullIdLugar, false, false, '', precio, type, this.selectedGrupo);

    Swal.fire('Lugar creado', `El lugar ${fullIdLugar} se añadió a la mesa ${this.selectedGrupo}`, 'success');
    this.showAddLugarDialog = false;
    if (this.selectedGrupo) {
      this.loadLugaresByMesa(this.selectedGrupo);
    }

    this.newLugar = {
      idLugar: '',
      precio: '',
      type: 'U',
    };
  }

  getGroupKey(lugar: any): string {
    if (lugar.idMesa) {
      return lugar.idMesa.toString().toUpperCase();
    }

    const idLugar = lugar.idLugar || '';
    if (idLugar.length >= 2 && /\d/.test(idLugar[1])) {
      return idLugar.slice(0, 2).toUpperCase();
    }
    if (idLugar.length >= 1) {
      return idLugar.charAt(0).toUpperCase();
    }
    return 'Otros';
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.groupLugares();
  }

  async changeLugarStatus(lugar: any, status: 'cancel' | 'reserved' | 'sold') {
    let apartado = false;
    let comprado = false;
    let fecha = '';
    const fechaActual = new Date().toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    if (status === 'sold') {
      comprado = true;
      apartado = false;
      fecha = fechaActual;
    } else if (status === 'reserved') {
      apartado = true;
      comprado = false;
      fecha = fechaActual;
    }

    await this.lugaresService.updateLugar2026Status(lugar.idLugar, {
      apartado,
      comprado,
      fecha,
    });

    lugar.apartado = apartado;
    lugar.comprado = comprado;
    lugar.fecha = fecha;
    this.groupLugares();
  }

  async resetMesa(grupo: string) {
    const result = await Swal.fire({
      title: 'Reiniciar mesa ' + grupo + '?',
      text: 'Esta acción quitará apartados y ventas de todos los lugares de la mesa.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, reiniciar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) {
      return;
    }

    const lugares = this.lugaresAgrupados[grupo] || [];
    const promises = lugares.map(lugar =>
      this.lugaresService.updateLugar2026Status(lugar.idLugar, {
        apartado: false,
        comprado: false,
        fecha: '',
      })
    );

    await Promise.all(promises);
    lugares.forEach(lugar => {
      lugar.apartado = false;
      lugar.comprado = false;
      lugar.fecha = '';
    });
    this.groupLugares();
  }

  async editPrecio(lugar: any) {
    const { value: nuevoPrecio } = await Swal.fire({
      title: 'Modificar precio',
      input: 'text',
      inputLabel: `Precio actual: ${lugar.precio}`,
      inputValue: lugar.precio,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Ingresa un precio válido';
        }
        return null;
      },
    });

    if (nuevoPrecio === undefined) {
      return;
    }

    const precioFormateado = nuevoPrecio.toString().trim();

    await this.lugaresService.updateLugar2026Status(lugar.idLugar, {
      precio: precioFormateado,
    });
    lugar.precio = precioFormateado;
    this.groupLugares();
  }

  async addAllLugaresMesa() {
    if (!this.selectedGrupo) {
      return;
    }

    const mesa = this.mesas.find((m) => m.id === this.selectedGrupo);
    if (!mesa) {
      Swal.fire('Mesa no encontrada', 'No se pudo encontrar la mesa seleccionada.', 'error');
      return;
    }

    const seatNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const existingIds = new Set(
      (this.lugaresAgrupados[this.selectedGrupo] || []).map((l) => l.idLugar?.toString().toUpperCase())
    );

    const promises = seatNumbers
      .map((seat) => `${mesa.id}${seat}`)
      .filter((idLugar) => !existingIds.has(idLugar.toUpperCase()))
      .map((idLugar) =>
        this.lugaresService.addLugar2026(idLugar, false, false, '', mesa.precio, mesa.type, mesa.id)
      );

    if (!promises.length) {
      Swal.fire('Sin cambios', 'Todos los lugares de esta mesa ya existen.', 'info');
      return;
    }

    await Promise.all(promises);
    Swal.fire('Lugares creados', `Todos los lugares de la mesa ${mesa.id} fueron añadidos.`, 'success');
    this.loadLugaresByMesa(this.selectedGrupo);
  }

  getGroupKeys(): string[] {
    return Object.keys(this.lugaresAgrupados).sort();
  }

  getStatus(value: boolean): string {
    return value ? 'Sí' : 'No';
  }
}
