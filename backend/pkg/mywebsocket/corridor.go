package mywebsocket

import "fmt"

type Corridor struct {
	Rooms          map[string]*Room
	RegisterRoom   chan *Room
	UnregisterRoom chan *Room
}

func NewCorridor() *Corridor {
	return &Corridor{
		Rooms:          make(map[string]*Room),
		RegisterRoom:   make(chan *Room),
		UnregisterRoom: make(chan *Room),
	}
}

func (corridor *Corridor) Serve() {
	for {
		select {
		case room := <-corridor.RegisterRoom:
			corridor.Rooms[room.ID] = room

		case room := <-corridor.UnregisterRoom:
			fmt.Println("Unregistering Room")
			fmt.Printf("Room Size: %v\n", len(corridor.Rooms))
			delete(corridor.Rooms, room.ID)
			fmt.Printf("Room Size: %v\n", len(corridor.Rooms))

		}
	}
}
