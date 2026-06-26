import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UpperCase } from '../../../../core/directives/upper-case';
import { CITIES } from '../../../../core/const/cities';
import { UIDropdownComponent, DropdownOption } from '../../../../components/shared/ui/ui-dropdown-component/ui-dropdown-component';
import { STATUS_BRANCH_AVAILABLE } from '../../../../core/const/register-const';
import { UIInputComponent } from '../../../../components/shared/ui/ui-input-component/ui-input-component';
import { UIPhoneInputComponent } from '../../../../components/shared/ui/ui-phone-input-component/ui-phone-input-component';
import { CommerceService } from '../../../../core/services/modules/commerce.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const COMPONENTS = [UIDropdownComponent, UIInputComponent, UIPhoneInputComponent];
const DIRECTIVES = [UpperCase];

@Component({
  selector: 'app-step-two-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, ...COMPONENTS, ...DIRECTIVES],
  templateUrl: './step-two-form.html',
  styleUrl: './step-two-form.scss',
})
export class StepTwoForm implements OnInit {

  private commerceService = inject(CommerceService);
  private destroyRef = inject(DestroyRef);

  citiesOptions: DropdownOption[] = CITIES.map(city => ({ abv: city, name: city }));
  statusavailable = STATUS_BRANCH_AVAILABLE;

  branchForm = new FormGroup({
    branchname: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(4), Validators.maxLength(150)] }),
    branchcity: new FormControl<string>('', { validators: [Validators.required] }),
    branchaddress: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(4), Validators.maxLength(150)] }),
    branchphone: new FormControl<string>('', { validators: [Validators.required, Validators.minLength(10), Validators.maxLength(13)] }),
    branchstatus: new FormControl<typeof this.statusavailable[number]>(this.statusavailable[0], { validators: [Validators.required] }),
  });

  constructor() {
    effect(() => {
      if (this.commerceService.triggerValidation() > 0) {
        this.branchForm.markAllAsTouched();
      }
    });
  }

  ngOnInit() {
    const saved = this.commerceService.branchData();
    if (saved) this.branchForm.patchValue(saved);

    this.commerceService.stepTwoValid.set(this.branchForm.valid);

    this.branchForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.commerceService.branchData.set(this.branchForm.value as any);
      this.commerceService.stepTwoValid.set(this.branchForm.valid);
    });
  }

  useSame() {
    const number = this.commerceService.commerceData()?.commercephone;
    this.branchForm.patchValue({
      branchphone: number
    });
  }

}
