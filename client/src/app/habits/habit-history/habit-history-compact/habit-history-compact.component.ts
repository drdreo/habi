import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input, Signal } from "@angular/core";
import { MatTooltip } from "@angular/material/tooltip";
import { Habit } from "../../habit.model";

type HistoryCompletion = {
    completions: number;
    color: string;
    tooltip: string;
};

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

function convertHabitToCompletion(habit: Habit): HistoryCompletion[] {
    if (!habit.completions) {
        return [];
    }

    function getCompletionGroups(habit: Habit) {
        const completionGroups: { date: string; completions: number[] }[] = [];

        habit.completions.forEach((completion) => {
            // TODO refactor this is definitely completely wrongly hallucinated
            const date = completion.created_at.split("T")[0];
            const existingGroup = completionGroups.find((group) => group.date === date);

            if (existingGroup) {
                existingGroup.completions.push(1);
            } else {
                completionGroups.push({ date, completions: [1] });
            }
        });

        console.log({ completionGroups, name: habit.name });
        return completionGroups;
    }

    const completionGroups = getCompletionGroups(habit);
    return completionGroups.map((completionGroup) => {
        const completions = completionGroup.completions.length;
        return {
            completions,
            color: getCompletionColor(completions, habit.targetMetric.goal),
            tooltip: `${completionGroup.date}: ${completions} / ${habit.targetMetric.goal}`
        };
    });
}

let mockValue = 0;

function getCompletionMock(): HistoryCompletion {
    const goal = 8;
    return {
        completions: mockValue++,
        tooltip: `${mockValue} / ${goal}`,
        color: getCompletionColor(mockValue, goal)
    };
}

function getCompletionColor(completions: number, goal: number): string {
    if (completions >= goal) {
        return "#ffdea2";
    }

    if (completions === 0) {
        return "#f2f2f2";
    }

    const baseRGB = { r: 54, g: 94, b: 157 };
    const ratio = Math.min(1, completions / goal);
    const newColor = {
        r: Math.floor(255 * (1 - ratio) + baseRGB.r * ratio),
        g: Math.floor(255 * (1 - ratio) + baseRGB.g * ratio),
        b: Math.floor(255 * (1 - ratio) + baseRGB.b * ratio)
    };

    return `rgb(${newColor.r}, ${newColor.g}, ${newColor.b})`;
}
