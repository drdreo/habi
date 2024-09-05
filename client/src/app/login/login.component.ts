import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@auth0/auth0-angular";

@Component({
    selector: "app-login",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./login.component.html",
    styleUrl: "./login.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
    private readonly auth = inject(AuthService);
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
