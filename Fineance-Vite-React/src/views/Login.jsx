import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { useContext } from 'react'
import { Link } from 'react-router-dom'
//import '../styles/style.css';
import '../styles/security.css';

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const { setUser } = useContext(AuthContext)

    const handleChange = (field, value) => {
        if (field === 'email') {
            setEmail(value);
        } else if (field === 'password') {
            setPassword(value);
        }
        setError('');
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                navigate('/');
            } else {
                const errorData = await response.json();

                if (errorData && typeof errorData === 'object') {
                    setError(
                        errorData.message ||
                        errorData.email ||
                        errorData.password ||
                        Object.values(errorData)[0] ||
                        'Niepoprawne dane logowania'
                    );
                } else if (response.status === 401) {
                    setError('Niepoprawne dane logowania');
                } else {
                    setError('Wystąpił błąd podczas logowania');
                }
            }
        } catch (error) {
            setError('Wystąpił błąd połączenia z serwerem')
        }
    };

    return (
        <main className="security-main">
            <div className="login-container">
                <div className="logo-side">
                    <div className="logo">
                        <p>Fineance</p>
                    </div>
                    <div className="description">
                        <p className="main-description">
                            Dzień dobry!
                        </p>
                        <p className="additional-description">
                            Zaloguj się na swoje konto:
                        </p>
                    </div>
                    <div className="register-link">
                        <p>Nie masz jeszcze konta?&nbsp;</p>
                        <Link to="/register">Utwórz je tutaj!</Link>
                    </div>
                </div>
                <div className="form-side">
                    <form className="login" onSubmit={handleLogin}>
                        <div className="messages">
                            {error && <p>{error}</p>}
                        </div>
                        <div className="auth-input">
                            <input placeholder="E-mail" value={email} onChange={(e) => handleChange('email', e.target.value)} />
                        </div>
                        <div className="auth-input">
                            <input placeholder="Hasło" type="password" value={password} onChange={(e) => handleChange('password', e.target.value)} />
                        </div>
                        <div className="button-background">
                            <button className="special-button" type="submit">Zaloguj się</button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default Login;