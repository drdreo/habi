import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { StatCardComponent } from "../../utils/stat-card/stat-card.component";
import { Habit } from "../habit.model";
import { getPeriodKey } from "../habit.utils";

@Component({
    selector: "habit-stats",
    standalone: true,
    imports: [CommonModule, StatCardComponent],
    templateUrl: "./habit-stats.component.html",
    styleUrl: "./habit-stats.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitStatsComponent {
    habit = input.required<Habit>();

    stats = computed(() => {
        const habit = this.habit();
        const periodCompletions = new Map<string, number>();
        habit.completions.forEach((completion) => {
            const periodKey = getPeriodKey(habit.frequency, new Date(completion.created_at));
            const periodCompletion = periodCompletions.get(periodKey) ?? 0;
            periodCompletions.set(periodKey, periodCompletion + 1);
        });

        const totalPeriods = periodCompletions.size;
        const totalCompletions = habit.completions.length;
        const averagePerPeriod = totalCompletions / totalPeriods;

        return {
            total: totalCompletions,
            totalPeriods,
            averagePeriod: Math.round(averagePerPeriod),
            lastCompletion: habit.completions[habit.completions.length - 1]?.created_at ?? "N/A"
        };
    });
}
