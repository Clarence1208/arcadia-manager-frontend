import {useEffect, useState} from "react";
import {AddCircleOutline, Delete, Edit} from "@mui/icons-material";
import {Alert, Button, CircularProgress, Link, Modal, Paper, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import { listFilesS3 } from "../../../utils/s3";
import { _Object } from "@aws-sdk/client-s3";
import VisibilityIcon from '@mui/icons-material/Visibility';
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
    userId: number | undefined;
    userToken: string | undefined;
}
export function WebsitesPanel({userId, userToken}: WebsitesPanelProps){
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [websites, setWebsites] = useState<Website[]>([])
    const [open, setOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [logo, setLogo] = useState<string>("");
    const [websiteLoaded, setWebsiteLoaded] = useState<boolean>(false);
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string>("");
    const [action, setAction] = useState<string>("");
    const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null);
    const [openDeleteAlertModal, setOpenDeleteAlertModal] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [changeOnPage, setChangeOnPage] = useState<boolean>(false);
    
    useEffect(() => {
        if (websiteLoaded) {
            setTimeout(() => {
                setIsPageLoaded(true);
            }, 200);
        }
    }, [websiteLoaded]);

    useEffect(() => {
            if (userToken && userId) {
                const getWebsites = async (filters: WebsitesFilters): Promise<Website[]> => {
                    const bearer = "Bearer " + userToken;
                    const response: Response = await fetch(`${import.meta.env.VITE_API_URL}/websites?userId=${userId}`, {
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
                    if (res.length === 0) {
                        setErrorMessage("Aucun site web trouvé")
                    }
                    return res;
                }
                getWebsites({userId: userId}).then(setWebsites).then(() => setWebsiteLoaded(true));
            }
        }
    , [userToken, userId])


    useEffect(() => {
        const fetchData = async () => {
            try {
                const fileList = await listFilesS3();
                const websitesWithLogos = [...websites];

                if (fileList?.Contents) {
                    for (const value of fileList.Contents) {
                        if (!value?.Key) continue;

                        const check = value.Key.split("/");
                        for (const website of websitesWithLogos) {
                            if (
                                check[0] === website.associationName &&
                                check[1] === "common" &&
                                check[2].startsWith("logo-")
                            ) {
                                website.logo = `https://arcadia-bucket.s3.eu-west-3.amazonaws.com/${value.Key}`;
                            }
                        }
                    }
                }
                setWebsites(websitesWithLogos);
            } catch (error) {
                console.error('List error:', error);
                setErrorMessage("Erreur : " + error);
                setOpen(true);
            }
        };
        fetchData();
    }, [websiteLoaded]);

    const handleClose = () => {
        setOpen(false);
        setErrorMessage("")
    }

    const handleCloseModal = () => {
        setOpenModal(false);
    }

    const showLogo = (url: string|undefined) => {
        if (!url) {
            setErrorMessage("Erreur : Pas d'image pour ce site web");
            setOpen(true);
            return;
        }
        setLogo(url);
        setOpenModal(true);
    }

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

    const handleCloseDeleteAlertModal = () => {
        setOpenDeleteAlertModal(false);
    }

    const deleteWebsite = (website: Website) => {
        return async () => {
            try {
                setIsLoading(true);
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
                setIsLoading(false);
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
                setIsLoading(true);
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
                setIsLoading(false);
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
                setIsLoading(true);
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
                setIsLoading(false);
                return res;
            } catch (e) {
                setErrorMessage("Erreur : " + e);
                setOpen(true);
            }
        }
    }

    if (isPageLoaded) {
        if (websites.length === 0) {
            return <div>
                <h2>Vous n'avez pas encore de site !</h2>
                <h3>Créez-en un en cliquant sur le bouton "Créer un site"</h3>
                <a color="primary" href="/websites/new">
                    <Button variant="contained" color="primary" type="submit" disableElevation>Créer un site</Button>
                </a>
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
                            { currentWebsite && !isLoading && 
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
                            {isLoading &&
                                <div className='loader'>
                                <CircularProgress />
                                </div>
                            }
                        </Paper>
                    </Modal>
                    <Modal
                        open={openModal}
                        onClose={handleCloseModal}
                        aria-labelledby="modal-create-setting"
                        aria-describedby="modale to create a setting"
                        id="modal-create-setting"
                    >
                        <Paper elevation={1} className={"paper"}>
                            <img src={logo} alt="image" style={{maxWidth: "50vh"}}/>
                        </Paper>
                    </Modal>
                        <h2>Vos sites web</h2>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <p>Vous pouvez gérer les sites web d'ici</p>
                            <Link href={"/websites/new"} style={{marginLeft: "3vw"}} title={"Ajouter un site"}><AddCircleOutline/></Link>
                        </div>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>URL du site</TableCell>
                                        <TableCell>Nom de l'association</TableCell>
                                        <TableCell align="right">Statut</TableCell>
                                        <TableCell align="center">Logo</TableCell>
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
                                        <TableCell align="center"><Button title={"Voir l'image"} onClick={() => showLogo(website.logo)}>{
                                                    <VisibilityIcon/>}</Button></TableCell>
                                            <TableCell align="right">
                                                {website.status === "active" &&
                                                    <Button title={"Désactiver"} onClick={pauseWebsiteAlert(website)}><PauseIcon style={{color: 'lightRed'}} /></Button>
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
                </div>
            );
        }
    } else {
        return <div></div>
    }
}

type WebsitesFilters = {
    status?: "active" | "inactive",
    userId?: number
    limit?: number
    page?: number
}
