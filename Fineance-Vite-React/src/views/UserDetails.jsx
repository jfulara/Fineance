import { Link, useNavigate, useParams } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faChevronRight, faBars, faCirclePlus, faCircleMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import { fetchWithAuth } from '../utils/fetchWithAuth';

function UserDetails() {
    const navigate = useNavigate();
    const { logout, user } = useContext(AuthContext);
    const { id_user } = useParams()
    const [userDetails, setUserDetails] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`http://localhost:8080/api/users/${id_user}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                setUserDetails(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Błąd pobierania użytkownika:', err)
                setLoading(false)
            })
    }, [id_user])

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) return <p>Ładowanie...</p>
    if (!userDetails) return <p>Nie znaleziono użytkownika</p>

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
            <main>
                <h1>Szczegóły użytkownika</h1>
                <div className="user-details-container">
                    <ul className="user-details-list">
                        <li><span className="user-details-label">ID:</span> <span className="user-details-value">{userDetails.id_user}</span></li>
                        <li><span className="user-details-label">Imię:</span> <span className="user-details-value">{userDetails.name}</span></li>
                        <li><span className="user-details-label">Nazwisko:</span> <span className="user-details-value">{userDetails.surname}</span></li>
                        <li><span className="user-details-label">E-mail:</span> <span className="user-details-value">{userDetails.email}</span></li>
                    </ul>
                </div>
            </main>
        </>
    )
}

export default UserDetails
