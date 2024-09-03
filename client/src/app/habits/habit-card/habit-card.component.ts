import { animate, keyframes, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, input, signal, WritableSignal } from "@angular/core";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatIcon } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressBar } from "@angular/material/progress-bar";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatTooltip } from "@angular/material/tooltip";
import { Habit } from "../habit.model";
import { HabitService } from "../habit.service";

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
        MatTooltip,
        MatProgressSpinner
    ],
    templateUrl: "./habit-card.component.html",
    styleUrl: "./habit-card.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger("fadeIn", [
            transition(":enter", [style({ opacity: 0 }), animate("300ms ease-in", style({ opacity: 1 }))])
        ]),
        trigger("checkmarkAnimation", [
            transition(":enter", [
                animate(
                    "500ms ease-in",
                    keyframes([
                        style({ transform: "scale(0)", opacity: 0, offset: 0 }),
                        style({ transform: "scale(1.2)", opacity: 1, offset: 0.6 }),
                        style({ transform: "scale(1)", opacity: 1, offset: 1.0 })
                    ])
                )
            ])
        ])
    ]
})
export class HabitCardComponent {
    habit = input.required<Habit>();

    completeState: WritableSignal<"start" | "loading" | "success" | "reset"> = signal("start");

    showCompleteButton = computed(() => {
        return this.completeState() === "start" || this.completeState() === "reset";
    });

    habitProgress = computed(() => {
        const habit = this.habit();
        return (habit.targetMetric.completions * 100) / habit.targetMetric.goal;
    });

    progressTooltip = computed(() => {
        const { targetMetric } = this.habit();
        return `${targetMetric.completions} of ${targetMetric.goal} ${targetMetric.unit}`;
    });

    private habitService = inject(HabitService);

    async completeHabit() {
        this.completeState.set("loading");

        try {
            await this.habitService.completeHabit(this.habit().id);
            this.completeState.set("success");
        } finally {
            setTimeout(() => {
                this.completeState.set("reset");
            }, 1350);
        }
    }

    archiveHabit() {
        return this.habitService.archiveHabit(this.habit().id);
    }

    deleteHabit() {
        return this.habitService.deleteHabit(this.habit().id);
    }
}
