import { Injectable, signal } from "@angular/core";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";

const SETTING_KEY_DARK_MODE = "dark-mode";
const DARK_MODE_CLASS_NAME = "dark-mode";

@Injectable({
    providedIn: "root"
})
export class SettingsService {
    darkModeEnabled = signal(localStorage.getItem(SETTING_KEY_DARK_MODE) == "true");

    constructor() {
        if (this.darkModeEnabled()) {
            document.body.classList.add(DARK_MODE_CLASS_NAME);
        } else {
            document.body.classList.remove(DARK_MODE_CLASS_NAME);
        }
    }

    toggleTheme($event: MatSlideToggleChange) {
        const darkMode = $event.checked;
        if (darkMode) {
            document.body.classList.add(DARK_MODE_CLASS_NAME);
            localStorage.setItem(SETTING_KEY_DARK_MODE, "true");
        } else {
            document.body.classList.remove(DARK_MODE_CLASS_NAME);
            localStorage.setItem(SETTING_KEY_DARK_MODE, "false");
        }
        this.darkModeEnabled.set(darkMode);
    }
}
