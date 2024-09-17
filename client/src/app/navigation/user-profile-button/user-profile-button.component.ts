import { CommonModule, DOCUMENT } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatFabButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatMenu, MatMenuItem, MatMenuModule } from "@angular/material/menu";
import { AuthService } from "@auth0/auth0-angular";

@Component({
    selector: "user-profile-button",
    standalone: true,
    imports: [CommonModule, MatIcon, MatMenu, MatMenuItem, MatIconButton, MatMenuModule, MatFabButton],
    templateUrl: "./user-profile-button.component.html",
    styleUrl: "./user-profile-button.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileButtonComponent {
    auth = inject(AuthService);
    private readonly document = inject(DOCUMENT);

    logout() {
        this.auth.logout({ logoutParams: { returnTo: this.document.location.origin } });
    }
}
