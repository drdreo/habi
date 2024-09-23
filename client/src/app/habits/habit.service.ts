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
        completions: [{ created_at: new Date().toString(), amount: 1 }],
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

    addDemoHabits() {
        this.isLoading.set(true);
        this.habitDataService.addDemoHabits().then((demoHabits) => {
            this.isLoading.set(false);
            this.habits.update((habits) => [...habits, ...demoHabits]);
        });
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

    async completeHabit(habitId: string, amount = 1) {
        await this.habitDataService.completeHabit(habitId, amount);

        let goalReached = false;
        this.habits.update((habits) => {
            return habits.map((habit) => {
                if (habit.id !== habitId) {
                    return habit;
                }
                goalReached = habit.currentCompletions + amount >= habit.targetMetric.goal;
                const tmpCompletion: HabitCompletion = { created_at: new Date().toString(), amount };
                return {
                    ...habit,
                    completions: [...habit.completions, tmpCompletion],
                    currentCompletions: habit.currentCompletions + amount,
                    isTracking: false
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
        await this.habitTrackingService.startTrackingHabit(habitId);
        this.updateHabitTrackingState(habitId, true);
    }

    async stopHabit(habitId: string) {
        const habit = this.habits().find((habit) => habit.id === habitId);
        if (!habit) {
            throw new Error("Habit not found");
        }

        const timeTracked = await this.habitTrackingService.stopTrackingHabit(habitId);
        // this.updateHabitTrackingState(habitId, false, timeTracked);

        // if (timeTracked < habit.targetMetric.goal) {
        //     console.log("Habit was not completed, time tracked: ", timeTracked);
        //     return false;
        // }
        //
        // if (habit.currentCompletions > 0) {
        //     console.log("Habit was already completed");
        //     return false;
        // }
        // console.log("Habit was completed");
        return this.completeHabit(habitId, timeTracked);
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
                if (isTrackingEntryExpired) {
                    console.log("Tracking entry expired");
                    this.habitTrackingService.deleteHabitTrackingEntry(trackingEntry.id);
                }
                if (trackingEntry && !isTrackingEntryExpired) {
                    isTracking = trackingEntry.isTracking;
                }
                return {
                    ...habit,
                    isTracking
                };
            });
        });
    }

    private updateHabitTrackingState(habitId: string, isTracking: boolean) {
        this.habits.update((habits) => {
            return habits.map((habit: Habit) => {
                if (habit.id !== habitId) {
                    return habit;
                }
                return {
                    ...habit,
                    isTracking
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
