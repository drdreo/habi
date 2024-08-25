import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AuthService } from "@auth0/auth0-angular";
import { LoginComponent } from "../login/login.component";

@Component({
    selector: "app-landing",
    standalone: true,
    imports: [CommonModule, LoginComponent],
    templateUrl: "./landing.component.html",
    styleUrl: "./landing.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {
    auth = inject(AuthService);
}
