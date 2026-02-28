"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { ReactNode } from "react";

interface ReCaptchaProviderProps {
    children: ReactNode;
    reCaptchaKey?: string;
}

export const ReCaptchaProvider = ({
    children,
    reCaptchaKey,
}: ReCaptchaProviderProps) => {
    const siteKey = reCaptchaKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey || process.env.NODE_ENV !== "production") {
        if (!siteKey && process.env.NODE_ENV === "production") {
            console.warn("ReCaptchaProvider: No site key provided in production.");
        }
        return <>{children}</>;
    }

    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={siteKey}
            scriptProps={{
                async: false,
                defer: false,
                appendTo: "head",
                nonce: undefined,
            }}
        >
            {children}
        </GoogleReCaptchaProvider>
    );
};
