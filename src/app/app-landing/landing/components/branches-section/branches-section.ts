import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PublicBranchDto } from '../../../core/interfaces/landing.interface';
import { LeafletMapComponent } from '../leaflet-map/leaflet-map';

@Component({
  selector: 'landing-branches-section',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, LeafletMapComponent],
  templateUrl: './branches-section.html',
})
export class BranchesSectionComponent {
  branches = input<PublicBranchDto[]>([]);
  loading = input<boolean>(false);

  hasCoordinates = computed(() => this.branches().some(b => b.branchlat != null && b.branchlng != null));

  // No es una implementación frágil basada en un solo proveedor: si hay coordenadas se usan
  // (más preciso), y si no, ambos servicios también aceptan una dirección de texto como query.
  googleMapsUrl(branch: PublicBranchDto): string {
    if (branch.branchlat != null && branch.branchlng != null) {
      return `https://www.google.com/maps/dir/?api=1&destination=${branch.branchlat},${branch.branchlng}`;
    }
    const query = encodeURIComponent(`${branch.branchaddress}, ${branch.branchcity}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  }

  wazeUrl(branch: PublicBranchDto): string {
    if (branch.branchlat != null && branch.branchlng != null) {
      return `https://waze.com/ul?ll=${branch.branchlat},${branch.branchlng}&navigate=yes`;
    }
    const query = encodeURIComponent(`${branch.branchaddress}, ${branch.branchcity}`);
    return `https://waze.com/ul?q=${query}&navigate=yes`;
  }
}
