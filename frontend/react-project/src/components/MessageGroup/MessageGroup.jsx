import Message from "../Message/Message"

const MessageGroup = ({messages, clientID}) => {

    var group = messages
    .map((msg, i) => {
        return <Message message={msg} key={msg.timestamp} clientID={clientID} first={i==0} last={i==messages.length - 1}/>
    })

    return (
        <div className="flex flex-col gap-0.5 mt-2">
            {group}
        </div> 
    )
}

export default MessageGroup