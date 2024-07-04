import {FormEvent, useContext, useEffect, useRef, useState} from "react";
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
import { uploadToS3 } from "../utils/s3";
import Logo from '../images/logo-green.svg';

type FormData = {
    firstName: string
    surname: string
    email: string
    password: string
    confirmPassword: string
    logoName: string
    url: string
    dbUsername: string,
    dbPassword: string,
    associationName: string;
}

type WebsiteData = {
    name: string;
    userId: number;
    subDomain: string;
    dbPassword: string;
    associationName: string;
    logoName: string;
}
const body: FormData = {
    firstName: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    logoName: "",
    url: "",
    dbUsername: "",
    dbPassword: "",
    associationName: ""
}

type Website = {
    id: number;
    url: string;
    associationName: string;
    status: string;
    logo: string | undefined;
}

export function NewWebsite() {
    const navigate = useNavigate()
    const userSessionContext = useContext(UserSessionContext)
    const userSession = userSessionContext?.userSession
    const [data, setData] = useState(body)
    const [errorMessage, setErrorMessage] = useState("")
    const [open, setOpen] = useState(false);
    const [websiteCreationProcess, setWebsiteCreationProcess] = useState({
        status: "idle",
        message: "Création du compte Arcadia en cours..."
    })
    const fileRef = useRef<File | null>(null);
    const specialChars = /[\[\];§¨£µ=+°\-'~²_`!@#$%^&*(),.?":{}|<>\/\\]/;
    const [websites, setWebsites] = useState<Website[]>([])  
    const [isWebsiteNameTaken, setIsWebsiteNameTaken] = useState(false)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>|null, action: boolean) => {
        if (action) {
            const file = event?.target.files?.[0];
            if (file) {
                fileRef.current = file;
                updateFields({logoName: file.name})
            }
        } else {
            fileRef.current = null;
            updateFields({logoName: ""})
        }
    };

    useEffect(() => {
            const getWebsites = async (): Promise<Website[]> => {
                const response: Response = await fetch(`${import.meta.env.VITE_API_URL}/websites`, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    setErrorMessage("Erreur : " + await error.message);
                    setOpen(true);
                    return []
                }
                const res = await response.json();
                return res;
            }
            getWebsites().then(setWebsites);
    }, [])

    function updateFields(fields: Partial<FormData>) {
        if (fields.url) {
            console.log(fields.url)
            fields.url = fields.url.toLowerCase();
            if (specialChars.test(fields.url)) {
                setErrorMessage("L'URL ne doit pas contenir de caractères spéciaux");
                setOpen(true);
                return
            }
            setIsWebsiteNameTaken(false);
            for (const website of websites) {
                console.log(website.url)
                if (website.url === fields.url) {
                    console.log("Website name taken")
                    setIsWebsiteNameTaken(true);
                    setErrorMessage("L'URL est déjà utilisée");
                    setOpen(true);
                    setData(prev => {
                        return {...prev, ...fields}
                    })
                    return
                }
            }
        }
        setErrorMessage("");
        setOpen(false);
        setData(prev => {
            return {...prev, ...fields}
        })
    }

    const handleClose = () => {
        setOpen(false);
        setErrorMessage("");
    };

    //If user already has an account and is logged in, don't need the user register form
    let forms = [
        <UserRegisterForm {...data} updateFields={updateFields} formError={errorMessage} handleClose={handleClose} open={open}
                          formTitle="Créer un compte Arcadia"
                          formDescription="Sur votre compte Arcadia, vous retrouverez vos sites, vos paiements et vos informations personnelles."/>,
        <WebsiteForm {...data} updateFields={updateFields} handleClose={handleClose} open={open} handleFileChange={handleFileChange} formError={errorMessage} formTitle="Créer un site internet"
                     formDescription="Ces informations seront utilisées pour configurer votre site."/>,
        <RecapForm {...data} updateFields={updateFields} formError={errorMessage} formTitle="Récapitulatif des données" handleClose={handleClose} open={open}
                   formDescription="Attention certaines informations ne pourront pas être modifiées ultèrieurement."/>
    ]
    if (userSession?.isLoggedIn) {
        forms = forms.slice(1, 2)
    }
    const {steps, currentStepIndex, step, isFirstStep, isLastStep, back, next} = useMultiStepForm(forms)


    async function createUser(userData:Partial<FormData>) {
        if (userData.password !== userData.confirmPassword) {
            setErrorMessage("Les mots de passe ne correspondent pas");
            setOpen(true);
            return
        }
        delete userData.confirmPassword;
        const response: Response = await fetch(import.meta.env.VITE_API_URL + "/users/register", {
            method: "POST",
            body: JSON.stringify(userData),
            headers: {"Content-Type": "application/json"}
        });
        if (!response.ok) {
            const error = await response.json()
            setErrorMessage("Erreur lors de la création du compte: " + await error.message);
            setOpen(true);
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
            setOpen(true);
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
        await deployAPI(scriptData, websiteDataDB);
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
        //POTENTIALLY A LAST HEALTH CHECK CALL AND A ROLLBACK IF ERROR
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
            setOpen(true);
            setWebsiteCreationProcess({...websiteCreationProcess, status: "Failed"})
            return;
        }
        return await response.json();
    }

    async function deployAPI(websiteData: WebsiteData, otherData: Partial<FormData>) {

        const userData = {
            adminEmail: otherData.dbUsername,
            firstName: otherData.firstName,
            surname: otherData.surname,
        }
        const data = {...websiteData, ...userData}

        const response: Response = await fetch(import.meta.env.VITE_API_URL + "/websites/scripts/apiDocker", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {"Content-Type": "application/json"}
        });
        if (!response.ok) {
            const error = await response.json()
            setErrorMessage("Erreur lors de la création du site web: " + await error.message);
            setOpen(true);
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
            setOpen(true);
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
            setOpen(true);
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
            setOpen(true);
            setWebsiteCreationProcess({...websiteCreationProcess, status: "done"})
            return
        }

        const res = await response.json();
        return res
    }

    const uploadLogo = async () => {
        const key = data.associationName + "/common/logo-" + fileRef.current?.name;
        try {
            await uploadToS3(fileRef.current!, key);
        } catch (error) {
            console.error("Error uploading logo: ", error);
            setErrorMessage("Erreur lors du chargement du logo: " + error);
            setOpen(true);
        }
    };

    const fetchLogoFile = async (): Promise<File> => {
        const response = await fetch(Logo);
        const blob = await response.blob();
        const file = new File([blob], 'logo-green.svg', { type: blob.type });
        return file;
      };

    async function onSubmit(e: FormEvent) {
        e.preventDefault()

        if (isWebsiteNameTaken) {
            setErrorMessage("L'URL est déjà utilisée");
            setOpen(true);
            return
        }

        if (!isLastStep) return next()

        let userID;
        setWebsiteCreationProcess({...websiteCreationProcess, status: "Starting process"})
        if (!userSession?.isLoggedIn) {
            const userData = {
                firstName: data.firstName,
                surname: data.surname,
                email: data.email,
                password: data.password,
                confirmPassword: data.confirmPassword
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
            userId: userID,
            associationName: data.associationName,
            logoName: data.logoName ?? "logo-logo-green.svg"
        }
        const websiteDataDB = {
            url: data.url,
            associationName: data.associationName,
            dbUsername: data.dbUsername,
            dbPassword: data.dbPassword,
            userId: userID
        }
        const website = await deployWesbite(scriptData,websiteDataDB)
        if (!website) return

        if (fileRef.current) {
            uploadLogo();
        } else {
            fileRef.current = await fetchLogoFile();
            uploadLogo();
        }

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
