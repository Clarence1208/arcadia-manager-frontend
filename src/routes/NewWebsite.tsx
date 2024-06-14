import {FormEvent, useContext, useState} from "react";
import {useMultiStepForm} from "../components/features/useMultipleStepForm";
import {UserRegisterForm} from "../components/features/form/UserRegisterForm";
import {WebsiteForm} from "../components/features/form/WebsiteForm";
import {RecapForm} from "../components/features/form/RecapForm";
import Collapse from '@mui/material/Collapse';
import '../styles/Form.css';
import Header from "../components/Header";
import {Footer} from "../components/Footer";
import {Alert, Button} from "@mui/material";
import LoadingSpinner from "../components/LoadingSpinner";
import {UserSessionContext} from "../contexts/user-session";
import {useNavigate} from "react-router-dom";

type FormData = {
    firstName: string
    surname: string
    email: string
    password: string
    subDomain: string,
    name: string,
    dbPassword: string,
}
const body: FormData = {
    firstName: "",
    surname: "",
    email: "",
    password: "",
    subDomain: "",
    name: "",
    dbPassword: ""
}

export function NewWebsite() {
    const navigate = useNavigate()
    const userSessionContext = useContext(UserSessionContext)
    const userSession = userSessionContext?.userSession
    const [data, setData] = useState(body)
    const [errorMessage, setErrorMessage] = useState("")
    const [open, setOpen] = useState(true);
    const [websiteCreationProcess, setWebsiteCreationProcess] = useState({
        status: "idle",
        message: "Création du compte Arcadia en cours..."
    })

    function updateFields(fields: Partial<FormData>) {
        setData(prev => {
            return {...prev, ...fields}
        })
    }

    //If user already has an account and is logged in, don't need the user register form
    let forms = [
        <UserRegisterForm {...data} updateFields={updateFields} formError={errorMessage}
                          formTitle="Créer un compte Arcadia"
                          formDescription="Sur votre compte Arcadia, vous retrouverez vos sites, vos paiements et vos informations personnelles."/>,
        <WebsiteForm {...data} updateFields={updateFields} formError={errorMessage} formTitle="Créer un site internet"
                     formDescription="Ces informations seront utilisées pour configurer votre site."/>,
        <RecapForm {...data} updateFields={updateFields} formError={errorMessage} formTitle="Récapitulatif des données"
                   formDescription="Attention certaines informations ne pourront pas être modifiées ultèrieurement."/>
    ]
    if (userSession?.isLoggedIn) {
        forms = forms.slice(1, 2)
    }
    const {steps, currentStepIndex, step, isFirstStep, isLastStep, back, next} = useMultiStepForm(forms)


    async function createUser(userData: { firstName: string; password: string; surname: string; email: string }) {

        const response: Response = await fetch(import.meta.env.VITE_API_URL + "/users/register", {
            method: "POST",
            body: JSON.stringify(userData),
            headers: {"Content-Type": "application/json"}
        });
        if (!response.ok) {
            const error = await response.json()
            setErrorMessage("Erreur lors de la création du compte: " + await error.message);
            setWebsiteCreationProcess({...websiteCreationProcess, status: "done"})
            return
        }
        const res = await response.json();
        return res
    }

    async function logInUser(email: string, password: string) {
        const response: Response = await fetch(import.meta.env.VITE_API_URL + "/users/login", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {"Content-Type": "application/json"}
        });
        if (!response.ok) {
            const error = await response.json()
            setErrorMessage("Erreur : " + await error.message);
            return
        }
        setErrorMessage("");
        const res = await response.json();
        if (userSessionContext) {
            userSessionContext.updateUserSession({
                userId: res.id, loginToken: res.loginToken,
                fullName: res.firstName + " " + res.surname, isLoggedIn: true
            })
        }
    }

    async function deployWesbite(websiteData: { name: string; userId: number; subDomain: string; dbPassword: string }) {

        // setWebsiteCreationProcess({...websiteCreationProcess, status: "Début de create"})
        // createWebsite(websiteData);

        setWebsiteCreationProcess({...websiteCreationProcess, status: "Déploiement du domaine"})
        await deployDomain(websiteData);

        setWebsiteCreationProcess({...websiteCreationProcess, status: "Déploiement API"})
        await deployAPI(websiteData);

        setWebsiteCreationProcess({...websiteCreationProcess, status: "DÉPLOIEMENT FRONT"})
        await deployFront(websiteData);

        setWebsiteCreationProcess({...websiteCreationProcess, status: "Début de create"})
        await deployNGINX(websiteData);

        //POTENTIALLY A LAST HEALTH CHECK CALL

    }

    async function deployDomain(websiteData: { name: string; userId: number; subDomain: string; dbPassword: string }) {
        const response: Response = await fetch(import.meta.env.VITE_API_URL + "/websites/scripts/domain", {
            method: "POST",
            body: JSON.stringify(websiteData),
            headers: {"Content-Type": "application/json"}
        });
        if (!response.ok) {
            const error = await response.json()
            setErrorMessage("Erreur lors de la création du site web: " + await error.message);
            setWebsiteCreationProcess({...websiteCreationProcess, status: "Failed"})
            return;
        }
        return await response.json();
    }

    async function deployAPI(websiteData: { name: string; userId: number; subDomain: string; dbPassword: string }) {
        const response: Response = await fetch(import.meta.env.VITE_API_URL + "/websites/scripts/apiDocker", {
            method: "POST",
            body: JSON.stringify(websiteData),
            headers: {"Content-Type": "application/json"}
        });
        if (!response.ok) {
            const error = await response.json()
            setErrorMessage("Erreur lors de la création du site web: " + await error.message);
            setWebsiteCreationProcess({...websiteCreationProcess, status: "Failed"})
            return;
        }
        return await response.json();
    }

    async function deployFront(websiteData: { name: string; userId: number; subDomain: string; dbPassword: string }) {
        const response: Response = await fetch(import.meta.env.VITE_API_URL + "/websites/scripts/frontDocker", {
            method: "POST",
            body: JSON.stringify(websiteData),
            headers: {"Content-Type": "application/json"}
        });
        if (!response.ok) {
            const error = await response.json()
            setErrorMessage("Erreur lors de la création du site web: " + await error.message);
            setWebsiteCreationProcess({...websiteCreationProcess, status: "Failed"})
            return;
        }
        return await response.json();
    }

    async function deployNGINX(websiteData: { name: string; userId: number; subDomain: string; dbPassword: string }) {
        const response: Response = await fetch(import.meta.env.VITE_API_URL + "/websites/scripts/confNGINX", {
            method: "POST",
            body: JSON.stringify(websiteData),
            headers: {"Content-Type": "application/json"}
        });
        if (!response.ok) {
            const error = await response.json()
            setErrorMessage("Erreur lors de la création du site web: " + await error.message);
            setWebsiteCreationProcess({...websiteCreationProcess, status: "Failed"})
            return;
        }
        return await response.json();
    }


    async function createWebsite(websiteData: { dbUsername: string; userId: number; url: string; dbPassword: string }) {
        const response: Response = await fetch(import.meta.env.VITE_API_URL + "/websites", {
            method: "POST",
            body: JSON.stringify(websiteData),
            headers: {"Content-Type": "application/json"}
        });
        if (!response.ok) {
            const error = await response.json()
            setErrorMessage("Erreur lors de la création du site web: " + await error.message);
            setWebsiteCreationProcess({...websiteCreationProcess, status: "done"})
            return
        }

        const res = await response.json();
        return res

    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        if (!isLastStep) return next()

        let user;
        setWebsiteCreationProcess({...websiteCreationProcess, status: "Starting process"})
        /*if (!userSession?.isLoggedIn) {
            const userData = {
                firstName: data.firstName,
                surname: data.surname,
                email: data.email,
                password: data.password
            }
            user = await createUser(userData)
            if (!user) return
            setWebsiteCreationProcess({...websiteCreationProcess,  message: "Votre compte a été créé avec succès!"})
        }*/

        const websiteData = {
            subDomain: data.subDomain,
            name: data.name,
            dbPassword: data.dbPassword,
            userId: userSession?.userId || 1
        }
        const website = await deployWesbite(websiteData)
        // const website = await createWebsite(websiteData)
        // if (!website) return

        // setWebsiteCreationProcess({...websiteCreationProcess, status: "done", message: "Votre site a été créé avec succès!"})
        navigate("/dashboard")
    }

    return (
        <div>
            <Header/>
            {websiteCreationProcess.status === "loading" && <LoadingSpinner message={websiteCreationProcess.message}/>}
            {websiteCreationProcess.status === "done" && <Collapse in={open}><Alert severity={"success"}
                                                                                    onClose={() => setOpen(false)}>{websiteCreationProcess.message}</Alert></Collapse>}
            <div id={"create-website-page"}>
                <div style={{display: "flex", justifyContent: "center"}}>
                    <div style={{
                        minWidth: "40vw",
                        position: "relative",
                        border: "1px solid black",
                        padding: "2rem",
                        margin: "1rem",
                        borderRadius: ".5rem",
                        maxWidth: "max-content"
                    }}>

                        <form onSubmit={onSubmit}>
                            <div style={{position: "absolute", top: ".5rem", right: ".5rem"}}>
                                Etape {currentStepIndex + 1} / {steps.length}
                            </div>
                            {step}
                            <div style={{
                                marginTop: "1rem",
                                display: "flex",
                                gap: ".5rem",
                                justifyContent: "flex-end"
                            }}>
                                {!isFirstStep && (
                                    <Button id="back-button" color="primary" variant={"outlined"} disableElevation
                                            onClick={back}>Back</Button>

                                )}
                                <Button id="next-button" color="primary" variant="contained" disableElevation
                                        type="submit">{isLastStep ? "Finish" : "Next"}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}
