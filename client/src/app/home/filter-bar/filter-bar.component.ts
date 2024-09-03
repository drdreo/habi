import { animate, state, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { MatChipListboxChange, MatChipsModule } from "@angular/material/chips";
import { FiltersService } from "./filters.service";

@Component({
    selector: "filter-bar",
    standalone: true,
    imports: [CommonModule, MatChipsModule],
    templateUrl: "./filter-bar.component.html",
    styleUrl: "./filter-bar.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger("openClose", [
            state(
                "open",
                style({
                    transform: "translateX(0)",
                    opacity: 1
                })
            ),
            state(
                "closed",
                style({
                    transform: "translateX(-100%)",
                    opacity: 0
                })
            ),
            transition("closed => open", [animate("0.5s ease-out")]),
            transition("open => closed", [animate("0.5s ease-in")])
        ])
    ]
})
export class FilterBarComponent {
    filtersOpen = signal(false);

    private filtersService = inject(FiltersService);

    toggleFilters() {
        this.filtersOpen.update((prev) => !prev);
    }

    filterChange($event: MatChipListboxChange) {
        this.filtersService.updateFrequency($event.value);
    }
}
