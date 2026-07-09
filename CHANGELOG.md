# Changelog

Wszystkie znaczące zmiany w tym projekcie są opisywane w tym pliku.

Format oparty na [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/),
a numeracja wersji zgodna z [Semantic Versioning](https://semver.org/lang/pl/).

## [1.8.5] - 2026-07-09

### Added
- Blok 08: krok 1 sekcji „Co robimy" linkuje teraz do promptu „Przygotuj
  migrację danych Projektu" (#blok-08-prompt-1) — wcześniej tylko krok 3
  linkował do swojego promptu (#blok-08-prompt-2).

## [1.8.4] - 2026-07-09

### Fixed
- Blok 03: usunięte zbędne powtórzenie w zdaniu „Lista darmowych źródeł UX
  do dodania w swoim notatniku: Darmowe źródła UX do własnego notatnika."
  — druga część była osieroconym tekstem linku zgubionego przy transkrypcji
  treści na stronę. W sejfie ten sam fragment to działający wikilink, więc
  poprawka dotyczy wyłącznie strony.

## [1.8.3] - 2026-07-09

### Changed
- Blok 07: „To dokument żywy:" → „To jest żywy dokument:" (naturalniejszy
  szyk zdania). Ta sama poprawka wprowadzona źródłowo w sejfie Obsidian.

## [1.8.2] - 2026-07-09

### Fixed
- Blok 07: zdanie o wklejeniu promptu dostosowującego schemat linkowało
  błędnie do promptu 1 („Szkielet do skopiowania — CLAUDE.md") zamiast do
  promptu 2 („Dostosuj schemat CLAUDE.md do mojej dziedziny"), którego
  faktycznie dotyczyło. Link poprawiony na właściwą kotwicę.

## [1.8.1] - 2026-07-09

### Fixed
- Blok 06: „Dziś jest pusto." → „Jeszcze nie mamy takiego pliku w sejfie." —
  jaśniej opisuje stan pliku `CLAUDE.md` przed rozdziałem 07. Ta sama
  poprawka wprowadzona źródłowo w sejfie Obsidian.

## [1.8.0] - 2026-07-09

### Added
- Nowa globalna zasada treści: każdy adres internetowy wspomniany w prozie
  bloków (`content`) jest teraz klikalnym linkiem zewnętrznym (`https://`,
  otwierany w nowej karcie), zamiast gołego tekstu. Zlinkowano: blok 05
  (`obsidian.md/download`), blok 07 (`kepano/obsidian-skills` ×2 — sekcja
  „Co robimy" i „Do użycia"), blok 09 (`obsidian.md/download`) oraz blok 15
  (`github.io` ×3, adres przykładowy `jtomeczek-dev.github.io/landing-ux/`,
  `netlify.com`, `app.netlify.com/drop`). Nazwy plików lokalnych (`skills.md`,
  `CLAUDE.md`…), adresy e-mail opisowe i placeholder `mojastrona.pl` zostają
  bez zmian, tak jak treść pól `checkpoints` i `prompts[].text`.

### Changed
- Blok 03: wzmocniono cytat „Zapamiętaj" o NotebookLM — dodano, że spośród
  dostępnych darmowych narzędzi AI ma on najmniejszą tendencję do halucynacji.
- Blok 02: usunięto z treści strony jedyny callout „Dla prowadzącego" (notatka
  adresowana wyłącznie do prowadzącego, nie do uczestnika).
- Blok 05: cztery poprawki tekstu („realnym" → „dostępnym"; doprecyzowanie
  „gęsto połączoną wzajemnymi linkami wiki"; „surowce" → „surowiec - pliki";
  „przetwarzać surowce" → „przetwarzać wszystkie pliki") oraz przywrócono
  zgubiony przy transkrypcji link do źródła wzorca (Andrej Karpathy, „LLM
  Wiki", gist).

## [1.7.0] - 2026-07-09

### Added
- Nowa globalna zasada renderowania: fragmenty treści bloków (`content`), które
  w prozie wspominają konkretny prompt z tego samego bloku po nazwie/etykiecie
  lub bliskiej parafrazie, są teraz klikalnymi linkami do kotwicy tej karty
  promptu (`#blok-{NN}-prompt-{index}`, ten sam format ID, jaki generuje
  `renderPromptCard`). Zlinkowano bloki 02 (6 miejsc: PROMPT 1 ×3, „pierwsza
  decyzja o Twojej landing page", „prompt weryfikacyjny", nagłówek i akapit
  „kończę pracę"), 07 (4 miejsca), 08 (1), 09 (1), 10 (2), 11 (1), 12 (3), 13
  (3) i 14 (4) — łącznie 25 nowych linków w treści. `renderInline()` obsługuje
  teraz zagnieżdżone `**pogrubienie**` wewnątrz `[tekst](url)` (linki
  parsowane rekurencyjnie), a kotwice wewnętrzne (`href` zaczynający się od
  `#`) otwierają się w tej samej karcie zamiast w nowej (adresy zewnętrzne bez
  zmian: nowa karta). Nagłówki (`type: 'heading'`) przechodzą teraz również
  przez `renderInline()`, więc mogą zawierać linki i pogrubienia tak samo jak
  akapity, listy, ramki i cytaty.

### Changed
- Redakcja nawyku „Myślenie oddzielone od wykonania" → „Wiedza oddzielona od
  kodu" (bloki 01 i 16, w treści i w `checkpoints` bloku 16): doprecyzowano,
  że to WIEDZA mieszka w Second Brain, a KOD strony powstaje w osobnym
  katalogu — nie „myślenie vs wykonanie".
- Blok 01: „Trzy nawyki, które wrócą przez cały dzień" → „Trzy nawyki, które
  będziemy powtarzać przez cały dzień".
- Blok 02: doprecyzowano, że Claude Chat działa „w oknie przeglądarki na
  `claude.ai` lub w aplikacji Claude Desktop" (wcześniej: „w oknie
  przeglądarki lub w aplikacji na `claude.ai`"); „doradcy na jeden raz" →
  „jednorazowego doradcy".
- Blok 03: wprowadzono termin „halucynacje" („nie zmyśla i nie dryfuje" →
  „nie ma halucynacji (...) i nie dryfuje") w opisie NotebookLM oraz w cytacie
  „Zapamiętaj" („mniej zmyślania" → „mniej halucynacji"); dodano listę ośmiu
  klikalnych linków do darmowych źródeł UX w sekcji „Do użycia".

Te same poprawki tekstu wprowadzono już źródłowo w rozdziałach podręcznika
w sejfie Obsidian (przez autora, poza zakresem tej zmiany w `app.js`).

## [1.6.0] - 2026-07-09

### Changed
- Ujednolicono terminologię w całej treści `app.js`: fraza „drugi mózg" (w
  dowolnej odmianie) pojawia się teraz **wyłącznie raz** w całym pliku — jako
  świadome, jednorazowe wyjaśnienie terminu w bloku 05 („Second Brain
  (dosłownie: „drugi mózg")"). We wszystkich pozostałych 16 blokach,
  włącznie z opisami, `checkpoints` i `prompts` do kopiowania, fraza została
  zastąpiona przez „Second Brain" (nieodmienne, jak przyjęte dla obcojęzycznych
  nazw własnych). To świadoma decyzja terminologiczna klienta, która w tym
  jednym wypadku celowo łamie dotychczasową zasadę „checkpointy/prompty
  dosłownie jak w źródle" — zmieniana jest wyłącznie ta jedna fraza, reszta
  treści checkpointów i promptów pozostaje bez zmian. Tę samą operację
  wprowadzono już źródłowo w rozdziałach podręcznika i pliku dystylującym
  treść w sejfie Obsidian (przez autora, poza zakresem tej zmiany w `app.js`).
- Blok 01: trzy poprawki tekstu — „To namacalny dowód, że metoda działa, a nie
  temat sam w sobie" → „To namacalny dowód, że proponowana przeze mnie metoda
  działa"; „poznaj **kształt całego dnia**" → „poznaj **plan całego dnia**";
  „więc rośnie sieć, a nie sterta luźnych plików" → „więc rośnie sieć powiązań
  w bazie wiedzy, a nie sterta luźnych plików". Te same poprawki wprowadzono
  już źródłowo w rozdziale 01 podręcznika w sejfie Obsidian.

## [1.5.0] - 2026-07-09

### Added
- `renderInline()` w `app.js` obsługuje teraz obok `**pogrubienia**` także
  składnię linku Markdown `[tekst](url)`, renderowaną bezpiecznie przez
  `h('a', { href, target: '_blank', rel: 'noopener noreferrer' }, tekst)`
  (bez `innerHTML`). Oba wzorce mogą występować w tym samym tekście, w
  dowolnej kolejności. Dodano regułę CSS podkreślającą linki wewnątrz
  `.block-detail__p`, `.callout__text` i `.callout-quote` dla czytelności
  (link ma ten sam kolor co reszta tekstu, więc bez podkreślenia byłby
  trudny do zauważenia).
- Blok 00, sekcja „Do użycia": podlinkowano „Checklistę uczestnika" do
  gotowego pliku PDF (`assets/checklista-uczestnika.pdf`), otwieranego w
  nowej karcie.

### Fixed
- Blok 01, sekcja „Ważne": zdanie o celu nadrzędnym dnia doprecyzowane —
  landing page powstaje na podstawie wiedzy z drugiego mózgu **i
  NotebookLM**, nie tylko z drugiego mózgu. Ta sama poprawka wprowadzona
  źródłowo w rozdziale 01 podręcznika kursu w sejfie Obsidian (przez
  autora, poza zakresem tej zmiany w `app.js`).

## [1.4.2] - 2026-07-09

### Fixed
- Blok 00: pole `content` (lista „Co robimy", pozycja o koncie Claude) zawierało
  nieaktualną rekomendację planu **Max** — sprzeczną z aktualną checklistą
  uczestnika, gdzie plan **Pro** został uznany za w pełni wystarczający (Max
  zarezerwowany dla prowadzącego). Treść na stronie ujednolicona z checklistą.
  Ta sama poprawka wprowadzona źródłowo w rozdziale 00 podręcznika kursu
  (plik `podrecznik/00-zanim-zaczniemy.md` w sejfie Obsidian), na wyraźne
  polecenie autora — jedyny dotąd wyjątek od zasady „sejf tylko do odczytu".

## [1.4.1] - 2026-07-09

### Changed
- Przegląd redakcyjny pola `content` we wszystkich 17 blokach w `app.js`:
  weryfikacja pod kątem naturalności polszczyzny (tekst ma czytać się jako
  myślany po polsku, nie jako tłumaczenie z angielskiego). Poprawiony tytuł
  callouta w bloku 01: „Uczciwie: to wymaga dyscypliny" → „Ważne: to wymaga
  dyscypliny" (poprzednia wersja brzmiała jak kalka z angielskiego
  „Honestly:"/„To be honest:"). Pozostała treść `content` po przeglądzie nie
  wymagała zmian. Pola `checkpoints` i `prompts` pozostają bez zmian, co do
  znaku.

## [1.4.0] - 2026-07-09

### Added
- Nowy, bezpieczny (bez `innerHTML`) renderer ustrukturyzowanej treści bloku
  w `app.js`: `renderInline()` (parsuje `**pogrubienia**` na DOM-node'y),
  `renderContentNode()` (nagłówki sekcji, akapity, listy punktowane i
  numerowane, ramki-callouty `info`/`tip`/`warning`/`success`/`note`, cytaty).
  Odpowiadające style w `style.css`: `.block-detail__section-heading`,
  `.block-detail__p`, `.callout`, `.callout__title`, `.callout__text`,
  `.callout-quote`.

### Changed
- Pole `desc` (płaski, jednoakapitowy opis) zastąpione w KAŻDYM z 17 bloków
  polem `content`: uporządkowaną tablicą węzłów treści wiernie odtwarzającą
  bogatą strukturę odpowiadających rozdziałów podręcznika (`podrecznik/00-*.md`
  … `16-*.md`) — nagłówki sekcji („🎯 Ważne", „🛠️ Co robimy" itd.), listy,
  ramki-callouty (`> [!warning]`, `> [!tip]`, `> [!info]`, `> [!success]`,
  `> [!note]`, w tym `[!abstract]` odwzorowane jako `info`) oraz zwykłe
  cytaty. `renderBlockDetail` renderuje teraz `content` zamiast płaskiego
  `desc`. Wewnętrzne linki do sejfu Obsidiana zamienione na czysty tekst.
  Pola `checkpoints` i `prompts` — już raz zweryfikowane co do wierności
  źródłu — pozostają bez zmian, co do znaku.

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
