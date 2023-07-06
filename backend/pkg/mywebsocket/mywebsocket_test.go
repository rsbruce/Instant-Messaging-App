package mywebsocket

// // (*Room).getWelcomeMessage
// func TestGetWelcomeMessage(t *testing.T) {
// 	room := NewRoom()

// 	req, err := http.NewRequest("GET", "/room/" + room.ID + "/ws", nil)
//     if err != nil {
//         t.Fatal(err)
//     }

// 	rr := httptest.NewRecorder()

// 	conn, err := Upgrade(rr, req)
// 	if err != nil {
// 		t.Error(err)
// 	}

// 	client := &Client {
// 		ID : gocql.TimeUUID().String(),
// 		Username: "Test User",
// 		Conn: conn,
// 		Room: room,
// 	}
// 	room.getWelcomeMessage(client, false)
// }
// // (*Room).getWelcomeMessage
// func TestGetFellowUserJoinedMessage(t *testing.T) {
// 	room := NewRoom()

// 	req, err := http.NewRequest("GET", "/room/" + room.ID + "/ws", nil)
//     if err != nil {
//         t.Fatal(err)
//     }

// 	rr := httptest.NewRecorder()

// 	conn, err := Upgrade(rr, req)
// 	if err != nil {
// 		t.Error(err)
// 	}

// 	client := &Client {
// 		ID : gocql.TimeUUID().String(),
// 		Username: "Test User",
// 		Conn: conn,
// 		Room: room,
// 	}
// 	room.getFellowUserJoinedMessage(client, false)
// }
// // (*Room).getUserDisconnectedMessage
// func TestGetUserDisconnectedMessage(t *testing.T) {
// 	room := NewRoom()

// 	req, err := http.NewRequest("GET", "/room/" + room.ID + "/ws", nil)
//     if err != nil {
//         t.Fatal(err)
//     }

// 	rr := httptest.NewRecorder()

// 	conn, err := Upgrade(rr, req)
// 	if err != nil {
// 		t.Error(err)
// 	}

// 	client := &Client {
// 		ID : gocql.TimeUUID().String(),
// 		Username: "Test User",
// 		Conn: conn,
// 		Room: room,
// 	}
// 	room.getUserDisconnectedMessage(client)
// }

// // NewRoom
// func TestNewRoom(t *testing.T) {
// 	return
// }

// // (*Room).saveMessage
// func TestSaveMessage(t *testing.T) {

// }

// // mywebsocket.Room.Start()
// func TestRegsisterClient(t *testing.T) {

// }

// // mywebsocket.Room.Start()
// func TestUnregsisterClient(t *testing.T) {

// }

// // mywebsocket.Room.Start()
// func TestBroadcast(t *testing.T) {

// }

// // mywebsocket.Client.Read()
// func TestClientRead(t *testing.T) {

// }

// // mywebsocket.Websocket.Upgrade(w http.ResponseWriter, r *http.Request)
// func TestWebsocketUpgrade(t *testing.T){

// }