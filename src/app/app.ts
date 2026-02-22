import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { WebSocketService } from './services/websocket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private auth = inject(AuthService);
  private ws = inject(WebSocketService);

  ngOnInit(): void {
    if (this.auth.isAuthenticated() && !this.ws.isConnected) {
      const token = this.auth.getAccessToken();
      if (token) this.ws.connect(token);
    }
  }
}
