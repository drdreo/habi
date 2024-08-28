import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";

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
        MatDatepickerModule,
        FormsModule
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
        frequency: new FormControl("daily", Validators.required),
        targetMetric: new FormGroup({
            type: new FormControl<TargetMetricType>("quantity"),
            value: new FormControl(null, Validators.required),
            unit: new FormControl("")
        }),
        type: new FormControl("good", Validators.required)
    });

    createHabit() {
        console.log(this.habitForm);
    }
}

type TargetMetricType = "quantity" | "duration" | "date" | null;
