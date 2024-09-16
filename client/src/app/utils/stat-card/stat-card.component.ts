import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";

@Component({
    selector: "stat-card",
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIcon],
    templateUrl: "./stat-card.component.html",
    styleUrl: "./stat-card.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCardComponent {
    value = input.required<string | number>();
    label = input.required<string>();
    icon = input<string>();
}
