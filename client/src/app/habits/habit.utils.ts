import { Habit, HabitFrequency, HabitType } from "./habit.model";
import { getWeekNumber } from "./time.utils";

let mockValue = 0;

export type HistoryCompletion = {
    completions: number;
    color: string;
    tooltip: string;
    period: string;
};

const COMPLETION_TARGET_COLOR_GOOD = "#ffdea2";
const COMPLETION_COLOR_GOOD = { r: 54, g: 94, b: 157 };
const COMPLETION_COLOR_BAD = { r: 200, g: 57, b: 55 };
const COMPLETION_TARGET_COLOR_BAD = "rgb(200, 8, 5)";

export type CompletionPeriod = { period: string; completions: number };

export function getPeriodKey(frequency: HabitFrequency, date: Date): string {
    switch (frequency) {
        case "daily": {
            return date.toISOString().split("T")[0];
        }
        case "weekly": {
            const year = date.getFullYear();
            const weekNumber = getWeekNumber(date);
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

export function generatePeriods(frequency: string, date: Date, limit = 5): CompletionPeriod[] {
    const periods: { period: string; completions: number }[] = [];
    for (let i = 0; i < limit; i++) {
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

export function getCompletionGroups(habit: Habit, limit?: number): CompletionPeriod[] {
    const completionPeriods = generatePeriods(habit.frequency, new Date(), limit);
    habit.completions.forEach((completion) => {
        const periodKey = getPeriodKey(habit.frequency, new Date(completion.created_at));
        const period = completionPeriods.find((group) => group.period === periodKey);
        // skip completions out of the period
        if (period) {
            period.completions++;
        }
    });

    return completionPeriods;
}

export function getCompletionColor(completions: number, goal: number, type: HabitType): string {
    if (completions >= goal) {
        return type === "bad" ? COMPLETION_TARGET_COLOR_BAD : COMPLETION_TARGET_COLOR_GOOD;
    }

    if (completions === 0) {
        return "#f2f2f2";
    }

    const baseRGB = type === "bad" ? COMPLETION_COLOR_BAD : COMPLETION_COLOR_GOOD;
    const ratio = Math.min(1, completions / goal);
    const newColor = {
        r: Math.floor(255 * (1 - ratio) + baseRGB.r * ratio),
        g: Math.floor(255 * (1 - ratio) + baseRGB.g * ratio),
        b: Math.floor(255 * (1 - ratio) + baseRGB.b * ratio)
    };

    return `rgb(${newColor.r}, ${newColor.g}, ${newColor.b})`;
}

export function convertHabitToCompletion(habit: Habit): HistoryCompletion[] {
    if (!habit.completions || habit.frequency === "finite") {
        return [];
    }

    const completionGroups = getCompletionGroups(habit);
    return completionGroups.map((completionGroup) => {
        const completions = completionGroup.completions;
        let goal = habit.targetMetric.goal;
        if (habit.targetMetric.type === "duration") {
            goal = 1;
        }
        return {
            completions,
            color: getCompletionColor(completions, goal, habit.type),
            period: completionGroup.period,
            tooltip: `${completionGroup.period}: ${completions} / ${goal}`
        };
    });
}

export function getHistoryCompletionMock(): HistoryCompletion {
    const goal = 8;
    return {
        completions: mockValue++,
        tooltip: `${mockValue} / ${goal}`,
        color: getCompletionColor(mockValue, goal, "good"),
        period: "mock"
    };
}
