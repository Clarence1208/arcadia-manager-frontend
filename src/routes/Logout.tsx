import {useNavigate} from "react-router-dom";
import {Home} from "./Home";

export default function Logout() {

    localStorage.removeItem("userSession");
    window.location.href = "/"

    return <Home/>

}