import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullScreenSignup } from '../components/ui/full-screen-signup';
import { trackSignup, trackSignupError } from '../lib/analytics';

const SignupPage = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const { error } = await signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                        phone: formData.phone
                    }
                }
            });

            if (error) throw error;

            trackSignup('email');

            try {
                await fetch('https://bitlancetechhub.app.n8n.cloud/webhook/signupbitlance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        phone: formData.phone,
                        email: formData.email
                    })
                });
            } catch (webhookError) {
                console.error('Webhook error:', webhookError);
            }

            setSuccess('Account created successfully! Please check your email for verification.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            trackSignupError(error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <FullScreenSignup
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSignup}
            loading={loading}
            error={error}
            success={success}
        />
    );
};

export default SignupPage;
