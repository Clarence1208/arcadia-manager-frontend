import Header from "../components/Header";
import {Footer} from "../components/Footer";

export function Contact() {
  return (
    <div>
     <Header />
        <div className="main">
            <h1>Contact</h1>
            <p>Vous pouvez nous contacter à l'adresse suivante : do-not-contact-us@it-s-a-fake-email.com
            </p>
        </div>
        <Footer />
    </div>
  );
}