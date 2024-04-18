import {FormEvent, useState} from "react";
import {useMultiStepForm} from "../components/features/useMultipleStepForm";
import {UserForm} from "../components/features/form/UserForm";
import {WebsiteForm} from "../components/features/form/WebsiteForm";

import '../styles/Form.css';
import Header from "../components/Header";
import {Footer} from "../components/Footer";

type FormData = {
    firstName: string
    lastName: string
    email: string
    password: string
    url: string,
    dbUsername: string,
    dbPassword: string,
}
const FORM_STEPS = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    url: "",
    dbUsername: "",
    dbPassword: ""
}
export function NewService() {
    const [data, setData] = useState(FORM_STEPS)

    function updateFields(fields: Partial<FormData>) {
        setData(prev => {
            return { ...prev, ...fields }
        })
    }

    function createAccountAndWebsite(e: FormEvent) {
        console.log("Creating account and website", data)
    }

    const { steps, currentStepIndex, step, isFirstStep, isLastStep, back, next } = useMultiStepForm(
        [
            <UserForm {...data} updateFields={updateFields} formTitle="Account details" />,
            <WebsiteForm {...data} updateFields={updateFields} formTitle="Website details" />
            ])

    function onSubmit(e: FormEvent) {
        e.preventDefault()
        if (!isLastStep) return next()
        alert("Submitted but not more yet")
        // Send data to the server
        //createAccountAndWebsite(e)
    }

    return (
        <div>
            <Header />

        <div id={"create-website-page"}>
            <h1>Create a website</h1>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ position: "relative", background: "white", border: "1px solid black", padding: "2rem", margin: "1rem", borderRadius: ".5rem", fontFamily: "Arial", maxWidth: "max-content" }}>
                    <form onSubmit={onSubmit}>
                        <div style={{ position: "absolute", top: ".5rem", right: ".5rem" }}>
                            {currentStepIndex + 1} / {steps.length}
                        </div>
                        {step}
                        <div style={{
                            marginTop: "1rem",
                            display: "flex",
                            gap: ".5rem",
                            justifyContent: "flex-end"
                        }}>
                            {!isFirstStep && (
                                <button type="button" onClick={back}>Back</button>

                            )}
                            <button type="submit">{isLastStep ? "Finish" : "Next"}  </button>

                        </div>
                    </form>
                </div>
            </div>
        </div>
            <Footer />
        </div>
    )
}
