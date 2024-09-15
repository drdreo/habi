import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AuthService } from "@auth0/auth0-angular";

@Component({
    selector: "user-profile-button",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./user-profile-button.component.html",
    styleUrl: "./user-profile-button.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileButtonComponent {
    auth = inject(AuthService);
}
