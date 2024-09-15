import { CommonModule } from "@angular/common";
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    input,
    viewChild
} from "@angular/core";
import { MatTooltip } from "@angular/material/tooltip";
import { Habit } from "../../habit.model";
import { convertHabitToCompletion, getCompletionColor, getDateFromPeriodKey, getPeriodKey } from "../../habit.utils";

type Period = {
    color: string;
    tooltip: string;
    current: boolean;
    date?: Date;
};

type Periods = (Period | null)[];

function generateDailyCalendarData(year: number, habit?: Habit): Periods[] {
    const weeks: Periods[] = [];
    let currentWeek: Periods = new Array(7).fill(null); // Start with an empty week

    const today = new Date();
    const currentKey = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

    for (let month = 0; month < 12; month++) {
        const startMonth = new Date(year, month, 1);
        const daysInMonth = new Date(startMonth.getFullYear(), month + 1, 0).getDate();
        let monthDayOfWeek = (startMonth.getDay() + 6) % 7; // Adjust to Monday start

        for (let day = 1; day <= daysInMonth; day++) {
            const periodKey = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
            currentWeek[monthDayOfWeek] = getPeriodData(periodKey, currentKey, habit);
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

function getPeriodData(periodKey: string, currentKey: string, habit?: Habit): Period {
    let color = "#f2f2f2";
    let tooltip = periodKey;
    const date = getDateFromPeriodKey(periodKey);
    if (habit) {
        const completions = habit.completions.filter(
            (completion) => getPeriodKey("daily", new Date(completion.created_at)) === periodKey
        );
        if (completions.length > 0) {
            color = getCompletionColor(completions.length, habit.targetMetric.goal, habit.type);
            tooltip = `${periodKey}: ${completions.length} / ${habit.targetMetric.goal}`;
        }
    }

    return {
        tooltip,
        color,
        current: periodKey === currentKey,
        date
    };
}

@Component({
    selector: "habit-history-heatmap",
    standalone: true,
    imports: [CommonModule, MatTooltip],
    templateUrl: "./habit-history-heatmap.component.html",
    styleUrl: "./habit-history-heatmap.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitHistoryHeatmapComponent implements AfterViewInit {
    weekdays = computed(() => {
        const habit = this.habit();
        if (habit.frequency === "daily") {
            return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        } else if (habit.frequency === "weekly") {
            return ["Weeks"];
        } else if (habit.frequency === "monthly") {
            return ["Months"];
        }
        return [];
    });
    calendarData = computed(() => {
        const year = new Date().getFullYear();
        const habit = this.habit();
        if (habit.frequency === "daily") {
            return generateDailyCalendarData(year, habit);
        }
        return [];
    });

    yearData = computed(() => {
        const habit = this.habit();
        if (habit.frequency === "weekly") {
            return convertHabitToCompletion(habit, new Date(new Date().getFullYear(), 11, 1), 52); // most years have 52 weeks
        } else if (habit.frequency === "monthly") {
            return convertHabitToCompletion(habit, new Date(new Date().getFullYear(), 11, 1), 12);
        }
        return [];
    });

    habit = input.required<Habit>();
    calendarGrid = viewChild<ElementRef<HTMLElement>>("calendarGrid");

    ngAfterViewInit() {
        this.scrollToTodayCell();
    }

    scrollToTodayCell() {
        const currentCell = this.calendarGrid()?.nativeElement?.querySelector(".current");
        if (!currentCell) {
            console.log("Tried to scroll to current period, but not found");
            return;
        }
        currentCell.scrollIntoView({ inline: "center" });
    }
}
