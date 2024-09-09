import { HabitFrequency } from "./habit.model";

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

export function timeTillEndOfDay(): number {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay.getTime() - Date.now();
}

export function timeTillEndOfWeek(): number {
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek.getTime() - Date.now();
}

export function timeTillEndOfMonth(): number {
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 1); // First day of next month
    endOfMonth.setHours(0, 0, 0, -1); // Last millisecond of the current month
    return endOfMonth.getTime() - Date.now();
}

export function startOfDay(date: Date): number {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay.getTime();
}

export function startOfWeek(date: Date): number {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.getTime();
}

export function startOfMonth(date: Date): number {
    const startOfMonth = new Date(date);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return startOfMonth.getTime();
}
