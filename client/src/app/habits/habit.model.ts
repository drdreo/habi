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
    historicCompletions?: HistoricCompletion[];
    isTracking?: boolean;
    timeTracked?: number;
    createdAt: number;
};

export type TargetMetricGoal = number;
export type TargetMetricType = "quantity" | "duration";
export type HabitFrequency = "daily" | "weekly" | "monthly" | "finite";

export type HistoricCompletion = {
    groupKey: {
        date: string;
        habitId: string;
    };
    completions: { date: string }[];
};

export type CoordinateUpdate = {
    lat: number;
    lng: number;
    accuracy?: number;
    altitude?: number | null;
};

export type LocationUpdate = {
    timestamp: Date;
    coordinates: CoordinateUpdate[];
};
