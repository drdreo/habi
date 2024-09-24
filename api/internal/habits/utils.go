package habits

import "time"

func getDemoHabits(userId string) []Habit {
	yesterday := time.Now().Add(-24 * time.Hour)
	previousDay := yesterday.Add(-48 * time.Hour)
	drinkHabit := Habit{
		UserId:      userId,
		Name:        "Drink 8 glasses of water",
		Description: "A demo habit created at " + time.Now().Format("2006-01-02 15:04:05"),
		Frequency:   "daily",
		Type:        "good",
		TargetMetric: HabitTargetMetric{
			Type: "quantity",
			Goal: 8,
			Unit: "glasses",
		},
		Completions: []HabitCompletion{
			{CreatedAt: time.Now()},
			{CreatedAt: time.Now()},
			{CreatedAt: yesterday},
			{CreatedAt: yesterday},
			{CreatedAt: yesterday},
			{CreatedAt: yesterday},
			{CreatedAt: yesterday},
			{CreatedAt: yesterday},
			{CreatedAt: yesterday},
			{CreatedAt: yesterday},
			{CreatedAt: previousDay},
			{CreatedAt: previousDay},
			{CreatedAt: previousDay},
			{CreatedAt: previousDay},
		},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	walkHabit := Habit{
		UserId:      userId,
		Name:        "Go for a walk",
		Description: "A demo habit created at " + time.Now().Format("2006-01-02 15:04:05"),
		Frequency:   "weekly",
		Type:        "good",
		TargetMetric: HabitTargetMetric{
			Type: "quantity",
			Goal: 3,
			Unit: "🚶",
		},
		Completions: []HabitCompletion{
			{CreatedAt: yesterday},
			{CreatedAt: previousDay},
			{CreatedAt: previousDay},
		},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	testHabit := Habit{
		UserId:      userId,
		Name:        "Test Habi",
		Description: "A demo habit created at " + time.Now().Format("2006-01-02 15:04:05"),
		Frequency:   "daily",
		Type:        "good",
		TargetMetric: HabitTargetMetric{
			Type: "quantity",
			Goal: 1,
			Unit: "",
		},
		Completions: []HabitCompletion{
			{CreatedAt: time.Now()},
		},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	return []Habit{testHabit, drinkHabit, walkHabit}
}
