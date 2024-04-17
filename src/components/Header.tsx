import '../styles/Header.css';
import logo from '../images/logo.png';
import {Link} from "@mui/material";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface CustomNavItemProps {
    link: string;
    text: string;
}
export function CustomNavItem(props: CustomNavItemProps){
    return (
        <div className="navItem">
            <Link href={props.link} underline={"none"}>{props.text}</Link>
            <ExpandMoreIcon />
        </div>
    )
}
export default function Header() {
    return (
        <div>
      <div className="main-header">
        <div className="header-logo">
            <a href="/"><img src={logo} alt="logo" /></a>
        </div>
          <div className="nav-header">
             <CustomNavItem link="/services" text="Nos services" />
              <CustomNavItem link="/websites/new" text="Créer un site" />
                <CustomNavItem link="/contact" text="Contact" />
          </div>
          <PersonOutlineIcon className="icon" fontSize={"large"} />
      </div>
            <div className="footer-header"></div>
        </div>
    )
  }
  