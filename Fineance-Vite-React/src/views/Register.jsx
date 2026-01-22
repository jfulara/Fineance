import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import '../styles/style.css';
import '../styles/security.css';


function Register() {
    const [form, setForm] = useState({ name: "", surname: "", email: "", password: "", confirmPassword: "" });
    const [message, setMessage] = useState("")
    const [errors, setErrors] = useState({});
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
        setMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setErrors({});

        try {
            const response = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (response.ok) {
                setMessage("Zarejestrowano pomyślnie!");
                navigate('/login')
            } else {
                const errorData = await response.json();

                if (errorData && typeof errorData === "object") {
                    const { message: genMsg, ...fieldErrors } = errorData;
                    const hasFieldErrors = Object.keys(fieldErrors).length > 0;

                    if (hasFieldErrors) {
                        setErrors(fieldErrors);
                    } else if (genMsg) {
                        setMessage(genMsg);
                    } else {
                        setMessage("Błąd rejestracji.");
                    }
                } else {
                    setMessage("Błąd rejestracji.");
                }
            }
        } catch (error) {
            setMessage("Wystąpił błąd połączenia z serwerem.");
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
                            Utwórz nowe konto:
                        </p>
                    </div>
                    <div className="login-link">
                        <p>Masz już konto?&nbsp;</p>
                        <Link to="/login">Przejdź do logowania!</Link>
                    </div>
                </div>
                <div className="form-side">
                    <form className="register" onSubmit={handleSubmit} noValidate>
                        <div className="messages">
                            {message && <p>{message}</p>}
                        </div>
                        <div className="auth-input">
                            <input name="name" placeholder="Imię" value={form.name} onChange={handleChange} required />
                            <small className="error">{errors.name}</small>
                        </div>
                        <div className="auth-input">
                            <input name="surname" placeholder="Nazwisko" value={form.surname} onChange={handleChange} required />
                            <small className="error">{errors.surname}</small>
                        </div>
                        <div className="auth-input">
                            <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required />
                            <small className="error">{errors.email}</small>
                        </div>
                        <div className="auth-input">
                            <input name="password" type="password" placeholder="Hasło" value={form.password} onChange={handleChange} required />
                            <small className="error">{errors.password}</small>
                        </div>
                        <div className="auth-input">
                            <input name="confirmPassword" type="password" placeholder="Powtórz hasło" value={form.confirmPassword} onChange={handleChange} required />
                            <small className="error">{errors.confirmPassword}</small>
                        </div>
                        <div className="button-background">
                            <button className="special-button" type="submit">Zarejestruj się</button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default Register;