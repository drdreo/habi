import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatIcon } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressBar } from "@angular/material/progress-bar";
import { MatTooltip } from "@angular/material/tooltip";

@Component({
    selector: "habit-card",
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatChipsModule,
        MatButton,
        MatIconButton,
        MatIcon,
        MatMenuModule,
        MatProgressBar,
        MatTooltip
    ],
    templateUrl: "./habit-card.component.html",
    styleUrl: "./habit-card.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitCardComponent {
    title = input.required();
}
