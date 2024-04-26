import Header from "../components/Header";
import {Footer} from "../components/Footer";

export function Services(){
    return (
        <div>
            <Header />

            <section className={"main"} id="services">
                <div>
                    <div className="service">
                        <h2>Création et déploiement de site web </h2>
                        <p>En créant un compte chez Arcadia, vous aurez la possibilité de créer un site web pour votre association</p>
                        <p>En 5 minutes, vous aurez accès à : </p>
                        <ul>
                            <li>Un nom de domaine personnalisé en [votreNomDeDOmaine].arcadia-solution.com</li>
                            <li>Un site web personnalisable via un back office pour gérer vos contenus et administré le site</li>
                            <li>Un espace de stockage sécurisé pour vos fichiers </li>
                            <li>Un moyen de gérer vos assemblées générales et vos différents votes</li>
                            <li>Une gestion des dons et adhésions à votre association</li>
                        </ul>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}