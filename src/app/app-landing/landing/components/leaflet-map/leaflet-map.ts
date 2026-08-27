import { AfterViewInit, Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import * as L from 'leaflet';
import { PublicBranchDto } from '../../../core/interfaces/landing.interface';

// Icono de marcador propio vía SVG inline: evita el problema clásico de los
// íconos por defecto de Leaflet rotos con bundlers (esbuild/webpack no
// resuelven automáticamente las rutas de imagen de leaflet/dist/images).
const MARKER_ICON = L.divIcon({
  className: 'landing-map-marker',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
    <path fill="#2563eb" stroke="#ffffff" stroke-width="1" d="M12 0C7 0 3 4 3 9c0 6.5 9 15 9 15s9-8.5 9-15c0-5-4-9-9-9z"/>
    <circle cx="12" cy="9" r="3.4" fill="#ffffff"/>
  </svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30],
});

@Component({
  selector: 'landing-leaflet-map',
  standalone: true,
  template: `<div #mapContainer class="w-full h-full rounded-xl overflow-hidden"></div>`,
})
export class LeafletMapComponent implements AfterViewInit, OnDestroy {
  branches = input<PublicBranchDto[]>([]);

  private mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private viewInitialized = false;

  constructor() {
    // input() es un signal: no dispara ngOnChanges, así que la reactividad a
    // cambios de `branches` se maneja con un effect en vez del lifecycle hook.
    effect(() => {
      this.branches();
      if (this.viewInitialized) this.render();
    });
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.render();
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  private located(): PublicBranchDto[] {
    return this.branches().filter(b => b.branchlat != null && b.branchlng != null);
  }

  private render(): void {
    const container = this.mapContainer()?.nativeElement;
    if (!container) return;

    const located = this.located();
    if (!located.length) {
      this.map?.remove();
      this.map = null;
      return;
    }

    if (!this.map) {
      this.map = L.map(container, { scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(this.map);
    }

    this.markers.forEach(marker => marker.remove());
    this.markers = located.map(branch => {
      const marker = L.marker([branch.branchlat as number, branch.branchlng as number], { icon: MARKER_ICON }).addTo(this.map as L.Map);
      marker.bindPopup(`<strong>${branch.branchname}</strong><br/>${branch.branchaddress}`);
      return marker;
    });

    if (located.length === 1) {
      this.map.setView([located[0].branchlat as number, located[0].branchlng as number], 15);
    } else {
      const bounds = L.latLngBounds(located.map(b => [b.branchlat as number, b.branchlng as number] as [number, number]));
      this.map.fitBounds(bounds, { padding: [24, 24] });
    }

    // El contenedor puede haberse renderizado con tamaño 0 si estaba oculto; forzar un
    // recalculo del tamaño evita un mapa cortado o mal centrado.
    setTimeout(() => this.map?.invalidateSize(), 0);
  }
}
