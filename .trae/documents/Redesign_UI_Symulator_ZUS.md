# Redesign UI - ZUS na Plus
## Dokument projektowy nowego interfejsu użytkownika

---

## 1. Założenia projektowe

### 1.1 Cele redesignu
- **Profesjonalizm**: Nowoczesny, ale poważny design odpowiedni dla produktu ZUS
- **Dostępność**: Pełna zgodność z WCAG 2.0 AA
- **Responsywność**: Mobile-first approach z pełną funkcjonalnością na wszystkich urządzeniach
- **Edukacja**: Budowanie świadomości o planowaniu emerytalnym
- **Zaufanie**: Wzbudzenie zaufania do narzędzia i instytucji ZUS

### 1.2 Grupa docelowa
- **Główna**: Osoby w wieku 25-50 lat nieświadome problemów emerytalnych
- **Wtórna**: Osoby planujące emeryturę, eksperci finansowi
- **Charakterystyka**: Różny poziom wiedzy finansowej, potrzeba prostych wyjaśnień

---

## 2. Nowa paleta kolorów

### 2.1 Kolory główne (ZUS Green Palette)
```css
/* Główne kolory ZUS */
--zus-green-primary: #00A651;     /* Główny zielony ZUS */
--zus-green-dark: #008A43;        /* Ciemniejszy zielony dla kontrastów */
--zus-green-light: #33B86B;       /* Jaśniejszy zielony dla hover */
--zus-green-pale: #E8F5ED;        /* Bardzo jasny zielony dla tła */

/* Kolory wsparcia */
--zus-navy: #1E3A8A;              /* Granatowy dla nagłówków */
--zus-gray-900: #111827;          /* Ciemny szary dla tekstu */
--zus-gray-600: #4B5563;          /* Średni szary dla tekstu pomocniczego */
--zus-gray-300: #D1D5DB;          /* Jasny szary dla obramowań */
--zus-gray-100: #F3F4F6;          /* Bardzo jasny szary dla tła */

/* Kolory akcent */
--zus-orange: #F59E0B;            /* Pomarańczowy dla ostrzeżeń */
--zus-red: #DC2626;               /* Czerwony dla błędów */
--zus-blue: #3B82F6;              /* Niebieski dla informacji */
```

### 2.2 Kontrast i dostępność WCAG 2.0
- **Tekst na białym tle**: Minimum 4.5:1 (AA)
- **Duży tekst**: Minimum 3:1 (AA)
- **Elementy interaktywne**: Minimum 3:1 dla obramowań
- **Focus indicators**: Wyraźne, kontrastowe obramowania

---

## 3. Typografia i hierarchia

### 3.1 Fonty systemowe
```css
/* Główny font stack - czytelny i profesjonalny */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;

/* Alternatywny dla nagłówków */
font-family: 'Poppins', 'Inter', sans-serif;
```

### 3.2 Skala typograficzna
```css
/* Nagłówki */
--text-6xl: 3.75rem;    /* 60px - Hero titles */
--text-5xl: 3rem;       /* 48px - Main titles */
--text-4xl: 2.25rem;    /* 36px - Section titles */
--text-3xl: 1.875rem;   /* 30px - Subsection titles */
--text-2xl: 1.5rem;     /* 24px - Card titles */
--text-xl: 1.25rem;     /* 20px - Large text */

/* Tekst podstawowy */
--text-lg: 1.125rem;    /* 18px - Large body */
--text-base: 1rem;      /* 16px - Body text */
--text-sm: 0.875rem;    /* 14px - Small text */
--text-xs: 0.75rem;     /* 12px - Captions */
```

### 3.3 Wagi fontów
- **300**: Light - dla dużych nagłówków
- **400**: Regular - dla tekstu podstawowego
- **500**: Medium - dla podkreśleń
- **600**: Semibold - dla małych nagłówków
- **700**: Bold - dla ważnych informacji

---

## 4. Komponenty UI zgodne z WCAG 2.0

### 4.1 Przyciski
```css
/* Przycisk główny */
.btn-primary {
  background: var(--zus-green-primary);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  min-height: 44px; /* WCAG touch target */
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--zus-green-dark);
  transform: translateY(-1px);
}

.btn-primary:focus {
  outline: 3px solid var(--zus-green-light);
  outline-offset: 2px;
}

/* Przycisk wtórny */
.btn-secondary {
  background: transparent;
  color: var(--zus-green-primary);
  border: 2px solid var(--zus-green-primary);
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 600;
  min-height: 44px;
}
```

### 4.2 Formularze
```css
/* Input fields */
.form-input {
  padding: 12px 16px;
  border: 2px solid var(--zus-gray-300);
  border-radius: 8px;
  font-size: 16px; /* Zapobiega zoom na iOS */
  min-height: 44px;
  background: white;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: var(--zus-green-primary);
  outline: 3px solid var(--zus-green-pale);
  outline-offset: 0;
}

/* Labels */
.form-label {
  font-weight: 600;
  color: var(--zus-gray-900);
  margin-bottom: 8px;
  display: block;
}

/* Error states */
.form-input.error {
  border-color: var(--zus-red);
}

.error-message {
  color: var(--zus-red);
  font-size: 14px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
```

### 4.3 Karty i kontenery
```css
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--zus-gray-200);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 166, 81, 0.1);
}

/* Card z akcentem zielonym */
.card-accent {
  border-left: 4px solid var(--zus-green-primary);
}
```

---

## 5. Landing Page - Struktura i sekcje

### 5.1 Hero Section - "Czy Twoja emerytura wystarczy?"
```html
<section class="hero-section">
  <div class="hero-content">
    <h1 class="hero-title">
      Sprawdź, czy Twoja emerytura wystarczy na godne życie
    </h1>
    <p class="hero-subtitle">
      Bezpłatny symulator ZUS pomoże Ci zaplanować przyszłość finansową. 
      Dowiedz się już dziś, ile będziesz otrzymywać na emeryturze.
    </p>
    
    <!-- Kluczowe statystyki -->
    <div class="hero-stats">
      <div class="stat-item">
        <span class="stat-number">47%</span>
        <span class="stat-label">średnia stopa zastąpienia emerytury</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">2 850 zł</span>
        <span class="stat-label">średnia emerytura w Polsce</span>
      </div>
    </div>
    
    <button class="btn-primary hero-cta">
      Oblicz swoją emeryturę
    </button>
  </div>
  
  <div class="hero-visual">
    <!-- Ilustracja lub infografika -->
    <div class="pension-calculator-preview">
      <!-- Podgląd kalkulatora -->
    </div>
  </div>
</section>
```

### 5.2 Problem Awareness Section - "Rzeczywistość emerytalna"
```html
<section class="awareness-section">
  <div class="container">
    <h2 class="section-title">Poznaj rzeczywistość emerytalną w Polsce</h2>
    
    <div class="awareness-grid">
      <div class="awareness-card warning">
        <div class="card-icon">⚠️</div>
        <h3>Stopa zastąpienia spada</h3>
        <p>
          Emerytura z ZUS zastępuje coraz mniejszą część ostatniego wynagrodzenia. 
          W 2040 roku może to być tylko 35-40%.
        </p>
      </div>
      
      <div class="awareness-card info">
        <div class="card-icon">📊</div>
        <h3>Inflacja zjada oszczędności</h3>
        <p>
          To, co dziś kosztuje 1000 zł, za 30 lat może kosztować nawet 2500 zł. 
          Planowanie jest kluczowe.
        </p>
      </div>
      
      <div class="awareness-card positive">
        <div class="card-icon">💡</div>
        <h3>Możesz to zmienić</h3>
        <p>
          Świadome planowanie i dodatkowe oszczędzanie może zapewnić Ci 
          komfortową emeryturę.
        </p>
      </div>
    </div>
    
    <div class="cta-section">
      <h3>Nie czekaj - sprawdź swoją sytuację już dziś</h3>
      <button class="btn-primary">Rozpocznij symulację</button>
    </div>
  </div>
</section>
```

---

## 6. Mobile-First Design

### 6.1 Breakpoints
```css
/* Mobile First - bazowe style dla mobile */
.container {
  padding: 0 16px;
  max-width: 100%;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 0 24px;
    max-width: 768px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 0 32px;
    max-width: 1200px;
  }
}

/* Large Desktop */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
  }
}
```

### 6.2 Nawigacja mobilna
```css
/* Mobile navigation */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid var(--zus-gray-300);
  padding: 12px 0;
  z-index: 50;
}

.mobile-nav-items {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  min-width: 44px;
  min-height: 44px;
  color: var(--zus-gray-600);
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
}

.mobile-nav-item.active {
  color: var(--zus-green-primary);
}
```

### 6.3 Formularze mobilne
```css
/* Mobile-optimized forms */
.form-mobile {
  padding: 16px;
}

.form-group-mobile {
  margin-bottom: 24px;
}

.form-input-mobile {
  width: 100%;
  padding: 16px;
  font-size: 16px; /* Zapobiega zoom */
  border-radius: 12px;
  border: 2px solid var(--zus-gray-300);
}

/* Sticky form actions */
.form-actions-mobile {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 16px;
  border-top: 1px solid var(--zus-gray-300);
  margin: 0 -16px -16px -16px;
}
```

---

## 7. Komunikaty edukacyjne

### 7.1 Ton komunikacji
- **Przyjazny, ale profesjonalny**: Unikamy żargonu finansowego
- **Edukacyjny**: Wyjaśniamy pojęcia krok po kroku
- **Motywujący**: Pokazujemy korzyści z planowania
- **Transparentny**: Jasno komunikujemy ograniczenia i założenia

### 7.2 Przykłady komunikatów

#### Strona główna
```
"Emerytura to nie odległa przyszłość - to decyzje, które podejmujesz dziś. 
Sprawdź, ile będziesz otrzymywać i dowiedz się, jak możesz to poprawić."
```

#### Formularz
```
"Każda informacja pomoże nam lepiej oszacować Twoją przyszłą emeryturę. 
Nie martw się - wszystkie dane są bezpieczne i nie są przechowywane."
```

#### Wyniki
```
"Twoja prognozowana emerytura to 2 450 zł miesięcznie. To około 45% Twojego 
obecnego wynagrodzenia. Eksperci zalecają, aby emerytura stanowiła co najmniej 
70% ostatniego wynagrodzenia dla komfortowego życia."
```

### 7.3 Tooltips i wyjaśnienia
```html
<!-- Przykład tooltip -->
<div class="tooltip-container">
  <span class="term">Stopa zastąpienia</span>
  <div class="tooltip">
    <p>
      Stosunek wysokości emerytury do ostatniego wynagrodzenia przed przejściem 
      na emeryturę, wyrażony w procentach.
    </p>
    <p><strong>Przykład:</strong> Jeśli zarabiasz 5000 zł, a emerytura wynosi 2500 zł, 
    stopa zastąpienia to 50%.</p>
  </div>
</div>
```

---

## 8. Accessibility (WCAG 2.0 AA)

### 8.1 Kluczowe wymagania
- **Kontrast kolorów**: Minimum 4.5:1 dla normalnego tekstu
- **Rozmiar touch targets**: Minimum 44x44px
- **Focus indicators**: Wyraźne i widoczne
- **Alt texts**: Dla wszystkich obrazów informacyjnych
- **Semantic HTML**: Proper heading hierarchy (h1-h6)
- **ARIA labels**: Dla elementów interaktywnych
- **Keyboard navigation**: Pełna dostępność z klawiatury

### 8.2 Screen reader support
```html
<!-- Przykłady ARIA labels -->
<button aria-label="Oblicz emeryturę na podstawie wprowadzonych danych">
  Oblicz emeryturę
</button>

<div role="alert" aria-live="polite" class="calculation-result">
  Twoja prognozowana emerytura została obliczona
</div>

<nav aria-label="Główna nawigacja">
  <ul role="menubar">
    <li role="none">
      <a href="/" role="menuitem">Strona główna</a>
    </li>
  </ul>
</nav>
```

### 8.3 Error handling
```html
<div class="form-group">
  <label for="salary" class="form-label">
    Miesięczne wynagrodzenie brutto *
  </label>
  <input 
    type="number" 
    id="salary" 
    class="form-input"
    aria-describedby="salary-error salary-help"
    aria-invalid="true"
    required
  >
  <div id="salary-help" class="form-help">
    Podaj swoje aktualne wynagrodzenie brutto w złotych
  </div>
  <div id="salary-error" class="error-message" role="alert">
    Wynagrodzenie musi być większe niż 0 zł
  </div>
</div>
```

---

## 9. Animacje i mikrointerakcje

### 9.1 Zasady animacji
- **Subtle i profesjonalne**: Nie rozpraszają od treści
- **Szybkie**: Maksymalnie 300ms dla większości animacji
- **Respect motion preferences**: `prefers-reduced-motion`
- **Purposeful**: Każda animacja ma cel (feedback, guidance)

### 9.2 Przykłady animacji
```css
/* Smooth transitions */
.btn-primary {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Loading states */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Implementacja - Plan działania

### 10.1 Faza 1: Fundament (Tydzień 1)
- [ ] Aktualizacja palety kolorów w Tailwind config
- [ ] Implementacja nowych komponentów UI
- [ ] Aktualizacja typografii i spacing
- [ ] Testy kontrastów WCAG

### 10.2 Faza 2: Landing Page (Tydzień 2)
- [ ] Redesign strony głównej
- [ ] Implementacja Hero Section
- [ ] Dodanie Awareness Section
- [ ] Optymalizacja mobile

### 10.3 Faza 3: Formularze i wyniki (Tydzień 3)
- [ ] Redesign FormPage
- [ ] Redesign ResultsPage
- [ ] Implementacja nowych komunikatów
- [ ] Testy accessibility

### 10.4 Faza 4: Finalizacja (Tydzień 4)
- [ ] Redesign AdminPage i DashboardPage
- [ ] Testy na różnych urządzeniach
- [ ] Optymalizacja performance
- [ ] Dokumentacja dla deweloperów

---

## 11. Metryki sukcesu

### 11.1 Accessibility
- [ ] 100% zgodność z WCAG 2.0 AA (test automatyczny + manualny)
- [ ] Lighthouse Accessibility Score: 95+
- [ ] Testy z screen readerami (NVDA, JAWS)

### 11.2 Performance
- [ ] Lighthouse Performance Score: 90+
- [ ] First Contentful Paint: <2s
- [ ] Largest Contentful Paint: <3s
- [ ] Mobile-friendly test: Pass

### 11.3 User Experience
- [ ] Zwiększenie conversion rate na landing page o 25%
- [ ] Zmniejszenie bounce rate o 20%
- [ ] Zwiększenie czasu spędzonego na stronie o 30%
- [ ] Pozytywne feedback od użytkowników (survey)

---

*Dokument stworzony: Styczeń 2025*  
*Wersja: 1.0*  
*Status: Do implementacji*