import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faChevronRight, faBars, faCirclePlus, faCircleMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import { fetchWithAuth } from '../utils/fetchWithAuth'

function AddIncome() {
    const navigate = useNavigate();
    const { logout, user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [category, setCategory] = useState("Wynagrodzenie");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await fetchWithAuth('http://localhost:8080/api/operations/addIncome', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ title, amount, date, category, id_user: user.id_user })
            }, navigate, logout);

            if (response.ok) {
                navigate('/')
            } else {
                setError('Niepoprawne dane')
            }
        } catch (error) {
            setError('Błąd wprowadzania wpływu')
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <>
            <nav className="menu">
                <div className="logo">
                    <p>Fineance</p>
                </div>
                <div className="welcome-string">
                    <p>Witaj {user.name}!</p>
                </div>
                <ul className="active">
                    <li><Link to="/" className="first">Podsumowanie<i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link to="/budgetAnalysis">Analiza budżetu<i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link to="/monthlyGoals">Cele miesięczne<i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link to="/history">Historia operacji<i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link to="/statistics">Statystyki<i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link to="/savings">Oszczędzanie<i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                </ul>
                <div className="buttons">
                    <button className="technical-help">Pomoc techniczna</button>
                    <button className="settings"><i className="fa-gear"><FontAwesomeIcon icon={faGear} /></i>Ustawienia</button>
                    <button className="logout" onClick={handleLogout}>Wyloguj się</button>
                </div>
                <ul className="mobile-icons">
                    <i className="fa-bars"><FontAwesomeIcon icon={faBars} /></i>
                </ul>
            </nav>
            <nav className="adder">
                <ul className="adder-list">
                    <li className="adder-item">
                        <Link to="/addIncome" className="adder-link">
                            <i className="fa-circle-plus"><FontAwesomeIcon icon={faCirclePlus} /></i>
                            <span className="link-text">&nbsp;&nbsp;&nbsp;&nbsp;Dodaj wpływ</span>
                        </Link>
                    </li>
                    <li className="adder-item">
                        <Link to="/addExpense" className="adder-link">
                            <i className="fa-circle-minus"><FontAwesomeIcon icon={faCircleMinus} /></i>
                            <span className="link-text">&nbsp;&nbsp;&nbsp;&nbsp;Dodaj wydatek</span>
                        </Link>
                    </li>
                </ul>
                <div className="plus">
                    <i className="fa-plus"><FontAwesomeIcon icon={faPlus} /></i>
                </div>
            </nav>
            <main>
                <section className="operation-form">
                    <h1>Dodaj operację</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="messages">
                            {messages.map((message, index) => (
                                <p key={index}>{message}</p>
                            ))}
                            {error && <p style={{color: 'red'}}>{error}</p>}
                        </div>
                        <h2>Wprowadź nowy wpływ</h2>
                        <input name="title" type="text" placeholder="Tytuł" value={title} onChange={e => setTitle(e.target.value)} required />
                        <input name="amount" type="number" step="0.01" min="0.00" placeholder="Kwota" value={amount} onChange={e => setAmount(e.target.value)} required />
                        <input name="date" type="date" placeholder="Data" value={date} onChange={e => setDate(e.target.value)} required />
                        <select name="category" placeholder="Kategoria" value={category} onChange={e => setCategory(e.target.value)} required>
                            <option value="Nieistotne">Nieistotne</option>
                            <option value="Oszczędności i inwestycje">Oszczędności i inwestycje</option>
                            <option value="Podarunki">Podarunek</option>
                            <option value="Premie">Premia</option>
                            <option value="Wynagrodzenie">Wynagrodzenie</option>
                            <option value="Nieskategoryzowane">Nieskategoryzowane</option>
                        </select>
                        <button type="submit">Dodaj</button>
                    </form>
                </section>
            </main>
        </>
    );
}

export default AddIncome;
