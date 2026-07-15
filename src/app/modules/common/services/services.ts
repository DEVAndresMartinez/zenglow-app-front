import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Tabs, TabItem } from '../../../components/shared/ui/tabs/tabs';
import { UISearchComponent } from '../../../components/shared/ui/ui-search-component/ui-search-component';
import { UIConfirmModalComponent } from '../../../components/shared/ui/ui-confirm-modal/ui-confirm-modal';
import { ActionMenuItem, UIActionMenuComponent } from '../../../components/shared/ui/ui-action-menu/ui-action-menu';
import { CategoryForm } from '../../../components/forms/category-form/category-form';
import { ServiceCategoriesService } from '../../../core/services/modules/service-categories.service';
import { CategoryInterface } from '../../../core/interfaces/service-category.interface';
import { ErrorGlobalException } from '../../../core/exceptions/error.interface';

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  active: { label: 'Activa', classes: 'bg-accent/10 text-accent-hover border-accent-soft' },
  inactive: { label: 'Inactiva', classes: 'bg-stroke/40 text-muted border-stroke' },
  deleted: { label: 'Eliminada', classes: 'bg-error/10 text-error border-error/30' },
};

type ServicesTab = 'categories' | 'services';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, Tabs, UISearchComponent, UIConfirmModalComponent, UIActionMenuComponent, CategoryForm],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {

  private categoryService = inject(ServiceCategoriesService);

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

  tabs: TabItem[] = [
    { key: 'categories', label: 'Categorías', icon: ['fas', 'tags'] },
    { key: 'services', label: 'Servicios', icon: ['fas', 'briefcase'] },
  ];

  categoryActionItems(category: CategoryInterface): ActionMenuItem[] {
    return [
      { key: 'edit', label: 'Editar', icon: 'pen' },
      { key: 'status', label: category.categorystatus === 'active' ? 'Desactivar' : 'Activar', icon: category.categorystatus === 'active' ? 'toggle-off' : 'toggle-on' },
      { key: 'delete', label: 'Eliminar', icon: 'trash', variant: 'danger' },
    ];
  }

  constructor() {
    this.getCategories();
  }

  onTabChange(key: string) {
    this.activeTab.set(key as ServicesTab);
  }

  onGlobalFilter(value: string) {
    this.categoriesCopy.set(
      this.categories().filter(category => category.categoryname.toLocaleLowerCase().includes(value.toLocaleLowerCase()))
    );
  }

  statusConfig(status: string) {
    return STATUS_MAP[status] ?? STATUS_MAP['inactive'];
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

}
