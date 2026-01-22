import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faChevronRight, faBars, faCirclePlus, faCircleMinus, faPlus, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import '../styles/add-saving.css';
import '../styles/style.css';
import savings_default from '../assets/images/savings_default.jpg';

export default function EditSaving() {
    const { id } = useParams();
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [saving, setSaving] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        goal: '',
        imageFile: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                setFormData(prev => ({
                    ...prev,
                    title: data.title || '',
                    goal: data.goal || ''
                }));
            })
            .catch(err => {
                console.error('Bład podczas pobierania celu:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

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

    const handleSubmit = async (e) => {
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

            const response = await fetchWithAuth(`http://localhost:8080/api/savings/${saving.id_saving}/edit`, {
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

    const getImageLabel = (imageFile) => {
        const defaultLabel = 'Wybierz plik (PNG, JPG, JPEG)';
        if (imageFile instanceof File) return imageFile.name;
        return defaultLabel;
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
                <h1>Edytuj cel oszczędnościowy</h1>
                <div className="btn-go-back" onClick={() => navigate(`/savings/${saving.id_saving}`)}>
                    <i className="fa-plus"><FontAwesomeIcon icon={faPlus} /></i>
                </div>
                <div className="add-saving-container">
                    <div className="add-saving-content">
                        <div className="title-box">
                            <div className="mode-selector-header">
                                <h3>Edytuj cel:</h3>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="custom-form">
                            <div className="form-group">
                                <label>Nazwa celu</label>
                                <input
                                    type="text"
                                    placeholder="np. Nowy laptop"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Kwota docelowa (PLN)</label>
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
                                    {loading ? 'Edytowanie...' : 'Edytuj cel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}