import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear,faChevronLeft, faChevronRight, faBars, faCirclePlus, faCircleMinus, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { fetchWithAuth } from '../utils/fetchWithAuth';
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend,} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import '../styles/style.css';
import '../styles/budget-analysis.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function toYearMonthString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

function parseYearMonthValue(monthValue) {
    // backend może zwracać "yyyy-MM" lub obiekt { year: 2026, month: 1 }
    if (!monthValue) return '';
    if (typeof monthValue === 'string') return monthValue;
    if (typeof monthValue === 'object' && monthValue.year != null && monthValue.month != null) {
        return `${monthValue.year}-${String(monthValue.month).padStart(2, '0')}`;
    }
    return String(monthValue);
}

function parseYearMonthToDate(yearMonthStr) {
    const [y, m] = yearMonthStr.split('-').map(Number);
    return new Date(y, m - 1, 1);
}

function addMonths(yearMonthStr, delta) {
    const d = parseYearMonthToDate(yearMonthStr);
    d.setMonth(d.getMonth() + delta);
    return toYearMonthString(d);
}

function formatMonthLabel(yearMonthStr, locale = 'pl-PL') {
    const d = parseYearMonthToDate(yearMonthStr);
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(d);
}

function toNumber(value) {
    if (value == null) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
    }

    try {
        return Number(value.toString()) || 0;
    } catch {
        return 0;
    }
}

function BudgetAnalysis(){
    const navigate = useNavigate();
    const { logout, user } = useContext(AuthContext);
    const [budgetData, setBudgetData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(() => toYearMonthString(new Date()));
    const [categotyMode, setCategoryMode] = useState('EXPENSE');

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        fetchWithAuth(`http://localhost:8080/api/budget-analysis?month=${selectedMonth}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }, navigate, logout)
            .then(res => res.json())
            .then(data => {
                if (!cancelled) {
                    setBudgetData(data);
                    setSelectedMonth(data.selectedMonth);
                }
            })
            .catch(err => {
                console.error('Błąd pobierania danych:', err);
            })
            .finally(() => {
                setLoading(false);
            });
        return () => { cancelled = true; };
    }, [selectedMonth]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const onPrev = () => {
        setSelectedMonth(prev => addMonths(prev, -1));
    };
    const onNext = () => {
        setSelectedMonth(prev => addMonths(prev, 1));
    };

    // Przygotuj dane do wykresu
    const chartMonthsRaw = budgetData?.chartMonths || [];
    const chartMonths = chartMonthsRaw.map(cm => ({
        monthStr: parseYearMonthValue(cm.month),
        incomes: toNumber(cm.incomes),
        expenses: toNumber(cm.expenses)
    }));

    const activeMonth = parseYearMonthValue(budgetData?.selectedMonth) || selectedMonth;
    const currentDate = parseYearMonthValue(toYearMonthString(new Date()));
    const firstMonth = parseYearMonthValue(budgetData?.firstPossibleMonth);
    const isActiveMonthCurrent = activeMonth === currentDate;
    const isActiveMonthFirst = activeMonth === firstMonth;

    const incomeDefault = 'rgba(65, 180, 69, 0.5)';
    const expenseDefault = 'rgba(191, 26, 47, 0.5)';
    const incomeHighlight = 'rgba(65, 180, 69, 1)';
    const expenseHighlight = 'rgba(191, 26, 47, 1)';

    const labels = chartMonths.map(cm => formatMonthLabel(cm.monthStr));
    const incomesData = chartMonths.map(cm => cm.incomes);
    const expensesData = chartMonths.map(cm => cm.expenses);
    const incomesColors = chartMonths.map(cm => cm.monthStr === activeMonth ? incomeHighlight : incomeDefault);
    const expensesColors = chartMonths.map(cm => cm.monthStr === activeMonth ? expenseHighlight : expenseDefault);


    const data = {
        labels,
        datasets: [
            {
                label: 'Wpływy',
                data: incomesData,
                backgroundColor: incomesColors,
                borderWidth: 0,
            },
            {
                label: 'Wydatki',
                data: expensesData,
                backgroundColor: expensesColors,
                borderWidth: 0,
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#dddddd',
                    generateLabels: (chart) => {
                        return chart.data.datasets.map((ds, i) => {
                            const isIncome = ds.label === 'Wpływy';
                            const isExpense = ds.label === 'Wydatki';
                            const fill = isIncome ? incomeHighlight : isExpense ? expenseHighlight
                                : (Array.isArray(ds.backgroundColor) ? ds.backgroundColor[0] : ds.backgroundColor);
                            return {
                                text: ds.label,
                                fillStyle: fill,
                                hidden: !chart.isDatasetVisible(i),
                                datasetIndex: i,
                                fontColor: '#dddddd'
                            };
                        });
                    }
                },
            },
            tooltip: {
                position: 'nearest',
                yAlign: 'bottom',
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0,0,0,0.75)',
                titleColor: '#dddddd',
                bodyColor: '#dddddd',
                borderColor: 'rgba(247, 55, 79, 1)',
                borderWidth: 1,
                caretSize: 6,
                caretPadding: 6,
                padding: 8,
                callbacks: {
                    labelColor: (context) => {
                        const ds = context.dataset;
                        const dataIdx = context.dataIndex;
                        const isIncome = ds.label === 'Wpływy';
                        const isExpense = ds.label === 'Wydatki';
                        const bgFromDataset = Array.isArray(ds.backgroundColor) ? ds.backgroundColor[dataIdx] : ds.backgroundColor;
                        const color = isIncome ? incomeHighlight : isExpense ? expenseHighlight : bgFromDataset;
                        return {
                            borderColor: '#000000',
                            backgroundColor: color,
                            borderWidth: 5
                        };
                    }
                }
            }
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
        scales: {
            x: {
                stacked: false,
                ticks: {
                    color: '#dddddd',
                    maxRotation: 0,
                    autoSkip: false
                },
                grid: {
                    /*color: 'rgba(255,255,255,0.12)',*/
                    color: 'rgba(247, 55, 79, 0.3)',
                    drawBorder: false
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#dddddd',
                },
                grid: {
                    /*color: 'rgba(255,255,255,0.12)',*/
                    color: 'rgba(247, 55, 79, 0.3)',
                    drawBorder: false
                }
            }
        }
    };

    const selectedSummary = budgetData?.selectedMonthSummary || {};
    const selectedMonthLabel = formatMonthLabel(selectedMonth);
    const isDiffPositive = (toNumber(selectedSummary.incomes) - toNumber(selectedSummary.expenses)) >= 0;

    if (loading) {
        return (
            <div className="loading-container">
                <p>Fineance</p>
                <i><FontAwesomeIcon icon={faSpinner} /></i>
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
                    <li><Link to="/budget-analysis" className="active"><p>Analiza budżetu</p><i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i></Link></li>
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
                <h1>Analiza budżetu</h1>
                <section className="budget-controls">
                    <div className="month-controls">
                        <div className="button-container">
                            {!isActiveMonthFirst &&
                            <i className="nav-btn left" onClick={onPrev}><FontAwesomeIcon icon={faChevronLeft} /></i>
                            }
                        </div>
                        <div className="month-label">{selectedMonthLabel}</div>
                        <div className="button-container">
                            {!isActiveMonthCurrent &&
                            <i className="nav-btn right" onClick={onNext}><FontAwesomeIcon icon={faChevronRight} /></i>
                            }
                        </div>
                    </div>
                </section>

                <div className="budget-content">
                    <section className="summary-chart-section">
                        <section className="summary-section">
                            <div className="selected-summary">
                                <div className="income-summary">
                                    <h1>Wpływy:</h1>
                                    <h2>{toNumber(selectedSummary.incomes).toFixed(2)} zł</h2>
                                </div>
                                <div className="expense-summary">
                                    <h1>Wydatki:</h1>
                                    <h2>{toNumber(selectedSummary.expenses).toFixed(2)} zł</h2>
                                </div>
                                <div className={`balance-summary-${isDiffPositive ? 'positive' : 'negative'}`}>
                                    <h1>Bilans:</h1>
                                    <h2>{isDiffPositive ? '+' : ''}
                                        {(toNumber(selectedSummary.incomes) - toNumber(selectedSummary.expenses)).toFixed(2)} zł
                                    </h2>
                                </div>
                            </div>
                        </section>

                        <section className="chart-section">
                            <Bar data={data} options={options} />
                        </section>
                    </section>

                    <section className={`categories-section${categotyMode === 'INCOME' ? ' income' : ' expense'}`}>
                        <div className="category-button-container">
                            <button
                                className={`income-category-button${categotyMode === 'INCOME' ? ' active' : ''}`}
                                onClick={() => setCategoryMode('INCOME')}
                            >
                                Wpływy
                            </button>
                            <button
                                className={`expense-category-button${categotyMode === 'EXPENSE' ? ' active' : ''}`}
                                onClick={() => setCategoryMode('EXPENSE')}
                            >
                                Wydatki
                            </button>
                        </div>
                        {categotyMode === 'INCOME' &&
                        <div className="categories-column income">
                            <ul>
                                {budgetData?.selectedMonthIncomeCategories?.map((category, index) => (
                                <li key={index}>
                                    <a className={`${index === 0 ? "first" : ''}`}>
                                        <div className="category">
                                            <span className="category-name">{category.categoryName}</span>
                                            <span className="category-amount">{toNumber(category.totalAmount).toFixed(2)} zł</span>
                                        </div>
                                        <div className="icon">
                                            <i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i>
                                        </div>
                                    </a>
                                </li>
                                )) ||
                                <li>Brak</li>
                                }
                            </ul>
                        </div>
                        }
                        {categotyMode === 'EXPENSE' &&
                        <div className="categories-column expense">
                            <ul>
                                {budgetData?.selectedMonthExpenseCategories?.map((category, index) => (
                                <li key={index}>
                                    <a className={`${index === 0 ? "first" : ''}`}>
                                        <div className="category">
                                            <span className="category-name">{category.categoryName}</span>
                                            <span className="category-amount">{toNumber(category.totalAmount).toFixed(2)} zł</span>
                                        </div>
                                        <div className="icon">
                                            <i className="fa-chevron-right"><FontAwesomeIcon icon={faChevronRight} /></i>
                                        </div>
                                    </a>
                                </li>
                                )) ||
                                <li>Brak</li>
                                }
                            </ul>
                        </div>
                        }
                    </section>
                </div>
            </main>
        </>
    );
}

export default BudgetAnalysis;