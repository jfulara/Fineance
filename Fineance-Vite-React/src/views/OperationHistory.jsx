import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faChevronRight, faBars, faCirclePlus, faCircleMinus, faPlus, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { fetchWithAuth } from '../utils/fetchWithAuth';

function OperationHistory() {
    const navigate = useNavigate();
    const { logout, user } = useContext(AuthContext);
    const [operations, setOperations] = useState([]);
    const [titleFilter, setTitleFilter] = useState("");
    const [debouncedFilter, setDebouncedFilter] = useState(titleFilter);
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownOptions = [
        { value: 'ALL', label: 'Wszystko' },
        { value: 'INCOME', label: 'Wpływy' },
        { value: 'EXPENSE', label: 'Wydatki' }
    ];
    const handleDropdownSelect = (value) => {
        setTypeFilter(value);
        setDropdownOpen(false);
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilter(titleFilter);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [titleFilter]);

    useEffect(() => {
        const params = new URLSearchParams();
        params.append("id_user", user.id_user);
        if (titleFilter !== "") {
            params.append("title", debouncedFilter);
        }
        if (typeFilter !== 'ALL') {
            params.append("type", typeFilter);
        }

        fetchWithAuth(`http://localhost:8080/api/operations/history?${params.toString()}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }, navigate, logout)
            .then(res => {
                if (!res.ok) throw new Error('Błąd serwera: ' + res.status);
                return res.json();
            })
            .then(data => setOperations(data))
            .catch(err => {
                console.error('Błąd pobierania danych:', err);
                navigate('/login');
            });
    }, [debouncedFilter, typeFilter]);

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
                    <li><Link to="/history" className="active"><p>Historia operacji</p><i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
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
            <main className="history-main">
                <section className="history">
                    <h1>Historia operacji</h1>
                    <div className="history-content">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Szukaj po tytule operacji..."
                                value={titleFilter}
                                onChange={e => setTitleFilter(e.target.value)}
                            />
                        </div>
                        <div className="operations-list">
                            {operations.length === 0 ? (
                                <p>Brak operacji do wyświetlenia</p>
                            ) : (
                                <table>
                                    <thead>
                                    <tr>
                                        <th className="date">Data</th>
                                        <th className="title">Tytuł</th>
                                        <th>Kategoria</th>
                                        <th className="th-last">
                                            Kwota
                                            <span onClick={() => setDropdownOpen((open) => !open)}>
                                                <FontAwesomeIcon icon={faChevronDown} />
                                            </span>
                                            {dropdownOpen && (
                                                <ul>
                                                    {dropdownOptions.map(opt => (
                                                        <li key={opt.value}
                                                            style={{
                                                                background: typeFilter === opt.value ? '#333' : 'transparent',
                                                                fontWeight: typeFilter === opt.value ? 'bold' : 'normal'
                                                            }}
                                                            onClick={() => handleDropdownSelect(opt.value)}
                                                        >
                                                            {opt.label}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {operations.map(op => (
                                        <tr key={`${op.type}-${op.id}`}>
                                            <td className="date">{new Date(op.date).toLocaleDateString()}</td>
                                            <td className="title">{op.title}</td>
                                            <td>{op.category}</td>
                                            <td className={`td-last ${op.type === 'INCOME' ? "income" : "expense"}`}>
                                                <i>{op.amount.toFixed(2)} </i> PLN
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>

                            )}
                        </div>
                        <div className="filler">
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

export default OperationHistory;

