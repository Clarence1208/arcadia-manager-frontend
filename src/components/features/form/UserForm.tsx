
import {IconButton, TextField, Tooltip} from "@mui/material";
import HelpIcon from '@mui/icons-material/Help';
import '../../../styles/Form.css';

type UserData = {
    firstName: string
    lastName: string
    email: string
    password: string,
}

type UserFormProps = UserData & {
    formTitle: string,
    updateFields: (fields: Partial<UserData>) => void
}

export function UserForm(props: UserFormProps) {
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
            <div className="form-inputs">
                <TextField color="primary" variant="outlined" label="First name" autoFocus required type="text" value={props.firstName} onChange={e => props.updateFields({ firstName: e.target.value })} />
                <TextField variant="outlined" label="Last name" required type="text" value={props.lastName} onChange={e => props.updateFields({ lastName: e.target.value })} />
                <TextField variant="outlined" label="Email" required type="email" value={props.email} onChange={e => props.updateFields({email: e.target.value})}/>
            </div>
        </div>
    )
}