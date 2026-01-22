import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faChevronRight, faBars, faCirclePlus, faCircleMinus, faPlus, faPenToSquare, faSpinner } from '@fortawesome/free-solid-svg-icons';
import '../styles/saving-details.css';
import '../styles/style.css';

export default function SavingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { logout, user } = useContext(AuthContext);
    const [saving, setSaving] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isDepositing, setIsDepositing] = useState(false);
    const [width, setWidth] = useState("0%");

    useEffect(() => {
        fetchWithAuth(`http://localhost:8080/api/savings/${id}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }, navigate, logout)
            .then(res => res.json())
            .then(data => {
                setSaving(data);
            })
            .catch(err => {
                console.error('Bład podczas pobierania celu:', err);
            })
            .finally(() => {
                const timer = setTimeout(() => {
                    setLoading(false);
                }, 750);
                return () => clearTimeout(timer);
            });
    }, []);

    const handleDeposit = async (e) => {
        e.preventDefault();
        if (!depositAmount || parseFloat(depositAmount) <= 0) {
            alert('Wpisz prawidłową kwotę!');
            return;
        }

        setIsDepositing(true);
        try {
            const response = await fetch(`http://localhost:8080/api/savings/${id}/deposit`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ amount: parseFloat(depositAmount) })
                }
            );

            if (!response.ok) throw new Error('Błąd wpłaty');

            const updated = await response.json();
            setSaving({
                ...saving,
                amount: updated.amount
            });
            setDepositAmount('');
            alert('Wpłata udana!');
        } catch (err) {
            alert('Błąd: ' + err.message);
        } finally {
            setIsDepositing(false);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
            alert('Wpisz prawidłową kwotę!');
            return;
        }

        if (parseFloat(withdrawAmount) > parseFloat(saving.amount)) {
            alert('Nie masz wystarczających środków na celu!');
            return;
        }

        setIsDepositing(true);
        try {
            const response = await fetch(`http://localhost:8080/api/savings/${id}/withdraw`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ amount: parseFloat(withdrawAmount) })
                }
            );

            if (!response.ok) throw new Error('Błąd wypłaty');

            const updated = await response.json();
            setSaving({
                ...saving,
                amount: updated.amount
            });
            setWithdrawAmount('');
            alert('Wypłata udana!');
        } catch (err) {
            alert('Błąd: ' + err.message);
        } finally {
            setIsDepositing(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten cel?')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/savings/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Błąd usuwania');

            navigate('/savings');
        } catch (err) {
            alert('Błąd: ' + err.message);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const progress = saving ? (saving.amount / saving.goal) * 100 : 0;

    if (loading) {
        return (
            <div className="loading-container">
                <p>Fineance</p>
                <i><FontAwesomeIcon icon={faSpinner} /></i>
            </div>
        );

    }

    if (error) return <div className="container error"><p>Błąd: {error}</p></div>;
    if (!saving) return <div className="container error"><p>Cel nie znaleziony</p></div>;

    function ProgressBar() {
        const [width, setWidth] = useState("0%");

        useEffect(() => {
            const timer = setTimeout(() => {
                setWidth(progress + "%");
            }, 50);
            return () => clearTimeout(timer);
        }, [progress]);

        return (
            <div
                className="progress-fill"
                style={{ width }}
            />
        );
    }

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
                    <li><Link to="/budget-analysis"><p>Analiza budżetu</p><i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link to="/savings" className="active"><p>Oszczędzanie</p><i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link><p>Cele miesięczne</p><i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link><p>Stałe wydatki</p><i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link><p>Statystyki</p><i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                </ul>
                <div className="buttons">
                    <button className="technical-help" type="button"
                            onClick={() => navigate(user.role === "ADMIN" ? "/users" : "/")}
                    >
                        {user.role === "ADMIN" ? "Panel admina" : "Pomoc techniczna"}
                    </button>
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
                <h1>Szczegóły celu oszczędnościowego</h1>
                <div className="btn-go-back" onClick={() => navigate('/savings')}>
                    <i className="fa-plus"><FontAwesomeIcon icon={faPlus} /></i>
                </div>

                <div className="saving-details-container">
                    <div className="details-content">
                        <div
                            className="details-image-section"
                            style={{backgroundImage: `url('${saving.imageDataUri}')`}}
                        >
                            <div
                                className="btn-edit"
                                onClick={() => navigate(`/savings/${saving.id_saving}/edit`)}
                            >
                                <i className="fa-pen-to-square"><FontAwesomeIcon icon={faPenToSquare} /></i>
                            </div>
                        </div>
                        <div className="details-info">
                            <h1>{saving.title}</h1>

                            <div className="progress-section">
                                <div className="progress-bar">
                                    <ProgressBar />
                                </div>
                                <div className="progress-info">
                                    <p className="created-date">
                                        Cel założony: {new Date(saving.createdAt).toLocaleDateString('pl-PL')}
                                    </p>
                                    <p className="progress-text">
                                        Osiągnięto: {Math.floor(progress)}%
                                    </p>
                                </div>
                            </div>

                            <div className="amounts-grid">
                                <div className="amount-box">
                                    <label>Zebrane środki</label>
                                    <div className="amount">{saving.amount.toFixed(2)} PLN</div>
                                </div>
                                <div className="amount-box">
                                    <label>Kwota docelowa</label>
                                    <div className="amount">{saving.goal.toFixed(2)} PLN</div>
                                </div>
                                <div className="amount-box">
                                    <label>Brakuje</label>
                                    <div className="amount remaining">
                                        {Math.max(0, saving.goal - saving.amount).toFixed(2)} PLN
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="operations-section">
                            <div className="operation-box">
                                <h3>Wpłata środków</h3>
                                <form onSubmit={handleDeposit}>
                                    <input
                                        type="number"
                                        placeholder="Kwota do wpłaty"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        min="0.01"
                                        step="0.01"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={isDepositing}
                                        className="btn-deposit"
                                    >
                                        {isDepositing ? 'Wpłacam...' : 'Wpłać'}
                                    </button>
                                </form>
                            </div>

                            <div className="operation-box">
                                <h3>Wypłata środków</h3>
                                <form onSubmit={handleWithdraw}>
                                    <input
                                        type="number"
                                        placeholder="Kwota do wypłaty"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        min="0.01"
                                        step="0.01"
                                        max={saving.amount}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={isDepositing}
                                        className="btn-withdraw"
                                    >
                                        {isDepositing ? 'Wypłacam...' : 'Wypłać'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="delete-section">
                            <button onClick={handleDelete} className="btn-delete">
                                Usuń cel
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

