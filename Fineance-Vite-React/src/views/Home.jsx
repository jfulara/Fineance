import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faChevronRight, faBars, faCirclePlus, faCircleMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import '../styles/operations.css';
import { fetchWithAuth } from '../utils/fetchWithAuth';

function Home() {
    const navigate = useNavigate();
    const { logout, user } = useContext(AuthContext);
    const [homeData, setHomeData] = useState(null);

    useEffect(() => {
        fetchWithAuth('http://localhost:8080/api/home', {
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }, navigate, logout)
            .then(res => res.json())
            .then(data => {
                setHomeData(data);
            })
            .catch(err => {
                console.error('Błąd pobierania danych:', err);
            });
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isDiffPositive = (homeData && homeData.totalIncome - homeData.totalExpense) > 0;

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
                    <li><Link to="/" className="first active">Podsumowanie<i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link to="/history">Historia operacji<i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link>Analiza budżetu<i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link>Oszczędzanie<i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link>Cele miesięczne<i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link>Stałe wydatki<i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link>Statystyki<i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
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
                <section className="top">
                    <h1>Podsumowanie miesiąca</h1>
                </section>
                <section className="bottom">
                    <section className="left-side">
                        <div className="comparisons">
                            <div className={`income-to-expense-${isDiffPositive ? 'positive' : 'negative'}`}>
                                <h1>Twój stosunek wpływów do wydatków w tym miesiącu to:</h1>
                                <h2>
                                    {isDiffPositive ? '+' : ''}
                                    {homeData ? (homeData.totalIncome - homeData.totalExpense).toFixed(2) : '0.00'} zł
                                </h2>
                            </div>
                        </div>
                    </section>
                    <section className="right-side">
                        <div className="incomes-window">
                            <h1>Wpływy: {homeData ? homeData.totalIncome.toFixed(2) : '0.00'} zł</h1>
                            <ul>
                                {homeData && Array.isArray(homeData.incomeCategorySummaries) && homeData.incomeCategorySummaries.map((category, index) => (
                                <li key={index}>
                                    <a className={`${index === 0 ? "first" : ''}`}>
                                        <div className="category">
                                            <span className="category-name">{category.categoryName}</span>
                                            <span className="category-amount">{category.totalAmount.toFixed(2)} zł</span>
                                        </div>
                                        <div className="icon">
                                            <i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i>
                                        </div>
                                    </a>
                                </li>
                                ))}
                            </ul>
                        </div>
                        <div className="expenses-window">
                            <h1>Wydatki: {homeData ? homeData.totalExpense.toFixed(2) : '0.00'} zł</h1>
                            <ul>
                                {homeData && Array.isArray(homeData.expenseCategorySummaries) && homeData.expenseCategorySummaries.map((category, index) => (
                                    <li key={index}>
                                        <a className={`${index === 0 ? "first" : ''}`}>
                                            <div className="category">
                                                <span className="category-name">{category.categoryName}</span>
                                                <span className="category-amount">{category.totalAmount.toFixed(2)} zł</span>
                                            </div>
                                            <div className="icon">
                                                <i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i>
                                            </div>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </section>
            </main>
        </>
    )
}

export default Home
