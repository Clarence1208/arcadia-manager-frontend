import {UserRegisterForm} from "../components/features/form/UserRegisterForm";
import {useState} from "react";
import Header from "../components/Header";
import {Footer} from "../components/Footer";
import {Button, Paper} from "@mui/material";
import {useNavigate} from "react-router-dom";

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

    function updateFields(fields: Partial<FormData>) {
        setData(prev => {
            return {...prev, ...fields}
        })
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
        navigate("/login?successMessage=true")

    }

    return (
        <div>
            <Header/>
            <div className="main">
                <Paper elevation={1} className={"paper"} style={{width: "40vw"}}>
                    <UserRegisterForm {...data} formTitle={"Créer un compte"}
                                      formDescription={"Création de compte Arcadia pour vos sites"}
                                      formError={errorMessage} updateFields={updateFields}/>
                    <Button variant="contained" type={"submit"} onClick={handleSubmit}>Valider</Button>
                </Paper>
            </div>
            <Footer/>
        </div>
    )
}