# Changelog

Wszystkie znaczące zmiany w tym projekcie są opisywane w tym pliku.

Format oparty na [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/),
a numeracja wersji zgodna z [Semantic Versioning](https://semver.org/lang/pl/).

## [1.3.0] - 2026-07-09

### Changed
- Opisy (`desc`) wszystkich 17 bloków w `app.js` przepisane na bazie PEŁNYCH
  rozdziałów podręcznika kursu (`podrecznik/00-*.md` … `16-*.md`), a nie
  skróconej treści wydestylowanej wcześniej. Nowe opisy wierniej oddają
  moje sformułowania i pierwszoosobowy ton prowadzącego („poprowadzę Cię",
  „dostajesz ode mnie", „pokażę Ci"). Pola `checkpoints` i `prompts` — już
  raz zweryfikowane co do wierności źródłu — pozostają bez zmian, co do znaku.
- `README.md` zaktualizowany pod aktualny stan projektu: gotowa, opublikowana
  strona pod adresem https://jtomeczek-dev.github.io/akademia-dev/ (GitHub
  Pages jako jedyny, świadomie wybrany cel wdrożenia; VPS odrzucony).
  Usunięte nieaktualne odniesienia do „kroku 0" i planowanej budowy strony;
  dodana wzmianka o podagentach Claude Code (webmaster, recenzent
  bezpieczeństwa, recenzent UX/dostępności, recenzent treści) jako narzędziach
  AI wspierających jednego autora, nie jako zespole ludzi.
- Spójność pierwszoosobowego głosu autora (JT CONSULTING, Juliusz Tomeczek)
  w całym projekcie — poprawione pojedyncze sformułowania sugerujące zespół
  ludzki (np. „poza zasięgiem naszego CSS" → „poza zasięgiem mojego CSS").

### Removed
- `Dockerfile` i `.dockerignore` — VPS jako cel wdrożenia został odrzucony na
  rzecz wyłącznie GitHub Pages, więc uruchamianie strony jako kontenera
  Docker wypadło z zakresu projektu.

## [1.2.0] - 2026-07-09

### Added
- Oba logo w nagłówku (JT CONSULTING i AI for Everyone) linkują teraz do
  https://aiforeveryone.blog, otwierane w nowej karcie (`target="_blank"`,
  `rel="noopener noreferrer"`), z opisowym `aria-label` informującym, że link
  prowadzi na zewnętrzną domenę. Logo JT CONSULTING w stopce pozostaje bez
  linku (poza zakresem tej zmiany).
- Nowy prompt w bloku 07 („Szkielet do skopiowania — CLAUDE.md"), dodany jako
  pierwszy w kolejności — zgodnie z metodą kursu szkielet kopiuje się do
  `CLAUDE.md` przed poproszeniem Claude Code o dostosowanie go do własnej
  dziedziny. Biblioteka promptów liczy teraz 19 pozycji.
- Plik `.dockerignore` w korzeniu projektu — wyklucza z obrazu Docker katalog
  `.git/` (pełna historia repo wraz z adresem zdalnym), `.claude/`,
  `README.md` i `CHANGELOG.md`, które wcześniej trafiały do publicznego
  obrazu przez `COPY . /usr/share/nginx/html`.
- Ogłaszanie potwierdzenia kopiowania promptu czytnikom ekranu: niewidoczny
  wizualnie element `role="status"`/`aria-live="polite"` obok przycisku
  „Kopiuj" (klasa `.sr-only`).
- Rozróżniający `aria-label` na każdym przycisku „Kopiuj" (np. „Kopiuj
  prompt: {etykieta}"), aktualizowany też po skopiowaniu.
- `aria-current="true"` na przycisku aktualnie wybranego bloku w liście
  programu dnia.
- `aria-live="polite"` na tekście postępu (`#progress-text`).

### Changed
- Sekcja kontaktowa: usunięty własny opisowy akapit (dublował się z tekstem
  wewnątrz formularza HubSpot), nagłówek zmieniony z „Masz pytanie? Napisz do
  nas" na „Zarejestruj się i zostaw opinię", zgodnie z faktyczną treścią
  formularza (rejestracja do przyszłej wersji komercyjnej + opinia). Kolor
  przycisku i font formularza HubSpot pozostają bez zmian (renderują się
  w cross-origin iframe hsforms.net, poza zasięgiem mojego CSS).
- Obszar dotykowy checkboxa listy bloków powiększony z 18×18px do 24×24px
  (minimalny zalecany rozmiar celu dotykowego).

### Fixed
- Kontrast: nowa zmienna `--zielen-cta` (#1E7A45) zastępuje `--zielen`
  (#2E9E5B) jako tło pod białym tekstem (przyciski „Skontaktuj się" i
  „Kopiuj", tag „w toku") — biały tekst na oryginalnej zieleni miał kontrast
  ok. 3,4:1, poniżej wymaganych WCAG 4,5:1; na nowym odcieniu kontrast wynosi
  ok. 5,35:1. `--zielen` oryginalna zostaje bez zmian tam, gdzie nie stoi na
  niej biały tekst (pasek postępu, checkboxy).
- `.block-item__num` i `.block-detail__eyebrow` (drobny tekst zielony na
  białym tle) zmienione na `var(--granat)` — brandbook zabrania używania
  zieleni jako koloru tekstu na bieli, tylko jako tła przycisku.
- Kontrast `.site-footer__version` na tle `--granat-gleboki`: kolor zmieniony
  z `#64748B` (ok. 3,0:1) na `#8FA0BE` (ten sam, którego już używa
  `.site-footer__note`, z kontrastem OK).

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
