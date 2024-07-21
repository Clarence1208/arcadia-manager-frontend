import {Alert, Button, IconButton, InputAdornment, InputLabel, Link, OutlinedInput, Snackbar, TextField} from "@mui/material";
import '../styles/LogIn.css';
import '../styles/App.css';
import {FormEvent, useContext, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {UserSessionContext} from "../contexts/user-session";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Visibility, VisibilityOff } from "@mui/icons-material";

type LogInData = {
    email: string,
    password: string
}
const body: LogInData = {
    email: "",
    password: ""
}

function LogInForm() {
    let navigate = useNavigate();
    const sessionContext = useContext(UserSessionContext)

    const [queryParameters] = useSearchParams();
    const [open, setOpen] = useState(queryParameters.get('error') === "true");
    const [openSuccessRegister, setopenSuccessRegisterOpen] = useState(queryParameters.get('successMessage') === "true");
    const [errorMessage, setErrorMessage] = useState("")
    const [data, setData] = useState(body)
    const [showPassword, setShowPassword] = useState(false);

    function updateFields(fields: Partial<LogInData>) {
        setData(prev => {
            return {...prev, ...fields}
        })
    }

    const handleClose = () => {
        setOpen(false);
        setErrorMessage("");
    };

    const handleCloseSuccessRegister = () => {
        setopenSuccessRegisterOpen(false);
    };

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        try {
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
            const res = await response.json();
            if (sessionContext) {
                sessionContext.updateUserSession({
                    userId: res.id, loginToken: res.loginToken,
                    fullName: res.firstName + " " + res.surname, isLoggedIn: true,
                    roles: res.roles, customerId: res.customerId
                })
            }
        } catch (e) {
            setErrorMessage("Erreur : " + e);
            setOpen(true);
            return
        }
        navigate('/dashboard')
    }

    function handlePasswordChange() {
        alert("flemme.")
    }

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      };

    return (
        <form id="formLogin" onSubmit={onSubmit}>
            <Snackbar
                open={openSuccessRegister}
                autoHideDuration={3000}
                onClose={handleCloseSuccessRegister}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <Alert
                    onClose={handleCloseSuccessRegister}
                    severity={errorMessage.includes("Erreur") ? "error" : "success"}
                    variant="filled"
                    sx={{width: '100%'}}
                >{errorMessage}</Alert>
            </Snackbar>
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <Alert
                    onClose={handleClose}
                    severity={errorMessage.includes("Erreur") ? "error" : "success"}
                    variant="filled"
                    sx={{width: '100%'}}
                >{errorMessage}</Alert>
            </Snackbar>
            <h1>Portail d'accès au panneau de gestion</h1>
            <div>
            <InputLabel htmlFor="outlined-adornment-email">Email</InputLabel>
                <OutlinedInput
                    id="outlined-adornment-email"
                    type="text"
                    onChange={e => updateFields({email: e.target.value})}
                    label="Email"
                    sx={{width: '100%'}}
                />
            </div>
            <div>
            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                <OutlinedInput
                    id="outlined-adornment-password"
                    type={showPassword ? 'text' : 'password'}
                    onChange={e => updateFields({password: e.target.value})}
                    sx={{width: '100%'}} 
                    endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                    }
                    label="Password"
                />
            </div>

            <div id="form-footer">
                <Button id="login-button" color="primary" variant="contained" type="submit" disableElevation>Se
                    connecter</Button>
                <Link href="" onClick={handlePasswordChange}>Mot de passe oublié ?</Link>
                <Link href={"/register"}>Créer un compte ?</Link>
            </div>
            <Snackbar
                open={openSuccessRegister}
                autoHideDuration={3000}
                onClose={() => setOpen(false)}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <Alert
                    onClose={() => {
                        setOpen(false)
                    }}
                    severity="success"
                    variant="filled"
                    sx={{width: '100%'}}
                >Le compte a été créé avec succès</Alert>
            </Snackbar>


        </form>
    );
}

export function LogIn() {
    return (
        <div className="containerRow">
            <div className="rotated-text">CONNEXION</div>
            <div className="green-separator"/>
            <div className="containerCol">
                <LogInForm/>
            </div>
        </div>
    );
}