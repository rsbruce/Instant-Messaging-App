import * as ENV from '../../env.json'

class WebSocketConnection {
    constructor(path, onMessageHandler) {
        try {
            let protocol = ENV.IM_APP_ENV == 'PRODUCTION' ? 'https' : 'http'
            this.socket = new WebSocket(`${protocol}://${ENV.BACKEND.HOST}:${ENV.BACKEND.PORT}/${path}`) 
        } catch (error) {
            console.log(error)
        }
        this.onMessageHandler = onMessageHandler
        this.onOpenHandler = () => {}
        this.onCloseHandler = () => {}
        this.clientID = ""
        this.history = []
        this.setup()
    }

    setup() {
        console.log("Attempting Connection...");
    
        this.socket.onopen = () => {
            console.log("Successfully connected");
            console.log(this.onOpenHandler)
            if (typeof(this.onOpenHandler) == "function") {
                this.onOpenHandler();
            }
        };
    
        this.socket.onmessage = (msg) => {
            // console.log(msg);
            if (typeof(this.onMessageHandler) == "function") {
                this.onMessageHandler(msg);
            }
        };
    
        this.socket.onclose = (event) => {
            console.log("this.socket Closed Connection: ", event);
            if (typeof(this.onCloseHandler) == "function") {
                this.onCloseHandler();
            }
        };
    
        this.socket.onerror = (error) => {
            console.log("this.socket error: ", error);
        };
    };
    
    sendMsg(msg) {
        console.log("sending msg: ", msg);
        this.socket.send(msg);
    };
    
}

export default WebSocketConnection