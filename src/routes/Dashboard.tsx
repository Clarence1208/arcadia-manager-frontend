import Header from "../components/Header";
import {Footer} from "../components/Footer";
import {SyntheticEvent, useContext, useEffect, useState} from "react";
import {UserSessionContext} from "../contexts/user-session";
import {WebsitesPanel} from "../components/features/dashboard/WebsitesPanel";
import {UserAccountPanel} from "../components/features/dashboard/UserAccountPanel";
import {Tab, Tabs} from "@mui/material";
import "../styles/Dashboard.css";
import { UsersPanel } from "../components/features/dashboard/UsersPanel";
import { Navigate, useNavigate } from "react-router-dom";
import InvoicesPanel from "../components/features/dashboard/InvoicesPanel";


//tabs comes from MUI API docs https://mui.com/material-ui/react-tabs/
function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}
function TabPanel(props: any) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <div>
                    {children}
                </div>
            )}
        </div>
    );
}

export function Dashboard(){
    const userSession = useContext(UserSessionContext)?.userSession
    const [tabsValue, setTabsValue] = useState(0);
    let navigate = useNavigate();

    const handleChange = (event: SyntheticEvent, newValue: number) => {
        setTabsValue(newValue);
        event.currentTarget.className = "active"; //doesn't seem to work as intended
    };
    useEffect(() => {

        if (!userSession?.isLoggedIn) {
            navigate('/login')
        }

    }, []);

    return (
        <div>
            <Header />

            <div id="dahsboard-main" className="main">

                <Tabs
                    className="panels-tabs"
                    orientation="vertical"
                    variant="scrollable"
                    value={tabsValue}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    sx={{ borderRight: 1, borderColor: 'divider' }}
                >
                    {userSession?.roles !== "superadmin" &&
                        <Tab label="Mes sites" {...a11yProps(0)}/>
                    }
                    {userSession?.roles === "superadmin" &&
                        <Tab label="Gestion des utlisateurs" {...a11yProps(0)}/>
                    }
                    <Tab label="Mon compte" {...a11yProps(1)}/>
                    {userSession?.roles !== "superadmin" &&
                        <Tab label="Historique de paiement" {...a11yProps(2)}/>
                    }
                </Tabs>

                <div className={"board"}>
                    <h1>Tableau de bord de {userSession?.fullName || "l'administrateur"}</h1>

                    {/*TABS PANEL: */}
                    {userSession?.roles !== "superadmin" &&
                    <TabPanel value={tabsValue} index={0}>
                        <WebsitesPanel userId={userSession?.userId} userToken={userSession?.loginToken} />
                    </TabPanel>
                    }
                        <TabPanel value={tabsValue} index={1}>
                            <UserAccountPanel userId={userSession?.userId} userToken={userSession?.loginToken} />
                        </TabPanel>
                    <TabPanel value={tabsValue} index={2}>
                        <InvoicesPanel />
                    </TabPanel>
                    {userSession?.roles === "superadmin" &&
                        <TabPanel value={tabsValue} index={0}>
                            <UsersPanel userToken={userSession?.loginToken} />
                        </TabPanel>
                    }
                </div>

            </div>

            <Footer />
        </div>
    );
}