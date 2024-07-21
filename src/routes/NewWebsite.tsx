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
import emailjs from "@emailjs/browser";
import {Elements, useElements, useStripe} from "@stripe/react-stripe-js";
import {ConfirmationToken, loadStripe, Stripe, StripeElements, StripeElementsOptions} from "@stripe/stripe-js";

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
    stripe?: Stripe;
    elements?: StripeElements;
    priceId?: string;
}

type User = {
    id: number;
    email: string;
    firstName: string;
    surname: string;
    roles: string;
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
    associationName: "",
    priceId:"price_1PdKGhBvbnM6p69ye4fbiWco", //default value test =price_1PcSauBvbnM6p69y2trJmBzR and default value prod= price_1PdKGhBvbnM6p69ye4fbiWco
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
    const specialChars = /[\[\];§¨£µ=+°\-'~²_`!@#$%^&*(),.?":{}|<>\/\\éèàëêôâîûüäùö]/;
    const [websites, setWebsites] = useState<Website[]>([])  
    const [isWebsiteNameTaken, setIsWebsiteNameTaken] = useState(false)

    // Stripe configuration
    const stripePromise = loadStripe("pk_live_51PPPaZBvbnM6p69y7vH2KFYTrszO7Mu94ZlkdSl2hJqk4nJszkBoCEM26kytyJLg1Wk4W6YJ33YwjUjcaenutVqj005pVjqnpO");
    const stripeOptions: StripeElementsOptions = {
        mode: 'subscription',
        amount: 50,
        currency: 'eur',
        paymentMethodCreation: 'manual',
    };


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
            fields.url = fields.url.toLowerCase();
            if (specialChars.test(fields.url)) {
                setErrorMessage("L'URL ne doit pas contenir de caractères spéciaux");
                setOpen(true);
                return
            }
            setIsWebsiteNameTaken(false);
            for (const website of websites) {

                if (website.url === fields.url) {
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

    function sendEmail(user: User) {
        emailjs.send(import.meta.env.VITE_MAIL_SERVICE_ID, "template_thcq9qz", {
            emailTo: user.email,
            userName: user.firstName + " " + user.surname,
        }, import.meta.env.VITE_MAIL_PUBLIC_KEY)
    }

    function sendWebsiteCreatedEmail(user: User, data: FormData) {
        emailjs.send(import.meta.env.VITE_MAIL_SERVICE_ID, "template_b61dthv", {
            emailTo: user.email,
            userName: user.firstName + " " + user.surname,
            associationName: data.associationName,
            websiteURL: `https://${data.url}.arcadia-solution.com`,
        }, import.meta.env.VITE_MAIL_PUBLIC_KEY)
    }

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
    if (userSession?.isLoggedIn ) {
        forms = forms.slice(1, 2);
    }
    const {steps, currentStepIndex, step, isFirstStep, isLastStep, back, next} = useMultiStepForm(forms)

    async function createUser(userData:Partial<FormData>) {
        if (userData.password !== userData.confirmPassword) {
            setErrorMessage("Les mots de passe ne correspondent pas");
            setOpen(true);
            return;
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
            setWebsiteCreationProcess({...websiteCreationProcess, status: "done"});
            return;
        }
        const res = await response.json();
        return res
    }
    async function deployWesbite(scriptData: WebsiteData, websiteDataDB: Partial<FormData>) {

        setWebsiteCreationProcess({
            ...websiteCreationProcess,
            status: "loading",
            message: "Création du site web en cours..."
        })

        const website = await createWebsite(websiteDataDB);
        await new Promise(r => setTimeout(r, 1000));

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
        await new Promise(r => setTimeout(r, 1000))


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
            setErrorMessage("Erreur lors du chargement du logo: " + error);
            setOpen(true);
        }
    };

    const fetchUser = async (userId: number, userToken: string) => {
        const bearer = "Bearer " + userToken;
        const response: Response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/withoutPassword`, {
            headers: {
                "Authorization": bearer,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            const error = await response.json()
            setErrorMessage("Erreur : " + await error.message);
            setOpen(true);
            return
        }
        const res = await response.json();
        return res;
    }

    const fetchLogoFile = async (): Promise<File> => {
        const response = await fetch(Logo);
        const blob = await response.blob();
        const file = new File([blob], 'logo-green.svg', { type: blob.type });
        return file;
      };

    async function logInUser(email: string, password: string) {
        const inputBOdy = {
            email: email,
            password: password
        }
        const response: Response = await fetch(import.meta.env.VITE_API_URL + "/users/login", {
            method: "POST",
            body: JSON.stringify(inputBOdy),
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
                fullName: res.firstName + " " + res.surname, isLoggedIn: false, //to allow the forms to stay as is.
                roles: res.roles, customerId: res.customerId
            })
        }
    }

    const createSubscription = async (userToken: string, customerId: string) => {
        //STRIPE PAYMENT METHOD
        // Create the ConfirmationToken using the details collected by the Payment Element
        // and additional shipping information
        if (!data.stripe || !data.elements || !userSessionContext) {
            return {
                error: {
                    message: "Missing stripe or elements or userSessionContext"
                }
            };
        }
        //PROD TESTING:
        //return {"message": "fake answer for testing"}
        const elements = data.elements;
        const {error, confirmationToken} = await data.stripe.createConfirmationToken({
                elements
            }
        );
        if (error) {
            setErrorMessage("Erreur lors de la création de l'abonnement: " + error);
            setOpen(true);
            return;
        }

        const bearer = "Bearer " + userToken;

        const inputBody ={
            priceId: data.priceId,
            customerId: customerId,
            confirmationTokenId: confirmationToken.id,
        }
        const response: Response = await fetch(`${import.meta.env.VITE_API_URL}/stripe/subscriptions`, {
            headers: {
                "Authorization": bearer,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(inputBody)
        });
        if (!response.ok) {
            const error = await response.json()
            setErrorMessage("Erreur : " + await error.message);
            setOpen(true);
            return;
        }
        const res = await response.json();
        return res;
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault()

        if (isWebsiteNameTaken) {
            setErrorMessage("L'URL est déjà utilisée");
            setOpen(true);
            return
        }

        if (!isLastStep) return next()

        let userID;
        let user;
        setWebsiteCreationProcess({...websiteCreationProcess, status: "Starting process"})

        if (data.elements) {
            const {error: submitError} = await data.elements?.submit();
            if (submitError) {
                setErrorMessage("Erreur lors de la création de l'abonnement: " + submitError);
                setOpen(true);
                return;
            }
        }
        if (!userSession?.isLoggedIn) {
            const userData = {
                firstName: data.firstName,
                surname: data.surname,
                email: data.email,
                password: data.password,
                confirmPassword: data.confirmPassword
            }
            user = await createUser(userData)
            sendEmail(user)
            if (!user) return
            userID = user.id
            setWebsiteCreationProcess({
                ...websiteCreationProcess,
                message: "Votre compte a été créé avec succès..."
            })
            await new Promise(r => setTimeout(r, 1000));
            const loggedUser= await logInUser(data.email, data.password);
        }
        else {
            userID = userSession?.userId
            user = await fetchUser(userID as number, userSession?.loginToken)
        }

       if (!userSessionContext) return;
        const cusId = user.stripeCustomerId

        const res = await createSubscription(userSessionContext?.userSession?.loginToken, cusId);
        if (res.error) {
            setErrorMessage(res.error.message);
            setOpen(true);
            return;
        }
        //WEBSITE CREATION PROCESS
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

        sendWebsiteCreatedEmail(user, data)

        await new Promise(r => setTimeout(r, 2000))

        if (userSessionContext) {
            userSessionContext.updateUserSession({
                isLoggedIn: true
            })
        }
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
                            <Elements stripe={stripePromise} options={stripeOptions}>
                                {step}
                            </Elements>
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
