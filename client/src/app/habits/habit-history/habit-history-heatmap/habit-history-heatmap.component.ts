import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { MatTooltip } from "@angular/material/tooltip";
import { Habit } from "../../habit.model";
import { getCompletionColor, getPeriodKey } from "../../habit.utils";

type Day = {
    color: string;
    tooltip: string;
    today: boolean;
};

type Week = (Day | null)[];

function generateYearCalendarData(year: number, habit?: Habit): Week[] {
    const weeks: Week[] = [];
    let currentWeek: Week = new Array(7).fill(null); // Start with an empty week

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

    for (let month = 0; month < 12; month++) {
        const startMonth = new Date(year, month, 1);
        const daysInMonth = new Date(startMonth.getFullYear(), month + 1, 0).getDate();
        let monthDayOfWeek = (startMonth.getDay() + 6) % 7; // Adjust to Monday start

        for (let day = 1; day <= daysInMonth; day++) {
            const periodKey = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
            let color = "#f2f2f2";

            let tooltip = periodKey;
            if (habit) {
                const completions = habit.completions.filter(
                    (completion) => getPeriodKey("daily", new Date(completion.created_at)) === periodKey
                );
                if (completions.length > 0) {
                    color = getCompletionColor(completions.length, habit.targetMetric.goal, habit.type);
                    tooltip = `${periodKey}: ${completions.length} / ${habit.targetMetric.goal}`;
                }
            }
            currentWeek[monthDayOfWeek] = {
                tooltip,
                color,
                today: periodKey === todayKey
            };
            monthDayOfWeek++;

            if (monthDayOfWeek > 6) {
                // End of week
                weeks.push(currentWeek);
                currentWeek = new Array(7).fill(null); // Start a new week
                monthDayOfWeek = 0;
            }
        }

        // After the end of the month, do not push the current week until it's filled by the next month
    }

    // push the last week if it contains any days
    if (currentWeek.some((day) => day !== null)) {
        weeks.push(currentWeek);
    }

    return weeks;
}

@Component({
    selector: "habit-history-heatmap",
    standalone: true,
    imports: [CommonModule, MatTooltip],
    templateUrl: "./habit-history-heatmap.component.html",
    styleUrl: "./habit-history-heatmap.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitHistoryHeatmapComponent {
    weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    calendarData = computed(() => {
        const year = new Date().getFullYear();
        let habit;
        // TODO fix for other frequencies
        if (this.habit().frequency === "daily") {
            habit = this.habit();
        }
        return generateYearCalendarData(year, habit);
    });

    habit = input.required<Habit>();
}
