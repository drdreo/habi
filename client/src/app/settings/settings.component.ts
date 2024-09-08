import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { MatSlideToggleChange, MatSlideToggleModule } from "@angular/material/slide-toggle";

@Component({
    selector: "app-settings",
    standalone: true,
    imports: [CommonModule, MatSlideToggleModule],
    templateUrl: "./settings.component.html",
    styleUrl: "./settings.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
    darkModeEnabled = signal(localStorage.getItem("darkMode") === "true");

    toggleTheme($event: MatSlideToggleChange) {
        const darkMode = $event.checked;
        if (darkMode) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("darkMode", "true");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("darkMode", "false");
        }
    }
}
