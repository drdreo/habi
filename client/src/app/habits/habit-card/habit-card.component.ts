import { animate, keyframes, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input, signal } from "@angular/core";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatIcon } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressBar } from "@angular/material/progress-bar";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
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
    title = input.required();
    id = 1;

    isLoading = signal(false);
    isSuccess = signal(false);
    showCompleteButton = computed(() => {
        return !this.isLoading() && !this.isSuccess();
    });

    completeHabit() {
        this.isLoading.set(true);
        this.isSuccess.set(false);

        // Simulate an async task with setTimeout (e.g., API call)
        setTimeout(() => {
            this.isLoading.set(false);
            this.isSuccess.set(true);

            // After showing the checkmark, revert to the original state
            setTimeout(() => {
                this.isSuccess.set(false);
            }, 1000);
        }, 2000);
    }

    onCheckmarkAnimationDone() {
        if (this.isSuccess()) {
            setTimeout(() => {
                this.isSuccess.set(false);
            }, 1000); // Delay before reverting to the original state (1 second)
        }
    }
}
