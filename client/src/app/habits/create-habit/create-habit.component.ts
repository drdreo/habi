import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatChipsModule } from "@angular/material/chips";

@Component({
    selector: "create-habit",
    standalone: true,
    imports: [CommonModule, MatChipsModule],
    templateUrl: "./create-habit.component.html",
    styleUrl: "./create-habit.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateHabitComponent {
    readonly habitFrequencies: string[] = ["Daily", "Weekly", "Monthly"];
}
