import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, signal, Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { ActivatedRoute } from "@angular/router";
import { Habit } from "../habit.model";
import { HabitService } from "../habit.service";
import { LocationService } from "../location.service";
import { MapComponent } from "./maps/maps.component";

@Component({
    selector: "app-habit-details",
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MapComponent],
    templateUrl: "./habit-details.component.html",
    styleUrl: "./habit-details.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitDetailsComponent {
    habit: Signal<Habit | undefined>;
    isWatchingLocation = signal(false);

    private habitService = inject(HabitService);
    private locationService = inject(LocationService);
    private readonly route = inject(ActivatedRoute);

    constructor() {
        console.log("HabitDetailsComponent created");
        const routeParam = toSignal(this.route.paramMap);
        this.habit = computed(() => {
            const id = routeParam()?.get("id");
            if (!id) {
                return undefined;
            }

            return this.habitService.getHabit(id);
        });
    }

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
