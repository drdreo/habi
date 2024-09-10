import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { HabitCreateInput, HabitFrequency, TargetMetricGoal, TargetMetricType } from "../habit.model";
import { HabitService } from "../habit.service";

@Component({
    selector: "create-habit",
    standalone: true,
    imports: [
        CommonModule,
        MatButtonToggleModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIcon,
        MatInput,
        MatButton,
        FormsModule,
        MatProgressSpinner
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: "./create-habit.component.html",
    styleUrl: "./create-habit.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateHabitComponent {
    habitForm = new FormGroup({
        name: new FormControl("", Validators.required),
        description: new FormControl(""),
        frequency: new FormControl<HabitFrequency | null>(null, Validators.required),
        targetMetric: new FormGroup({
            type: new FormControl<TargetMetricType>("quantity"),
            goal: new FormControl<TargetMetricGoal | null>(null, Validators.required),
            unit: new FormControl("")
        }),
        type: new FormControl("good", Validators.required)
    });

    isCreating = signal(false);

    private habitService = inject(HabitService);
    private dialogRef = inject(MatDialogRef<CreateHabitComponent>);

    async createHabit() {
        this.isCreating.set(true);
        await this.habitService.createHabit(this.habitForm.value as HabitCreateInput);
        this.isCreating.set(false);

        this.dialogRef.close();
    }

    dateFilter = (d: Date | null): boolean => {
        if (!d) {
            return false;
        }
        return d > new Date();
    };
}
