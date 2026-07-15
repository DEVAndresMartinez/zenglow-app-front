import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpErrorResponse } from '@angular/common/http';
import { UIInputComponent } from '../../shared/ui/ui-input-component/ui-input-component';
import { ServiceCategoriesService } from '../../../core/services/modules/service-categories.service';
import { CategoryInterface, CreateCategoryInterface } from '../../../core/interfaces/service-category.interface';
import { ErrorGlobalException } from '../../../core/exceptions/error.interface';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, UIInputComponent],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss',
})
export class CategoryForm {

  isEdit = input(false);
  categoryuuid = input<string>('');
  category = input<CategoryInterface | null>(null);

  saved = output<CategoryInterface>();
  closed = output();

  responseCategory = signal<CategoryInterface | null>(null);
  error = signal<string>('');
  sent = signal<boolean>(false);
  loading = signal<boolean>(false);

  categoryForm: FormGroup = new FormGroup({
    categoryname: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(3), Validators.maxLength(50)] }),
  });

  private categoryService = inject(ServiceCategoriesService);

  ngOnInit(): void {
    this.sent.set(false);
    this.loading.set(false);
    if (this.isEdit() && this.category() !== null) {
      this.categoryForm.patchValue({
        categoryname: this.category()?.categoryname,
      });
    } else {
      this.categoryForm.reset();
    }
  }

  get nameError(): string {
    if (!this.sent()) return '';
    const ctrl = this.categoryForm.get('categoryname');
    if (ctrl?.errors?.['required']) return 'El nombre es requerido';
    if (ctrl?.errors?.['minlength']) return 'Mínimo 3 caracteres';
    if (ctrl?.errors?.['maxlength']) return 'Máximo 100 caracteres';
    return '';
  }

  close() {
    this.closed.emit();
  }

  submit() {
    this.sent.set(true);
    this.loading.set(true);
    if (this.categoryForm.valid) {
      if (!this.isEdit() && this.categoryuuid() === '') {
        this.categoryService.create(this.categoryForm.value as CreateCategoryInterface).subscribe({
          next: (response: CategoryInterface) => {
            this.responseCategory.set(response);
            this.loading.set(false);
            this.saved.emit(response);
          },
          error: (httpErr: HttpErrorResponse) => {
            const body = httpErr.error as ErrorGlobalException;
            this.handleError(body?.error, body?.message);
            this.loading.set(false);
          }
        });
      } else if (this.isEdit() && this.categoryuuid() !== '') {
        this.categoryService.update(this.categoryuuid(), this.categoryForm.value as CreateCategoryInterface).subscribe({
          next: (response: CategoryInterface) => {
            this.responseCategory.set(response);
            this.loading.set(false);
            this.saved.emit(response);
          },
          error: (httpErr: HttpErrorResponse) => {
            const body = httpErr.error as ErrorGlobalException;
            this.handleError(body?.error, body?.message);
            this.loading.set(false);
          }
        });
      }
    } else {
      this.loading.set(false);
    }
  }

  handleError(error: string, message?: string) {
    switch (error) {
      case 'AE_NAME_CONFLICT':
        this.error.set('El nombre de la categoría ya está en uso.');
        break;
      default:
        this.error.set(message || 'Ocurrió un error inesperado. Inténtalo nuevamente.');
    }
  }

}
