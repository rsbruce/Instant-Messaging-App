import React, { useState, useRef, useEffect, useReducer } from "react";
import MessageGroup from "../MessageGroup/MessageGroup"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import * as ENV from '../../../env.json'

const ChatHistory = ({socket, clientID, roomID}) => {

    const reducer = (history, action) => {
        switch(action.type) {
            case 'history':
                try {
                    console.log(action.message)
                    setIsHistoryComplete(Boolean(action.message.complete))
                    return [...action.message.history.reverse(), ...history]
                } catch (error) {
                    console.log(error)
                    return history
                }
            case 'message':
                return [...history, action.message]
        }
    }

    const [lastMessageId, setLastMessageId] = useState("")
    const [isHistoryComplete, setIsHistoryComplete] = useState(true)
    const [chatHistory, updateChatHistory] = useReducer(reducer, [])
    const [disconnected , setDisconnected] = useState(false)

    const messagesEndRef = useRef(null)
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    
    const prependHistory = (before) => {
        fetch(`http://${ENV.BACKEND.HOST}:${ENV.BACKEND.PORT}/history?roomID=${roomID}&before=${before}`).then(
            (response) =>  {
                if (response.ok) {
                    return response.json()
                }
                throw("History request not OK")
            }
        ).then(
            (data) => {
                updateChatHistory({type: "history", message: data})
            }
        ).catch((error) => console.log(error))
    }

    const moreHistory = () => {
        if (chatHistory.length > 0) {
            let before = encodeURI(chatHistory[0].timestamp).replace("+", "%2b")
            prependHistory(before)
        }
    }

    const getMessageGroups = () => {
        let messageGroups = []
        let first = 0
        let afterLast = 0
        
        while (first < chatHistory.length && afterLast < chatHistory.length) {
            let bothSystemMessages = (chatHistory[first].type != "user_message" && chatHistory[afterLast].type != "user_message")
            let userMessageSameSender = (chatHistory[first].type == "user_message" && chatHistory[afterLast].type == "user_message" && chatHistory[first].userID == chatHistory[afterLast].userID)
            if (bothSystemMessages || userMessageSameSender) {
                afterLast++
            } else {
                messageGroups = [...messageGroups, chatHistory.slice(first, afterLast)]
                if (first == afterLast) afterLast++
                first = afterLast
            }
        }
        messageGroups = [...messageGroups, chatHistory.slice(first, afterLast)]

        return messageGroups
    }

    socket.onOpenHandler = () => {
        prependHistory("")
    }
    socket.onCloseHandler = () => {
        setDisconnected(true)
    }

    socket.onMessageHandler = (msg) => {
        let message = JSON.parse(msg.data)
        try {
            if (message.type) {
                updateChatHistory({type: 'message', message: message})
            }
        } catch (error) {
            console.log(error)
        }
        if (message.userID != undefined) setLastMessageId(message.userID)
    }

    useEffect(() => {
        try{
            let chatWindow = document.getElementById("chat-window")
            if (lastMessageId == clientID || (chatWindow != null && (chatWindow.scrollTopMax - chatWindow.scrollTop < 300))) {
                scrollToBottom()
            } 
        } catch (error) {
            console.log(error)
        }
    }, [chatHistory]);

    var messageGroups = []
    try {
        messageGroups = getMessageGroups()
    } catch(error) {
        console.log(error)
    }

    let messageGroupComponents = messageGroups.map((group, i) => <MessageGroup messages={group} clientID={clientID} key={i}/> )

    return (
        <div id="chat-window" className={"bg-white mx-auto flex flex-col w-full px-4 pb-2 mt-2 rounded-md grow border-black border-2 "
            + " " + (disconnected ? "overflow-hidden" : "overflow-auto")}>
            {
                disconnected &&
                <div className="flex justify-center flex-col items-center absolute top-0 left-0 h-full w-full bg-gray-500/50 z-20">
                    <div className="loader text-xl w-24 h-24">🌀</div>
                    <div class="mt-12 p-2 bg-white border-black border text-xl rounded-md">
                        Lost Connection
                        <a href={window.location.href} className="block text-white bg-sky-600 text-sm font-semibold rounded-md mt-1 mx-auto p-2 text-center">
                        Reload window?
                        </a>
                    </div>
                </div>
            }
            {
                !isHistoryComplete &&
                <button className="text-white bg-sky-600 text-sm font-semibold rounded-md mt-1 mx-auto p-2 uppercase" onClick={moreHistory}><FontAwesomeIcon icon={faPlus}/> Click for more messages</button>
            }
            {messageGroupComponents}
            <div ref={messagesEndRef} />
        </div>
    );
}

export default ChatHistory;
