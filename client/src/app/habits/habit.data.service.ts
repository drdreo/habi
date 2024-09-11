import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { delay, firstValueFrom, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";
import {
    Habit,
    HabitCreateInput,
    HabitDto,
    HabitStatistics,
    HabitUpdateInput,
    LocationUpdate,
    TrackingSession
} from "./habit.model";
import { startOfDay, startOfMonth, startOfWeek } from "./time.utils";

@Injectable({
    providedIn: "root"
})
export class HabitDataService {
    private readonly http = inject(HttpClient);

    getHabitById(habitId: string): Observable<Habit | null> {
        return this.http.get<Habit | null>(`${environment.origins.api}/api/habits/${habitId}`);
    }

    getHabitStatistics(habitId: string): Observable<HabitStatistics | null> {
        return this.http.get<HabitStatistics | null>(`${environment.origins.api}/api/habits/${habitId}`);
    }

    getAllHabits(): Promise<Habit[]> {
        return firstValueFrom(
            this.http.get<HabitDto[] | null>(`${environment.origins.api}/api/habits`).pipe(
                map((habits) => {
                    if (!habits) {
                        console.warn("No habits available");
                        return [];
                    }
                    return mapHabitsDtoToHabits(habits);
                })
            )
        );
    }

    createHabit(habitInput: HabitCreateInput): Promise<Habit> {
        return firstValueFrom(
            this.http.post<HabitDto>(`${environment.origins.api}/api/habits`, habitInput).pipe(map(mapHabitDtoToHabit))
        );
    }

    updateHabit(habitId: string, habitInput: HabitUpdateInput): Promise<Habit> {
        return firstValueFrom(
            this.http
                .put<HabitDto>(`${environment.origins.api}/api/habits/${habitId}`, habitInput)
                .pipe(map(mapHabitDtoToHabit), delay(2000))
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
            this.http.get<TrackingSession | null>(`${environment.origins.api}/api/habits/${habitId}/tracking`)
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
