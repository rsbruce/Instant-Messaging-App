import * as ENV from '../../../env.json'

import { useEffect, useState } from "react"
import Cookies from "universal-cookie"
import Loader from "../Loader/Loader"

const Lobby = () => {

    const [clientID, setClientID] = useState("")
    const [roomID, setRoomID] = useState("")
    const [roomName, setRoomName] = useState("")

    const cookieMatcher = RegExp(/(?<key>.*?)=(?<value>.*?);\s?(?<options>.*)/) 
    const hostURLMatcher = new RegExp(/(.*\.)?(?<host>.*?\.[^\.]*)/)
    const cookies = new Cookies()

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    const redirectToRoom = () => {
        window.location.href = window.location.protocol + "//" + window.location.host + "/room/" + roomID
    }

    var requestURL = `http://${ENV.BACKEND.HOST}`
    if (ENV.BACKEND.PORT) requestURL += `:${ENV.BACKEND.PORT}`

    const parseOptions = (arr) => {
        let options = {"sameSite": "none", "secure": true}
        try {
            options["domain"] = "." + ENV.BACKEND.HOST.match(hostURLMatcher).groups.host
        } catch {
            console.log("Cookie set to localhost.")
            options["domain"] = "localhost"
        }
        let re = RegExp(/(?<key>.*?)=(?<value>.*)/)
        arr.map((elem) => {
            let matches = elem.match(re)
            options[matches.groups.key] = matches.groups.value
        })
        options["path"] = options["Path"]
        options["expires"] = new Date(Date.now() + Date.parse(options["Expires"]))
        options["maxAge"] = parseInt(options["Max-Age"])
        options["encode"] = (string) => string

        return options
    }

    if (window.location.pathname == "/new-room" || window.location.pathname == "/join-room") {

        requestURL += (window.location.pathname + "?" + urlSearchParams.toString())

        useEffect(() => {
            if (cookies.get("userID") || cookies.get("roomID")) {
                return
            }

            fetch(requestURL, { rejectUnauthorized: false }).then(
                (response) =>  {
                    if (response.ok) {
                        return response.json()
                    } else {
                        throw new Error("Request for room failed")
                    }
                } 
            ).then(
                (data) => {
                    try {
                        console.log(data)
                        let matches = data.auth.match(cookieMatcher)
                        let key = matches.groups.key
                        let value = matches.groups.value
                        let options = parseOptions(matches.groups.options.split(";").map((e) => e.trim()))
                        console.log("COOKIE VALUE: ", value)
                        cookies.set(key, value, options)
                        setClientID(data.userID)
                        cookies.set("userID", data.userID)
                        setRoomID(data.roomID || params.roomID)
                        cookies.set("roomID", data.roomID || params.roomID)
                        setRoomName(data.roomName)
                        cookies.set("roomName", data.roomName)
                    } catch {
                        console.log(error)
                    }
                }
            ).catch((error) => {
                console.log(error)
            })
        }, [])
    } 

    if (!clientID || !roomID || !roomName) {
        return <Loader />
    } else {
        redirectToRoom()
    }
} 

export default Lobby