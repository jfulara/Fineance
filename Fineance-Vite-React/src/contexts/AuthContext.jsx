import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCurrentUser = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:8080/api/auth/me', {
                method: 'GET',
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error('Not authenticated');
            }

            const data = await res.json();
            setUser(data);
            return true;
        } catch (error) {
            console.error('Błąd podczas pobierania danych użytkownika:', error);
            setUser(null);
            return false;
        }
    }, []);

    useEffect(() => {
        const initializeAuth = async () => {
            setLoading(true);
            await fetchCurrentUser();
            setLoading(false);
        };

        initializeAuth();
    }, [fetchCurrentUser]);

    const logout = async () => {
        try {
            await fetch('http://localhost:8080/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Błąd podczas wylogowania:', error);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout, fetchCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
};
