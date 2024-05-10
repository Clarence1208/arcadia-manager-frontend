import {useEffect, useState} from "react";
import {AddCircleOutline, Delete, Edit} from "@mui/icons-material";
import {Button, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import logo from "../../../images/logo.png";
type Website = {
    id: number;
    url: string;
    status: string;

}
type WebsitesPanelProps = {
    userId: number | undefined;
    userToken: string | undefined;
}
export function WebsitesPanel({userId, userToken}: WebsitesPanelProps){
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [websites, setWebsites] = useState<Website[]>([])
    console.log(userId, userToken)

    useEffect(() => {
            if (userToken && userId) {
                const getWebsites = async (filters: WebsitesFilters): Promise<Website[]> => {
                    const bearer = "Bearer " + userToken;
                    const response: Response = await fetch(`http://localhost:3000/websites?userId=${userId}`, {
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

    if (websites.length === 0) {
        return <div>Loading...</div>
    }else{
        return (
            <div>
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
                                        {website.url}
                                    </TableCell>
                                    <TableCell style={{color: website.status === "active"? "green": "red"}} align="right">{website.status}</TableCell>
                                   <TableCell align="center"><a onClick={()=>alert("Flemme")}>Voir l'image</a></TableCell>
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
