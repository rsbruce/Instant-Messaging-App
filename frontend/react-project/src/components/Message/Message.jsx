import * as systemMessageBodies from "../../systemMessages.json"

const Message = ({message, clientID, first, last}) => {
    const isFromSelf = () => {
        try {
            return (message.userID === clientID && message.type == "user_message")
        } catch (error) {
            console.log(error)
            return false
        }
    }

    const isFromOther = () => {
        try {
            return (message.userID != clientID && message.type == "user_message")
        } catch (error) {
            console.log(error)
            return true
        }
    }
    
    const getMessageClassName = () => {
        if (fromSelf) {
            return "float-right bg-emerald-400 py-2 px-1 rounded-md" 
        } else if (message.type != "user_message") {
            return "text-center mx-auto bg-gray-200 text-black uppercase text-xs rounded-md p-2 my-1 w-52"
        } else {
            return "float-left rounded-md py-2 px-1 bg-gray-200"
        }

    }

    var fromSelf = isFromSelf()
    var fromOther = isFromOther()

    if (message.type != "user_message") {
        let systemMessageBody = systemMessageBodies[message.type].body
        message.body = systemMessageBody.replace("%s", (message.userID == clientID ? "You" : message.username))
    }

    return (
        message.body !== undefined && message.body.length > 0 &&
        <div className={fromSelf ? "xl:pl-20 md:pl-12 pl-6" : fromOther ? "xl:pr-20 md:pr-12 pr-6" : ""} >
            <div className={getMessageClassName()}>
                {
                    fromOther && first && 
                    <div className="text-xs border-b border-gray-500 px-1">
                        {message.username}
                    </div>
                }
                <div className="px-1">
                    {message.body}
                </div>
            </div>
        </div>
    );

}

export default Message;
