import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faChevronRight, faBars, faCirclePlus, faCircleMinus, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import '../styles/add-saving.css';
import '../styles/style.css';
import savings_default from '../assets/images/savings_default.jpg';
import savings_holiday from '../assets/images/savings_holiday.jpg';
import savings_kid from '../assets/images/savings_kid.jpg';
import savings_car from '../assets/images/savings_car.jpg';
import savings_flat from '../assets/images/savings_flat.jpg';
import savings_house from '../assets/images/savings_house.jpg';

export default function AddSaving() {
    const navigate = useNavigate();
    const { logout, user } = useContext(AuthContext);
    const [mode, setMode] = useState('select');
    const [formData, setFormData] = useState({
        title: '',
        goal: '',
        imageFile: savings_default
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [predefinedSavings, setPredefinedSavings] = useState([
        {
            id: 1,
            title: 'Oszczędności',
            image: savings_default,
            goal: ''
        },
        {
            id: 2,
            title: 'Wakacje',
            image: savings_holiday,
            goal: ''
        },
        {
            id: 3,
            title: 'Dzieci',
            image: savings_kid,
            goal: ''
        },
        {
            id: 4,
            title: 'Samochód',
            image: savings_car,
            goal: ''
        },
        {
            id: 5,
            title: 'Mieszkanie',
            image: savings_flat,
            goal: ''
        },
        {
            id: 6,
            title: 'Dom',
            image: savings_house,
            goal: ''
        }
    ]);

    const handleSubmitPredefined = async (predefined) => {
        setLoading(true);
        setError(null);

        const responseData = new FormData();
        responseData.append('title', predefined.title);

        if (!predefined.goal || isNaN(predefined.goal) || parseFloat(predefined.goal) <= 0) {
            responseData.append('goal', parseFloat(0));
        }
        responseData.append('goal', parseFloat(predefined.goal));

        const image = await fetch(predefined.image);
        const blob = await image.blob();
        const filename = predefined.image.split('/').pop();
        const file = new File([blob], filename, { type: blob.type });
        responseData.append('imageFile', file);

        try {
            const response = await fetchWithAuth('http://localhost:8080/api/savings/add', {
                method: 'POST',
                credentials: 'include',
                body: responseData
            }, navigate, logout);

            if (response.ok) {
                const saving = await response.json();
                navigate(`/savings/${saving.id_saving}`);
            } else {
                const text = await response.text().catch(() => null);
                const msg = text || response.statusText || `Błąd ${response.status}`;
                throw new Error(msg);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    async function fileFromSource(source) {
        if (!source) return null;
        if (source instanceof File) return source;
        if (typeof source === 'string') {
            const res = await fetch(source);
            const blob = await res.blob();
            const filename = source.split('/').pop();
            return new File([blob], filename, { type: blob.type });
        }
        return null;
    }

    const handleSubmitCustom = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const responseData = new FormData();
        responseData.append('title', formData.title);

        if (!formData.goal || isNaN(formData.goal) || parseFloat(formData.goal) <= 0) {
            responseData.append('goal', parseFloat(0));
        }
        responseData.append('goal', parseFloat(formData.goal));

        if (!formData.title) {
            setError('Wypełnij wszystkie pola');
            setLoading(false);
            return;
        }

        try {
            const imageFile = await fileFromSource(formData.imageFile);
            if (imageFile) {
                responseData.append('imageFile', imageFile);
            }

            const response = await fetchWithAuth('http://localhost:8080/api/savings/add', {
                method: 'POST',
                credentials: 'include',
                body: responseData
            }, navigate, logout);

            if (response.ok) {
                const saving = await response.json();
                navigate(`/savings/${saving.id_saving}`);
            } else {
                const text = await response.text().catch(() => null);
                const msg = text || response.statusText || `Błąd ${response.status}`;
                throw new Error(msg);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            const timer = setTimeout(() => {
                setLoading(false);
            }, 750);
            return () => clearTimeout(timer);
        }
    };

    const getImageLabel = (imageFile) => {
        const defaultLabel = 'Wybierz plik (PNG, JPG, JPEG)';
        if (imageFile instanceof File) return imageFile.name;
        return defaultLabel;
    };

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

    if (mode === 'select') {
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
                    <h1>Dodaj nowy cel oszczędnościowy</h1>
                    <div className="btn-go-back" onClick={() => navigate('/savings')}>
                        <i className="fa-plus"><FontAwesomeIcon icon={faPlus} /></i>
                    </div>
                    <div className="add-saving-container">
                        <div className="add-saving-content">
                            <div className="mode-selector">
                                <div className="mode-selector-header">
                                    <h3>Wybierz sposób dodania celu:</h3>
                                </div>
                                <div className="mode-buttons">
                                    <button
                                        className="mode-btn predefined-btn active"
                                        onClick={() => setMode('select')}
                                    >
                                        Gotowy cel
                                    </button>
                                    <button
                                        className="mode-btn custom-btn"
                                        onClick={() => setMode('custom')}
                                    >
                                        Własny cel
                                    </button>
                                </div>
                            </div>
                            <div className="predefined-header">
                                <h3>Popularne cele oszczędnościowe:</h3>
                            </div>
                            <div className="predefined-grid">
                                {predefinedSavings.map(saving => (
                                    <div key={saving.id} className="predefined-card">
                                        <div
                                            className="card-image"
                                            style={{ backgroundImage: `url("${saving.image}")` }}
                                        ></div>
                                        <div className="card-title">
                                            <p>{saving.title}</p>
                                        </div>
                                        <div className="card-actions">
                                            <input
                                                className="goal-input"
                                                type="number"
                                                placeholder="Kwota docelowa"
                                                value={saving.goal}
                                                onChange={(e) => setPredefinedSavings(prev =>
                                                    prev.map(s => s.id === saving.id ? { ...s, goal: e.target.value } : s))}
                                                min="1"
                                                step="0.01"
                                                required
                                            ></input>
                                            <button
                                                className="select-btn"
                                                disabled={loading}
                                                onClick={() => handleSubmitPredefined(saving)}
                                            >
                                                {loading ? 'Tworzenie...' : 'Wybierz'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                    </div>
                </main>
            </>
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
                    <li><Link to="/" className="first">Podsumowanie<i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link to="/history">Historia operacji<i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link>Analiza budżetu<i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
                    <li><Link to="/savings" className="active">Oszczędzanie<i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
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
                <h1>Dodaj nowy cel oszczędnościowy</h1>
                <div className="btn-go-back" onClick={() => navigate('/savings')}>
                    <i className="fa-plus"><FontAwesomeIcon icon={faPlus} /></i>
                </div>
                <div className="add-saving-container">
                    <div className="add-saving-content">
                        <div className="mode-selector">
                            <div className="mode-selector-header">
                                <h3>Wybierz sposób dodania celu:</h3>
                            </div>
                            <div className="mode-buttons">
                                <button
                                    className="mode-btn"
                                    onClick={() => setMode('select')}
                                >
                                    Gotowy cel
                                </button>
                                <button
                                    className="mode-btn active"
                                    onClick={() => setMode('custom')}
                                >
                                    Własny cel
                                </button>
                            </div>
                        </div>
                        <div className="custom-header">
                            <h3>Stwórz własny cel:</h3>
                        </div>
                        <form onSubmit={handleSubmitCustom} className="custom-form">
                            <div className="form-group">
                                <label>Nazwa celu *</label>
                                <input
                                    type="text"
                                    placeholder="np. Nowy laptop"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Kwota docelowa (PLN) *</label>
                                <input
                                    type="number"
                                    placeholder="np. 5000"
                                    value={formData.goal}
                                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                    min="1"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Obrazek (opcjonalnie)</label>
                                <div className="file-input-wrapper">
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg"
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            imageFile: e.target.files[0] || null
                                        })}
                                        id="image-input"
                                    />
                                    <label htmlFor="image-input" className="file-label">
                                        {getImageLabel(formData.imageFile)}
                                    </label>
                                </div>
                                <small>Max 2MB</small>
                            </div>
                            {error && <div className="error-message">{error}</div>}
                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Tworzenie...' : 'Utwórz cel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}

