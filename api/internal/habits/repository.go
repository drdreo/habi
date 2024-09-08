package habits

import (
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log/slog"
	"os"
	"strconv"
	"time"
)

type Repository interface {
	Create(ctx context.Context, userId string, habit *HabitInput) (Habit, error)
	GetAll(ctx context.Context, userId string) ([]Habit, error)
	GetById(ctx context.Context, userId string, habitId string) (Habit, error)
	DeleteById(ctx context.Context, userId string, habitId string) error
	ArchiveById(ctx context.Context, userId string, habitId string) (Habit, error)
	CompleteById(ctx context.Context, userId string, habitId string) (*HabitCompletion, error)
}

type habitRepository struct {
	habitCollection               *mongo.Collection
	habitCompletionCollection     *mongo.Collection
	habitCompletionCollectionName string
}

func NewRepository(db *mongo.Client) Repository {
	var habitCollection = "habits"
	var habitCompletionCollectionName = "habit_completions"

	if os.Getenv("MODE") == "development" {
		habitCollection = "dev_habits"
		habitCompletionCollectionName = "dev_habit_completions"
	}

	slog.Info("Using collections: ", "habitCollection", habitCollection, "habitCompletionCollectionName", habitCompletionCollectionName)

	return &habitRepository{
		habitCollection:               db.Database("habits").Collection(habitCollection),
		habitCompletionCollection:     db.Database("habits").Collection(habitCompletionCollectionName),
		habitCompletionCollectionName: habitCompletionCollectionName,
	}
}

func (r *habitRepository) GetAll(ctx context.Context, userId string) ([]Habit, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// NOTE: Maybe re-write to create this aggregation pipeline via code
	pipeline := mongo.Pipeline{
		bson.D{{"$match", bson.D{{"user_id", userId}}}},

		getCurrentCompletionsPipeline(r.habitCompletionCollectionName),
		bson.D{{"$addFields", bson.D{{"target_metric.completions", bson.D{{"$size", "$completions"}}}}}},

		getHistoryPipeline(r.habitCompletionCollectionName),
	}

	cursor, err := r.habitCollection.Aggregate(ctx, pipeline)
	if err != nil {
		slog.Warn("failed to aggregate habit and completions", "err", err)
		return nil, err
	}

	var habits []Habit
	if err = cursor.All(ctx, &habits); err != nil {
		return nil, err
	}

	// For each habit, fill in missing historic completions
	for i, habit := range habits {
		habits[i].HistoricCompletions = fillMissingDates(habit.Id, habit.HistoricCompletions, habit.Frequency)
	}

	slog.Info("Successfully got all habits")
	for i, habit := range habits {
		slog.Info("Habit "+strconv.Itoa(i), "habitId", habit.Id, "created_at", habit.CreatedAt, "completions", habit.TargetMetric.Completions, "name", habit.Name)
	}
	return habits, nil
}

func getCurrentCompletionsPipeline(habitCompletionCollectionName string) bson.D {
	return bson.D{
			{"$lookup",
				bson.D{
					{"from", habitCompletionCollectionName},
					{"localField", "_id"},
					{"foreignField", "habit_id"},
					{"as", "completions"},
					{"let",
						bson.D{
							{"frequency", "$frequency"},
							{"startOfDay",
								bson.D{
									{"$dateTrunc",
										bson.D{
											{"date", "$$NOW"},
											{"unit", "day"},
										},
									},
								},
							},
							{"startOfWeek",
								bson.D{
									{"$dateTrunc",
										bson.D{
											{"date", "$$NOW"},
											{"unit", "week"},
											{"startOfWeek", "monday"},
										},
									},
								},
							},
						},
					},
					{"pipeline",
						bson.A{
							bson.D{
								{"$match",
									bson.D{
										{"$expr",
											bson.D{
												{"$switch",
													bson.D{
														{"branches",
															bson.A{
																bson.D{
																	{"case",
																		bson.D{
																			{"$eq",
																				bson.A{
																					"$$frequency",
																					"daily",
																				},
																			},
																		},
																	},
																	{"then",
																		bson.D{
																			{"$and",
																				bson.A{
																					bson.D{
																						{"$gte",
																							bson.A{
																								"$created_at",
																								"$$startOfDay",
																							},
																						},
																					},
																				},
																			},
																		},
																	},
																},
																bson.D{
																	{"case",
																		bson.D{
																			{"$eq",
																				bson.A{
																					"$$frequency",
																					"weekly",
																				},
																			},
																		},
																	},
																	{"then",
																		bson.D{
																			{"$and",
																				bson.A{
																					bson.D{
																						{"$gte",
																							bson.A{
																								"$created_at",
																								"$$startOfWeek",
																							},
																						},
																					},
																				},
																			},
																		},
																	},
																},
															},
														},
														{"default", false},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
		}
}

func getHistoryPipeline(habitCompletionCollectionName string) bson.D {
	return bson.D{
		{"$lookup",
			bson.D{
				{"from", habitCompletionCollectionName},
				{"localField", "_id"},
				{"foreignField", "habit_id"},
				{"as", "historic_completions"},
				{"let", bson.D{{"frequency", "$frequency"}}},
				{"pipeline",
					bson.A{
						bson.D{
							{"$addFields",
								bson.D{
									{"cutoffDate",
										bson.D{
											{"$switch",
												bson.D{
													{"branches",
														bson.A{
															bson.D{
																{"case",
																	bson.D{
																		{"$eq",
																			bson.A{
																				"$$frequency",
																				"daily",
																			},
																		},
																	},
																},
																{"then",
																	bson.D{
																		{"$dateSubtract",
																			bson.D{
																				{"startDate", "$$NOW"},
																				{"unit", "day"},
																				{"amount", 5},
																			},
																		},
																	},
																},
															},
															bson.D{
																{"case",
																	bson.D{
																		{"$eq",
																			bson.A{
																				"$$frequency",
																				"weekly",
																			},
																		},
																	},
																},
																{"then",
																	bson.D{
																		{"$dateSubtract",
																			bson.D{
																				{"startDate", "$$NOW"},
																				{"unit", "week"},
																				{"amount", 5},
																			},
																		},
																	},
																},
															},
															bson.D{
																{"case",
																	bson.D{
																		{"$eq",
																			bson.A{
																				"$$frequency",
																				"monthly",
																			},
																		},
																	},
																},
																{"then",
																	bson.D{
																		{"$dateSubtract",
																			bson.D{
																				{"startDate", "$$NOW"},
																				{"unit", "month"},
																				{"amount", 5},
																			},
																		},
																	},
																},
															},
														},
													},
													{"default", "$$NOW"},
												},
											},
										},
									},
								},
							},
						},
						bson.D{
							{"$match",
								bson.D{
									{"$expr",
										bson.D{
											{"$gte",
												bson.A{
													"$created_at",
													"$cutoffDate",
												},
											},
										},
									},
								},
							},
						},
						bson.D{
							{"$group",
								bson.D{
									{"_id",
										bson.D{
											{"habit_id", "$habit_id"},
											{"date",
												bson.D{
													{"$switch",
														bson.D{
															{"branches",
																bson.A{
																	bson.D{
																		{"case",
																			bson.D{
																				{"$eq",
																					bson.A{
																						"$$frequency",
																						"daily",
																					},
																				},
																			},
																		},
																		{"then",
																			bson.D{
																				{"$dateToString",
																					bson.D{
																						{"format", "%Y-%m-%d"},
																						{"date", "$created_at"},
																					},
																				},
																			},
																		},
																	},
																	bson.D{
																		{"case",
																			bson.D{
																				{"$eq",
																					bson.A{
																						"$$frequency",
																						"weekly",
																					},
																				},
																			},
																		},
																		{"then",
																			bson.D{
																				{"$dateToString",
																					bson.D{
																						{"format", "%Y-W%V"},
																						{"date", "$created_at"},
																					},
																				},
																			},
																		},
																	},
																	bson.D{
																		{"case",
																			bson.D{
																				{"$eq",
																					bson.A{
																						"$$frequency",
																						"monthly",
																					},
																				},
																			},
																		},
																		{"then",
																			bson.D{
																				{"$dateToString",
																					bson.D{
																						{"format", "%Y-%m"},
																						{"date", "$created_at"},
																					},
																				},
																			},
																		},
																	},
																},
															},
															{"default", "$created_at"},
														},
													},
												},
											},
										},
									},
									{"completions",
										bson.D{
											{"$push",
												bson.D{
													{"date", "$created_at"},
													{"value", "$value"},
												},
											},
										},
									},
								},
							},
						},
						bson.D{{"$sort", bson.D{{"_id.date", -1}}}},
					},
				},
			},
		},
	}
}

func (r *habitRepository) GetById(ctx context.Context, userId string, habitId string) (Habit, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	id, err := primitive.ObjectIDFromHex(habitId)
	if err != nil {
		slog.Warn("failed to convert habit Id", "habitId", habitId, "err", err)
		return Habit{}, err
	}
	filter := bson.M{"user_id": userId, "_id": id}

	var habit Habit
	err = r.habitCollection.FindOne(ctx, filter).Decode(&habit)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			slog.Warn("habit not found", "userId", userId, "habitId", habitId)
			return Habit{}, errors.New("habit not found")
		}
		slog.Warn("failed to get habit", "habitId", habitId, "err", err)
		return Habit{}, err
	}

	slog.Info("Successfully got all habits")
	return habit, nil
}

func (r *habitRepository) Create(ctx context.Context, userId string, habitInput *HabitInput) (Habit, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Create a Habit struct and populate it with data from HabitInput
	habit := Habit{
		UserId:      userId,
		Name:        habitInput.Name,
		Description: habitInput.Description,
		Frequency:   habitInput.Frequency,
		Type:        habitInput.Type,
		TargetMetric: HabitTargetMetric{
			Type:        habitInput.TargetMetric.Type,
			Goal:        habitInput.TargetMetric.Goal,
			Unit:        habitInput.TargetMetric.Unit,
			Completions: 0,
		},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	res, err := r.habitCollection.InsertOne(ctx, habit)
	if err != nil {
		slog.Warn("failed to create habit", "err", err)
		return Habit{}, err
	}

	habit.Id = res.InsertedID.(primitive.ObjectID)

	slog.Info("Successfully created habit", "habitId", habit.Id)
	return habit, nil
}

func (r *habitRepository) DeleteById(ctx context.Context, userId string, habitId string) error {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	habitOId, _ := primitive.ObjectIDFromHex(habitId)
	_, err := r.habitCollection.DeleteOne(ctx, bson.M{"_id": habitOId, "user_id": userId})
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			slog.Warn("habit not found", "userId", userId, "habitId", habitId)
			return errors.New("habit not found")
		}
		slog.Warn("failed to delete habit", "habitId", habitId, "err", err)
		return err
	}

	slog.Info("Successfully deleted habit", "habitId", habitId)
	return nil
}

func (r *habitRepository) CompleteById(ctx context.Context, userId string, habitId string) (*HabitCompletion, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Get current habit target value
	var habit Habit
	habitOId, _ := primitive.ObjectIDFromHex(habitId)
	err := r.habitCollection.FindOne(ctx, bson.M{"_id": habitOId, "user_id": userId}).Decode(&habit)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			slog.Warn("habit not found", "userId", userId, "habitId", habitId)
			return nil, errors.New("habit not found")
		}
		slog.Warn("failed to find habit", "habitId", habitId, "err", err)
		return nil, err
	}

	// Create a Habit struct and populate it with data from HabitInput
	habitCompletion := HabitCompletion{
		HabitId:   habitOId,
		UserId:    userId,
		Goal:      habit.TargetMetric.Goal,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	res, err := r.habitCompletionCollection.InsertOne(ctx, habitCompletion)
	if err != nil {
		slog.Warn("failed to insert habit completion", "habitId", habitId, "err", err)
		return nil, err
	}

	slog.Info("Successfully inserted habit completion", "completionId", res.InsertedID)
	return &habitCompletion, nil
}

func (r *habitRepository) ArchiveById(ctx context.Context, userId string, habitId string) (Habit, error) {
	// timeout for the database operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	id, _ := primitive.ObjectIDFromHex(habitId)
	filter := bson.M{"user_id": userId, "_id": id}
	update := bson.D{
		{"$set", bson.D{
			{"archived", true}}},
		{"$set", bson.D{
			{"updated_at", time.Now()},
		}},
	}

	var updatedHabit Habit
	err := r.habitCollection.FindOneAndUpdate(ctx, filter, update, options.FindOneAndUpdate().SetReturnDocument(options.After)).Decode(&updatedHabit)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			slog.Warn("habit not found", "userId", userId, "habitId", habitId)
			return Habit{}, errors.New("habit not found")
		}
		slog.Warn("failed to update habit", "habitId", habitId, "err", err)
		return Habit{}, err
	}

	slog.Info("Successfully archived habit", "habitId", habitId)
	return updatedHabit, nil
}
