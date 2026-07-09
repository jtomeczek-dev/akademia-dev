# Changelog

Wszystkie znaczące zmiany w tym projekcie są opisywane w tym pliku.

Format oparty na [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/),
a numeracja wersji zgodna z [Semantic Versioning](https://semver.org/lang/pl/).

## [1.1.0] - 2026-07-09

### Fixed
- Przycisk „Kopiuj" w kartach promptów: wizualny feedback („Skopiowano ✓")
  był uzależniony od rozstrzygnięcia obietnicy `navigator.clipboard.writeText()`.
  W niektórych warunkach przeglądarki (np. utrata fokusu dokumentu w momencie
  kliknięcia) ta obietnica potrafi nigdy się nie rozstrzygnąć — ani sukcesem,
  ani błędem — bez żadnego zgłoszenia w konsoli. Feedback na przycisku jest
  teraz ustawiany synchronicznie, od razu w handlerze kliknięcia, niezależnie
  od wyniku i czasu trwania operacji schowka; samo kopiowanie do schowka
  (z zapasowym `execCommand`) działa dalej w tle, najlepszym możliwym
  wysiłkiem.

### Added
- Mechanizm wersjonowania: stała `APP_VERSION` w `app.js`, jedno miejsce do
  podbicia przy każdej kolejnej zmianie.
- Numer wersji widoczny w stopce strony, obok noty o materiale kursowym.

## [1.0.0] - 2026-07-09

### Added
- Pierwsza wersja narzędzia dla uczestników warsztatu „drugi mózg z AI"
  (10.07.2026, JT CONSULTING / AI for Everyone).
- Program dnia: 17 bloków z opisem, godzinami, checkpointami do zaznaczenia
  i śledzeniem postępu w `localStorage` (pasek postępu, wyróżnienie bloku
  „w toku" wg aktualnej godziny).
- Biblioteka promptów: 18 gotowych promptów do skopiowania, przypisanych do
  odpowiednich bloków programu, z linkowaniem przez `location.hash`.
- Layout i identyfikacja wizualna zgodne z brandbookiem JT CONSULTING
  (kolory, typografia, nagłówek z logo i CTA „Skontaktuj się").
- Sekcja kontaktowa `#kontakt` z osadzonym formularzem HubSpot.
- `Dockerfile` do uruchomienia strony jako statycznego kontenera.
