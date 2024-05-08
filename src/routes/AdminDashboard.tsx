import Header from "../components/Header";
import {Footer} from "../components/Footer";
import {useContext} from "react";
import {UserSessionContext} from "../contexts/user-session";

export function AdminDashboard(){
    const userSession = useContext(UserSessionContext)

    return (
        <div>
            <Header />

            <div className="main">

                <h2>Tableau de bord de {userSession?.fullName || "l'administrateur"}</h2>
                {/* NAV SUR LE COTE */}

            </div>

            <Footer />
        </div>
    );
}