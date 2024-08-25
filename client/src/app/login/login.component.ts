import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AuthService } from "@auth0/auth0-angular";

@Component({
    selector: "app-login",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./login.component.html",
    styleUrl: "./login.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
    private readonly auth = inject(AuthService);

    login() {
        this.auth.loginWithRedirect();
    }
}
