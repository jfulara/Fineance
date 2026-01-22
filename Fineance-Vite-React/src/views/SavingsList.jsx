import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faChevronRight, faBars, faCirclePlus, faCircleMinus, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import '../styles/savings.css';
import '../styles/style.css';

export default function SavingsList() {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [savings, setSavings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [width, setWidth] = useState("0%");

    useEffect(() => {
        fetchWithAuth('http://localhost:8080/api/savings', {
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }, navigate, logout)
            .then(res => res.json())
            .then(data => {
                setSavings(data);
            })
            .catch(err => {
                console.error('Błąd pobierania celów:', err);
            })
            .finally(() => {
                const timer = setTimeout(() => {
                    setLoading(false);
                }, 750);
                return () => clearTimeout(timer);
            });
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <p>Fineance</p>
                <i><FontAwesomeIcon icon={faSpinner} /></i>
            </div>
        );
    }

    function SavingItem({ saving }) {
        const progress = (saving.amount / saving.goal) * 100;

        const [width, setWidth] = useState("0%");

        useEffect(() => {
            const timer = setTimeout(() => {
                setWidth(progress + "%");
            }, 30);
            return () => clearTimeout(timer);
        }, [progress]);

        return (
            <div className="saving-card" key={saving.id_saving} onClick={() => navigate(`/savings/${saving.id_saving}`)}>
                <div
                    className="card-image"
                    style={{ backgroundImage: `url('${saving.imageDataUri}')` }}
                ></div>
                <div className="card-info">
                    <div className="card-text">
                        <h3>{saving.title}</h3>
                        <p>{Math.floor(progress)}%</p>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width }}
                        ></div>
                    </div>
                </div>
            </div>
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
                            onClick={() => navigate(user.role === "ADMIN" ? "/users" : "")}
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
                <h1>Oszczędności</h1>
                <div className="savings-grid">
                    {/* Lista istniejących celów */}
                    {savings
                        .slice()
                        .sort((a, b) => (b.amount / b.goal) - (a.amount / a.goal))
                        .map(saving => (
                            <SavingItem saving={saving} key={saving.id_saving}></SavingItem>
                        ))
                    }
                    {/* Przycisk dodaj cel */}
                    {savings.length < 6 &&
                    <div className="saving-card add-card" onClick={() => navigate('/savings/add')}>
                        <i className="fa-circle-plus"><FontAwesomeIcon icon={faCirclePlus} /></i>
                        <p>Dodaj nowy cel</p>
                    </div>
                    }
                </div>
            </main>
        </>
    );
}
