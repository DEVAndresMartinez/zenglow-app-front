import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { StepOneForm } from './step-one-form/step-one-form';
import { StepTwoForm } from './step-two-form/step-two-form';
import { StepThreeForm } from './step-three-form/step-three-form';
import { CommerceService } from '../../../core/services/modules/commerce.service';
import { CreateCommerceInterface } from '../../../core/interfaces/commerce.interface';

const COMPONENTS = [StepOneForm, StepTwoForm, StepThreeForm];

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule, ...COMPONENTS],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

  step = signal<number>(0);
  loading = signal<boolean>(false);
  private commerceService = inject(CommerceService);
  private router = inject(Router);

  constructor() { }

  ngOnInit() {
    this.step.set(1);
  }

  nextStep() {
    const validByStep: Record<number, boolean> = {
      1: this.commerceService.stepOneValid(),
      2: this.commerceService.stepTwoValid(),
      3: this.commerceService.stepThreeValid(),
    };

    if (!validByStep[this.step()]) {
      this.commerceService.triggerValidation.update(n => n + 1);
      return;
    }

    if (this.step() === 3) {
      this.createCommerce();
      return;
    }

    this.step.update(s => s + 1);
  }

  createCommerce() {
    const commerce = this.commerceService.commerceData();
    const branch = this.commerceService.branchData();
    const user = this.commerceService.userData();

    if (!commerce || !branch || !user) return;

    const req: CreateCommerceInterface = {
      commercetype: commerce.commercetype,
      commercename: commerce.commercename,
      commerceslug: commerce.commerceslug,
      commerceemail: commerce.commerceemail,
      commercephone: commerce.commercephone,
      commercedocumenttype: commerce.commercedocumenttype,
      commercedocumentnumber: commerce.commercedocumentnumber,
      commercedigitverification: commerce.commercedigitverification,
      commercestatus: commerce.commercestatus,
      branch: {
        branchname: branch.branchname,
        branchcity: branch.branchcity,
        branchaddress: branch.branchaddress,
        branchphone: branch.branchphone,
        branchstatus: branch.branchstatus,
      },
      user: {
        userfirstname: user.userfirstname,
        userlastname: user.userlastname,
        userphone: user.userphone,
        username: user.username,
        useremail: user.useremail,
        userstatus: user.userstatus,
      },
    };

    this.loading.set(true);

    this.commerceService.createCommerce(req).subscribe({
      next: () => {
        this.loading.set(false);
        alert('¡Registro correcto! Por favor revise su correo electrónico (incluyendo la carpeta de spam).');
        this.router.navigate(['/modules/auth/login']);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Error al crear comercio:', err);
      }
    });
  }

  prevStep() {
    this.step.update((s) => s - 1);
  }

}
