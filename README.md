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

## Kontakt

Autor: Jakub Fulara  
Email: fularajakub@onet.pl  
Repozytorium: https://github.com/jfulara/Fineance
