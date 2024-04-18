import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './styles/App.css';
import {Home} from "./routes/Home";
import {LogIn} from "./routes/LogIn";
import {NotFound} from "./routes/NotFound";
import {NewService} from "./routes/NewService";


function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LogIn />} />
                <Route path="/websites/new" element={<NewService />} />
                <Route path='*' element={<NotFound />}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
