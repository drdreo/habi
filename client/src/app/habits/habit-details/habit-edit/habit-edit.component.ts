import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatButtonToggle, MatButtonToggleGroup } from "@angular/material/button-toggle";
import { MatFormField, MatHint, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Habit, HabitFrequency, HabitUpdateInput, TargetMetricGoal, TargetMetricType } from "../../habit.model";
import { HabitService } from "../../habit.service";

@Component({
    selector: "habit-edit",
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButton,
        MatButtonToggle,
        MatButtonToggleGroup,
        MatFormField,
        MatHint,
        MatIcon,
        MatInput,
        MatLabel,
        MatSuffix,
        ReactiveFormsModule,
        MatProgressSpinner
    ],
    templateUrl: "./habit-edit.component.html",
    styleUrl: "./habit-edit.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitEditComponent {
    habit = input.required<Habit>();
    habitForm = computed(() => {
        const { name, description, frequency, type, targetMetric } = this.habit();
        return new FormGroup({
            name: new FormControl(name, Validators.required),
            description: new FormControl(description),
            frequency: new FormControl<HabitFrequency>(frequency, Validators.required),
            targetMetric: new FormGroup({
                type: new FormControl<TargetMetricType>(
                    { value: targetMetric.type, disabled: true },
                    Validators.required
                ),
                goal: new FormControl<TargetMetricGoal>(targetMetric.goal, Validators.required),
                unit: new FormControl(targetMetric.unit)
            }),
            type: new FormControl(type, Validators.required)
        });
    });

    isSaving = signal(false);

    private habitService = inject(HabitService);

    async updateHabit() {
        this.isSaving.set(true);

        const habitUpdate = this.habitForm().getRawValue() as HabitUpdateInput;
        await this.habitService.updateHabit(this.habit().id, habitUpdate);
        this.isSaving.set(false);
    }

    dateFilter = (d: Date | null): boolean => {
        if (!d) {
            return false;
        }
        return d > new Date();
    };
}
