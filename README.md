# Fineance – Aplikacja do zarządzania finansami

Fineance to aplikacja webowa umożliwiająca użytkownikom zarządzanie swoimi finansami – dodawanie, usuwanie i przeglądanie operacji finansowych, w postaci skategoryzowanych wpływów i wydatków, śledzenie historii, analiza budżetu oraz zarządzanie celami oszczędnościowymi.

## Architektura aplikacji

      +------------------+              +---------------------+
      |     Frontend     |  <-------->  |     Backend (API)   |
      |  (React + Vite)  |              | (Spring Boot, JWT)  |
      +------------------+              +---------------------+
                 |                                 |
                 |                                 |
                 v                                 v
      +------------------+              +----------------------+
      | HttpOnly Cookies |              |   PostgreSQL (DB)    |
      |  (auth/session)  |              | Operacje, użytkownicy|
      +------------------+              +----------------------+


- Aplikacja podzielona jest na frontend w ***React z Vite*** oraz backend w ***Spring Boot***.
- Do komunikacji wykorzystywane są **REST API** i uwierzytelnianie z wykorzystaniem **JWT** przechowywanych w **HttpOnly cookie**.
- Dane są przechowywane w bazie danych ***PostgreSQL***, w osobnych tabelach dla wpływów i wydatków.

## Instrukcja uruchomienia

### 1. Backend (Spring Boot)

#### Wymagania:
- Java 17+
- Maven
- Docker + Docker Compose

#### Krok po kroku:

```bash
# Uruchomienie bazy danych:
docker-compose up -d

# Przejdź do katalogu backendu i uruchom:
cd backend
./mvnw spring-boot:run
```

Backend dostępny będzie pod adresem: http://localhost:8080

### 2. Frontend (React + Vite)

#### Wymagania:
- Node.js 18+

#### Krok po kroku:

```bash
# Przejdź do katalogu frontend i zainstaluj zależności:
cd frontend
npm install

# Uruchom aplikację:
npm run dev
```

Frontend dostępny będzie pod adresem: http://localhost:5173

## Użyte technologie wraz z uzasadnieniem

| Technologia          | Uzasadnienie                                                               |
| -------------------- | -------------------------------------------------------------------------- |
| **Spring Boot**      | Umożliwia szybkie budowanie aplikacji REST, ma bogate wsparcie do JWT i JPA |
| **PostgreSQL**       | Relacyjna baza danych, stabilna, otwartoźródłowa, wspierana przez Spring   |
| **React**            | Popularna biblioteka do tworzenia dynamicznych interfejsów użytkownika     |
| **Vite**             | Szybszy niż tradycyjne bundlery, bardzo szybkie uruchomienie  |
| **JWT**              | Popularny standard do bezstanowego uwierzytelniania                        |
| **HttpOnly Cookies** | Bezpieczny sposób przechowywania tokenów JWT (chroni przed XSS)            |
| **Docker Compose**   | Ułatwia zarządzanie środowiskiem deweloperskim (PostgreSQL + pgAdmin)      |

## Przykładowe widoki aplikacji

<img width="1920" height="921" alt="Login" src="https://github.com/user-attachments/assets/f63486e8-ff8b-4815-b69d-ae9c2730d472" />
<img width="1920" height="921" alt="Home" src="https://github.com/user-attachments/assets/df0b1da5-9451-4444-bbe0-fcddb459c7c7" />
<img width="1920" height="922" alt="OperationHistory" src="https://github.com/user-attachments/assets/24f7b38e-47fa-4297-8091-57c53a4f9368" />
<img width="1920" height="921" alt="BudgetAnalysis1" src="https://github.com/user-attachments/assets/5fcd0052-6b3c-43e5-bb0f-3235b1aa326f" />
<img width="1920" height="921" alt="SavingsList" src="https://github.com/user-attachments/assets/caf3f40d-7b1d-4780-9914-962977ed3960" />
<img width="1920" height="921" alt="SavingDetails" src="https://github.com/user-attachments/assets/89f63cf2-b4d4-4426-a080-2c8b57a2ac1b" />

## Kontakt

Autor: Jakub Fulara  
Email: fularajakub@onet.pl  
Repozytorium: https://github.com/jfulara/Fineance
