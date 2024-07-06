import {UserRegisterForm} from "../form/UserRegisterForm";
import {useContext, useEffect, useState} from "react";
import {Button} from "@mui/material";
import {UserSessionContext} from "../../../contexts/user-session";

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

type UserPanelProps = {
    userId: number | undefined
    userToken: string | undefined
}

async function getUserData(userId: number, userToken: string) {
    const bearer = "Bearer " + userToken;
    const response: Response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/withoutPassword`, {
        headers: {
            "Authorization": bearer,
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) {
        const error = await response.json()
        return {}
    }
    const res = await response.json();
    console.log(res)
    return res;

}

async function updateUser(userId: number | undefined, userToken: string | undefined, data: Partial<FormData>) {

    const bearer = "Bearer " + userToken;
    const response: Response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        method: "PATCH",
        headers: {
            "Authorization": bearer,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json()
       throw new Error(error.message);
    }
    const res = await response.json();
    return res;
}
export function UserAccountPanel({userId, userToken}: UserPanelProps) {
    const sessionContext = useContext(UserSessionContext)

    const [data, setData] = useState(body)
    const [updateData, setUpdateData] = useState({})
    const [errorMessage, setErrorMessage] = useState("")
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
        setErrorMessage("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            const res = await updateUser(userId, userToken, updateData)
            if (sessionContext){
                sessionContext.updateUserSession({ userId: res.id, loginToken: res.loginToken,
                    fullName: res.firstName + " " + res.surname, isLoggedIn: true})
            }
            return;
        }catch (e){
            setErrorMessage("Erreur"+e)
            setOpen(true)
            console.log("error update", e)
        }
    }

    function updateFields(fields: Partial<FormData>) {
        setUpdateData(prev => {
            return { ...prev, ...fields }
        })
        setData(prev => {
            return { ...prev, ...fields }
        })
    }

    useEffect(() => {
        if (userId && userToken) {
            getUserData(userId, userToken).then(setData)
        }
    }, [userId, userToken]);

    return (
        <div>
            <UserRegisterForm {...data} updateFields={updateFields} open={open} handleClose={handleClose} formError={errorMessage} formTitle="Mes informations personnelles" formDescription="Voici les données que nous avons enregistrés par rapport à votre compte."/>
            <Button style={{width:"25vw", marginTop: "2vh"}} variant="contained" type={"submit"} onClick={handleSubmit} >Mettre à jour</Button>
        </div>
    )
}