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
import { RouterLink } from "@angular/router";
import { HabitHistoryCompactComponent } from "../habit-history/habit-history-compact/habit-history-compact.component";
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
        MatProgressSpinner,
        RouterLink,
        HabitHistoryCompactComponent
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
    habitProgress = computed(() => {
        const { targetMetric, timeTracked, currentCompletions } = this.habit();
        if (targetMetric.type === "duration") {
            if (typeof timeTracked === "undefined") {
                return 0;
            }
            return (timeTracked * 100) / targetMetric.goal;
        }
        return (currentCompletions * 100) / targetMetric.goal;
    });
    habitTimer = signal(0);
    completeState: WritableSignal<"start" | "loading" | "success" | "reset"> = signal("start");
    showCompleteButton = computed(() => {
        return this.completeState() === "start" || this.completeState() === "reset";
    });

    private habitService = inject(HabitService);
    private intervalId: number | undefined;

    progressTooltip = computed(() => {
        const { timeTracked, targetMetric, currentCompletions } = this.habit();
        if (targetMetric.type === "duration") {
            const habitTimer = this.habitTimer();
            if (this.intervalId) {
                return `${convertSecondsToTime(habitTimer)} of ${targetMetric.goal}min`;
            }
            return `${convertMinutesToTime(timeTracked ?? 0)} of ${targetMetric.goal}min`;
        }
        return `${currentCompletions} of ${targetMetric.goal} ${targetMetric.unit}`;
    });

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

    startHabit() {
        this.habitService.startHabit(this.habit().id);
        this.startHabitTimer(this.habit().timeTracked);
    }

    async stopHabit() {
        this.habitService.stopHabit(this.habit().id);
        this.stopHabitTimer();
    }

    private startHabitTimer(timeTracked?: number) {
        this.habitTimer.set(timeTracked ? Math.round(timeTracked * 60) : 0);
        this.intervalId = window.setInterval(() => {
            this.habitTimer.update((time) => time + 1);
        }, 1000);
    }

    private stopHabitTimer() {
        clearInterval(this.intervalId);
        this.intervalId = undefined;
        this.habitTimer.set(0);
    }
}

function convertMinutesToTime(totalMinutes: number): string {
    const minutes = Math.floor(totalMinutes);
    let seconds = Math.round((totalMinutes - minutes) * 60).toString();
    seconds = seconds.padStart(2, "0");
    return `${minutes}:${seconds}s`;
}

function convertSecondsToTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    let seconds = (totalSeconds % 60).toString();
    seconds = seconds.padStart(2, "0");
    return `${minutes}:${seconds}s`;
}
