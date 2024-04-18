import Header from "../components/Header";
import '../styles/Home.css';
import Logo from '../images/logo-black.svg';
import {Button} from "@mui/material";
import {Footer} from "../components/Footer";

export function Home() {

        return (
            <div>
                <Header />
                <div id="section-presentation">
                    <img src={Logo} alt={"logo"} />
                    <div>
                        <h1>Créer le site pour votre association 100 % personalisable en <span className="green">5 minutes</span> !</h1>
                        <Button variant="contained" color="primary">Créer un site</Button>
                    </div>
                </div>
                <Footer />
                </div>
        );
}