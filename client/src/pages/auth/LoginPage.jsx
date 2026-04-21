import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FullScreenLogin } from '../../components/ui/full-screen-login';
import { trackLogin, trackLoginError } from '../../lib/analytics';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await signIn({ email, password });
            if (error) throw error;
            trackLogin('email');
            toast.success("Welcome back! 👋");
            navigate('/home');
        } catch (error) {
            console.error(error);
            const message = error.message === "Invalid login credentials"
                ? "Oops! Incorrect email or password. Please try again."
                : error.message;
            trackLoginError(message);
            toast.error(message, {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <FullScreenLogin
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleSubmit={handleLogin}
            loading={loading}
        />
    );
};

export default LoginPage;
