import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-invoice-sidebar',
  imports: [
    CommonModule,
  ],
  templateUrl: './invoice-sidebar.component.html',
  styles: ``
})
export class InvoiceSidebarComponent {

  users = [
    {
      name: 'Zain Geidt',
      id: '#348',
      image: './assets/images/user/user-19.jpg',
      active: true,
    },
    {
      name: 'Carla George',
      id: '#982',
      image: './assets/images/user/user-17.jpg',
    },
    {
      name: 'Abram Schleifer',
      id: '#289',
      image: './assets/images/user/user-20.jpg',
    },
    {
      name: 'Lincoln Donin',
      id: '#522',
      image: './assets/images/user/user-34.jpg',
    },
  ];

}
