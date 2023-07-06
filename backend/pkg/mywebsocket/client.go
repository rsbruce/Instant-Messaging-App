package mywebsocket

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	ID       string `cql:"id"`
	Username string `cql:"username"`
	Conn     *websocket.Conn
	Room     *Room
}

type Message struct {
	ID        string `json:"ID"`
	Body      string `json:"body"`
	UserID    string `json:"userID"`
	Username  string `json:"username"`
	Timestamp string `json:"timestamp"`
	Type      string `json:"type"`
}

type MessageHistory struct {
	History  []Message `json:"history"`
	Complete bool      `json:"complete"`
}

func (c *Client) Read() {
	defer func() {
		c.Room.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, p, err := c.Conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}
		message := Message{
			Body:      string(p),
			UserID:    c.ID,
			Username:  c.Username,
			Timestamp: time.Now().Format(timeFormat),
			Type:      "user_message",
		}
		c.Room.Broadcast <- message
		log.Printf("Message Received from %+v: %+v\n", c.Username, message)
	}
}
