import {createContext, FC, ReactNode, useMemo} from "react";

interface IUserSession {
    isLoggedIn: boolean;
    fullName: string;
    backPage: string;
    loginToken: string;
    roles: []
}

interface IProps {
    children: ReactNode;
}

export const UserSessionContext = createContext<IUserSession | null>(null);

export const UserSessionProvider: FC<IProps> = ({ children }) => {
    const userSession: IUserSession = useMemo(() => ({
        isLoggedIn: false,
        fullName: "",
        backPage: "",
        roles: [],
        loginToken: ""
    }), []);

    return (
        <UserSessionContext.Provider value={userSession}>
            {children}
        </UserSessionContext.Provider>
    );
}