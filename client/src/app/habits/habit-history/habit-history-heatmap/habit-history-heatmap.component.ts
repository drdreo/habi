import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";

type Week = (number | null)[];

const generateCalendarData = (startDate: Date, daysInMonth: number): Week[] => {
    const weeks: Week[] = [];
    let currentWeek: Week = new Array(7).fill(null);
    let dayOfWeek = (startDate.getDay() + 6) % 7; // Monday as start day

    for (let day = 1; day <= daysInMonth; day++) {
        currentWeek[dayOfWeek] = day;
        dayOfWeek++;

        // End of week or month
        if (dayOfWeek > 6 || day === daysInMonth) {
            weeks.push(currentWeek);
            currentWeek = new Array(7).fill(null); // New week
            dayOfWeek = 0;
        }
    }

    return weeks;
};

@Component({
    selector: "habit-history-heatmap",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./habit-history-heatmap.component.html",
    styleUrl: "./habit-history-heatmap.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitHistoryHeatmapComponent {
    weekdays = ["M", "T", "W", "T", "F", "S", "S"];
    calendarData = signal<Week[][]>([[]]);

    constructor() {
        const year = new Date().getFullYear();

        const calendarData: Week[][] = [];
        for (let month = 0; month < 12; month++) {
            const startDate = new Date(year, month, 1);
            const daysInMonth = new Date(year, month + 1, 0).getDate(); // 0:day is the last day of last month, giving days in month
            calendarData.push(generateCalendarData(startDate, daysInMonth));
        }

        this.calendarData.set(calendarData);

        console.log(calendarData);
    }
}
