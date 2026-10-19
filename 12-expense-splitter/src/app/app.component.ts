import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ToastHostComponent } from './components/toast-host/toast-host.component';
import { GroupStoreService } from './services/group-store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ToastHostComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly store = inject(GroupStoreService);
  private readonly router = inject(Router);

  resetDemo(): void {
    this.store.reset();
    void this.router.navigate(['/groups']);
  }
}
