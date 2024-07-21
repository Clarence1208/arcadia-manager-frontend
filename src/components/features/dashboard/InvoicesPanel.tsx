import {
    Alert, Button,
    CircularProgress,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import {Download} from "@mui/icons-material";
import {UserSessionContext} from "../../../contexts/user-session";
import {useContext, useEffect, useState} from "react";

type Subscription = {
    id?: string,
    product?: any,
    status?: string,
    created_at?: number,
    cancel_at?: number,
    current_period_end?: number,
    current_period_start?: number,
    price?: any,
}
export default function InvoicesPanel() {
    const [invoices, setInvoices] = useState([]);
    const [subscription, setSubscription] = useState<Subscription>();
    const userSession = useContext(UserSessionContext)?.userSession;
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [open, setOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const getInvoices = async () => {
        // Call the API to get the invoices
        const bearer = "Bearer " + userSession?.loginToken;
        const customerId = userSession?.customerId;
        const userId = userSession?.userId;
        if (!customerId ){
            return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/stripe/invoices/${userId}?customerId=${customerId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': bearer
            },
        });
        if (!response.ok) {
            return;
        }
        const data = await response.json();
        return data;

    }
    const getSubscription = async () => {
        // Call the API to get the subscription
        const bearer = "Bearer " + userSession?.loginToken;
        const customerId = userSession?.customerId;
        const userId = userSession?.userId;
        if (!customerId){
            return {};
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/stripe/subscriptions/${userId}?customerId=${customerId}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': bearer
                },
            });
            if (!response.ok) {
                return {};
            }
            const data: Subscription = await response.json();
            return data;

        } catch (e) {
            setErrorMessage("Erreur de récupération des données.");
            setOpen(true);
            return {};
        }
    }
    useEffect(
        () => {
            getInvoices().then((data) => {
                setInvoices(data);
            });
            getSubscription().then((data) => {
                setSubscription(data);
                setIsDataFetched(true);
            });
        }, []
    )

    const confirmCancel = async (subscriptionID: string | undefined) => {
        if (window.confirm("Voulez-vous vraiment vous désabonner ? Vous n'aurez plus accès aux services de l'association.")){
            // Call the API to cancel the subscription
            const bearer = "Bearer " + userSession?.loginToken;
            const userId = userSession?.userId;
            if (!subscriptionID ){
                return;
            }
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/stripe/subscriptions/${userId}?subscriptionId=${subscriptionID}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': bearer
                    },
                });
                if (!response.ok) {
                    setErrorMessage("Erreur lors de la suppression de l'abonnement. Veuillez réessayer.");
                    return;
                }
                setErrorMessage("Abonnement annulé avec succès.");
            }catch (e){
                setErrorMessage("Erreur" + e)
            }finally {
                setOpen(true);
            }
        }else{

            return;
        }
    }

    return(
        <div>
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={() => setOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setOpen(false)}
                    severity={errorMessage.includes("Erreur") ? "error" : "success"}
                    variant="filled"
                    sx={{ width: '100%' }}
                >{errorMessage}</Alert>
            </Snackbar>
        <h2>Historique des paiements</h2>
            {!isDataFetched ?
            (
            <div><CircularProgress color={"inherit"}/></div>
            )
            :
                <div>
                    {(subscription && subscription.price && subscription.id) ?
                        <div>
                            <div className="article-div">

                                <h3>{subscription.product.name}</h3>
                                <div>
                                    <p>Description: {subscription.product.description}</p>
                                    <p>Coût: {subscription.price.unit_amount /100} €</p>
                                    <p>Depuis le {new Date((subscription.created_at || 0) *1000) .toLocaleDateString()}</p>
                                    <p>Prochaine facturation le {new Date(subscription.current_period_end || 0).toLocaleDateString()}</p>
                                    <Button variant="contained" color="primary" onClick={() => confirmCancel(subscription.id)}>Se désabonner</Button>
                                    <br/>
                                </div>

                            </div>
                        </div> : null
                    }
                    <h3>Derniers paiements: </h3>
                    <TableContainer component={Paper} style={{maxHeight: "70vh", overflowY:"scroll"}}>
                        <Table sx={{minWidth: 650}} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date du paiement</TableCell>
                                    <TableCell>Montant</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Facture</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    invoices && invoices.map((invoice: any) => {
                                        return (
                                            <TableRow key={invoice.id}>
                                                <TableCell>{new Date(invoice.created *1000).toLocaleDateString()}</TableCell>
                                                <TableCell>{invoice.amount_paid/100} {invoice.currency}</TableCell>
                                                <TableCell>{invoice.status === "paid" ? "Finalisé": "Non-finalisé"}</TableCell>
                                                <TableCell><a href={invoice.invoice_pdf} target="_blank" rel="noreferrer"><Download color="primary"/></a></TableCell>
                                            </TableRow>
                                        )
                                    })
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            }
    </div>
    )
}
