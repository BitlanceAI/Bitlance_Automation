import React, { useEffect } from 'react';

const FacebookLogin = () => {
    useEffect(() => {
        // Re-parse XFBML when component mounts to render the button
        if (window.FB) {
            window.FB.XFBML.parse();
        }

        // Define the callback if it doesn't exist (it should be in index.html, but good to be safe/consistent)
        // Actually, the index.html logic handles the global window.checkLoginState.
        // We just need to make sure the button triggers it.
    }, []);

    return (
        <div className="flex justify-center mt-4">
            <div
                className="fb-login-button"
                data-width=""
                data-size="large"
                data-button-type="continue_with"
                data-layout="default"
                data-auto-logout-link="false"
                data-use-continue-as="false"
                data-onlogin="checkLoginState();"
            >
            </div>
        </div>
    );
};

export default FacebookLogin;
