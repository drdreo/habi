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
        unit?: string;
    };
    completions: HabitCompletion[];
    isTracking?: boolean;
    timeTracked?: number;
    createdAt: number;
};

export type TargetMetricGoal = number;
export type TargetMetricType = "quantity" | "duration";
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
