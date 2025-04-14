declare module "@/components/registrationForm" {
    import React from "react";
    const RegistrationForm: React.FC<{
        onSignUp: ({ email, password }: { email: string; password: string }) => void;
        onSwitchToLogIn: () => void;
        error: string;
    }>;
    export default RegistrationForm;
}