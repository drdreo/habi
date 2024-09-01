package main

import (
	"api/internal/server"
	"fmt"
	"log/slog"
)

func main() {
	slog.SetLogLoggerLevel(slog.LevelDebug)

	srv := server.NewServer()

	fmt.Printf("starting API at http://localhost%s\n", srv.Addr)
	err := srv.ListenAndServe()
	if err != nil {
		fmt.Printf("failed to start API: %s", err)
	}
}
