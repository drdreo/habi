import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterModule } from "@angular/router";
import { AuthService } from "@auth0/auth0-angular";
import { LoginComponent } from "./login/login.component";

@Component({
    selector: "app-landing",
    standalone: true,
    imports: [CommonModule, LoginComponent, RouterModule, MatButtonModule, MatToolbarModule, MatIconModule],
    templateUrl: "./landing.component.html",
    styleUrl: "./landing.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {
    protected readonly auth = inject(AuthService);
}
