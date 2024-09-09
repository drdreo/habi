package main

import (
	"api/internal/habits"
	"context"
	"fmt"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	_ "github.com/joho/godotenv/autoload"
)

func migrator() {
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(os.Getenv("MONGODB_CONNECTION_STRING")))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(context.Background())

	db := client.Database("habits")
	oldCollection := db.Collection("dev_habit_completions")
	habitCollection := db.Collection("dev_habits")

	// Fetch old completions
	cursor, err := oldCollection.Find(context.Background(), bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(context.Background())

	var completions []habits.ArchivedHabitCompletion
	if err := cursor.All(context.Background(), &completions); err != nil {
		log.Fatal(err)
	}

	for _, completion := range completions {
		filter := bson.M{"_id": completion.HabitId}
		update := bson.D{
			{"$push", bson.D{
				{"completions", bson.D{
					{"created_at", completion.CreatedAt},
				}},
			}},
		}

		// Update the habit collection
		_, err := habitCollection.UpdateOne(context.Background(), filter, update)
		if err != nil {
			log.Printf("Failed to update document: %v", err)
		} else {
			fmt.Printf("Updated document with ID: %v\n", completion.Id)
		}
	}

	fmt.Println("Migration completed.")
}
