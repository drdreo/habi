import { CommonModule, DOCUMENT } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AuthService } from "@auth0/auth0-angular";
import { LoginComponent } from "../login/login.component";

@Component({
    selector: "app-landing",
    standalone: true,
    imports: [CommonModule, LoginComponent, RouterModule],
    templateUrl: "./landing.component.html",
    styleUrl: "./landing.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {
    protected readonly auth = inject(AuthService);
    protected readonly document = inject(DOCUMENT);
}
