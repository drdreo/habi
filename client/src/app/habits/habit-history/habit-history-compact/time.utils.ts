import { HabitFrequency } from "../../habit.model";

export function getPeriodKey(frequency: HabitFrequency, date: Date): string {
    switch (frequency) {
        case "daily": {
            return date.toISOString().split("T")[0];
        }
        case "weekly": {
            const year = date.getFullYear();
            const weekNumber = getWeek(date);
            return `${year}-W${weekNumber}`;
        }
        case "monthly": {
            const month = new Date(date.setMonth(date.getMonth()));
            return `${month.getFullYear()}-${month.getMonth() + 1}`;
        }
        default:
            throw new Error(`Invalid frequency ${frequency}`);
    }
}

export function generateLastFivePeriods(frequency: string, date: Date): { period: string; completions: number }[] {
    const periods: { period: string; completions: number }[] = [];
    for (let i = 0; i < 5; i++) {
        let periodKey: string;
        const currentDate = new Date(date);
        switch (frequency) {
            case "daily":
                periodKey = getPeriodKey(frequency, new Date(currentDate.setDate(currentDate.getDate() - i)));
                break;
            case "weekly":
                periodKey = getPeriodKey(frequency, new Date(currentDate.setDate(currentDate.getDate() - 7 * i)));
                break;
            case "monthly":
                periodKey = getPeriodKey(frequency, new Date(currentDate.setMonth(currentDate.getMonth() - i)));
                break;
            default:
                throw new Error(`Invalid frequency ${frequency}`);
        }
        periods.push({ period: periodKey, completions: 0 });
    }

    return periods;
}

// Fucking JavaScript
// TODO: probably buggy
function getWeek(date: Date): number {
    const onejan = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = (date.getTime() - onejan.getTime() + 86400000) / 86400000;
    return Math.ceil(dayOfYear / 7);
}
