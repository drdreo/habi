package main

import (
	"fmt"
	"net/http"
)

const PORT = ":3333"

func handleRoot(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte(":)"))
}

func handleGetPosts(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	fmt.Fprintf(w, "Retrieving post with ID: %s", id)
}

// in the future use proper CORS https://github.com/rs/cors
func EnableCors(next http.HandlerFunc) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    w.Header().Add("Access-Control-Allow-Origin", "*")
    w.Header().Add("Access-Control-Allow-Credentials", "true")
    w.Header().Add("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
    w.Header().Add("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")

    if r.Method == "OPTIONS" {
        http.Error(w, "No Content", http.StatusNoContent)
        return
    }

    next(w, r)
  }
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /", EnableCors(handleRoot))
	mux.HandleFunc("GET /posts/{id}", EnableCors(handleGetPosts))


	fmt.Printf("starting API at http://localhost%s\n", PORT)


	err := http.ListenAndServe(PORT, mux)
	if err != nil {
		fmt.Printf("failed to start API: %s", err)
	}
}
