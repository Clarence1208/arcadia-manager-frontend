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
    url: string
    dbUsername: string,
    dbPassword: string,
}

type WebsiteData = {
    name: string;
    userId: number;
    subDomain: string;
    dbPassword: string
}
const body: FormData = {
    firstName: "",
    surname: "",
    email: "",
    password: "",
    url: "",
    dbUsername: "",
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

    async function deployWesbite(scriptData: WebsiteData, websiteDataDB: Partial<FormData>) {

        setWebsiteCreationProcess({
            ...websiteCreationProcess,
            status: "loading",
            message: "Création du site web en cours..."
        })

        const website = await createWebsite(websiteDataDB);
        await new Promise(r => setTimeout(r, 1000))

        setWebsiteCreationProcess({
            ...websiteCreationProcess,
            status: "loading",
            message: "Déploiement du domaine en cours..."
        })
        await deployDomain(scriptData);
        await new Promise(r => setTimeout(r, 1000))


        setWebsiteCreationProcess({
            ...websiteCreationProcess,
            status: "loading",
            message: "Déploiement API en cours..."
        })
        await deployAPI(scriptData);
        await new Promise(r => setTimeout(r, 1000))

        setWebsiteCreationProcess({
            ...websiteCreationProcess,
            status: "loading",
            message: "Déploiement Front en cours..."
        })
        await deployFront(scriptData);
        await new Promise(r => setTimeout(r, 1000))

        setWebsiteCreationProcess({
            ...websiteCreationProcess,
            status: "loading",
            message: "Déploiement NGINX en cours..."
        })
        await deployNGINX(scriptData);
        //wait a bit
        await new Promise(r => setTimeout(r, 2000))


        setWebsiteCreationProcess({
            ...websiteCreationProcess,
            status: "done",
            message: "Votre site a été créé avec succès!"
        })
        //POTENTIALLY A LAST HEALTH CHECK CALL AND INSERTING DATA INTO DATABASE
        return website;
    }

    async function deployDomain(websiteData: WebsiteData) {
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

    async function deployAPI(websiteData: WebsiteData) {
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

    async function deployFront(websiteData: WebsiteData) {
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

    async function deployNGINX(websiteData: WebsiteData) {
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


    async function createWebsite(websiteData: Partial<FormData>) {
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

        let userID;
        setWebsiteCreationProcess({...websiteCreationProcess, status: "Starting process"})
        if (!userSession?.isLoggedIn) {
            const userData = {
                firstName: data.firstName,
                surname: data.surname,
                email: data.email,
                password: data.password
            }
            const user = await createUser(userData)
            if (!user) return
            userID = user.id
            setWebsiteCreationProcess({...websiteCreationProcess,  message: "Votre compte a été créé avec succès!"})
            await logInUser(data.email, data.password);
        }
        else {
            userID = userSession?.userId
        }

        const scriptData :WebsiteData = {
            subDomain: data.url,
            name: data.dbUsername,
            dbPassword: data.dbPassword,
            userId: userID
        }
        const websiteDataDB = {
            url: data.url,
            dbUsername: data.dbUsername,
            dbPassword: data.dbPassword,
            userId: userID
        }
        const website = await deployWesbite(scriptData,websiteDataDB)
        if (!website) return

        //wait a bit before redirecting
        await new Promise(r => setTimeout(r, 2000))

        navigate("/dashboard")
    }

    if (websiteCreationProcess.status === "loading") {
        return <LoadingSpinner message={websiteCreationProcess.message}/>
    }
    if (websiteCreationProcess.status === "done") {
        return (
            <div>
                <Header/>
                <div className={"main"}>
                        <div style={{position: "absolute", top: ".5rem", right: ".5rem"}}>
                            Etape {currentStepIndex + 1} / {steps.length}
                        </div>
                        <Collapse in={open}>
                            <Alert severity="success" onClose={() => setOpen(false)}>
                                {websiteCreationProcess.message}
                            </Alert>
                        </Collapse>
                </div>
                <Footer/>
            </div>
        )
    }

    return (
        <div>
            <Header/>
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
