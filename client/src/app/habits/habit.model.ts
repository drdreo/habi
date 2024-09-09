export type HabitInput = {
    name: string;
    description?: string;
    frequency: HabitFrequency | null;
    type: HabitType;
    targetMetric: {
        type: TargetMetricType | null;
        goal: TargetMetricGoal | null;
        unit?: string;
    };
};

export type HabitDto = {
    id: string;
    userId: string;
    name: string;
    description?: string;
    frequency: HabitFrequency;
    type: HabitType;
    targetMetric: {
        type: TargetMetricType;
        goal: TargetMetricGoal;
        unit?: string;
    };
    completions: HabitCompletion[];

    createdAt: number;
};

export type Habit = {
    currentCompletions: number;
    isTracking?: boolean;
    timeTracked?: number;
} & HabitDto;

export type TargetMetricGoal = number;
export type TargetMetricType = "quantity" | "duration";
export type HabitType = "good" | "bad";
export type HabitFrequency = "daily" | "weekly" | "monthly" | "finite";
export type HabitCompletion = {
    created_at: string;
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

export type TrackingSession = {
    habitId: string;
    startTime: string;
    endTime: string;
    totalDistance?: number;
    totalDuration?: number;
    location: {
        type: "LineString";
        coordinates: [number, number, number][];
    };
    update_at: string;
    created_at: string;
};
