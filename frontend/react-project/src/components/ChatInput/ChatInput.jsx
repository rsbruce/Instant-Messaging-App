import React, {useState} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeftLong, faPaperPlane } from '@fortawesome/free-solid-svg-icons'

const ChatInput = ({socket}) => {


    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.protocol + "//" + window.location.host)
        setShareTooltip(linkCopied)
        setTimeout(() => setShareTooltip(copyLink), 5000)
    }

    let keyboardSend = (event) => {
        if (event.keyCode === 13) {
            if(socket){
                socket.sendMsg(event.target.value);
            }
            event.target.value = "";
        }
    }
    let UISend = () => {
        if(socket && (document.getElementById("message-input") != null)){
            socket.sendMsg(document.getElementById("message-input").value)
            document.getElementById("message-input").value = ""
        }
    }

    return (
        <div className="my-4 flex gap-3">
            <button className="hidden lg:block font-semibold text-white bg-red-600 w-16 rounded-md border-2 border-red-900">
                <a href="/" className="w-full block py-2"><FontAwesomeIcon icon={faArrowLeftLong} /></a>
            </button>
            <button className="font-semibold text-white bg-emerald-500 lg:w-16 w-12 rounded-md border-2 border-emerald-900" onClick={UISend}>
                <FontAwesomeIcon icon={faPaperPlane} />
            </button>
            <input id="message-input" placeholder="Write a message..." className="grow p-2 border-black border-2 text-base rounded-md shadow-md" onKeyDown={keyboardSend}></input>

        </div>
    );
}

export default ChatInput;
