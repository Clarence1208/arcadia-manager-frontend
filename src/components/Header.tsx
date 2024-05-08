import '../styles/Header.css';
import logo from '../images/logo.png';
import {Link} from "@mui/material";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {LogIn} from "../routes/LogIn";
import {useContext} from "react";
import {UserSessionContext} from "../contexts/user-session";

interface CustomNavItemProps {
    link: string;
    text: string;
    expand?: boolean
}
export function CustomNavItem(props: CustomNavItemProps){
    return (
        <div className="navItem">
            <Link href={props.link} underline={"none"}>{props.text}</Link>
            {props.expand && <ExpandMoreIcon />}
        </div>
    )
}
export default function Header() {
    const userSession = useContext(UserSessionContext);
    console.log(userSession)

    return (
        <div>
      <div className="main-header">
        <div className="header-logo">
            <a href="/"><img src={logo} alt="logo" /></a>
        </div>
          <div className="nav-header">
             <CustomNavItem link="/services" text="Nos services" expand={true} />
              <CustomNavItem link="/websites/new" text="Créer un site" />
                <CustomNavItem link="/contact" text="Contact" />
          </div>

          <a href= {userSession?.userSession.isLoggedIn ? "/logout" : "/login"}>
          <PersonOutlineIcon className="icon" fontSize={"large"} />
          </a>
      </div>
            <div className="footer-header"></div>
        </div>
    )
  }
  