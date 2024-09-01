import { BreakpointObserver, Breakpoints, LayoutModule } from "@angular/cdk/layout";
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, Signal, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatIconButton } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MatDivider } from "@angular/material/divider";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIcon } from "@angular/material/icon";
import { MatListModule, MatListSubheaderCssMatStyler } from "@angular/material/list";
import { map } from "rxjs/operators";
import { HabitCardComponent } from "../habits/habit-card/habit-card.component";
import { HabitEntryComponent } from "../habits/habit-entry/habit-entry.component";
import { Habit, HabitGroup } from "../habits/habit.model";
import { HabitService } from "../habits/habit.service";

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
        MatExpansionModule
    ],
    templateUrl: "./home.component.html",
    styleUrl: "./home.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
    numCols = signal(5);
    habitGroups: Signal<HabitGroup>;
    filtersOpen = signal(false);

    private habitService = inject(HabitService);
    private breakpointObserver = inject(BreakpointObserver);

    constructor() {
        this.habitGroups = toSignal(this.habitService.getAllHabits().pipe(map(groupHabitsByCategory)), {
            initialValue: INITIAL_GROUPS
        });

        this.breakpointObserver.observe([Breakpoints.HandsetLandscape]).subscribe((result) => {
            if (result.matches) {
                this.numCols.set(2);
            }
            console.log(result);
        });
    }
}

const INITIAL_GROUPS = {
    daily: [],
    weekly: [],
    monthly: [],
    finite: []
};

function groupHabitsByCategory(habits: Habit[]): HabitGroup {
    return habits.reduce((groups: HabitGroup, habit: Habit) => {
        const frequency = habit.frequency;
        groups[frequency].push(habit);
        return groups;
    }, INITIAL_GROUPS);
}
