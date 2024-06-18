import {CircularProgress} from "@mui/material";

type LoadingSpinnerProps = {
    message: string
}
export default function LoadingSpinner(props: LoadingSpinnerProps) {

    return (
        <div className="main" style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems:"center"}}>
            <div className="spinner"></div>
            <iframe src="https://giphy.com/embed/aNqEFrYVnsS52" width="480" height="269" className="giphy-embed" allowFullScreen></iframe>
            <CircularProgress style={{marginTop: "2em"}} color={"inherit"}/>
            <h2>{props.message}</h2>
        </div>
    )
}