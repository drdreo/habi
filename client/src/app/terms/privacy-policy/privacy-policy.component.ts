import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: "privacy-policy",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./privacy-policy.component.html",
    styleUrl: "./privacy-policy.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicyComponent {}
