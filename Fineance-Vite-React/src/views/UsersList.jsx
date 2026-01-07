import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faChevronRight, faBars, faCirclePlus, faCircleMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import { fetchWithAuth } from '../utils/fetchWithAuth';

function UsersList() {
    const navigate = useNavigate();
    const { logout, user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWithAuth('http://localhost:8080/api/users', {
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }, navigate, logout)
            .then(res => res.json())
            .then(data => {
                setUsers(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Błąd pobierania użytkowników:', err)
                setLoading(false)
            })
    }, [])

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleDelete = async (id_user) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tego użytkownika?')) return;
        try {
            const response = await fetchWithAuth(`http://localhost:8080/api/users/${id_user}`, {
                method: 'DELETE',
                credentials: 'include',
            }, navigate, logout);
            if (response.ok) {
                setUsers(users.filter(u => u.id_user !== id_user));
            } else {
                alert('Nie udało się usunąć użytkownika.');
            }
        } catch (err) {
            alert('Błąd podczas usuwania użytkownika.');
        }
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
                <div>
                    <h1>Lista użytkowników</h1>
                    {loading ? (
                        <p>Ładowanie...</p>
                    ) : (
                        <div className="users-list-container">
                            <ul className="users-list">
                                {users.map(user => (
                                    <li key={user.id_user} className="users-list-item">
                                        <div className="user-row">
                                            <Link to={`/users/${user.id_user}`}>{user.email}</Link>
                                            <button
                                                className={`delete-user-btn${user.role === "ADMIN" ? " admin" : ""}`}
                                                onClick={() => handleDelete(user.id_user)} title="Usuń użytkownika">
                                                Usuń
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}

export default UsersList
