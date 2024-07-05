
import {Alert, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField, Tooltip} from "@mui/material";
import Collapse from '@mui/material/Collapse';
import HelpIcon from '@mui/icons-material/Help';
import '../../../styles/Form.css';
import '../../../styles/App.css';
import {useState} from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

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
    handleClose: () => void,
    open: boolean
}

export function UserRegisterForm(props: UserFormProps) {

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      };


    return (
        <div>
            <div className="form-header">
                <h2>{props.formTitle}</h2>
                <Tooltip title="Enter details about the user account.">
                    <IconButton>
                       <HelpIcon />
                    </IconButton>
                </Tooltip>
            </div>
            <p>{props.formDescription}</p>
            {props.formError && <Collapse in={props.open}><Alert className="alert" onClose={props.handleClose} severity="error">{props.formError}</Alert></Collapse>}
            <div className="form-inputs">
                <TextField className="form-input" color="primary" variant="outlined" label="Prénom" autoFocus required type="text" value={props.firstName} onChange={e => props.updateFields({ firstName: e.target.value })} />
                <TextField className="form-input" variant="outlined" label="Nom de famille" required type="text" value={props.surname} onChange={e => props.updateFields({ surname: e.target.value })} />
                <TextField className="form-input" variant="outlined" label="E-mail" required type="email" value={props.email} onChange={e => props.updateFields({email: e.target.value})}/>
                <div>
                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        value={props.password}  
                        onChange={e => props.updateFields({password: e.target.value})}
                        sx={{width: '25vw'}} 
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
                    <div>
                <InputLabel htmlFor="outlined-adornment-password">Confirm Password</InputLabel>
                <OutlinedInput
                        id="outlined-adornment-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        onChange={e => props.updateFields({confirmPassword: e.target.value})}
                        value={props.confirmPassword}
                        sx={{width: '25vw'}} 
                        endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleClickShowConfirmPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                        }
                        label="Password"
                    />
                    </div>
            </div>
        </div>
    )
}