import { Component } from '@angular/core';
import { CardNav } from '../../../../components/shared/ui/card-nav/card-nav';
import { IconProp } from '@fortawesome/fontawesome-svg-core';


@Component({
  selector: 'app-options',
  standalone: true,
  imports: [CardNav],
  templateUrl: './options.html',
  styleUrl: './options.scss',
})
export class Options {

  options: { icon: IconProp; title: string; description: string; link: string; color: string }[] = [
    {
      icon: ['fas', 'house'],
      title: 'Inicio',
      description: 'Visión general de tu cuenta y actividad reciente.',
      link: '/modules/common/home',
      color: 'text-blue-700'
    },
    {
      icon: ['fas', 'building'],
      title: 'Negocio',
      description: 'Gestiona tu negocio: sucursales, usuarios, roles, permisos',
      link: '/modules/common/business',
      color: 'text-yellow-700'
    },
    {
      icon: ['fas', 'briefcase'],
      title: 'Servicios',
      description: 'Gestiona tus servicios.',
      link: '/services',
      color: 'text-green-700'
    },
    {
      icon: ['fas', 'users'],
      title: 'Clientes',
      description: 'Administra los clientes de tu negocio.',
      link: '/users',
      color: 'text-purple-700'
    },
    {
      icon: ['fas', 'plug'],
      title: 'Integraciones',
      description: 'Conecta tus herramientas favoritas.',
      link: '/integrations',
      color: 'text-pink-700'
    },
    {
      icon: ['fas', 'credit-card'],
      title: 'Medios de pago',
      description: 'Gestiona y configura tus métodos de pago.',
      link: '/payment-methods',
      color: 'text-yellow-700'
    },
    {
      icon: ['fas', 'cogs'],
      title: 'Ajustes',
      description: 'Configura tu experiencia.',
      link: '/settings',
      color: 'text-gray-700'
    }
  ];

  constructor() { }
}
