package mywebsocket

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

func Upgrade(w http.ResponseWriter, r *http.Request) (*websocket.Conn, error) {

	upgrader := websocket.Upgrader {
		ReadBufferSize: 1024,
		WriteBufferSize: 1024,
	
		CheckOrigin: func(r *http.Request) bool {return true},
	}
	
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return conn, err
	}
	return conn, nil
}

