import { Injectable, signal } from "@angular/core";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";

@Injectable({
    providedIn: "root"
})
export class SettingsService {
    darkModeEnabled = signal(localStorage.getItem("darkMode") === "true");

    constructor() {
        if (this.darkModeEnabled()) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }

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
