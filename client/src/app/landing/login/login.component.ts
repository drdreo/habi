import { CommonModule, DOCUMENT } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { Router } from "@angular/router";
import { AuthService } from "@auth0/auth0-angular";

@Component({
    selector: "app-login",
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
    templateUrl: "./login.component.html",
    styleUrl: "./login.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
    readonly auth = inject(AuthService);
    protected readonly document = inject(DOCUMENT);
    private readonly router = inject(Router);

    ngOnInit() {
        const params = window.location.search;
        if (params.includes("code=") && params.includes("state=")) {
            this.auth.handleRedirectCallback().subscribe({
                next: async ({ appState }) => {
                    const targetUrl = appState?.target || "/app/home";
                    await this.router.navigate([targetUrl]);
                },
                error: (error) => console.error(error)
            });
        }
    }

    login() {
        this.auth.loginWithRedirect({
            appState: { target: "/app/home" }
        });
    }
}
