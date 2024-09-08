import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
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
    completions = signal<HistoryCompletion[]>([]);

    constructor() {
        this.completions.set(Array.from({ length: 5 }, getCompletionMock));
    }
}

function getCompletionMock(habit: Habit): HistoryCompletion {
    const value = Math.floor(Math.random() * 10);
    return {
        completions: value,
        tooltip: new Date().getDay().toString(),
        color: getCompletionColor(value, 8)
    };
}

function getCompletionColor(completions: number, goal: number): string {
    if (completions >= goal) {
        return "#ffdea2";
    }

    const baseRGB = { r: 54, g: 94, b: 157 };
    const ratio = Math.min(1, completions / goal);
    const newColor = {
        r: Math.floor(baseRGB.r * (1 - ratio) + 255 * ratio),
        g: Math.floor(baseRGB.g * (1 - ratio) + 255 * ratio),
        b: Math.floor(baseRGB.b * (1 - ratio) + 255 * ratio)
    };

    return `rgb(${newColor.r}, ${newColor.g}, ${newColor.b})`;
}
