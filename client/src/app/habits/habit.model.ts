export type HabitInput = {
    name: string;
    description?: string;
    frequency: HabitFrequency | null;
    type: string;
    targetMetric: {
        type: TargetMetricType | null;
        goal: TargetMetricGoal | null;
        unit?: string;
    };
};

export type Habit = {
    id: string;
    userId: string;
    name: string;
    description?: string;
    frequency: HabitFrequency;
    type: string;
    targetMetric: {
        type: TargetMetricType;
        goal: TargetMetricGoal;
        completions: number;
        unit?: string;
    };
    isTracking?: boolean;
    createdAt: number;
};

export type TargetMetricGoal = number;
export type TargetMetricType = "quantity" | "duration";
export type HabitFrequency = "daily" | "weekly" | "monthly" | "finite";
