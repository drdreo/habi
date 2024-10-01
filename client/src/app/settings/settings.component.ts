import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatSlideToggleChange, MatSlideToggleModule } from "@angular/material/slide-toggle";
import { SettingsService } from "./settings.service";

@Component({
    selector: "app-settings",
    standalone: true,
    imports: [CommonModule, MatSlideToggleModule],
    templateUrl: "./settings.component.html",
    styleUrl: "./settings.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
    private settingsService = inject(SettingsService);

    darkModeEnabled = this.settingsService.darkModeEnabled;

    toggleTheme($event: MatSlideToggleChange) {
        this.settingsService.toggleTheme($event);
    }
}
