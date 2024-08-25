package main

import (
    "fmt"
    "github.com/joho/godotenv"
    "github.com/rs/cors"
    "log"
    "net/http"

    "api/authenticator"
)

const PORT = ":3333"

func handleRoot(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte(":)"))
}

func handleGetHabits() http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        log.Printf("Handling habits")
        id := r.PathValue("id")
        fmt.Fprintf(w, "Retrieving post with ID: %s", id)
    })
}

func main() {
    err := godotenv.Load()
    if err != nil {
      log.Fatal("Error loading .env file")
    }

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowCredentials: true,
        AllowedHeaders:   []string{"Authorization"},
	})

	auth, err := authenticator.New()
	if err != nil {
		log.Fatalf("Failed to initialize the authenticator: %v", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /", handleRoot)
    mux.Handle("GET /api/habits/{id}", auth.AuthMiddleware(handleGetHabits()))

    log.Printf("starting API at http://localhost%s\n", PORT)

	err = http.ListenAndServe(PORT, c.Handler(mux))
	if err != nil {
        log.Printf("failed to start API: %s", err)
	}
}
