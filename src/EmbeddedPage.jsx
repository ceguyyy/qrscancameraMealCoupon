
import React, { useEffect, useState } from 'react';

const EmbeddedPage = () => {
    const [config, setConfig] = useState({ token: null, env: null });
    const [viewState, setViewState] = useState('LOADING'); // LOADING, SUCCESS, EXPIRED, UNAUTHORIZED, ERROR
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const tokenParam = queryParams.get('token');
        const envParam = queryParams.get('env');

        if (tokenParam && envParam) {
            setConfig({ token: tokenParam, env: envParam });
            fetchData(tokenParam, envParam);
        } else {
            setErrorMessage("Missing token or env parameters");
            setViewState('ERROR');
        }
    }, []);

    const fetchData = async (token, env) => {
        try {
            const urlInfix = env === 'development' ? '-dev' : '';
            const apiUrl = `https://api-officeless${urlInfix}.mekari.com/`; // Note: Original snippet had trailing slash, keeping it. 
            // Warning: The snippet fetched from base URL. Usually APIs have endpoints like /users or /data. 
            // I will keep it as requested but it might need adjustment later.

            // Wait, looking at the snippet:
            // const apiUrl = `https://api-officeless${urlInfix}.mekari.com/`;
            // This is likely just the base check or health check if fetched directly?
            // Or maybe the user meant to append an endpoint. 
            // I will strictly follow the snippet for now.

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                }
            });

            // The user's snippet implies the response might be JSON with error field
            // even if status is OK.
            const result = await response.json();

            // 1. Handle Specific Business Logic Errors
            if (result.error === true) {
                if (result.message === "ERR_TOKEN_EXPIRED") {
                    setViewState('EXPIRED');
                    return;
                }

                if (result.message === "ERR_UNAUTHORIZED") {
                    setViewState('UNAUTHORIZED');
                    return;
                }
            }

            // 2. Handle Standard HTTP Errors
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            // 3. Success
            setViewState('SUCCESS');

        } catch (err) {
            console.error("Fetch error:", err);
            setErrorMessage(err.toString());
            setViewState('ERROR');
        }
    };

    if (viewState === 'LOADING') {
        return <div>Loading...</div>;
    }

    if (viewState === 'UNAUTHORIZED') {
        return <div>Error 401: Unauthorized</div>;
    }

    if (viewState === 'EXPIRED') {
        return <div>Token Expired. Please reload the page.</div>;
    }

    if (viewState === 'ERROR') {
        return <div>Error: {errorMessage}</div>;
    }

    return (
        <div>
            <h1>Success Render</h1>
            {/* Additional UI logic here */}
        </div>
    );
};

export default EmbeddedPage;
