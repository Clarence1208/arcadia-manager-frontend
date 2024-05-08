import {createContext, FC, ReactNode, useEffect, useMemo, useState} from "react";

interface IUserSession {
    isLoggedIn: boolean;
    fullName: string;
    backPage: string;
    loginToken: string;
    roles: [];
}

interface IUserSessionContext {
    userSession: IUserSession;
    updateUserSession: (newUserSession: Partial<IUserSession>) => void;
}

interface IProps {
    children: ReactNode;
}

export const UserSessionContext = createContext<IUserSessionContext | null>(null);

export const UserSessionProvider: FC<IProps> = ({ children }) => {
    const [userSession, setUserSession] = useState<IUserSession>({
        isLoggedIn: false,
        fullName: "",
        backPage: "",
        loginToken: "",
        roles: [],
    });

    //le contexte ne persistait pas donc on tente de stocker dans local storage mais c'est de la D ça marche pas.
    useEffect(() => {
        // Retrieve user session data from local storage on component mount
        const storedUserSession = localStorage.getItem("userSession");
        if (storedUserSession) {
            setUserSession(JSON.parse(storedUserSession));
        }
    }, []);

    useEffect(() => {
        // Write updated user session data to local storage whenever it changes
        localStorage.setItem("userSession", JSON.stringify(userSession));
    }, [userSession]);

    const updateUserSession = (newUserSession: Partial<IUserSession>) => {
        setUserSession({...userSession, ...newUserSession});
        console.log(userSession)
    };


    return (
        <UserSessionContext.Provider value={{userSession, updateUserSession}}>
            {children}
        </UserSessionContext.Provider>
    );
}