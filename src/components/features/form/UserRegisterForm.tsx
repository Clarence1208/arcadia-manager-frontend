
import {Alert, IconButton, TextField, Tooltip} from "@mui/material";
import Collapse from '@mui/material/Collapse';
import HelpIcon from '@mui/icons-material/Help';
import '../../../styles/Form.css';
import '../../../styles/App.css';
import {useState} from "react";

type UserData = {
    firstName: string
    surname: string
    email: string
    password: string,
    confirmPassword?: string,
}

type UserFormProps = UserData & {
    formTitle: string,
    formDescription: string,
    formError: string,
    updateFields: (fields: Partial<UserData>) => void
}

export function UserRegisterForm(props: UserFormProps) {

    const [open, setOpen] = useState(true);

    return (
        <div className="form-base">
            <div className="form-header">
                <h2>{props.formTitle}</h2>
                <Tooltip title="Enter details about the user account.">
                    <IconButton>
                       <HelpIcon />
                    </IconButton>
                </Tooltip>
            </div>
            <p>{props.formDescription}</p>
            {props.formError && <Collapse in={open}><Alert className="alert" onClose={() => setOpen(false)} severity="error">{props.formError}</Alert></Collapse>}
            <div className="form-inputs">
                <TextField color="primary" variant="outlined" label="Prénom" autoFocus required type="text" value={props.firstName} onChange={e => props.updateFields({ firstName: e.target.value })} />
                <TextField variant="outlined" label="Nom de famille" required type="text" value={props.surname} onChange={e => props.updateFields({ surname: e.target.value })} />
                <TextField variant="outlined" label="E-mail" required type="email" value={props.email} onChange={e => props.updateFields({email: e.target.value})}/>
                <TextField variant="outlined" label="Mot de passe" required type="password" value={props.password} onChange={e => props.updateFields({password: e.target.value})}/>
                <TextField variant="outlined" label="Confirmer votre mot de passe" required type="password" value={props.confirmPassword} onChange={e => props.updateFields({confirmPassword: e.target.value})}/>

            </div>
        </div>
    )
}