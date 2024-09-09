package habits

import (
	"fmt"
	"time"
)

// Generates last 5 periods (days, weeks, or months) based on frequency
func generateLastFivePeriods(frequency string) []string {
	var periods []string
	now := time.Now()

	for i := 0; i < 5; i++ {
		switch frequency {
		case "daily":
			periods = append(periods, now.AddDate(0, 0, -i).Format("2006-01-02"))
		case "weekly":
			week := now.AddDate(0, 0, -7*i)
			year, weekNumber := week.ISOWeek()
			periods = append(periods, fmt.Sprintf("%d-W%02d", year, weekNumber)) // ISOWeek format
		case "monthly":
			month := now.AddDate(0, -i, 0)
			periods = append(periods, month.Format("2006-01"))
		}
	}

	return periods
}

//func fillMissingDates(habitId primitive.ObjectID, completions []HabitCompletion, frequency string) []HistoricCompletionGroup {
//	// Generate last 5 periods (days/weeks/months)
//	expectedPeriods := generateLastFivePeriods(frequency)
//
//	// Create a map of existing completions for faster lookup
//	completionMap := make(map[string]HistoricCompletionGroup)
//	for _, group := range completions {
//		completionMap[group.GroupKey.Date] = group
//	}
//
//	// Prepare the final list with empty completions for missing dates
//	var filledCompletions []HistoricCompletionGroup
//	for _, period := range expectedPeriods {
//		if group, exists := completionMap[period]; exists {
//			// If data exists for the period, add it
//			filledCompletions = append(filledCompletions, group)
//		} else {
//			// Otherwise, create an empty completion group for the period
//			filledCompletions = append(filledCompletions, HistoricCompletionGroup{
//				GroupKey: HistoricCompletionGroupKey{
//					HabitId: habitId,
//					Date:    period,
//				},
//				Completions: []HistoricCompletion{},  // Empty completions
//			})
//		}
//	}
//
//	return filledCompletions
//}
