import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Tabs, TabItem } from '../../../components/shared/ui/tabs/tabs';
import { UISearchComponent } from '../../../components/shared/ui/ui-search-component/ui-search-component';
import { UIConfirmModalComponent } from '../../../components/shared/ui/ui-confirm-modal/ui-confirm-modal';
import { ActionMenuItem, UIActionMenuComponent } from '../../../components/shared/ui/ui-action-menu/ui-action-menu';
import { CategoryForm } from '../../../components/forms/category-form/category-form';
import { ServiceForm } from '../../../components/forms/service-form/service-form';
import { ServiceImagesForm } from '../../../components/forms/service-images-form/service-images-form';
import { ServiceImageCarousel } from '../../../components/shared/ui/service-image-carousel/service-image-carousel';
import { ServiceCategoriesService } from '../../../core/services/modules/service-categories.service';
import { ServiceService } from '../../../core/services/modules/service.service';
import { CategoryInterface } from '../../../core/interfaces/service-category.interface';
import { ServiceImagesInterface, ServiceInterface } from '../../../core/interfaces/service.interface';
import { ErrorGlobalException } from '../../../core/exceptions/error.interface';
import { DropdownOption, UIDropdownComponent } from '../../../components/shared/ui/ui-dropdown-component/ui-dropdown-component';

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  active: { label: 'Activa', classes: 'bg-accent/10 text-accent-hover border-accent-soft' },
  inactive: { label: 'Inactiva', classes: 'bg-stroke/40 text-muted border-stroke' },
  deleted: { label: 'Eliminada', classes: 'bg-error/10 text-error border-error/30' },
};

const SERVICE_STATUS_MAP: Record<string, { label: string; classes: string }> = {
  active: { label: 'Activo', classes: 'bg-accent/10 text-accent-hover border-accent-soft' },
  inactive: { label: 'Inactivo', classes: 'bg-stroke/40 text-muted border-stroke' },
  soon: { label: 'Próximamente', classes: 'bg-primary/10 text-primary border-on-brand-muted' },
  deleted: { label: 'Eliminado', classes: 'bg-error/10 text-error border-error/30' },
};

type ServicesTab = 'categories' | 'services';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, Tabs, UISearchComponent, UIConfirmModalComponent, UIActionMenuComponent, CategoryForm, ServiceForm, ServiceImagesForm, ServiceImageCarousel, UIDropdownComponent],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {

  private categoryService = inject(ServiceCategoriesService);
  private serviceService = inject(ServiceService);

  activeTab = signal<ServicesTab>('categories');

  categories = signal<CategoryInterface[]>([]);
  categoriesCopy = signal<CategoryInterface[]>([]);
  loading = signal(false);

  showCategoryForm = signal(false);
  editCategory = signal<CategoryInterface | null>(null);

  showDeleteCategoryForm = signal(false);
  deleteCategory = signal<CategoryInterface | null>(null);
  deletingCategory = signal(false);
  deleteCategoryError = signal('');

  togglingStatusUuid = signal<string | null>(null);

  services = signal<ServiceInterface[]>([]);
  servicesCopy = signal<ServiceInterface[]>([]);
  loadingServices = signal(false);
  servicesLoaded = signal(false);

  showServiceForm = signal(false);
  editService = signal<ServiceInterface | null>(null);

  showServiceImagesForm = signal(false);
  imagesService = signal<ServiceInterface | null>(null);

  showDeleteServiceForm = signal(false);
  deleteService = signal<ServiceInterface | null>(null);
  deletingService = signal(false);
  deleteServiceError = signal('');

  togglingServiceStatusUuid = signal<string | null>(null);

  tabs: TabItem[] = [
    { key: 'categories', label: 'Categorías', icon: ['fas', 'tags'] },
    { key: 'services', label: 'Servicios', icon: ['fas', 'briefcase'] },
  ];

  categoriesOptions = computed(() => this.categories().map(c => ({ name: c.categoryname, abv : c.categoryuuid })));

  categoryActionItems(category: CategoryInterface): ActionMenuItem[] {
    return [
      { key: 'edit', label: 'Editar', icon: 'pen' },
      { key: 'status', label: category.categorystatus === 'active' ? 'Desactivar' : 'Activar', icon: category.categorystatus === 'active' ? 'toggle-off' : 'toggle-on' },
      { key: 'delete', label: 'Eliminar', icon: 'trash', variant: 'danger' },
    ];
  }

  serviceActionItems(service: ServiceInterface): ActionMenuItem[] {
    return [
      { key: 'edit', label: 'Editar', icon: 'pen' },
      { key: 'images', label: 'Gestionar imágenes', icon: 'images' },
      { key: 'status', label: service.servicestatus === 'active' ? 'Desactivar' : 'Activar', icon: service.servicestatus === 'active' ? 'toggle-off' : 'toggle-on' },
      { key: 'delete', label: 'Eliminar', icon: 'trash', variant: 'danger' },
    ];
  }

  constructor() {
    this.getCategories();
  }

  onTabChange(key: string) {
    this.activeTab.set(key as ServicesTab);
    if (key === 'services' && !this.servicesLoaded()) {
      this.getServices();
    }
  }

  onGlobalFilter(value: string) {
    const query = value.toLocaleLowerCase();
    if (this.activeTab() === 'services') {
      this.servicesCopy.set(this.services().filter(service => service.servicename.toLocaleLowerCase().includes(query)));
    } else {
      this.categoriesCopy.set(this.categories().filter(category => category.categoryname.toLocaleLowerCase().includes(query)));
    }
  }

  statusConfig(status: string) {
    return STATUS_MAP[status] ?? STATUS_MAP['inactive'];
  }

  serviceStatusConfig(status: string) {
    return SERVICE_STATUS_MAP[status] ?? SERVICE_STATUS_MAP['inactive'];
  }

  getCategories() {
    this.loading.set(true);
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories.set(response);
        this.categoriesCopy.set(this.categories());
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });
  }

  openCreateCategory() {
    this.editCategory.set(null);
    this.showCategoryForm.set(true);
  }

  openEditCategory(category: CategoryInterface) {
    this.editCategory.set(category);
    this.showCategoryForm.set(true);
  }

  onCategorySaved(category: CategoryInterface) {
    if (this.editCategory() !== null) {
      this.categories.update(cs => cs.map(c => c.categoryuuid === category.categoryuuid ? category : c));
      this.categoriesCopy.update(cs => cs.map(c => c.categoryuuid === category.categoryuuid ? category : c));
    } else {
      this.categories.update(cs => [category, ...cs]);
      this.categoriesCopy.update(cs => [category, ...cs]);
    }
  }

  onCategoryFormClosed() {
    this.showCategoryForm.set(false);
    this.editCategory.set(null);
  }

  onCategoryAction(action: string, category: CategoryInterface) {
    switch (action) {
      case 'edit': this.openEditCategory(category); break;
      case 'status': this.toggleCategoryStatus(category); break;
      case 'delete': this.openDeleteCategory(category); break;
    }
  }

  toggleCategoryStatus(category: CategoryInterface) {
    this.togglingStatusUuid.set(category.categoryuuid);
    this.categoryService.changeStatus(category.categoryuuid).subscribe({
      next: () => {
        const nextStatus = category.categorystatus === 'active' ? 'inactive' : 'active';
        this.categories.update(cs => cs.map(c => c.categoryuuid === category.categoryuuid ? { ...c, categorystatus: nextStatus } : c));
        this.categoriesCopy.update(cs => cs.map(c => c.categoryuuid === category.categoryuuid ? { ...c, categorystatus: nextStatus } : c));
        this.togglingStatusUuid.set(null);
      },
      error: () => { this.togglingStatusUuid.set(null); },
    });
  }

  openDeleteCategory(category: CategoryInterface) {
    this.deleteCategory.set(category);
    this.deleteCategoryError.set('');
    this.showDeleteCategoryForm.set(true);
  }

  onDeleteCategoryCancelled() {
    this.showDeleteCategoryForm.set(false);
    this.deleteCategory.set(null);
  }

  onDeleteCategoryConfirmed() {
    const category = this.deleteCategory();
    if (!category) return;
    this.deletingCategory.set(true);
    this.deleteCategoryError.set('');
    this.categoryService.remove(category.categoryuuid).subscribe({
      next: () => {
        this.categories.update(cs => cs.filter(c => c.categoryuuid !== category.categoryuuid));
        this.categoriesCopy.update(cs => cs.filter(c => c.categoryuuid !== category.categoryuuid));
        this.deletingCategory.set(false);
        this.showDeleteCategoryForm.set(false);
        this.deleteCategory.set(null);
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.deleteCategoryError.set(body?.message || 'No se pudo eliminar la categoría. Inténtalo nuevamente.');
        this.deletingCategory.set(false);
      },
    });
  }

  getServices() {
    this.loadingServices.set(true);
    this.serviceService.getServices().subscribe({
      next: (response) => {
        this.services.set(response);
        this.servicesCopy.set(this.services());
        this.loadingServices.set(false);
        this.servicesLoaded.set(true);
      },
      error: () => { this.loadingServices.set(false); },
    });
  }

  openCreateService() {
    this.editService.set(null);
    this.showServiceForm.set(true);
  }

  openEditService(service: ServiceInterface) {
    this.editService.set(service);
    this.showServiceForm.set(true);
  }

  onServiceSaved(service: ServiceInterface) {
    if (this.editService() !== null) {
      this.services.update(ss => ss.map(s => s.serviceuuid === service.serviceuuid ? service : s));
      this.servicesCopy.update(ss => ss.map(s => s.serviceuuid === service.serviceuuid ? service : s));
    } else {
      this.services.update(ss => [service, ...ss]);
      this.servicesCopy.update(ss => [service, ...ss]);
    }
  }

  onServiceFormClosed() {
    this.showServiceForm.set(false);
    this.editService.set(null);
  }

  onServiceAction(action: string, service: ServiceInterface) {
    switch (action) {
      case 'edit': this.openEditService(service); break;
      case 'images': this.openServiceImages(service); break;
      case 'status': this.toggleServiceStatus(service); break;
      case 'delete': this.openDeleteService(service); break;
    }
  }

  openServiceImages(service: ServiceInterface) {
    this.imagesService.set(service);
    this.showServiceImagesForm.set(true);
  }

  onServiceImagesSaved(images: ServiceImagesInterface[]) {
    const serviceuuid = this.imagesService()?.serviceuuid;
    if (!serviceuuid) return;
    this.services.update(ss => ss.map(s => s.serviceuuid === serviceuuid ? { ...s, images } : s));
    this.servicesCopy.update(ss => ss.map(s => s.serviceuuid === serviceuuid ? { ...s, images } : s));
    this.imagesService.update(s => s ? { ...s, images } : s);
  }

  onServiceImagesFormClosed() {
    this.showServiceImagesForm.set(false);
    this.imagesService.set(null);
  }

  toggleServiceStatus(service: ServiceInterface) {
    this.togglingServiceStatusUuid.set(service.serviceuuid);
    this.serviceService.changeStatus(service.serviceuuid).subscribe({
      next: () => {
        const nextStatus = service.servicestatus === 'active' ? 'inactive' : 'active';
        this.services.update(ss => ss.map(s => s.serviceuuid === service.serviceuuid ? { ...s, servicestatus: nextStatus } : s));
        this.servicesCopy.update(ss => ss.map(s => s.serviceuuid === service.serviceuuid ? { ...s, servicestatus: nextStatus } : s));
        this.togglingServiceStatusUuid.set(null);
      },
      error: () => { this.togglingServiceStatusUuid.set(null); },
    });
  }

  openDeleteService(service: ServiceInterface) {
    this.deleteService.set(service);
    this.deleteServiceError.set('');
    this.showDeleteServiceForm.set(true);
  }

  onDeleteServiceCancelled() {
    this.showDeleteServiceForm.set(false);
    this.deleteService.set(null);
  }

  onDeleteServiceConfirmed() {
    const service = this.deleteService();
    if (!service) return;
    this.deletingService.set(true);
    this.deleteServiceError.set('');
    this.serviceService.remove(service.serviceuuid).subscribe({
      next: () => {
        this.services.update(ss => ss.filter(s => s.serviceuuid !== service.serviceuuid));
        this.servicesCopy.update(ss => ss.filter(s => s.serviceuuid !== service.serviceuuid));
        this.deletingService.set(false);
        this.showDeleteServiceForm.set(false);
        this.deleteService.set(null);
      },
      error: (httpErr: HttpErrorResponse) => {
        const body = httpErr.error as ErrorGlobalException;
        this.deleteServiceError.set(body?.message || 'No se pudo eliminar el servicio. Inténtalo nuevamente.');
        this.deletingService.set(false);
      },
    });
  }

  filterServicesByCategory(option: DropdownOption | DropdownOption[] | null) {
    const opt = Array.isArray(option) ? option[0] : option;
    if (!opt?.abv) {
      this.servicesCopy.set(this.services());
      return;
    }
    this.servicesCopy.set(this.services().filter(s => s.category?.categoryuuid === opt.abv));
  }

}
