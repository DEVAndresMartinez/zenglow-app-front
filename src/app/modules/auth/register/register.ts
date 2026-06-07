import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { StepOneForm } from './step-one-form/step-one-form';

const COMPONENTS = [StepOneForm];

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ...COMPONENTS],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

  step = signal<number>(0);

  constructor() { }

  ngOnInit() {
    this.step.set(1);
  }

  nextStep() {
    this.step.update((s) => s + 1);
  }

  prevStep() {
    this.step.update((s) => s - 1);
  }



}
