import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import { Habit, HabitInput } from "./habit.model";

@Injectable({
    providedIn: "root"
})
export class HabitDataService {
    private readonly http = inject(HttpClient);

    getHabitById(habitId: string): Promise<Habit> {
        return firstValueFrom(this.http.get<Habit>(`${environment.origins.api}/api/habits/${habitId}`));
    }

    getAllHabits(): Promise<Habit[]> {
        return firstValueFrom(this.http.get<Habit[]>(`${environment.origins.api}/api/habits`));
    }

    createHabit(habitInput: HabitInput) {
        return firstValueFrom(this.http.post<Habit>(`${environment.origins.api}/api/habits`, habitInput));
    }

    deleteHabit(habitId: string) {
        return firstValueFrom(this.http.delete(`${environment.origins.api}/api/habits/${habitId}`));
    }

    completeHabit(habitId: string) {
        return firstValueFrom(this.http.post(`${environment.origins.api}/api/habits/${habitId}/complete`, undefined));
    }

    archiveHabit(habitId: string) {
        return firstValueFrom(this.http.post(`${environment.origins.api}/api/habits/${habitId}/archive`, undefined));
    }
}
