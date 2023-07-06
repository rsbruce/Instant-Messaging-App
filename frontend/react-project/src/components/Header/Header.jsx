import Cookies from "universal-cookie";

const Header = () =>{
    const cookies = new Cookies()
    const roomName = cookies.get("roomName")
    const roomID = cookies.get("roomID")

    var displayRoomName = false

    try {
        var roomIDMatcher = new RegExp(/room\/(?<roomID>\w+)/)
        var potentialRoomIDMatch = window.location.pathname.match(roomIDMatcher).groups.roomID
    
        if (roomID.length > 0 && potentialRoomIDMatch != undefined && potentialRoomIDMatch == roomID) {
            displayRoomName = true
        }
    } catch (error) {
        console.log(error)
    }

    return (
        <div className="h-14 absolute bg-gray-700 p-4 w-full text-white">
            {
                !displayRoomName &&
                <h2>
                    <a href="/">Realtime Chat App</a>
                </h2>
            }
            {
                displayRoomName &&
                <h2>
                    <div className="font-semibold text-lg text-center">{roomName}  
                        <span className="hidden lg:inline">
                            &nbsp;
                            | Entry Code: <span className="uppercase underline font-bold">{roomID}</span>
                        </span>
                    </div>
                </h2>
            }
        </div>
    );
}


export default Header;
