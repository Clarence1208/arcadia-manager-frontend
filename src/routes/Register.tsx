import {UserRegisterForm} from "../components/features/form/UserRegisterForm";
import {useState} from "react";
import Header from "../components/Header";
import {Footer} from "../components/Footer";
import {Button, Paper} from "@mui/material";
import {useNavigate} from "react-router-dom";
import emailjs from "@emailjs/browser";

type FormData = {
    firstName: string
    surname: string
    email: string
    password: string,
    confirmPassword?: string,
}

const body: FormData = {
    firstName: "",
    surname: "",
    email: "",
    password: "",
}

export function Register() {

    const navigate = useNavigate();
    const [data, setData] = useState(body)
    const [errorMessage, setErrorMessage] = useState("")
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
        setErrorMessage("");
    };

    function updateFields(fields: Partial<FormData>) {
        setData(prev => {
            return {...prev, ...fields}
        })
    }

    function sendEmail(userData: FormData) {
        emailjs.send(import.meta.env.VITE_MAIL_SERVICE_ID, "template_thcq9qz", {
            emailTo: userData.email,
            userName: userData.firstName + " " + userData.surname,
        }, import.meta.env.VITE_MAIL_PUBLIC_KEY)
    }

    async function handleSubmit() {

        if (data.password !== data.confirmPassword) {
            setErrorMessage("Les mots de passe ne correspondent pas");
            return
        }

        delete data.confirmPassword;

        const response: Response = await fetch(import.meta.env.VITE_API_URL + "/users/register", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {"Content-Type": "application/json"}
        });
        if (!response.ok) {
            const error = await response.json()
            setErrorMessage("Erreur lors de la création du compte: " + await error.message);
            return
        }
        const res = await response.json();
        sendEmail(data);
        navigate("/login?successMessage=true")

    }

    return (
        <div>
            <Header/>
            <div className="main">
                <Paper elevation={1} className={"paper"} style={{width: "40vw"}}>
                <div style={{display: 'flex', flexDirection: "column", justifyContent: 'center', alignItems: 'center'}}className="form-and-button">
                    <UserRegisterForm {...data} formTitle={"Créer un compte"} open={open} handleClose={handleClose}
                                      formDescription={"Création de compte Arcadia pour vos sites"}
                                      formError={errorMessage} updateFields={updateFields}/>
                    <Button sx={{marginTop: '2vh', width: '25vw'}} variant="contained" type={"submit"} onClick={handleSubmit}>Valider</Button>
                </div>
                </Paper>
            </div>
            <Footer/>
        </div>
    )
}