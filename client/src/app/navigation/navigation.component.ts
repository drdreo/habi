import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { AsyncPipe, DOCUMENT } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "@auth0/auth0-angular";
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import { CreateHabitComponent } from "../habits/create-habit/create-habit.component";
import { NavigationButtonComponent } from "./navigation-button/navigation-button.component";

@Component({
    selector: "app-navigation",
    templateUrl: "./navigation.component.html",
    styleUrl: "./navigation.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        AsyncPipe,
        RouterLink,
        RouterLinkActive,
        NavigationButtonComponent,
        MatTooltipModule
    ]
})
export class NavigationComponent {
    protected readonly auth = inject(AuthService);
    protected readonly document = inject(DOCUMENT);
    private breakpointObserver = inject(BreakpointObserver);
    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
        map((result) => result.matches),
        shareReplay()
    );
    private readonly dialog = inject(MatDialog);

    constructor() {
        console.log("NavigationComponent created");
    }

    openCreateHabitDialog() {
        this.dialog.open(CreateHabitComponent, {
            height: "800px",
            width: "600px"
        });
    }

    logout() {
        this.auth.logout({ logoutParams: { returnTo: this.document.location.origin } });
    }
}
