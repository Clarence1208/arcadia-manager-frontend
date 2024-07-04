import {useEffect, useState} from "react";
import {AddCircleOutline, Delete, Edit} from "@mui/icons-material";
import {Alert, Button, Link, Modal, Paper, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import { listFilesS3 } from "../../../utils/s3";
import { _Object } from "@aws-sdk/client-s3";

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
                        console.log(error)
                        setErrorMessage("Erreur : " + await error.message);
                        return []
                    }
                    const res = await response.json();
                    if (res.length === 0) {
                        setErrorMessage("Aucun site web trouvé")
                    }
                    return res;
                }
                getWebsites({userId: userId}).then(setWebsites)
            }
        }
    , [userToken, userId])


    useEffect(() => {
        const fetchData = async () => {
            try {
                const fileList = await listFilesS3();
                fileList?.Contents?.forEach((value: _Object, index: number, array: _Object[]) => {
                    if (!value?.Key) {
                        return;
                    }
                    const check = value.Key.split("/");
                    websites.forEach(website => {
                        if ((check[0] === website.associationName) && (check[1] === "common") && (check[2].startsWith("logo-"))) {
                            setWebsites((prev) => {
                                if (!prev.some(existingWebsite => existingWebsite.id === website.id)) {
                                    return [...prev, {...website, logo: "https://arcadia-bucket.s3.eu-west-3.amazonaws.com/" + value.Key}];
                                }
                                return prev;
                            });
                        } 
                    });
                });
            } catch (error) {
                console.error('List error:', error);
                setErrorMessage("Erreur : " + error);
                setOpen(true);
            }
        };
        fetchData();
    }, [websites]);

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

    if (websites.length === 0) {
        return <div>No websites...</div>
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
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                >{errorMessage}</Alert>
            </Snackbar>
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
                {errorMessage && <div className="error">{errorMessage}</div>}

                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>URL du site</TableCell>
                                <TableCell align="right">Statut</TableCell>
                                <TableCell align="right">Logo</TableCell>
                                <TableCell align="right">Actions</TableCell>
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
                                    <TableCell style={{color: website.status === "active"? "green": "red"}} align="right">{website.status}</TableCell>
                                   <TableCell align="center"><a onClick={()=>showLogo(website.logo)}>Voir l'image</a></TableCell>
                                    <TableCell align="right">
                                        <Button title={"Modifier"}><Edit /></Button>
                                        <Button title={"Supprimer"}>{<Delete />}</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}

type WebsitesFilters = {
    status?: "active" | "inactive",
    userId?: number
    limit?: number
    page?: number
}
