package main

import (
	"fmt"
    
	"api/internal/server"
)

func main() {
	srvr := server.NewServer()

    fmt.Printf("starting API at http://localhost%s\n", srvr.Addr)
	err := srvr.ListenAndServe()
	if err != nil {
        fmt.Printf("failed to start API: %s", err)
	}
}
