import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { ActivatedRoute } from "@angular/router";
import { filter, switchMap } from "rxjs";
import { HabitService } from "../habit.service";
import { LocationService } from "../location.service";
import { HabitEditComponent } from "./habit-edit/habit-edit.component";
import { MapComponent } from "./maps/maps.component";

@Component({
    selector: "app-habit-details",
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MapComponent, HabitEditComponent],
    templateUrl: "./habit-details.component.html",
    styleUrl: "./habit-details.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitDetailsComponent {
    isWatchingLocation = signal(false);
    private routeParam = toSignal(this.route.paramMap);
    private habitService = inject(HabitService);
    private locationService = inject(LocationService);
    private readonly route = inject(ActivatedRoute);
    habit = computed(() => {
        const id = this.routeParam()?.get("id");
        if (!id) {
            return undefined;
        }
        return this.habitService.getHabit(id);
    });
    statistics = toSignal(
        toObservable(this.habit).pipe(
            filter(Boolean),
            switchMap((habit) => this.habitService.getHabitStatistics(habit.id))
        )
    );

    startLocationTracking() {
        const habit = this.habit();
        if (!habit) {
            console.warn("cant start location tracking without a habit");
            return;
        }
        this.locationService.startLocationTracking(habit.id);
        this.isWatchingLocation.set(true);
    }

    stopLocationTracking() {
        const habit = this.habit();
        if (!habit) {
            console.warn("cant stop location tracking without a habit");
            return;
        }
        this.locationService.stopLocationTracking(habit.id);
        this.isWatchingLocation.set(false);
    }
}
