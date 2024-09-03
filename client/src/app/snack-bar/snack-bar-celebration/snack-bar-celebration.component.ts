import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: "snack-bar-celeberation",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./snack-bar-celebration.component.html",
    styleUrl: "./snack-bar-celebration.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnackBarCelebrationComponent {}
