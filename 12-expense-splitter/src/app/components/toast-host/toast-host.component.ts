import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './toast-host.component.html',
  styleUrl: './toast-host.component.css',
})
export class ToastHostComponent {
  readonly toasts = inject(ToastService);
}
