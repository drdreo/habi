import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavigationComponent } from "./navigation/navigation.component";

@Component({
    selector: "app-app-wrapper",
    standalone: true,
    imports: [CommonModule, NavigationComponent, RouterOutlet],
    template: `
        <app-navigation>
            <router-outlet></router-outlet>
        </app-navigation>
    `
})
export class AppWrapperComponent {}
