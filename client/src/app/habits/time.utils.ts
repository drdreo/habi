// Fucking JavaScript
// https://www.geeksforgeeks.org/calculate-current-week-number-in-javascript/
export function getWeekNumber(date: Date): number {
    const currentDate = typeof date === "object" ? date : new Date();
    const januaryFirst = new Date(currentDate.getFullYear(), 0, 1);
    const daysToNextMonday = januaryFirst.getDay() === 1 ? 0 : (7 - januaryFirst.getDay()) % 7;
    const nextMonday = new Date(currentDate.getFullYear(), 0, januaryFirst.getDate() + daysToNextMonday);

    return currentDate > nextMonday
        ? Math.ceil((currentDate.getTime() - nextMonday.getTime()) / (24 * 3600 * 1000) / 7)
        : 1;
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
