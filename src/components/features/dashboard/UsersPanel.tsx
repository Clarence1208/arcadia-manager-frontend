import {useEffect, useState} from "react";
import {AddCircleOutline, Delete, Edit} from "@mui/icons-material";
import {Alert, Button, Link, Modal, Paper, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import { _Object } from "@aws-sdk/client-s3";
import WebIcon from '@mui/icons-material/Web';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
type Website = {
    id: number;
    url: string;
    associationName: string;
    status: string;
    logo: string | undefined;
}
type WebsitesPanelProps = {
    userToken: string | undefined;
}

type User = {
    id: number;
    email: string;
    firstName: string;
    surname: string;
    roles: string;
    websites: Website[];
}

export function UsersPanel({userToken}: WebsitesPanelProps){
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [websites, setWebsites] = useState<Website[]>([])
    const [currentUser, setCurrentUser] = useState<User | undefined>(undefined)
    const [currentWebsite, setCurrentWebsite] = useState<Website | undefined>(undefined)
    const [open, setOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteAlertModal, setOpenDeleteAlertModal] = useState(false);
    const [usersLoaded, setUsersLoaded] = useState<boolean>(false);
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [changeOnPage, setChangeOnPage] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>("");
    const [action, setAction] = useState<string>("");

    useEffect(() => {
        if (usersLoaded) {
            setTimeout(() => {
                setIsPageLoaded(true);
            }, 200);
        }
    }, [usersLoaded]);

    useEffect(() => {
            if (userToken) {
                const getUsers = async (): Promise<User[]> => {
                    const bearer = "Bearer " + userToken;
                    const response: Response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
                        headers: {
                            "Authorization": bearer,
                            "Content-Type": "application/json"
                        }
                    });
                    if (!response.ok) {
                        const error = await response.json()
                        setErrorMessage("Erreur : " + await error.message);
                        return []
                    }
                    const res = await response.json();
                    console.log(res)
                    if (res.length === 0) {
                        setErrorMessage("Aucun site web trouvé")
                    }
                    return res;
                }
                getUsers().then(setUsers).then(() => setUsersLoaded(true));
            }
        }
    , [userToken, changeOnPage])

    const deleteWebsiteAlert = (website: Website) => {
        return async () => {
            setAlertMessage(`Vous êtes sur le point de supprimer <strong>${website.url}</strong>. Êtes-vous sûr de vouloir continuer ?`);
            setCurrentWebsite(website);
            setAction("delete");
            setOpenDeleteAlertModal(true);
        }
    }

    const pauseWebsiteAlert = (website: Website) => {
        return async () => {
            setAlertMessage(`Vous êtes sur le point de mettre en pause <strong>${website.url}</strong>. Êtes-vous sûr de vouloir continuer ?`);
            setCurrentWebsite(website);
            setAction("pause");
            setOpenDeleteAlertModal(true);
        }
    }

    const resumeWebsiteAlert = (website: Website) => {
        return async () => {
            setAlertMessage(`Vous êtes sur le point de remettre en ligne <strong>${website.url}</strong>. Êtes-vous sûr de vouloir continuer ?`);
            setCurrentWebsite(website);
            setAction("resume");
            setOpenDeleteAlertModal(true);
        }
    }



    const deleteWebsite = (website: Website) => {
        return async () => {
            try {
                let response: Response = await fetch(`${import.meta.env.VITE_API_URL}/websites/scripts/deleteWebsite`, {
                    method: "POST",
                    body: JSON.stringify({subdomain: website.url}),
                    headers: {
                        "Authorization": "Bearer " + userToken,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    setErrorMessage("Erreur : " + await error.message);
                    setOpen(true);
                    return
                }
                let res = await response.json();
                response = await fetch(`${import.meta.env.VITE_API_URL}/websites/${website.id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": "Bearer " + userToken,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    setErrorMessage("Erreur : " + await error.message);
                    setOpen(true);
                    return
                }
                res = await response.json();
                setChangeOnPage(!changeOnPage);
                handleCloseModal();
                handleCloseDeleteAlertModal();
                setErrorMessage("Site web supprimé avec succès");
                setOpen(true);
                return res;
            } catch (e) {
                setErrorMessage("Erreur : " + e);
                setOpen(true);
            }
        }
    }

    const pauseWebsite = (website: Website) => {
        return async () => {
            try {
                let response: Response = await fetch(`${import.meta.env.VITE_API_URL}/websites/scripts/pauseWebsite`, {
                    method: "POST",
                    body: JSON.stringify({subdomain: website.url}),
                    headers: {
                        "Authorization": "Bearer " + userToken,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    setErrorMessage("Erreur : " + await error.message);
                    setOpen(true);
                    return
                }
                let res = await response.json();
                response = await fetch(`${import.meta.env.VITE_API_URL}/websites/${website.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({status: "inactive"}),
                    headers: {
                        "Authorization": "Bearer " + userToken,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    setErrorMessage("Erreur : " + await error.message);
                    setOpen(true);
                    return
                }
                res = await response.json();
                setChangeOnPage(!changeOnPage);
                handleCloseModal();
                handleCloseDeleteAlertModal();
                setErrorMessage("Site web mis en pause avec succès");
                setOpen(true);
                return res;
            } catch (e) {
                setErrorMessage("Erreur : " + e);
                setOpen(true);
            }
        }
    }

    const resumeWebsite = (website: Website) => {
        return async () => {
            try {
                let response: Response = await fetch(`${import.meta.env.VITE_API_URL}/websites/scripts/resumeWebsite`, {
                    method: "POST",
                    body: JSON.stringify({subdomain: website.url}),
                    headers: {
                        "Authorization": "Bearer " + userToken,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    setErrorMessage("Erreur : " + await error.message);
                    setOpen(true);
                    return
                }
                let res = await response.json();
                response = await fetch(`${import.meta.env.VITE_API_URL}/websites/${website.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({status: "active"}),
                    headers: {
                        "Authorization": "Bearer " + userToken,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const error = await response.json()
                    setErrorMessage("Erreur : " + await error.message);
                    setOpen(true);
                    return
                }
                res = await response.json();
                setChangeOnPage(!changeOnPage);
                handleCloseModal();
                handleCloseDeleteAlertModal();
                setErrorMessage("Site web remis en ligne avec succès");
                setOpen(true);
                return res;
            } catch (e) {
                setErrorMessage("Erreur : " + e);
                setOpen(true);
            }
        }
    }

    const handleClose = () => {
        setOpen(false);
        setErrorMessage("")
    }

    const handleCloseModal = () => {
        setOpenModal(false);
    }

    const handleCloseDeleteAlertModal = () => {
        setOpenDeleteAlertModal(false);
    }

    const openWebsiteModal = (user: User) => {
        setWebsites(user.websites);
        setCurrentUser(user);
        setOpenModal(true);
    }

    if (isPageLoaded) {
        if (!users) {
            return <div>
                <h2>Il n'y a pas encore d'utilisateur pour ce site...</h2>
            </div>
        }else{
            return (
                <div>
                        <Snackbar
                        open={open}
                        autoHideDuration={3000}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <Alert
                            onClose={handleClose}
                            severity={errorMessage.includes("Erreur") ? "error" : "success"}
                            variant="filled"
                            sx={{ width: '100%' }}
                        >{errorMessage}</Alert>
                    </Snackbar>
                    <Modal
                        open={openDeleteAlertModal}
                        onClose={handleCloseDeleteAlertModal}
                        aria-labelledby="modal-delete-alert-websites"
                        aria-describedby="modal alert to delete a website"
                        id="modal-delete-alert-website"
                    >
                        <Paper elevation={1} className={"paper"}>
                            { currentWebsite && 
                                <div>
                                    <h2>Attention !</h2>
                                    <p dangerouslySetInnerHTML={{ __html: alertMessage }}></p>
                                    {action === "delete" && 
                                        <Button variant="contained" onClick={deleteWebsite(currentWebsite)}>Oui</Button>
                                    }
                                    {action === "pause" && 
                                        <Button variant="contained" onClick={pauseWebsite(currentWebsite)}>Oui</Button>
                                    }
                                    {action === "resume" && 
                                        <Button variant="contained" onClick={resumeWebsite(currentWebsite)}>Oui</Button>
                                    }
                                    <Button variant="outlined" style={{marginLeft: "2vh"}} onClick={handleCloseDeleteAlertModal}>Non</Button>
                                </div>
                            }
                        </Paper>
                    </Modal>
                    <Modal
                        open={openModal}
                        onClose={handleCloseModal}
                        aria-labelledby="modal-see-websites"
                        aria-describedby="modal to see websites of an user"
                        id="modal-see-websites"
                    >
                        <Paper elevation={1} className={"paper"}>
                        <h2>Sites web de l'utilisateur {currentUser?.firstName + " " + currentUser?.surname} :</h2>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>URL du site</TableCell>
                                        <TableCell>Nom de l'association</TableCell>
                                        <TableCell align="right">Statut</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {websites.map((website) => (
                                        <TableRow
                                            key={website.id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                <a href={"https://"+ website.url + ".arcadia-solution.com"}>{website.url}</a>
                                            </TableCell>
                                            <TableCell>{website.associationName}</TableCell>
                                            <TableCell style={{color: website.status === "active"? "green": "red"}} align="right">{website.status}</TableCell>
                                            <TableCell align="right">
                                                {website.status === "active" &&
                                                    <Button title={"Désactiver"} onClick={pauseWebsiteAlert(website)}><PauseIcon style={{color: 'darkred'}} /></Button>
                                                } 
                                                { website.status === "inactive" &&
                                                    <Button color={"error"} title={"Activer"} onClick={resumeWebsiteAlert(website)}><PlayArrowIcon style={{color: 'lightGreen'}} /></Button>
                                                }
                                                <Button title={"Supprimer"} onClick={deleteWebsiteAlert(website)}>{<Delete />}</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        </Paper>
                    </Modal>
                        <h2>Utilisateurs :</h2>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <p>Vous pouvez gérer les utilisateurs et leurs sites ici :</p>
                        </div>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nom</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell align="right">Role</TableCell>
                                        <TableCell align="center">Sites</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell>{user.firstName + " " +user.surname}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell style={{color: user.roles === "user"? "green": "red"}} align="right">{user.roles}</TableCell>
                                                <TableCell align="center">
                                                {user.websites.length !== 0 &&
                                                    <Button title={"Voir l'image"} onClick={() => openWebsiteModal(user)}>{
                                                        <WebIcon/>}
                                                    </Button>
                                                }
                                                </TableCell>
                                                <TableCell align="right">
                                                <Button title={"Supprimer"} onClick={() => {}}><Delete /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                </div>
            );
        }
    } else {
        return <div></div>
    }
}
