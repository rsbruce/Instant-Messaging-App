import ChatHistory from "../ChatHistory/ChatHistory";
import ChatInput from "../ChatInput/ChatInput";
import WebSocketConnection from "../../api/WebSocketConnection";
import Cookie from "universal-cookie"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeftLong, faShareNodes } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from "react";

const ChatRoom = () => {

    const cookies = new Cookie()
    const roomID = cookies.get("roomID")
    const userID = cookies.get("userID")
    var pathRoomID = ""

    const roomNotFound = () => {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center gap-2">
                <span className="text-white text-3xl font-bold">Room not found :/</span>
                <button className="font-semibold text-white bg-red-600 w-36 rounded-md border-2 border-red-900">
                    <a href="/" className="w-full block py-2">
                        <FontAwesomeIcon icon={faArrowLeftLong} />
                        <span className="pl-2">Back to Home</span>
                    </a>
                </button>
            </div>
        )
    }

    try {
        let roomIDMatcher = new RegExp(/room\/(?<roomID>\w+)/)
        var potentialRoomIDMatch = window.location.pathname.match(roomIDMatcher).groups.roomID
    
        if (roomID.length > 0 && potentialRoomIDMatch != undefined && potentialRoomIDMatch == roomID) {
            pathRoomID = roomID
        } else {
            return roomNotFound()
        }
    } catch (error) {
        console.log(error)
    }

    var socket
    if (roomID && userID){
        socket = new WebSocketConnection(`room/${roomID}/ws`)
    }
    if (socket != undefined) {
        return (
            <div className="h-full flex flex-col justify-between px-4">
                <div className="flex gap-1 pt-2">
                    <button className="font-semibold block lg:hidden text-white bg-red-600 w-12 rounded-md border-2 border-red-900">
                        <a href="/" className="w-full block py-2"><FontAwesomeIcon icon={faArrowLeftLong} /></a>
                    </button>
                    <span className="grow flex items-center lg:hidden font-semibold text-white bg-sky-600 rounded-md border-2 border-sky-900">
                        <span className="mx-auto">Entry Code: <span className="uppercase underline font-bold">{roomID}</span></span>
                    </span>
                </div>
                <ChatHistory socket={socket} clientID={userID} roomID={roomID}></ChatHistory>
                <ChatInput socket={socket}/>
            </div>
        )
    }

}

export default ChatRoom