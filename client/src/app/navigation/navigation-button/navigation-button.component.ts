import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
    selector: "navigation-button",
    standalone: true,
    imports: [CommonModule, MatButton, MatIcon, RouterLink, RouterLinkActive],
    templateUrl: "./navigation-button.component.html",
    styleUrl: "./navigation-button.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationButtonComponent {
    label = input.required();
    icon = input.required();
    link = input("");
}
