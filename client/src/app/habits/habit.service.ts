import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom, Observable, of } from "rxjs";
import { environment } from "../../environments/environment";
import { Habit, HabitFrequency, HabitInput } from "./habit.model";

let MOCK_COUNTER = 0;

let frequencies: Exclude<HabitFrequency, null>[] = ["daily", "monthly", "weekly", "finite"];

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
            value: "10"
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
    private readonly http = inject(HttpClient);

    async getHabitById(habitId: string): Promise<Habit> {
        return await firstValueFrom(this.http.get<Habit>(`${environment.origins.api}/api/habits/${habitId}`));
    }

    getAllHabits(): Observable<Habit[]> {
        return of(habitsMock);
        // return await firstValueFrom(this.http.get<Habit[]>(`${environment.origins.api}/api/habits`));
    }

    async createHabit(habitInput: HabitInput) {
        return await firstValueFrom(this.http.post(`${environment.origins.api}/api/habits`, habitInput));
    }
}
