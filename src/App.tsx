import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './styles/App.css';
import {Home} from "./routes/Home";
import {LogIn} from "./routes/LogIn";
import {NotFound} from "./routes/NotFound";
import {NewWebsite} from "./routes/NewWebsite";
import {Services} from "./routes/Services";
import {AdminDashboard} from "./routes/AdminDashboard";


function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LogIn />} />
                <Route path="/websites/new" element={<NewWebsite />} />
                <Route path="/services" element={<Services />} />
                <Route path="/admin/dashboard" element={< AdminDashboard />} />
                <Route path='*' element={<NotFound />}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
