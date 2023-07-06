package mywebsocket

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/dchest/uniuri"
	"github.com/gocql/gocql"
)

var IDChars []byte = []byte("abcdefghijklmnopqrstuvwxyz0123456789")
var timeFormat = "2006-01-02 15:04:05.999"

type Room struct {
	ID                  string
	Register            chan *Client
	Unregister          chan *Client
	ActiveClients       map[string]*Client
	InactiveClients     map[string]*Client
	TempInactiveClients map[string]time.Time
	Broadcast           chan Message
	EmptySince          time.Time
	Name                string
	Corridor            *Corridor
	DBSession           *gocql.Session
}

func (room *Room) initializeCloudDB() {
	cluster := gocql.NewCluster("cassandra.eu-west-2.amazonaws.com")
	cluster.Port = 9142
	cluster.Keyspace = os.Getenv("AWS_KEYSPACE")

	// add your service specific credentials
	cluster.Authenticator = gocql.PasswordAuthenticator{
		Username: os.Getenv("AWS_CASSANDRA_USERNAME"),
		Password: os.Getenv("AWS_CASSANDRA_PASSWORD"),
	}
	// provide the path to the sf-class2-root.crt
	cluster.SslOpts = &gocql.SslOptions{
		CaPath:                 os.Getenv("AWS_CERT"),
		EnableHostVerification: false,
	}

	// Override default Consistency to LocalQuorum
	cluster.Consistency = gocql.LocalQuorum
	cluster.DisableInitialHostLookup = false

	cassandra, err := cluster.CreateSession()
	if err != nil {
		fmt.Println("err>", err)
	}

	if err := cassandra.Query(
		fmt.Sprintf("CREATE TABLE IF NOT EXISTS %s.messages_by_room_and_time ( room_id text, time timestamp, body text, id uuid, sender_username text, type text, user_id uuid, PRIMARY KEY (room_id, time) ) WITH CLUSTERING ORDER BY (time DESC);", cluster.Keyspace),
	).Exec(); err != nil {
		log.Println(err)
		log.Panic("Could not create table")
	}

	room.DBSession = cassandra

}

func (room *Room) initializeLocalDB() {
	cluster := gocql.NewCluster("im_app_db")
	cluster.Keyspace = "im_app"
	cassandra, err := cluster.CreateSession()

	if err != nil {
		fmt.Println(err)

		cluster.Keyspace = "system"
		cassandra, err = cluster.CreateSession()
		if err != nil {
			fmt.Println(err)
			log.Panic("Could not connect to Cassandra")
		}

		if err := cassandra.Query(
			"CREATE KEYSPACE IF NOT EXISTS im_app WITH REPLICATION = {'class' : 'SimpleStrategy', 'replication_factor': 1};",
		).Exec(); err != nil {
			fmt.Println(err)
			log.Panic("Could not create keyspace")
		}
		if err := cassandra.Query(
			"CREATE TABLE IF NOT EXISTS im_app.messages_by_room_and_time ( room_id text, time timestamp, body text, id uuid, sender_username text, type text, user_id uuid, PRIMARY KEY (room_id, time) ) WITH CLUSTERING ORDER BY (time DESC);",
		).Exec(); err != nil {
			fmt.Println(err)
			log.Panic("Could not create table")
		}
		cassandra.Close()

		cluster.Keyspace = "im_app"
		cassandra, err = cluster.CreateSession()
		if err != nil {
			fmt.Println(err)
			log.Panic("Could not connect to Cassandra after setup")
		}

	}

	room.DBSession = cassandra

}

func NewRoom(corridor *Corridor, name string) *Room {

	room := Room{
		ID:                  uniuri.NewLenChars(4, IDChars),
		Register:            make(chan *Client),
		Unregister:          make(chan *Client),
		ActiveClients:       make(map[string]*Client),
		InactiveClients:     make(map[string]*Client),
		TempInactiveClients: make(map[string]time.Time),
		Broadcast:           make(chan Message),
		EmptySince:          time.Now(),
		Name:                name,
		Corridor:            corridor,
	}

	if os.Getenv("IM_APP_ENV") == "PRODUCTION" {
		room.initializeCloudDB()
	} else if os.Getenv("IM_APP_ENV") == "DEV" {
		room.initializeLocalDB()
	}

	return &room
}

func (room *Room) saveMessage(message *Message) {
	query := "INSERT INTO messages_by_room_and_time (id, room_id, user_id, body, time, sender_username, type) VALUES (?, ?, ?, ?, ?, ?, ?)"
	uuid, _ := gocql.ParseUUID(message.UserID)
	timestamp, _ := time.Parse(timeFormat, message.Timestamp)
	if err := room.DBSession.Query(query,
		gocql.TimeUUID(),
		room.ID,
		uuid,
		message.Body,
		timestamp,
		message.Username,
		message.Type,
	).Exec(); err != nil {
		log.Fatal(err)
	}
}

func (room *Room) Serve() {
	secondTicker := time.NewTicker(time.Second)
	minuteTicker := time.NewTicker(1 * time.Minute)

	for {
		select {
		case <-minuteTicker.C:
			if len(room.ActiveClients) < 1 && time.Since(room.EmptySince) >= (30*time.Minute) {
				fmt.Println("Empty Since:", room.EmptySince)
				room.Corridor.UnregisterRoom <- room
				return
			}

		case <-secondTicker.C:
			var client *Client

			for clientID, timestamp := range room.TempInactiveClients {
				_, inactive := room.InactiveClients[clientID]
				if inactive && time.Since(timestamp) >= (5*time.Second) {
					delete(room.TempInactiveClients, clientID)

					client = room.InactiveClients[clientID]
					systemMessage := Message{Type: "leave", Username: client.Username, UserID: client.ID, Timestamp: time.Now().Format(timeFormat)}

					room.saveMessage(&systemMessage)
					for _, client := range room.ActiveClients {
						if err := client.Conn.WriteJSON(systemMessage); err != nil {
							log.Println(err)
							return
						}
					}
				}
			}

		case client := <-room.Register:

			if _, alreadyPresent := room.ActiveClients[client.ID]; alreadyPresent {
				break
			} else {
				room.ActiveClients[client.ID] = client
			}

			if _, recentDeparture := room.TempInactiveClients[client.ID]; recentDeparture {
				delete(room.TempInactiveClients, client.ID)
				delete(room.InactiveClients, client.ID)
				break
			}

			var systemMessage Message
			if _, clientRejoining := room.InactiveClients[client.ID]; clientRejoining {
				delete(room.InactiveClients, client.ID)
				systemMessage = Message{Type: "rejoin", Username: client.Username, UserID: client.ID, Timestamp: time.Now().Format(timeFormat), Body: ""}
			} else {
				systemMessage = Message{Type: "join", Username: client.Username, UserID: client.ID, Timestamp: time.Now().Format(timeFormat), Body: ""}
			}

			room.saveMessage(&systemMessage)

			for _, otherClient := range room.ActiveClients {
				if otherClient != client {
					if err := otherClient.Conn.WriteJSON(systemMessage); err != nil {
						log.Println(err)
						return
					}
				}
			}

		case client := <-room.Unregister:
			delete(room.ActiveClients, client.ID)
			room.TempInactiveClients[client.ID] = time.Now()
			room.InactiveClients[client.ID] = client

			if len(room.ActiveClients) < 1 {
				room.EmptySince = time.Now()
			}
		case message := <-room.Broadcast:
			room.saveMessage(&message)
			for _, client := range room.ActiveClients {
				if err := client.Conn.WriteJSON(message); err != nil {
					log.Println(err)
					return
				}
			}
		}
	}
}

func (room *Room) GetMessageHistory(before time.Time) MessageHistory {
	var message_id string
	var user_id string
	var body string
	var timestamp time.Time
	var message Message
	var username string
	var message_type string
	var messages []Message

	numMaxMessages := 50

	query := fmt.Sprintf("SELECT id, user_id, body, time, sender_username, type FROM messages_by_room_and_time WHERE room_id='%s' AND time < '%s' ORDER BY time DESC LIMIT %v", room.ID, before.Format(timeFormat), numMaxMessages)
	iter := room.DBSession.Query(query).Iter()

	for iter.Scan(&message_id, &user_id, &body, &timestamp, &username, &message_type) {
		message = Message{
			ID:        message_id,
			UserID:    user_id,
			Body:      body,
			Timestamp: timestamp.Format(timeFormat),
			Username:  username,
			Type:      message_type,
		}

		messages = append(messages, message)
	}
	iter.Close()

	history := MessageHistory{
		History:  messages,
		Complete: numMaxMessages > len(messages),
	}

	return history
}
