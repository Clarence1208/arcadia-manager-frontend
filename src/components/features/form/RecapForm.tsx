
import {Alert, Collapse, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField} from "@mui/material";
import '../../../styles/App.css';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {useEffect, useState} from "react";
import { Stripe, StripeElements} from "@stripe/stripe-js";
import {PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";

type RecapData = {
    firstName: string
    surname: string
    email: string
    password: string
    confirmPassword: string
    url: string,
    dbUsername: string,
    dbPassword: string,
    associationName: string
    stripe?: Stripe,
    elements?: StripeElements
}

type RecapProps = RecapData & {
    formTitle: string,
    formDescription: string,
    formError: string,
    updateFields: (fields: Partial<RecapData>) => void
    handleClose: () => void,
    open: boolean
}
type Product = {
    id: string,
    price: number,
    name: string
}

export function RecapForm(props: RecapProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showAdminPassword, setShowAdminPassword] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

    const handleClickShowAdminPassword = () => setShowAdminPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      };

    const getProductInfo = async () => {
        return {
            id: "prod_QTPPLAZFRAHAbA",
            price: 50,
            name: "Maintenance Site Web"
        }
    }
    const stripe = useStripe();
    const elements = useElements();

    useEffect(() => {
        getProductInfo().then((data) => {
            setProduct(data);
        });
        if (stripe && elements) {
            console.log("Stripe and elements loaded")
            props.updateFields({stripe: stripe, elements: elements});
        }else{
            console.log("Stripe or elements not loaded")
        }
    },[]);

    return (
        <div>
        <div className="form-base">
            <h1>{props.formTitle}</h1>
            <p>{props.formDescription}</p>
            {props.formError && <Collapse in={props.open}><Alert className="alert" onClose={props.handleClose} severity="error">{props.formError}</Alert></Collapse>}
            <div style={{display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
                <div className="form-inputs">
                    <h3>Création de compte:</h3>
                    <TextField className="form-input-small" color="primary" variant="outlined" label="Prénom" autoFocus required type="text" value={props.firstName} onChange={e => props.updateFields({ firstName: e.target.value })} />
                    <TextField className="form-input-small" variant="outlined" label="Nom de famille" required type="text" value={props.surname} onChange={e => props.updateFields({ surname: e.target.value })} />
                    <TextField className="form-input-small" variant="outlined" label="E-mail" required type="email" value={props.email} onChange={e => props.updateFields({email: e.target.value})}/>
                    <div>
                    <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        onChange={e => props.updateFields({password: e.target.value})}
                        value={props.password}
                        sx={{width: '15vw'}} 
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
                        sx={{width: '15vw'}} 
                        value={props.confirmPassword}
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

                <div className="form-inputs">
                    <h3>Configuration du site:</h3>
                    <TextField className="form-input-small" variant="outlined" label="URL du site" InputProps={{endAdornment: <InputAdornment position="end">.arcadia-solution.com</InputAdornment>}} autoFocus required type="text" value={props.url} onChange={e => props.updateFields({ url: e.target.value })} />
                    <TextField className="form-input-small" variant="outlined" label="Nom de l'association" required type="text" value={props.associationName} onChange={e => props.updateFields({ associationName: e.target.value })} />
                    <TextField className="form-input-small" variant="outlined" label="E-mail de l'administrateur" required type="text" value={props.dbUsername} onChange={e => props.updateFields({dbUsername: e.target.value})}/>
                    <div>    
                    <InputLabel htmlFor="outlined-adornment-password">Mot de passe de l'administrateur</InputLabel>
                    <OutlinedInput
                            id="outlined-adornment-password"
                            sx={{width: '15vw'}}
                            type={showAdminPassword ? 'text' : 'password'}
                            value={props.dbPassword}
                            onChange={e => props.updateFields({dbPassword: e.target.value})}
                            endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowAdminPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                                >
                                {showAdminPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                            }
                            label="Password"
                        />
                    </div>
                </div>
            </div>
        </div>
            <div style={{marginTop: "4em"}}>
                <h3>Paiement de l'abonnement mensuel</h3>
                {
                    product && (<p>{product.name} - <b>{product.price/100}€</b></p>)
                }
                <PaymentElement/>
            </div>
        </div>
    )
}