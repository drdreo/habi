import { inject, Injectable, signal } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SnackBarCelebrationComponent } from "../snack-bar/snack-bar-celebration/snack-bar-celebration.component";
import { HabitTrackingService } from "./habit-tracking.service";
import { HabitDataService } from "./habit.data.service";
import { Habit, HabitFrequency, HabitInput } from "./habit.model";

let MOCK_COUNTER = 0;

const frequencies: HabitFrequency[] = ["daily", "monthly", "weekly", "finite"];

function getHabitMock(name: string): Habit {
    const randomIndex = Math.floor(Math.random() * frequencies.length);
    const frequency = frequencies[randomIndex];
    return {
        id: `testId${MOCK_COUNTER++}`,
        userId: "testUserId",
        name,
        description: "Test Description",
        frequency,
        type: "Health",
        targetMetric: {
            type: "duration",
            goal: 10,
            completions: 3
        },
        createdAt: Date.now()
    };
}

const habitsMock: Habit[] = [];

for (let i = 0; i < 10; i++) {
    habitsMock.push(getHabitMock("Exercise for 30 Minutes"));
    habitsMock.push(getHabitMock("ShortTitle"));
}

@Injectable({
    providedIn: "root"
})
export class HabitService {
    // Store all habits in a signal
    habits = signal<Habit[]>([]);

    private readonly snackBar = inject(MatSnackBar);
    private readonly habitDataService = inject(HabitDataService);
    private readonly habitTrackingService = inject(HabitTrackingService);

    constructor() {
        this.habitDataService.getAllHabits().then((habits) => {
            this.habits.set(habits);

            this.checkTrackingState(habits);
        });
        // this.habits.set(habitsMock);
    }

    async createHabit(habitInput: HabitInput) {
        const createdHabit = await this.habitDataService.createHabit(habitInput);

        this.habits.update((habits) => [...habits, createdHabit]);

        return createdHabit;
    }

    async deleteHabit(habitId: string) {
        await this.habitDataService.deleteHabit(habitId);
        this.habits.update((habits) => habits.filter((habit) => habit.id !== habitId));
    }

    async completeHabit(habitId: string) {
        await this.habitDataService.completeHabit(habitId);

        let habitCompleted = false;
        this.habits.update((habits) => {
            return habits.map((habit) => {
                if (habit.id !== habitId) {
                    return habit;
                }
                habitCompleted = habit.targetMetric.completions + 1 === habit.targetMetric.goal;
                return {
                    ...habit,
                    targetMetric: {
                        ...habit.targetMetric,
                        completions: habit.targetMetric.completions + 1
                    }
                };
            });
        });

        if (habitCompleted) {
            this.openCelebrationSnackBar();
        }
    }

    archiveHabit(habitId: string) {
        return this.habitDataService.archiveHabit(habitId);
    }

    openCelebrationSnackBar() {
        this.snackBar.openFromComponent(SnackBarCelebrationComponent, {
            duration: 5 * 1000
        });
    }

    async startHabit(habitId: string) {
        const habit = this.habits().find((habit) => habit.id === habitId);
        if (!habit) {
            console.error("Habit not found");
            return;
        }
        const timeTracked = await this.habitTrackingService.startTrackingHabit(habitId);
        this.updateHabitTrackingState(habitId, true, timeTracked);
    }

    async finishHabit(habitId: string) {
        const habit = this.habits().find((habit) => habit.id === habitId);
        if (!habit) {
            console.error("Habit not found");
            return;
        }

        const timeTracked = await this.habitTrackingService.stopTrackingHabit(habitId);
        this.updateHabitTrackingState(habitId, false, timeTracked);

        if (timeTracked < habit.targetMetric.goal) {
            console.log("Habit was not completed, time tracked: ", timeTracked);
            return;
        }

        console.log("Habit was completed");
        return this.completeHabit(habitId);
    }

    private async checkTrackingState(habits: Habit[]) {
        await this.habitTrackingService.databaseInitialized.promise;
        const allTrackingHabits = await this.habitTrackingService.getAllHabitTrackingEntries();

        this.habits.update((habits) => {
            return habits.map((habit) => {
                const trackingEntry = allTrackingHabits.find((entry) => entry.id === habit.id);
                let isTracking = false;
                let timeTracked;
                if (trackingEntry) {
                    isTracking = true;
                    timeTracked = trackingEntry.timeTracked;
                }
                return {
                    ...habit,
                    isTracking,
                    timeTracked
                };
            });
        });
    }

    private updateHabitTrackingState(habitId: string, isTracking: boolean, timeTracked: number) {
        this.habits.update((habits) => {
            return habits.map((habit: Habit) => {
                if (habit.id !== habitId) {
                    return habit;
                }
                return {
                    ...habit,
                    isTracking,
                    timeTracked
                };
            });
        });
    }
}
