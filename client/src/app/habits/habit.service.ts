import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatSnackBar } from "@angular/material/snack-bar";
import { firstValueFrom, Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { SnackBarCelebrationComponent } from "../snack-bar/snack-bar-celebration/snack-bar-celebration.component";
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
            type: "quantity",
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

    private readonly http = inject(HttpClient);
    private readonly snackBar = inject(MatSnackBar);

    constructor() {
        this.getAllHabits()
            .pipe(takeUntilDestroyed())
            .subscribe((habits) => {
                this.habits.set(habits);
            });
    }

    async getHabitById(habitId: string): Promise<Habit> {
        return await firstValueFrom(this.http.get<Habit>(`${environment.origins.api}/api/habits/${habitId}`));
    }

    getAllHabits(): Observable<Habit[]> {
        // return of(habitsMock);
        return this.http.get<Habit[]>(`${environment.origins.api}/api/habits`);
    }

    async createHabit(habitInput: HabitInput) {
        const createdHabit = await firstValueFrom(
            this.http.post<Habit>(`${environment.origins.api}/api/habits`, habitInput)
        );

        this.habits.update((habits) => [...habits, createdHabit]);

        return createdHabit;
    }

    async deleteHabit(habitId: string) {
        await firstValueFrom(this.http.delete(`${environment.origins.api}/api/habits/${habitId}`));

        this.habits.update((habits) => habits.filter((habit) => habit.id !== habitId));
    }

    async completeHabit(habitId: string) {
        await firstValueFrom(this.http.post(`${environment.origins.api}/api/habits/${habitId}/complete`, undefined));

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
        return firstValueFrom(this.http.post(`${environment.origins.api}/api/habits/${habitId}/archive`, undefined));
    }

    openCelebrationSnackBar() {
        this.snackBar.openFromComponent(SnackBarCelebrationComponent, {
            duration: 5 * 1000
        });
    }
}
