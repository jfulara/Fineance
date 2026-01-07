import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faChevronRight, faBars, faCirclePlus, faCircleMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import { fetchWithAuth } from '../utils/fetchWithAuth'
import '../styles/style.css'
import '../styles/add-operation.css'

function AddIncome() {
    const navigate = useNavigate();
    const { logout, user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [category, setCategory] = useState("Wynagrodzenie");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

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
                navigate('/');
            } else {
                setError('Niepoprawne dane');
            }
        } catch (error) {
            setError('Błąd wprowadzania wpływu');
        } finally {
            setLoading(false);
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
                    <li><Link to="/" className="first"><p>Podsumowanie</p><i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link to="/history"><p>Historia operacji</p><i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link><p>Analiza budżetu</p><i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link to="/savings"><p>Oszczędzanie</p><i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link><p>Cele miesięczne</p><i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link><p>Stałe wydatki</p><i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link><p>Statystyki</p><i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
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
                <section className="operation-section">
                    <h1>Dodaj operację</h1>
                    <div className="add-operation-content">
                        <form onSubmit={handleSubmit} className="operation-form">
                            <div className="messages">
                                {messages.map((message, index) => (
                                    <p key={index}>{message}</p>
                                ))}
                                {error && <p style={{color: 'red'}}>{error}</p>}
                            </div>
                            <h2>Wprowadź nowy wpływ</h2>
                            <div className="form-group">
                                <label>Tytuł *</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="np. Wynagrodzenie za lipiec"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Kwota (PLN) *</label>
                                <input
                                    type="number"
                                    name="amount"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="np. 5000.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Data *</label>
                                <input
                                    type="date"
                                    name="date"
                                    placeholder="Data"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Kategoria *</label>
                                <select
                                    name="category"
                                    placeholder="Kategoria"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    required
                                >
                                    <option value="Nieistotne">Nieistotne</option>
                                    <option value="Oszczędności i inwestycje">Oszczędności i inwestycje</option>
                                    <option value="Podarunki">Podarunek</option>
                                    <option value="Premie">Premia</option>
                                    <option value="Wynagrodzenie">Wynagrodzenie</option>
                                    <option value="Nieskategoryzowane">Nieskategoryzowane</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Dodawanie...' : 'Dodaj'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </>
    );
}

export default AddIncome;
