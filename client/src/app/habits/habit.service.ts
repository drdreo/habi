import { inject, Injectable, signal } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SnackBarCelebrationComponent } from "../snack-bar/snack-bar-celebration/snack-bar-celebration.component";
import { HabitTrackingService } from "./habit-tracking.service";
import { HabitDataService } from "./habit.data.service";
import { Habit, HabitCompletion, HabitCreateInput, HabitFrequency, HabitUpdateInput } from "./habit.model";
import { timeTillEndOfDay, timeTillEndOfMonth, timeTillEndOfWeek } from "./time.utils";

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
        type: "good",
        targetMetric: {
            type: "duration",
            goal: 10
        },
        currentCompletions: 1,
        completions: [{ created_at: new Date().toString() }],
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
    habits = signal<Habit[]>([]);
    isLoading = signal(true);

    private readonly snackBar = inject(MatSnackBar);
    private readonly habitDataService = inject(HabitDataService);
    private readonly habitTrackingService = inject(HabitTrackingService);

    constructor() {
        this.habitDataService.getAllHabits().then((habits) => {
            this.isLoading.set(false);
            this.habits.set(habits);

            this.checkTrackingState();
        });
        // this.habits.set(habitsMock);
    }

    findHabit(habitId: string): Habit | undefined {
        return this.habits().find((habit) => habit.id === habitId);
    }

    getHabitById(habitId: string) {
        return this.habitDataService.getHabitById(habitId);
    }

    getHabitStatistics(habitId: string) {
        return this.habitDataService.getHabitById(habitId);
    }

    async createHabit(habitInput: HabitCreateInput) {
        const createdHabit = await this.habitDataService.createHabit(habitInput);

        this.habits.update((habits) => [...habits, createdHabit]);

        return createdHabit;
    }

    async updateHabit(habitId: string, habitInput: HabitUpdateInput) {
        const createdHabit = await this.habitDataService.updateHabit(habitId, habitInput);

        this.habits.update((habits) => {
            return habits.map((habit) => {
                if (habit.id === habitId) {
                    return createdHabit;
                }
                return habit;
            });
        });

        return createdHabit;
    }

    async deleteHabit(habitId: string) {
        await this.habitDataService.deleteHabit(habitId);
        this.habits.update((habits) => habits.filter((habit) => habit.id !== habitId));
    }

    async completeHabit(habitId: string) {
        await this.habitDataService.completeHabit(habitId);

        let goalReached = false;
        this.habits.update((habits) => {
            return habits.map((habit) => {
                if (habit.id !== habitId) {
                    return habit;
                }
                if (habit.targetMetric.type === "duration") {
                    goalReached = (habit.timeTracked ?? 0) >= habit.targetMetric.goal;
                } else {
                    goalReached = habit.currentCompletions + 1 === habit.targetMetric.goal;
                }
                const tmpCompletion: HabitCompletion = { created_at: new Date().toString() };
                return {
                    ...habit,
                    completions: [...habit.completions, tmpCompletion],
                    currentCompletions: habit.currentCompletions + 1
                };
            });
        });

        if (goalReached) {
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

    async stopHabit(habitId: string): Promise<boolean> {
        const habit = this.habits().find((habit) => habit.id === habitId);
        if (!habit) {
            throw new Error("Habit not found");
        }

        const timeTracked = await this.habitTrackingService.stopTrackingHabit(habitId);
        this.updateHabitTrackingState(habitId, false, timeTracked);

        if (timeTracked < habit.targetMetric.goal) {
            console.log("Habit was not completed, time tracked: ", timeTracked);
            return false;
        }

        if (habit.currentCompletions > 0) {
            console.log("Habit was already completed");
            return false;
        }
        console.log("Habit was completed");
        await this.completeHabit(habitId);
        return true;
    }

    private async checkTrackingState() {
        await this.habitTrackingService.databaseInitialized.promise;
        const allTrackingHabits = await this.habitTrackingService.getAllHabitTrackingEntries();

        this.habits.update((habits) => {
            return habits.map((habit) => {
                const trackingEntry = allTrackingHabits.find((entry) => entry.id === habit.id);
                const trackingExpiryDate = getHabitExpiryDate(habit);
                const isTrackingEntryExpired =
                    trackingEntry && trackingEntry.startTime + trackingExpiryDate < Date.now();
                let isTracking;
                let timeTracked;
                if (isTrackingEntryExpired) {
                    console.log("Tracking entry expired");
                    this.habitTrackingService.deleteHabitTrackingEntry(trackingEntry.id);
                }
                if (trackingEntry && !isTrackingEntryExpired) {
                    isTracking = trackingEntry.isTracking;
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

function getHabitExpiryDate(habit: Habit): number {
    switch (habit.frequency) {
        case "daily":
            return timeTillEndOfDay();
        case "weekly":
            return timeTillEndOfWeek();
        case "monthly":
            return timeTillEndOfMonth();
        case "finite":
            return Infinity;
        default:
            throw new Error("Invalid frequency");
    }
}
