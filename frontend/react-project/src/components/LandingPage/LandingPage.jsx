import React, { useState } from "react";
import Cookies from "universal-cookie"

const LandingPage = () => {

    var [username, setUsername] = useState("")
    var [roomID, setRoomID] = useState("")
    var [roomName, setRoomName] = useState("")
    var [joinRoom, setJoinRoom] = useState(false)
    var [endpoint, setEndpoint] = useState(joinRoom ? "join-room" : "new-room")

    const cookies = new Cookies()

    const extract = (str, pattern) => (str.match(pattern) || []).pop() || ''

    const handleRoomID = (event) => {
        let value = extract(event.target.value, "[0-9a-zA-Z]+")
        value = value.toLowerCase()

        if (value.length <= 4) {
            setRoomID(value)
        }
        setEndpoint("join-room")
    }
    
    const handleUsername = (event) => {
        let value = event.target.value
        if (value.length <= 32) {
            setUsername(value)
        }
    }
    
    const handleRoomName = (event) => {
        let value = event.target.value
        if (value.length <= 32) {
            setRoomName(value)
        }
    }
    const joinRoomMode = () => {
        setJoinRoom(true)
        setEndpoint("join-room")
    }

    const createRoomMode = () => {
        setJoinRoom(false)
        setEndpoint("new-room")
    }

    const clearCookies = () => {
        cookies.remove("session-name")
        cookies.remove("userID")
        cookies.remove("roomID")
    }

    const buttonFocusClasses = (isFocus) => isFocus ? " bg-sky-600 text-white underline underline-offset-8" : " bg-gray-200 text-gray-800 "

    return (
        <div className="pt-20 flex flex-col">
            <div className="w-80 mx-auto p-4 bg-white rounded-lg border-2 border-black">
                <div className="absolute w-64 z-10">
                    <div className="bg-gray-200 p-3 rounded-t-xl"></div>
                    <div className="bg-sky-600 p-4 rounded-b-xl"></div>
                </div>
                <div className="relative z-20 border-b-2 border-b-sky-600">
                    <button className={"w-1/2 p-4 rounded-lg rounded-bl-none font-semibold" + buttonFocusClasses(!joinRoom)} onClick={createRoomMode}>Create Room</button>
                    <button className={"w-1/2 p-4 rounded-lg rounded-br-none font-semibold" + buttonFocusClasses(joinRoom)} onClick={joinRoomMode}>Join Room</button>
                </div>
                <form action={endpoint} onSubmit={clearCookies} className="flex flex-col mt-1">
                    <div className="h-32 mb-2 rounded-b-lg">
                        <label htmlFor="username" className="py-1">User Name
                            <input type="text" name="username" value={username} onChange={handleUsername} className="w-full border-black border-2 rounded-md mt-1 p-1"></input>
                        </label>
                        {
                            !joinRoom &&
                            <label htmlFor="roomID">Room Name
                            <input type="text" name="roomName" value={roomName} onChange={handleRoomName} className="w-full border-black border-2 rounded-md mt-1 p-1"></input>
                        </label>
                        }
                        {
                            joinRoom &&
                            <label htmlFor="roomID">Room ID
                            <input type="text" name="roomID" value={roomID} onChange={handleRoomID} className="w-full border-black border-2 rounded-md uppercase mt-1 p-1"></input>
                        </label>
                        }
                    </div>
                    <input type="submit" value="Go!" className="bg-red-700 text-center text-white py-2 rounded-lg text-lg font-semibold mt-2"></input>
                </form>
            </div>
        </div>
    )
}

export default LandingPage