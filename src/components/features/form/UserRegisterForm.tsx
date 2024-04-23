
import {Alert, IconButton, TextField, Tooltip} from "@mui/material";
import HelpIcon from '@mui/icons-material/Help';
import '../../../styles/Form.css';
import '../../../styles/App.css';

type UserData = {
    firstName: string
    surname: string
    email: string
    password: string,
}

type UserFormProps = UserData & {
    formTitle: string,
    formDescription: string,
    formError: string,
    updateFields: (fields: Partial<UserData>) => void
}

export function UserRegisterForm(props: UserFormProps) {
    return (
        <div className="form-base">
            <div className="form-header">
                <h1>{props.formTitle}</h1>
                <Tooltip title="Enter details about the account. They will be used to create your account.">
                    <IconButton>
                       <HelpIcon />
                    </IconButton>
                </Tooltip>
            </div>
            <p>{props.formDescription}</p>
            {props.formError && <Alert className="alert" onClose={() => {}} severity="error">{props.formError}</Alert>}
            <div className="form-inputs">
                <TextField color="primary" variant="outlined" label="First name" autoFocus required type="text" value={props.firstName} onChange={e => props.updateFields({ firstName: e.target.value })} />
                <TextField variant="outlined" label="Surname" required type="text" value={props.surname} onChange={e => props.updateFields({ surname: e.target.value })} />
                <TextField variant="outlined" label="Email" required type="email" value={props.email} onChange={e => props.updateFields({email: e.target.value})}/>
                <TextField variant="outlined" label="Password" required type="password" value={props.password} onChange={e => props.updateFields({password: e.target.value})}/>

            </div>
        </div>
    )
}