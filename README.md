# ZUS na Plus - Symulator Emerytalny

## 📋 Opis projektu

**ZUS na Plus** to zaawansowane narzędzie edukacyjne do prognozowania wysokości emerytury, wyposażone w moduły aktuarialne FUS20. Aplikacja umożliwia użytkownikom symulację różnych scenariuszy emerytalnych na podstawie aktualnych danych demograficznych i ekonomicznych.

### Główne funkcjonalności:
- 📊 Prognozowanie wysokości emerytury na podstawie danych FUS20 (2022-2080)
- 🔍 Integracja z danymi demograficznymi MF, GUS, NBP
- 📈 Zaawansowane kalkulacje aktuarialne z uwzględnieniem waloryzacji składek
- 🎯 Symulacja różnych wariantów (pesymistyczny, pośredni, optymistyczny)
- 📱 Responsywny interfejs użytkownika
- 💬 Inteligentny chatbot AI do wsparcia użytkowników

## 🚀 Demo

Aplikacja jest dostępna online: **[https://traehackyeahudus-m653l-sebastians-projects-a48fb6cb.vercel.app/](https://traehackyeahudus-m653l-sebastians-projects-a48fb6cb.vercel.app/)**

## 🛠️ Technologie

### Frontend
- **React 19** - Biblioteka do budowy interfejsu użytkownika
- **TypeScript** - Typowany JavaScript dla lepszej jakości kodu
- **Vite** - Szybki bundler i dev server
- **Tailwind CSS** - Framework CSS do stylizacji
- **React Router** - Routing w aplikacji SPA

### UI/UX
- **Lucide React** - Ikony
- **Chart.js + React-ChartJS-2** - Wykresy i wizualizacje
- **React Hook Form + Zod** - Zarządzanie formularzami i walidacja
- **Class Variance Authority** - Wariantowe komponenty UI

### Backend & Baza danych
- **Supabase** - Backend-as-a-Service (baza danych, autentykacja, API)
- **PostgreSQL** - Relacyjna baza danych (przez Supabase)

### AI & Integracje
- **Google Generative AI** - Chatbot AI
- **jsPDF** - Generowanie raportów PDF
- **XLSX** - Obsługa plików Excel

### Narzędzia deweloperskie
- **ESLint** - Linter dla JavaScript/TypeScript
- **PostCSS + Autoprefixer** - Przetwarzanie CSS

## 🏃‍♂️ Uruchomienie lokalnie

### Wymagania
- Node.js (wersja 18 lub nowsza)
- npm lub yarn

### Instalacja

1. **Sklonuj repozytorium:**
```bash
git clone <repository-url>
cd hackyeah
```

2. **Zainstaluj zależności:**
```bash
npm install
```

3. **Skonfiguruj zmienne środowiskowe:**
Utwórz plik `.env` w głównym katalogu i dodaj wymagane zmienne:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. **Uruchom aplikację w trybie deweloperskim:**
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:5173`

### Dostępne skrypty

- `npm run dev` - Uruchomienie serwera deweloperskiego
- `npm run build` - Budowanie aplikacji produkcyjnej
- `npm run preview` - Podgląd zbudowanej aplikacji
- `npm run lint` - Sprawdzenie kodu linterem

## 🚀 Deployment na Vercel

Aplikacja jest automatycznie deployowana na Vercel przy każdym push do głównej gałęzi.

### Konfiguracja Vercel:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Zmienne środowiskowe na Vercel:
Upewnij się, że następujące zmienne są skonfigurowane w panelu Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`

### Plik konfiguracyjny:
Projekt zawiera `vercel.json` z konfiguracją dla SPA:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 📁 Struktura projektu

```
src/
├── components/          # Komponenty React
│   ├── ui/             # Komponenty UI (przyciski, inputy, etc.)
│   └── chat/           # Komponenty chatbota
├── pages/              # Strony aplikacji
├── hooks/              # Custom React hooks
├── services/           # Serwisy (API, integracje)
├── utils/              # Funkcje pomocnicze i kalkulacje
├── data/               # Dane statyczne
└── types/              # Definicje typów TypeScript
```

## 🔧 Funkcjonalności

### Moduł Symulacji Emerytury
- Formularz wprowadzania danych osobowych i zawodowych
- Kalkulacje na podstawie aktualnych wskaźników ZUS
- Uwzględnienie kapitału początkowego i stażu pracy

### Dashboard Zaawansowany
- Wybór wariantów prognozy FUS20
- Modyfikacja założeń makroekonomicznych
- Analiza kontekstu powiatowego i zawodowego

### System Raportowania
- Generowanie raportów PDF
- Eksport danych do Excel
- Wizualizacje w formie wykresów

### Chatbot AI
- Wsparcie użytkowników w nawigacji
- Wyjaśnianie pojęć emerytalnych
- Pomoc w interpretacji wyników

## 📄 Licencja

Ten projekt został stworzony na potrzeby konkursu HackYeah 2025.

---

**Zbudowane z ❤️ dla lepszego zrozumienia systemu emerytalnego w Polsce**
