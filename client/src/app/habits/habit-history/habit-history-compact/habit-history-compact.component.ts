import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input, Signal } from "@angular/core";
import { MatTooltip } from "@angular/material/tooltip";
import { Habit } from "../../habit.model";
import { convertHabitToCompletion, HistoryCompletion } from "../../habit.utils";

@Component({
    selector: "habit-history-compact",
    standalone: true,
    imports: [CommonModule, MatTooltip],
    templateUrl: "./habit-history-compact.component.html",
    styleUrl: "./habit-history-compact.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitHistoryCompactComponent {
    completions: Signal<HistoryCompletion[]>;
    habit = input.required<Habit>();

    constructor() {
        // this.completions = signal(Array.from({ length: 5 }, getCompletionMock));

        this.completions = computed(() => convertHabitToCompletion(this.habit()));
    }
}
