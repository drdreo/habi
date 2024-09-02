import { BreakpointObserver, Breakpoints, LayoutModule } from "@angular/cdk/layout";
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatIconButton } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MatDivider } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIcon } from "@angular/material/icon";
import { MatListModule, MatListSubheaderCssMatStyler } from "@angular/material/list";
import { HabitCardComponent } from "../habits/habit-card/habit-card.component";
import { HabitEntryComponent } from "../habits/habit-entry/habit-entry.component";
import { Habit } from "../habits/habit.model";
import { HabitService } from "../habits/habit.service";
import { GroupByPipe } from "../utils/group-by.pipe";
import { FilterBarComponent } from "./filter-bar/filter-bar.component";
import { FiltersService } from "./filter-bar/filters.service";

@Component({
    selector: "app-home",
    standalone: true,
    imports: [
        CommonModule,
        HabitEntryComponent,
        MatDivider,
        MatListModule,
        MatIcon,
        MatListSubheaderCssMatStyler,
        MatIconButton,
        HabitCardComponent,
        MatGridListModule,
        LayoutModule,
        MatChipsModule,
        MatFormFieldModule,
        FilterBarComponent,
        GroupByPipe
    ],
    templateUrl: "./home.component.html",
    styleUrl: "./home.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
    numCols = signal(5);
    habits: Signal<Habit[]>;
    filteredHabits: Signal<Habit[]>;

    private habitService = inject(HabitService);
    private filtersService = inject(FiltersService);
    private breakpointObserver = inject(BreakpointObserver);

    constructor() {
        this.habits = toSignal(this.habitService.getAllHabits(), { initialValue: [] });

        this.filteredHabits = computed(() => {
            const habits = [...this.habits()];
            const filterState = this.filtersService.filterState();
            return habits.filter((habit) => filterState.frequency.includes(habit.frequency));
        });

        this.breakpointObserver.observe([Breakpoints.HandsetLandscape]).subscribe((result) => {
            if (result.matches) {
                this.numCols.set(2);
            }
            console.log(result);
        });
    }
}
