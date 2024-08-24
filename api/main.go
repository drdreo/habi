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

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /", handleRoot)
	mux.HandleFunc("GET /posts/{id}", handleGetPosts)

	fmt.Printf("starting API at http://localhost%s\n", PORT)
	err := http.ListenAndServe(PORT, mux)
	if err != nil {
		fmt.Println("failed to start API")
	}
}
