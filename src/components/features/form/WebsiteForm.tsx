
import {Alert, Button, Collapse, IconButton, InputAdornment, InputLabel, OutlinedInput, styled, TextField} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import '../../../styles/App.css';
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";


const VisuallyHiddenInput = styled('input')({
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

type WebsiteData = {
    url: string,
    logoName: string,
    dbUsername: string,
    dbPassword: string,
    associationName: string
}

type WebsiteFormProps = WebsiteData & {
    formTitle: string,
    formDescription: string,
    formError: string,
    updateFields: (fields: Partial<WebsiteData>) => void,
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>|null, action: boolean) => void,
    handleClose: () => void,
    open: boolean
}

export function WebsiteForm(props: WebsiteFormProps) {

    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      };

    return (
        <div className="form-base">
            <h1>{props.formTitle}</h1>
            <p>{props.formDescription}</p>
            {props.formError && <Collapse in={props.open}><Alert className="alert" onClose={props.handleClose} severity="error">{props.formError}</Alert></Collapse>}
            <div className="form-inputs">
                <TextField className="form-input" variant="outlined" label="URL du site" InputProps={{endAdornment: <InputAdornment position="end">.arcadia-solution.com</InputAdornment>,}} autoFocus required type="text" value={props.url} onChange={e => props.updateFields({ url: e.target.value })} />
                <TextField className="form-input" variant="outlined" label="Nom de l'association" required type="text" value={props.associationName} onChange={e => props.updateFields({associationName: e.target.value})}/>
                <Button
                    className="form-input"
                    component="label"
                    role="button"
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon/>}
                >
                    Charger un logo
                    <VisuallyHiddenInput
                        type="file"
                        onChange={(e) => props.handleFileChange(e, true)}
                    />
                </Button>
                {(props.logoName != "") && 
                    <div style={{display: "flex", alignItems:"center", justifyContent: "center"}}>
                        <Button
                            component="label"
                            onClick={(e) => props.handleFileChange(null, false)}
                        >X</Button>
                        <p>{props.logoName}</p>
                    </div>
                    }
                <div>   
                <InputLabel className="form-input" htmlFor="outlined-adornment-password">Email de l'administrateur</InputLabel>
                <TextField className="form-input" variant="outlined" required type="text" value={props.dbUsername} onChange={e => props.updateFields({dbUsername: e.target.value})}/>
                </div>    
                <div>    
                <InputLabel sx={{width: '25vw'}} htmlFor="outlined-adornment-password">Mot de passe de l'administrateur</InputLabel>
                <OutlinedInput
                        id="outlined-adornment-password"
                        sx={{width: '25vw'}}
                        type={showPassword ? 'text' : 'password'}
                        onChange={e => props.updateFields({dbPassword: e.target.value})}
                        value={props.dbPassword}
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
            </div>
        </div>
    )
}