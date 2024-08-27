import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";

@Component({
    selector: "habit-entry",
    standalone: true,
    imports: [CommonModule, MatIcon, MatButton, MatListModule, MatIconButton],
    templateUrl: "./habit-entry.component.html",
    styleUrl: "./habit-entry.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitEntryComponent {}
