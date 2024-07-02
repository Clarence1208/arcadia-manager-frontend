
import {Alert, InputAdornment, TextField} from "@mui/material";
import '../../../styles/App.css';


type RecapData = {
    firstName: string
    surname: string
    email: string
    password: string
    confirmPassword: string
    url: string,
    dbUsername: string,
    dbPassword: string,
}

type RecapProps = RecapData & {
    formTitle: string,
    formDescription: string,
    formError: string,
    updateFields: (fields: Partial<RecapData>) => void
}

export function RecapForm(props: RecapProps) {
    return (
        <div className="form-base">
            <h1>{props.formTitle}</h1>
            <p>{props.formDescription}</p>
            {props.formError && <Alert className={"alert"} severity="error" onClose={() => {}}>{props.formError}</Alert>}
            <div style={{display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
                <div className="form-inputs">
                    <h3>Création de compte:</h3>
                    <TextField color="primary" variant="outlined" label="Prénom" autoFocus required type="text" value={props.firstName} onChange={e => props.updateFields({ firstName: e.target.value })} />
                    <TextField variant="outlined" label="Nom de famille" required type="text" value={props.surname} onChange={e => props.updateFields({ surname: e.target.value })} />
                    <TextField variant="outlined" label="E-mail" required type="email" value={props.email} onChange={e => props.updateFields({email: e.target.value})}/>
                    <TextField variant="outlined" label="Mot de passe" required type="password" value={props.password} onChange={e => props.updateFields({password: e.target.value})}/>
                    <TextField variant="outlined" label="Confirmer votre mot de passe" required type="password" value={props.confirmPassword} onChange={e => props.updateFields({confirmPassword: e.target.value})}/>
                </div>

                <div className="form-inputs">
                    <h3>Configuration du site:</h3>
                    <TextField variant="outlined" label="URL du site" InputProps={{endAdornment: <InputAdornment position="end">.arcadia-solution.com</InputAdornment>}} autoFocus required type="text" value={props.url} onChange={e => props.updateFields({ url: e.target.value })} />
                    <TextField variant="outlined" label="E-mail de l'administrateur" required type="text" value={props.dbUsername} onChange={e => props.updateFields({dbUsername: e.target.value})}/>
                    <TextField variant="outlined" label="Mot de passe de l'administrateur" required type="password" value={props.dbPassword} onChange={e => props.updateFields({ dbPassword: e.target.value })} />
                </div>
            </div>
        </div>
    )
}