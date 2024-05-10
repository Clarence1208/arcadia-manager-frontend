import {UserRegisterForm} from "../components/features/form/UserRegisterForm";
import {useState} from "react";
import Header from "../components/Header";
import {Footer} from "../components/Footer";
import {Button} from "@mui/material";

type FormData = {
    firstName: string
    surname: string
    email: string
    password: string,
}

const body: FormData = {
    firstName: "",
    surname: "",
    email: "",
    password: "",
}

export function Register(){

    const [data, setData] = useState(body)
    const [errorMessage, setErrorMessage] = useState("")

    function updateFields(fields: Partial<FormData>) {
        setData(prev => {
            return { ...prev, ...fields }
        })
    }

    function handleSubmit(){
        console.log(data)
    }

    return (
        <div>
            <Header />
            <div className="">
                <UserRegisterForm {...data} formTitle={"Créer un compte"} formDescription={"Création de compte Arcadia pour vos sites"} formError={errorMessage} updateFields={updateFields} />
                <Button variant="contained" type={"submit"} onClick={handleSubmit} >Valider</Button>
            </div>
            <Footer />
        </div>
    )
}