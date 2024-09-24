import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: "terms-of-service",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./terms-of-service.component.html",
    styleUrl: "./terms-of-service.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsOfServiceComponent {}
