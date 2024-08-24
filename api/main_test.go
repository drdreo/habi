package main

import (
	"testing"
)

func TestHello(t *testing.T) {
	if PORT != ":3333" {
		t.Error("Expected PORT to be 3333")
	}

}
