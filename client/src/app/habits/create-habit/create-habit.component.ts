import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
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
        MatDatepickerModule
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: "./create-habit.component.html",
    styleUrl: "./create-habit.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateHabitComponent {
    nameControl = new FormControl("");
    descriptionControl = new FormControl("");
    unitControl = new FormControl("");
    frequencyControl = new FormControl("daily");
    typeControl = new FormControl("good");
    targetMetricTypeControl = new FormControl<TargetMetricType>("quantity");
    targetMetricValueControl = new FormControl();
}

type TargetMetricType = "quantity" | "duration" | "date" | null;
