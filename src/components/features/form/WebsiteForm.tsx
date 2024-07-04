
import {Alert, Button, InputAdornment, styled, TextField} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import '../../../styles/App.css';


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
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>|null, action: boolean) => void
}

export function WebsiteForm(props: WebsiteFormProps) {
    return (
        <div className="form-base">
            <h1>{props.formTitle}</h1>
            <p>{props.formDescription}</p>
            {props.formError && <Alert className={"alert"} severity="error" onClose={() => {}}>{props.formError} </Alert>}
            <div className="form-inputs">
                <TextField variant="outlined" label="URL du site" InputProps={{endAdornment: <InputAdornment position="end">.arcadia-solution.com</InputAdornment>,}} autoFocus required type="text" value={props.url} onChange={e => props.updateFields({ url: e.target.value })} />
                <TextField variant="outlined" label="Nom de l'association" required type="text" value={props.associationName} onChange={e => props.updateFields({associationName: e.target.value})}/>
                <Button
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
                <TextField variant="outlined" label="Email de l'administrateur par défaut" required type="text" value={props.dbUsername} onChange={e => props.updateFields({dbUsername: e.target.value})}/>
                <TextField variant="outlined" label="Mot de passe de l'administrateur" required type="password" value={props.dbPassword} onChange={e => props.updateFields({dbPassword: e.target.value})} />

            </div>
        </div>
    )
}