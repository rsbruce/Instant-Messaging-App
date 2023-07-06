import { createRoot } from "react-dom/client"
import { Link, BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";
import ChatRoom from "./components/ChatRoom/ChatRoom"
import LandingPage from "./components/LandingPage/LandingPage";
import Lobby from "./components/Lobby/Lobby";

const App = () => {
    return (
        <BrowserRouter>
        <div className="h-screen flex flex-col bg-gray-600">
            <Header /> 
            <div className="h-full pt-14 container mx-auto flex-grow">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/new-room" element={<Lobby />} />
                    <Route path="/join-room" element={<Lobby  />} />
                    <Route path="/room/:id" element={<ChatRoom />} />
                </Routes>
            </div>
        </div>
        </BrowserRouter>
    )
}

const container = document.getElementById("root")
const root = createRoot(container)
root.render(<App />)