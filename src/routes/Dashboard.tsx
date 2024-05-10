import Header from "../components/Header";
import {Footer} from "../components/Footer";
import {useContext} from "react";
import {UserSessionContext} from "../contexts/user-session";
import {WebsitesPanel} from "../components/features/dashboard/WebsitesPanel";

export function Dashboard(){
    const userSession = useContext(UserSessionContext)?.userSession

    return (
        <div>
            <Header />

            <div className="main">

                <h2>Tableau de bord de {userSession?.fullName || "l'administrateur"}</h2>
                {/* NAV SUR LE COTE */}

                <WebsitesPanel userId={userSession?.userId} userToken={userSession?.loginToken} />

            </div>

            <Footer />
        </div>
    );
}