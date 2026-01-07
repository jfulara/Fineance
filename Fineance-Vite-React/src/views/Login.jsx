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

    const handleLogin = async (e) => {
        e.preventDefault()

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
                navigate('/')
            } else {
                setError('Niepoprawne dane logowania')
            }
        } catch (error) {
            setError('Błąd logowania')
        }
    };

    return (
        <main className="security-main">
            <div className="login-container">
                <div className="logo-side">
                    <div className="logo">
                        <p>
                            Fineance
                        </p>
                    </div>
                    <div className="description">
                        <p className="main-description">
                            Dzień dobry!
                        </p>
                        <p className="additional-description">
                            Zaloguj się lub utwórz nowe konto:
                        </p>
                    </div>
                </div>
                <div className="form-side">
                    <form className="login" onSubmit={handleLogin}>
                        <div className="messages">
                            {error && <p>{error}</p>}
                        </div>
                        <div>
                            <input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <input placeholder="Hasło" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="button-background">
                            <button className="special-button" type="submit">Zaloguj się</button>
                        </div>
                        <div className="register-link">
                            <p>Nie masz jeszcze konta?&nbsp;</p>
                            <Link to="/register">Utwórz je tutaj!</Link>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default Login;