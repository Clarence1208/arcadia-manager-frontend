
import {Alert, InputAdornment, TextField} from "@mui/material";
import '../../../styles/App.css';

type WebsiteData = {
    subDomain: string,
    name: string,
    dbPassword: string,
}


type WebsiteFormProps = WebsiteData & {
    formTitle: string,
    formDescription: string,
    formError: string,
    updateFields: (fields: Partial<WebsiteData>) => void
}

export function WebsiteForm(props: WebsiteFormProps) {
    return (
        <div className="form-base">
            <h1>{props.formTitle}</h1>
            <p>{props.formDescription}</p>
            {props.formError && <Alert className={"alert"} severity="error" onClose={() => {}}>{props.formError} </Alert>}
            <div className="form-inputs">
                <TextField variant="outlined" label="Website url" InputProps={{endAdornment: <InputAdornment position="end">.arcadia-solution.com</InputAdornment>,}} autoFocus required type="text" value={props.subDomain} onChange={e => props.updateFields({ subDomain: e.target.value })} />
                <TextField variant="outlined" label="Super Administrator login" required type="text" value={props.name} onChange={e => props.updateFields({name: e.target.value})}/>
                <TextField variant="outlined" label="Administrator password" required type="password" value={props.dbPassword} onChange={e => props.updateFields({ dbPassword: e.target.value })} />

            </div>
        </div>
    )
}