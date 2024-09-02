import { Injectable, signal } from "@angular/core";
import { HabitFrequency } from "../../habits/habit.model";

const initialFilterState = {
    frequency: ["daily", "weekly", "monthly", "finite"] as HabitFrequency[]
};

@Injectable({
    providedIn: "root"
})
export class FiltersService {
    filterState = signal(initialFilterState);

    updateFrequency(frequencies: HabitFrequency[]) {
        this.filterState.update((prev) => ({
            ...prev,
            frequency: frequencies.length ? frequencies : initialFilterState.frequency
        }));
    }
}
