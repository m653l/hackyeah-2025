# Dokumentacja Projektu: Symulator Emerytalny ZUS (Aktualizacja 2.0)

## 1. Wstęp
Projekt służy zwiększeniu świadomości społeczeństwa w zakresie ryzyka starości [40, 41]. Narzędzie to ma przedstawiać wizualnie i w prosty sposób przyszłe zarobki oraz realną siłę nabywczą wynagrodzenia i emerytury [41].

## 2. Podstawy Aktuarialne i Źródła Danych
Podstawowym modelem prognostycznym jest **FUS20**, opracowany przez Departament Statystyki i Prognoz Aktuarialnych ZUS w 2022 roku, obejmujący horyzont czasowy do 2080 roku [1, 36, 42, 43].

### 2.1. Kluczowe Prognozy i Dane Wejściowe
Prognoza bazuje na założeniach makroekonomicznych Ministerstwa Finansów (MF) z 2022 r. [37, 38, 44].

| Kategoria Danych | Szczegóły | Źródła |
| :--- | :--- | :--- |
| **Warianty Prognozy FUS20** | Model jest przeliczany w trzech scenariuszach: **Wariant nr 1 (pośredni)**, **Wariant nr 2 (pesymistyczny)** oraz **Wariant nr 3 (optymistyczny)** [1, 6]. Różnią się one założeniami dotyczącymi stopy bezrobocia, wskaźnika realnego wzrostu wynagrodzenia i ściągalności składek [3-5, 30-32]. | [1, 2, 33] |
| **Prognoza Demograficzna** | Wykorzystano prognozę demograficzną MF z 2022 r. [38, 45]. Liczebność populacji Polski spada do 28,2 mln w 2080 r. [46, 47]. Mediana wieku rośnie do ok. 53,0 lat w 2080 r. [48, 49]. | [38, 46-49] |
| **Wskaźniki Waloryzacji Składek** | Należy użyć historycznych **rocznych** (np. 114.40% dla 2022 r. [8, 9]) oraz **kwartalnych wskaźników** waloryzacji składek na **koncie i subkoncie** (dla lat 2014-2024 i prognoz na 2025 r.) [7, 11, 12]. | [7, 8, 11-13] |
| **Dalsze Trwanie Życia** | W obliczeniach należy użyć tablic średniego dalszego trwania życia (w miesiącach), np. Prognozy Demograficznej MF z 2024 r. (parametr pd=1) lub Komunikatu Prezesa GUS z 25 marca 2025 r. (parametr pd=0) [16-18]. | [16-18] |
| **Kapitał Początkowy (CP)** | Dostępne są tabele referencyjne przeciętnej wysokości CP na 31 grudnia 1998 r. w zależności od stażu składkowego (1, 5, 10, 15, 20 lat) dla kobiet i mężczyzn (np. 20 lat: Kobiety 99,937 zł, Mężczyźni 111,358 zł) [19]. | [19, 20] |

## 3. Wymagania Funkcjonalne – Logika Kalkulacji (1.2 i 1.4)

### 3.1. Przeliczanie Składek i Kapitału
*   **Obowiązkowe daty:** Rok rozpoczęcia i zakończenia pracy muszą odnosić się zawsze do **stycznia** [50].
*   **Reverse Indexation (Odwracanie Indeksacji):** Symulator musi odwrócić indeksację wynagrodzeń, używając wskaźnika wzrostu wynagrodzeń podawanego przez NBP lub GUS od momentu rozpoczęcia pracy [50, 51].
*   **Waloryzacja:** W symulacji musi być uwzględniona roczna i kwartalna waloryzacja składek, zgodnie z danymi ZUS dla konta i subkonta [11, 22].

### 3.2. Absencja Chorobowa
Opcja „uwzględniaj możliwość zwolnień lekarskich” musi wykorzystywać dane statystyczne:
1.  **Płeć i Wiek:** Średnia długość absencji chorobowej (w dniach) musi być symulowana w oparciu o dane dla danej **płci i wieku** ubezpieczonego (np. dla 60 lat: Mężczyźni 37.19 dni, Kobiety 47.47 dni w 2024 r.) [23].
2.  **Kontekstualizacja:** Musi pojawić się informacja o tym, ile średnio pracujący przebywa na zwolnieniach i jak to obniża świadczenie [51, 52].
3.  **Dashboard:** W Dashboardzie zaawansowanym (1.4) użytkownik powinien mieć możliwość wprowadzenia okresów choroby (przeszłość/przyszłość) bazując na **statystykach powiatowych** (przeciętna długość absencji i zaświadczenia lekarskiego w dniach dla 380 powiatów) [34, 35, 53].

### 3.3. Dashboard Zaawansowany (1.4) – Symulacja Wariantowa
Dashboard (dostępny po przejściu wszystkich kroków [54]) ma oferować pełną kontrolę nad zmiennymi prognostycznymi:
*   **Wybór Scenariusza:** Możliwość przełączania między Wariantem 1, 2 i 3 FUS20 [1, 6]. Wariant 3 (optymistyczny) jest jedynym, w którym fundusz emerytalny osiąga nadwyżki roczne (od 2067 r.) [55, 56].
*   **Parametry Makroekonomiczne:** Użytkownik powinien móc modyfikować kluczowe parametry FUS20, takie jak stopa bezrobocia, wskaźnik realnego wzrostu przeciętnego wynagrodzenia, realny wzrost PKB czy ściągalność składek [2, 33]. Wskaźnik realnego wzrostu przeciętnego wynagrodzenia jest parametrem o **silnym zróżnicowaniu wpływu** na wyniki prognozy [57].

## 4. Wymagania Wynikowe i Kontekst (1.3)

Wynik jest podawany w **Wysokości rzeczywistej** i **Wysokości urealnionej** [50, 58].

### 4.1. Analiza Opóźnienia i Kontekst Statystyczny
Informacja o wzroście świadczenia w przypadku odłożenia przejścia na emeryturę o X lat (np. rok, dwa i pięć) [58].
*   Należy uwzględnić dane statystyczne pokazujące odsetek osób w danym roczniku (2022-2024) przechodzących na emeryturę **dokładnie w wieku emerytalnym** lub w opóźnieniu (np. o 1-11 miesięcy, lub 2 lata i więcej) dla mężczyzn i kobiet [25, 26].

### 4.2. Kontekstualizacja Emerytury (Wizualizacje)
*   **Dane Powiatowe:** Na ekranie wyników lub w raporcie, prognozę należy porównać ze statystykami z danego powiatu (jeśli kod pocztowy został podany w kroku 1.6 [53]), w tym z **najwyższą, najniższą i przeciętną wysokością emerytury** (z dodatkami pielęgnacyjnymi i bez) na grudzień 2024 r. [27, 59].
*   **Kody Tytułu Ubezpieczenia:** Należy wyświetlić informację o przeciętnej wysokości przyznanej emerytury dla grupy kodów tytułu ubezpieczenia (np. Pracownicy, Członkowie RSP, Posłowie/Senatorowie), bazując na danych z 2024 r. [29, 60].

## 5. Raportowanie (1.7)
Raport z użycia dla administratora (format XLS [61]) musi zawierać zaktualizowane nagłówki uwzględniające szczegółowość danych wejściowych:
*   Data użycia
*   Godzina użycia
*   Emerytura oczekiwana
*   Wiek
*   Płeć
*   Wysokość wynagrodzenia
*   **Czy uwzględniał okresy choroby** [61]
*   Wysokość zgromadzonych środków na koncie i Subkoncie
*   Emerytura rzeczywista
*   Emerytura urealniona
*   Kod pocztowy [61, 62]
*   Dodatkowo, dla pełnej analizy, zaleca się zapisanie użytego **Wariantu Prognozy FUS20** oraz ewentualnych ręcznych zmian kluczowych parametrów makroekonomicznych (np. wskaźnika realnego wzrostu wynagrodzenia).

# Dalsza część
# Dokumentacja Projektu: Symulator Emerytalny ZUS (FUS20)

## 1. Wstęp i Cel Projektu
Projekt "Symulator emerytalny" jest zaawansowanym narzędziem edukacyjnym, opracowanym w celu zwiększenia świadomości społeczeństwa, zwłaszcza osób wkraczających na rynek pracy, na temat ryzyka starości. Celem jest przybliżenie perspektywy przyszłych zarobków, realnej siły nabywczej wynagrodzenia oraz przewidywanej wysokości świadczenia emerytalnego.

Narzędzie musi w prosty i wizualny sposób prezentować dane.

### 1.1. Wymagania Techniczne i Standardy
1.  **Typ aplikacji:** Musi to być narzędzie **webowe** (aplikacja), publicznie dostępne z poziomu witryny Zakładu Ubezpieczeń Społecznych (ZUS).
2.  **Dostępność:** Symulator musi spełniać standard **WCAG 2.0**.
3.  **Wizualizacje/Kolory:** Schemat kolorów powinien być zgodny z Księgą Znaku ZUS (lub zbliżony). Wymagane korelacje RGB to:
    *   R: 255; G: 179; B: 79
    *   R: 0; G: 153; B: 63
    *   R: 190; G: 195; B: 206
    *   R: 63; G: 132; B: 210
    *   R: 0: G: 65; B: 110
    *   R: 240; G: 94; B: 94
    *   R: 0; G: 0; B: 0

## 2. Podstawy Aktuarialne i Źródła Danych

Podstawą obliczeń symulatora jest model **FUS20**, opracowany przez Departament Statystyki i Prognoz Aktuarialnych ZUS w 2022 roku. Model ten prognozuje wpływy i wydatki Funduszu Emerytalnego do **2080 roku**.

### 2.1. Integracja Zewnętrznych Danych
Do poprawnego działania symulator musi uwzględniać dane z:
*   Prognoza wpływów i wydatków Funduszu Emerytalnego (FUS20)
*   Główny Urząd Statystyczny (GUS)
*   Narodowy Bank Polski (NBP)
*   Ministerstwo Finansów (MF)

### 2.2. Modele Prognostyczne FUS20
Prognoza FUS20 została sporządzona w **trzech wariantach**, które różnią się założeniami makroekonomicznymi i częstością przyznawania emerytur:
1.  **Wariant nr 1 – Pośredni:** Zakłada utrzymanie częstości przyznawania emerytur na średnim poziomie z 2021 r..
2.  **Wariant nr 2 – Pesymistyczny:** Zakłada zwiększenie częstości przyznawania rent i emerytur w porównaniu do Wariantu 1.
3.  **Wariant nr 3 – Optymistyczny:** Zakłada zmniejszenie częstości przyznawania rent i emerytur w porównaniu do Wariantu 1.

> **Kluczowy Wynik FUS20:** W wariantach 1 i 2 Fundusz Emerytalny osiąga ujemne saldo roczne aż do 2080 r.. **Wariant nr 3** jest jedynym, w którym fundusz osiąga **nadwyżki roczne, co następuje od 2067 r.**.

### 2.3. Dane Demograficzne i Tablice Dalszego Życia
Kalkulacja emerytury zależy od średniego dalszego trwania życia, które musi być wczytane w miesiącach. W symulatorze należy udostępnić dwie tablice:
*   Prognoza demograficzna MF z 2024 r. (stosowana, gdy parametr `pd=1`).
*   Komunikat Prezesa GUS z 25 marca 2025 r. (stosowany, gdy parametr `pd=0`).

Dla kontekstu: W 2022 r. populacja Polski wynosiła 37,9 mln; prognoza MF 2022 zakłada spadek do **28,2 mln w 2080 r.**. **Mediana wieku rośnie** i w 2080 r. osiągnie 53,0 lat.

### 2.4. Wskaźniki Waloryzacji Składek
Symulator musi wykorzystywać zarówno roczne, jak i kwartalne wskaźniki waloryzacji składek (na koncie i subkoncie).

| Okres | Rodzaj Waloryzacji | Wskaźnik (Przykłady historyczne) | Źródła |
| :--- | :--- | :--- | :--- |
| Roczna (Konto/CP) | Za rok 2000 | **112.72%** | |
| Roczna (Konto/CP) | Za rok 2021 | **109.33%** | |
| Roczna (Konto/CP) | Za rok 2022 | **114.40%** | |
| Roczna (Konto/CP) | Za rok 2023 | **114.87%** | |
| Kwartalna (Konto) | I kw. 2023 | **113.83%** | |
| Kwartalna (Konto) | II kw. 2023 | **104.01%** | |
| Kwartalna (Konto) | I kw. 2024 | **112.48%** | |
| Kwartalna (Subkonto) | 2023 r. (cały rok) | **102.30%** | |

## 3. Przebieg Symulacji (Fazy 1.1 - 1.4)

### 3.1. Pulpit Podstawowy (1.1)
Symulator rozpoczyna od pytania o **oczekiwaną wysokość emerytury w przyszłości**. Kwota ta jest natychmiast kontekstualizowana poprzez porównanie jej do obecnej, średniej wysokości świadczenia.
*   **Wizualizacja grup:** Wyświetlany jest obiekt (np. wykres) ze średnią wysokością świadczenia dla różnych grup, z dymkami (tooltipami) zawierającymi **krótką charakterystykę** danej grupy (np. emerytury poniżej minimalnej, wskazujące, że świadczeniobiorcy nie przepracowali wymaganego minimum 25/20 lat).
*   **Ciekawostki:** Wyświetlanie **losowej ciekawostki** (np. o najwyższej emeryturze w Polsce, długości stażu pracy, czy braku zwolnień lekarskich).

### 3.2. Symulacja Emerytury (1.2)
#### Wymagane Dane
*   **Obowiązkowo:** Wiek, Płeć, Wysokość wynagrodzenia brutto, Rok rozpoczęcia pracy, Planowany rok zakończenia aktywności zawodowej.
*   **Daty:** Rok rozpoczęcia pracy i zakończenia pracy **powinny zawsze odnosić się do stycznia**. Planowany rok zakończenia aktywności zawodowej jest domyślnie ustawiany na rok osiągnięcia wieku emerytalnego.
*   **Fakultatywnie:** Wysokość zgromadzonych środków na koncie i subkoncie w ZUS. Jeśli brak danych, musi istnieć opcja **oszacowania wysokości środków** z poziomu wynagrodzenia.

#### Logika Kalkulacyjna
1.  **Odwrócenie Indeksacji (Reverse Indexation):** Symulator musi odwrócić indeksację wynagrodzeń (o średni wzrost wynagrodzeń w Polsce, podawany przez NBP lub GUS) od roku rozpoczęcia pracy.
2.  **Waloryzacja Składek:** Do urealnienia zgromadzonych składek oraz prognozowania przyszłych kwot należy zastosować historyczne wskaźniki waloryzacji składek (rocznej lub kwartalnej).
3.  **Kapitał Początkowy (CP):** Musi być opcja kalkulacji CP na podstawie stażu składkowego/nieskładkowego na 31 grudnia 1998 r.. Należy użyć przeciętnej wysokości CP dla różnych stażów (1, 5, 10, 15, 20 lat), np. dla **20 lat stażu**: Kobiety 99,937 zł, Mężczyźni 111,358 zł.
4.  **Absencja Chorobowa:** Opcja **„uwzględniaj możliwość zwolnień lekarskich”**. Symulacja ma uwzględniać **przeciętną długość absencji chorobowej (w dniach) dla danej płci oraz wieku ubezpieczonego** (dane z 2024 r.). Należy wyświetlić informację, jak ten okres obniża świadczenie. *Przykładowe dane dla 60 lat (2024 r.): Mężczyźni 37.19 dni; Kobiety 47.47 dni*.

### 3.3. Wynik (1.3)
Wynik jest podawany w dwóch kwotach: **Wysokość rzeczywista** i **Wysokość urealniona**.

#### Prezentacja i Kontekstualizacja Wyniku
*   **Stopa Zastąpienia:** Wskaźnik porównujący wynagrodzenie zindeksowane do prognozowanego świadczenia.
*   **Analiza Chorobowa:** Informacja o wysokości świadczenia **bez i z uwzględnianiem** okresów chorobowych.
*   **Prognoza Odroczenia:** Informacja, o ile wzrosłoby świadczenie w przypadku odłożenia przejścia na emeryturę o X lat (np. rok, dwa i pięć).
*   **Gap Oczekiwana/Prognozowana:** Jeżeli prognozowane świadczenie jest niższe niż oczekiwane, musi pojawić się informacja, **o ile dłużej musi pracować**, żeby osiągnąć oczekiwaną kwotę.
*   **Kontekst Statystyczny Opóźnienia:** Porównanie prognozy do zachowań statystycznych, np. odsetka osób, które opóźniły przejście na emeryturę o 1-11 miesięcy lub 2 lata i więcej. *W 2022 r. 77.7% mężczyzn i 64.5% kobiet przechodziło na emeryturę dokładnie w wieku emerytalnym*.
*   **Kontekst Powiatowy i Zawodowy:**
    *   Wyświetlenie przeciętnej wysokości emerytury w 2024 r. (z podziałem na płeć i powiat) dla kontekstu.
    *   Wyświetlenie przeciętnej wysokości przyznanej emerytury dla różnych **grup kodów tytułu ubezpieczenia** (np. Pracownicy, Osoby na zleceniu). *Przykładowo, przeciętna wysokość przyznanej emerytury (w 2024 r.) dla Posła lub Senatora to 9,561.47 zł, a dla Pracowników 5,748.66 zł (Mężczyźni)*.

### 3.4. Dashboard Zaawansowany (1.4)
Po przejściu wszystkich kroków użytkownik ma dostęp do Dashboardu umożliwiającego zaawansowaną analizę wrażliwości.

#### Kontrola Założeń Aktuarialnych
1.  **Wybór Wariantu FUS20:** Umożliwienie przełączania między Wariantem 1 (pośredni), Wariantem 2 (pesymistyczny) i Wariantem 3 (optymistyczny).
2.  **Modyfikacja Parametrów Makroekonomicznych:** Możliwość zmiany kluczowych założeń FUS20:
    *   Stopa bezrobocia.
    *   **Wskaźnik realnego wzrostu przeciętnego wynagrodzenia** (parametr o silnym zróżnicowaniu wpływu na wyniki).
    *   Średnioroczny wskaźnik cen towarów i usług konsumpcyjnych (inflacja).
    *   Ściągalność składek.
3.  **Szczegółowe Okresy Chorobowe (Absencja):** Możliwość wprowadzenia określonych okresów choroby w przeszłości i przyszłości. Funkcja musi uwzględniać dane z **konkretnego powiatu** (przeciętna długość absencji lub zaświadczenia lekarskiego w dniach). *Przykładowo, dla powiatu cieszyńskiego przeciętna długość zaświadczenia wynosiła 10.94 dni (2024 r.)*.
4.  **Podgląd Środków:** Opcja podglądu, jak zwiększa się kwota na koncie i subkoncie w ZUS wraz z upływem lat.

## 4. Raportowanie i Administracja (Fazy 1.5 - 1.7)

### 4.1. Raport Użytkownika
Użytkownik musi mieć możliwość **pobrania raportu** dotyczącego swojej prognozy, zawierającego wprowadzone parametry początkowe, wykresy i tabele.

### 4.2. Dane Opcjonalne
Na końcu procesu symulacji pojawia się prośba o podanie **kodu pocztowego** (jest to opcja nieobligatoryjna).

### 4.3. Raportowanie Administracyjne (Admin)
Musi istnieć możliwość pobrania raportu z użycia symulatora w formacie **XLS** z poziomu administratora.
**Nagłówki raportu użycia muszą zawierać**:
*   Data użycia
*   Godzina użycia
*   Emerytura oczekiwana
*   Wiek
*   Płeć
*   Wysokość wynagrodzenia
*   Czy uwzględniał okresy choroby
*   Wysokość zgromadzonych środków na koncie i Subkoncie
*   Emerytura rzeczywista
*   Emerytura urealniona
*   Kod pocztowy