import Header from "../components/Header";
import {Footer} from "../components/Footer";

export function Services() {
    return (
        <div>
            <Header/>

            <section className={"main"} id="services">
                <div>
                    <div className="service">
                        <h2>Création et déploiement de site web </h2><br></br>
                        <h3>En créant un compte chez Arcadia, vous aurez la possibilité de créer un site web pour votre
                            association</h3><br></br>
                        <h4>En 5 minutes, vous aurez accès à : </h4><br></br>
                        <ul>
                            <li>Un nom de domaine personnalisé en [votreNomDeDOmaine].arcadia-solution.com</li><br></br><br></br>
                            <li>Un site web personnalisable via un back office pour gérer vos contenus et administré le
                                site
                            </li><br></br><br></br>
                            <li>Un espace de stockage sécurisé pour vos fichiers</li><br></br><br></br>
                            <li>Un moyen de gérer vos assemblées générales et vos différents votes</li><br></br><br></br>
                            <li>Une gestion des dons et adhésions à votre association</li><br></br><br></br>
                            <li>La possibilité de crée des articles et sondages personalisés</li><br></br><br></br>
                        </ul>
                    </div>
                </div>
            </section>

            <Footer/>
        </div>
    );
}