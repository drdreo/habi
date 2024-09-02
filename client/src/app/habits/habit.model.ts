export type HabitInput = {
    name: string;
    description: string;
    frequency: HabitFrequency | null;
    type: string;
    targetMetric: {
        type: TargetMetricType | null;
        value: string;
    };
};

export type Habit = {
    id: string;
    userId: string;
    name: string;
    description: string;
    frequency: HabitFrequency;
    type: string;
    targetMetric: {
        type: TargetMetricType;
        value: string;
    };
    createdAt: number;
};

export type TargetMetricType = "quantity" | "duration" | "date";
export type HabitFrequency = "daily" | "weekly" | "monthly" | "finite";
