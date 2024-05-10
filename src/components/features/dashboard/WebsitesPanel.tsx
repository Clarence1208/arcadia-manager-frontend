import {useEffect, useState} from "react";
import {Delete, Edit} from "@mui/icons-material";
import {Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";

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

    useEffect(() => {
            if (userToken) {
                const getWebsites = async (filters: WebsitesFilters): Promise<Website[]> => {
                    const bearer = "Bearer " + userToken;
                    const response: Response = await fetch("http://localhost:3000/websites", {
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
                    return res;
                }
                const fetchedWebsites = getWebsites({userId: userId}).then(setWebsites)
            }
        }
    , [userToken])

    if (websites.length === 0) {
        return <div>Loading...</div>
    }else{
        return (
            <div>
                <h2>Vos sites web</h2>
                <p>Vous pouvez gérer les sites web d'ici</p>

                {errorMessage && <div className="error">{errorMessage}</div>}

                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Website URL</TableCell>
                                <TableCell align="right">Statut</TableCell>
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
                                    <TableCell align="right">{website.status}</TableCell>
                                    <TableCell align="right">
                                        <Button><Edit /></Button>
                                        <Button>{<Delete />}</Button>
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