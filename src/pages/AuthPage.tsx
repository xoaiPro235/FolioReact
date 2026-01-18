import React, { useEffect } from 'react';
import { Auth } from '../components/Auth';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
    const { currentUser } = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    return <Auth />;
};

export default AuthPage;
