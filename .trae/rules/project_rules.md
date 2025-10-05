{
  "Projekt": "ZUS na Plus ()",
  "Cel_Glowny": "Narzędzie edukacyjne do prognozowania wysokości emerytury, z modułami aktuarialnymi FUS20",
  "Wymagania_Podstawowe": [
    {"ID": "R004", "Opis": "Integracja danych: Prognoza FUS20 (2022) do 2080 roku [1, 6, 36], Prognoza Demograficzna MF z 2022 r. [37, 38], GUS, NBP, MF", "Status": "Obowiązkowy"},
    {"ID": "R005", "Opis": "Wczytanie historycznych wskaźników waloryzacji składek (rocznych i kwartalnych) [7, 11]", "Status": "Obowiązkowy"},
    {"ID": "R006", "Opis": "Wczytanie tablic dalszego trwania życia (w miesiącach) [16-18]", "Status": "Obowiązkowy"}
  ],
  "Modul_Symulacja_Emerytury": {
    "Ekran": "Formularz Wprowadzania Danych (1.2)",
    "Pola_Obowiazkowe": ["Wiek", "Płeć", "Wysokość wynagrodzenia brutto", "Rok rozpoczęcia pracy", "Planowany rok zakończenia aktywności (domyślnie: wiek emerytalny)"],
    "Pola_Fakultatywne": ["Wysokość zgromadzonych środków na koncie i subkoncie ZUS", "Staż składkowy/nieskładkowy na 31.12.1998 [19]"],
    "Logika_Wewnetrzna": [
      {"ID": "L2.2", "Opis": "Waloryzacja Wynagrodzeń: Odwracanie indeksacji wynagrodzeń na podstawie średniego wzrostu NBP/GUS oraz wykorzystanie historycznych **rocznych/kwartalnych wskaźników waloryzacji składek (konto/subkonto)** [7, 11, 12, 22, 39]."},
      {"ID": "L2.4a", "Opis": "Kalkulacja Chorobowego: Uwzględnienie średniej długości absencji chorobowej **w podziale na wiek i płeć** (np. dla 60 lat) [23]."},
      {"ID": "L2.5", "Opis": "Obliczenie Emerytury: Wykorzystanie zgromadzonego Kapitału Początkowego (jeśli podano/obliczono na podstawie stażu) [19] oraz tablicy dalszego trwania życia [16-18]."}
    ]
  },
  "Modul_Wynik": {
    "Ekran": "Prezentacja Prognozy (1.3)",
    "Wskazniki": [
      {"ID": "W3.4", "Opis": "Opóźnienie emerytury: Prognoza wzrostu świadczenia przy odłożeniu o X lat oraz **porównanie z historycznymi odsetkami opóźnienia przejścia na emeryturę** (np. o 2 lata i więcej) [25, 26]."},
      {"ID": "W3.6", "Opis": "Kontekst Powiatowy/Zawodowy: Możliwość wyświetlenia **przeciętnej wysokości emerytury (2024)** w wybranym powiecie oraz przeciętnej emerytury dla **ostatniego kodu tytułu ubezpieczenia** [27, 29]."}
    ]
  },
  "Modul_Dashboard_Zaawansowany": {
    "Ekran": "Dashboard (1.4)",
    "Funkcjonalnosci_Aktuarialne": [
      {"ID": "F4.0", "Opis": "Wybór Wariantu FUS20: Wariant 1 (pośredni), Wariant 2 (pesymistyczny), Wariant 3 (optymistyczny) [1, 6]."},
      {"ID": "F4.1", "Opis": "Modyfikacja Założeń Makroekonomicznych: Zmiana **stopy bezrobocia, wskaźnika realnego wzrostu przeciętnego wynagrodzenia, inflacji ogółem/dla emerytów, ściągalności składek** [2-5, 33]."},
      {"ID": "F4.3a", "Opis": "Wprowadzenie Chorobowego wg Powiatu: Możliwość symulacji przyszłej/historycznej absencji na podstawie statystyk danego powiatu [34, 35]."},
      {"ID": "F4.5", "Opis": "Wprowadzenie Kapitału Początkowego: Wprowadzanie precyzyjnej kwoty kapitału początkowego lub wyliczenie go na podstawie tabel referencyjnych (staż 1-20 lat) [19]."}
    ]
  }
}