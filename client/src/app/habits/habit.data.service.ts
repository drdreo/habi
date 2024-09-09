import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { Habit, HabitDto, HabitInput, LocationUpdate, TrackingSession } from "./habit.model";
import { startOfDay, startOfMonth, startOfWeek } from "./time.utils";

@Injectable({
    providedIn: "root"
})
export class HabitDataService {
    private readonly http = inject(HttpClient);

    getHabitById(habitId: string): Promise<Habit> {
        return firstValueFrom(this.http.get<Habit>(`${environment.origins.api}/api/habits/${habitId}`));
    }

    getAllHabits(): Promise<Habit[]> {
        return firstValueFrom(
            this.http.get<HabitDto[]>(`${environment.origins.api}/api/habits`).pipe(map(mapHabitsDtoToHabits))
        );
    }

    createHabit(habitInput: HabitInput): Promise<Habit> {
        return firstValueFrom(
            this.http.post<HabitDto>(`${environment.origins.api}/api/habits`, habitInput).pipe(map(mapHabitDtoToHabit))
        );
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

    getTrackingSession(habitId: string) {
        return firstValueFrom(
            this.http.get<TrackingSession>(`${environment.origins.api}/api/habits/${habitId}/tracking`)
        );
    }

    createTrackingSession(habitId: string) {
        return firstValueFrom(this.http.post(`${environment.origins.api}/api/habits/${habitId}/tracking`, undefined));
    }

    updateTrackingLocation(habitId: string, locationUpdate: LocationUpdate) {
        return firstValueFrom(
            this.http.put(`${environment.origins.api}/api/habits/${habitId}/tracking`, {
                ...locationUpdate
            })
        );
    }
}

function mapHabitsDtoToHabits(habits: HabitDto[]): Habit[] {
    return habits.map(mapHabitDtoToHabit);
}

function mapHabitDtoToHabit(habit: HabitDto): Habit {
    return { ...habit, currentCompletions: getHabitCurrentCompletions(habit) };
}

function getHabitCurrentCompletions(habit: HabitDto): number {
    let startDate: number;
    const now = new Date();
    switch (habit.frequency) {
        case "daily":
            startDate = startOfDay(now);
            break;
        case "weekly":
            startDate = startOfWeek(now);
            break;
        case "monthly":
            startDate = startOfMonth(now);
            break;
        case "finite":
            startDate = -Infinity;
            break;
        default:
            throw new Error("Invalid frequency");
    }

    return habit.completions.filter((completion) => new Date(completion.created_at).getTime() >= startDate).length;
}
