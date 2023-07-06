package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"net/http"

	"rsbruce/im_app/pkg/mywebsocket"

	"github.com/gocql/gocql"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/joho/godotenv"
	_ "github.com/joho/godotenv/autoload"
)

var IDChars []byte = []byte("abcdefghijklmnopqrstuvwxyz0123456789")
var store = sessions.NewCookieStore([]byte(os.Getenv("SESSION_KEY")))
var corridor = mywebsocket.NewCorridor()
var timeFormat = "2006-01-02 15:04:05.999"

func serveRoom(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
	log.Println("Websocket Endpoint Hit")

	params := mux.Vars(r)
	room, ok := corridor.Rooms[params["id"]]
	if !ok {
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}

	session, err := store.Get(r, "session-name")
	if err != nil {
		fmt.Println("COOKIE ERROR", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var errorMsg string

	username, ok := session.Values["username"]
	if !ok {
		errorMsg += "\nNo Username in Session"
	}

	userID, ok := session.Values["userID"]
	if !ok {
		errorMsg += "\nNo User ID in Session"
	}

	if len(errorMsg) > 0 {
		log.Println(errorMsg)
		http.Error(w, "Bad request, please try again", http.StatusBadRequest)
		return
	}

	conn, err := mywebsocket.Upgrade(w, r)
	if err != nil {
		fmt.Fprintf(w, "%+v\n", err)
		log.Printf("%+v\n", err)
		return
	}

	client := &mywebsocket.Client{
		ID:       userID.(string),
		Username: username.(string),
		Conn:     conn,
		Room:     room,
	}

	room.Register <- client

	client.Read()
}

type NewRoomResponse struct {
	RoomID   string `json:"roomID"`
	RoomName string `json:"roomName"`
	UserID   string `json:"userID"`
	Auth     string `json:"auth"`
}

func newRoomHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
	queryParams := r.URL.Query()
	username := queryParams.Get("username")
	roomName := queryParams.Get("roomName")

	if roomName == "" {
		roomName = username + "'s room"
	}

	var errorMsg string

	if username == "" {
		errorMsg += "username not found in query string"
		http.Error(w, errorMsg, http.StatusBadRequest)
		return
	}

	room := mywebsocket.NewRoom(corridor, roomName)
	corridor.RegisterRoom <- room

	session, err := store.Get(r, "session-name")
	if err != nil {
		log.Println("COOKIE ERROR:", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	session.Values["username"] = username
	session.Values["userID"] = gocql.TimeUUID().String()

	err = session.Save(r, w)
	if err != nil {
		log.Println("COOKIE ERROR:", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(NewRoomResponse{RoomID: room.ID, RoomName: room.Name, UserID: session.Values["userID"].(string), Auth: w.Header().Get("Set-Cookie")})
	go room.Serve()
}

type JoinRoomResponse struct {
	RoomName string `json:"roomName"`
	UserID   string `json:"userID"`
	Auth     string `json:"auth"`
}

func joinRoomHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")

	queryParams := r.URL.Query()
	roomID := queryParams.Get("roomID")
	username := queryParams.Get("username")
	var errorMsg string

	room, roomExists := corridor.Rooms[roomID]

	if username == "" {
		errorMsg += "username not found in query string"
	}
	if roomID == "" {
		errorMsg += "roomID not found in query string"
	} else if !roomExists {
		errorMsg += "No room found with that roomID"
	}
	if len(errorMsg) > 0 {
		http.Error(w, errorMsg, http.StatusBadRequest)
		return
	}

	session, err := store.Get(r, "session-name")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	session.Values["username"] = username
	session.Values["userID"] = gocql.TimeUUID().String()

	err = session.Save(r, w)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println(err.Error())
		return
	}

	json.NewEncoder(w).Encode(JoinRoomResponse{UserID: session.Values["userID"].(string), RoomName: room.Name, Auth: w.Header().Get("Set-Cookie")})
}

func serveHistory(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")

	queryParams := r.URL.Query()
	roomID := queryParams.Get("roomID")
	before := queryParams.Get("before")
	var timestamp time.Time
	var errorMsg string
	var err error

	if _, ok := corridor.Rooms[roomID]; !ok {
		errorMsg += "No room found with that roomID\n"
	}

	if before == "" {
		timestamp = time.Now()
	} else {
		timestamp, err = time.Parse(timeFormat, before)
		if err != nil {
			errorMsg += "Time given not coercible into time\n"
		}
	}

	if len(errorMsg) > 0 {
		http.Error(w, errorMsg, http.StatusBadRequest)
		return
	}

	room := corridor.Rooms[roomID]

	history := room.GetMessageHistory(timestamp)

	json.NewEncoder(w).Encode(history)
}

func setupRoutes(r *mux.Router) {

	r.HandleFunc("/new-room", newRoomHandler)

	r.HandleFunc("/join-room", joinRoomHandler)

	r.HandleFunc("/room/{id}/ws", serveRoom)

	r.HandleFunc("/history", serveHistory)
}

func main() {
	fmt.Println("Chat App Started")
	file, err := os.OpenFile("log.txt", os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal(err)
	}
	log.SetOutput(file)
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	log.Println("App started")

	err = godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	defer func() {
		file.Close()
	}()

	r := mux.NewRouter()

	go corridor.Serve()

	setupRoutes(r)

	serveAddress := ":" + os.Getenv("SERVE_PORT")

	if err := http.ListenAndServeTLS(serveAddress, os.Getenv("CERT_FILE"), os.Getenv("KEY_FILE"), r); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
