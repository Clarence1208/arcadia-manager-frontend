import React, {useContext} from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './styles/App.css';
import {Home} from "./routes/Home";
import {LogIn} from "./routes/LogIn";
import {NotFound} from "./routes/NotFound";
import {NewWebsite} from "./routes/NewWebsite";
import {Services} from "./routes/Services";
import {Dashboard} from "./routes/Dashboard";
import {UserSessionContext, UserSessionProvider} from "./contexts/user-session";
import Logout from "./routes/Logout";

function App() {

    return (
        <BrowserRouter>
            <UserSessionProvider>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LogIn />} />
                <Route path="/websites/new" element={<NewWebsite />} />
                <Route path="/services" element={<Services />} />
                <Route path="/dashboard" element={< Dashboard />} />

                <Route path="/logout" element={<Logout />} />
                <Route path='*' element={<NotFound />}/>
            </Routes>
            </UserSessionProvider>
        </BrowserRouter>
    );
}

export default App;
