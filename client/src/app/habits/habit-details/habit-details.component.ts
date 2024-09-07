import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { ActivatedRoute } from "@angular/router";
import { Habit } from "../habit.model";
import { HabitService } from "../habit.service";

@Component({
    selector: "app-habit-details",
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
    templateUrl: "./habit-details.component.html",
    styleUrl: "./habit-details.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitDetailsComponent {
    habit: Signal<Habit | undefined>;

    private habitService = inject(HabitService);
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

    startLocationTracking() {}
}
