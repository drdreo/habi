import { Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NavigationComponent } from "./navigation/navigation.component";
import { LogSWUpdateService } from "./sw-update.service";

@Component({
    standalone: true,
    imports: [RouterModule, NavigationComponent],
    selector: "app-root",
    templateUrl: "./app.component.html"
})
export class AppComponent {
    private swUpdateService = inject(LogSWUpdateService);
}
