'use strict';

/* ==========================================================================
   Akademia — Second Brain z AI
   Dane 17 bloków programu dnia + biblioteka promptów, śledzenie postępu
   w localStorage. Czysty vanilla JS, bez frameworka, bez backendu.
   ========================================================================== */

/* Wersja aplikacji (semver) — jedno miejsce do podbicia przy każdej zmianie.
   Wyświetlana w stopce strony i śledzona w CHANGELOG.md. */
const APP_VERSION = '1.8.3';

/* ---------- Mały bezpieczny helper do budowy DOM (bez innerHTML) ---------- */
function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === null || value === undefined || value === false) continue;
      if (key === 'text') {
        el.textContent = value;
      } else if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === 'class') {
        el.setAttribute('class', value);
      } else {
        el.setAttribute(key, value);
      }
    }
  }
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)));
    } else {
      el.appendChild(child);
    }
  }
  return el;
}

/* ==========================================================================
   Dane bloków (treść wydestylowana z materiału źródłowego kursu)
   ========================================================================== */

const BLOCKS = [
  {
    id: '00',
    title: 'Zanim zaczniemy',
    time: 'przed zajęciami (dzień wcześniej), ok. 30–45 min',
    mode: 'przygotowanie',
    content: [
      { type: 'heading', text: '🎯 Ważne' },
      { type: 'p', text: 'Warsztat jest **intensywny i praktyczny**: pracujesz na komputerze od pierwszej godziny. Ten rozdział pilnuje, aby zacząć kurs z gotowym środowiskiem i **nie tracić czasu na zakładanie kont**, gdy reszta grupy już buduje. Piętnaście minut przygotowania oszczędza Ci godzinę frustracji.' },
      { type: 'callout', kind: 'info', title: 'Windows i macOS', text: 'Pracujemy na obu systemach. Wszystkie kroki mają wariant dla Windows i macOS.' },
      { type: 'heading', text: '🛠️ Co robimy' },
      { type: 'p', text: 'Przejdź **całą** Checklistę uczestnika, punkt po punkcie. W skrócie potrzebujesz:' },
      { type: 'ol', items: [
        '**Laptop** z prawami administratora i wolnym miejscem na dysku.',
        '**Konto Google** do NotebookLM, z działającym logowaniem.',
        '**Konto Claude z płatną subskrypcją.** Plan **Pro** (ok. 18 EUR/mies.) w zupełności wystarczy — program mieści się w jego limitach, a limit odnawia się co ~5 godzin. Tani bezpiecznik na wszelki wypadek: **Usage credits** w Ustawienia → Usage. Plan **Max** (ok. 90 EUR/mies.) nie jest wymagany — ja jako prowadzący korzystam z niego, żeby pokazy szły płynnie. Darmowe konto nie wystarczy.',
        '**Aplikacja Claude na komputer**, zainstalowana i zalogowana.',
        '**Instalator Obsidian**, pobrany (sejf założymy razem na kursie).',
        '**Rozszerzenie Obsidian Web Clipper**, dodane do przeglądarki (skonfigurujemy je razem na kursie).',
        '**Pomysł na temat** Twojego Second Brain. Jeśli go nie masz, poprowadzę Cię z góry zdefiniowaną ścieżką tematyczną UX.'
      ]},
      { type: 'callout', kind: 'note', title: 'Co dostajesz ode mnie', text: 'Tę checklistę, link do wspólnego notatnika NotebookLM (jeśli go nie masz, podaj mi na Teams swój adres Gmail) oraz materiały szkoleniowe, które przekażę już podczas kursu.' },
      { type: 'heading', text: '📋 Do użycia' },
      { type: 'p', text: 'Pełna lista z uzasadnieniami: [Checklista uczestnika](assets/checklista-uczestnika.pdf).' },
      { type: 'heading', text: '💡 Zapamiętaj' },
      { type: 'quote', text: 'Przez cały dzień wszystko opiera się na dwóch osobnych logowaniach: **konto Google** do NotebookLM (Twoja wiedza dziedzinowa) oraz **płatny Claude** do Projektów, MCP, Claude Code i Claude Design (mózg i produkcja). Jeśli coś ma dziś nie zadziałać, to prawie zawsze brakuje jednego z tych dwóch, więc sprawdź oba **dziś**, nie jutro rano. I pamiętaj: to Twoja wiedza jest sednem warsztatu, a narzędzia jedynie pomagają ją uporządkować.' }
    ],
    checkpoints: [
      'Wchodzę do NotebookLM (konto Google) i widzę interfejs narzędzia.',
      'Wchodzę do aplikacji Claude, subskrypcja jest aktywna.',
      'Mam Obsidian lub jego instalator.',
      'Mam dodane rozszerzenie Web Clipper w przeglądarce.',
      'Mam temat Second Brain albo wiem, że pójdę ścieżką UX.'
    ],
    prompts: []
  },
  {
    id: '01',
    title: 'Cel dnia i wybór tematu',
    time: '8:00–8:20',
    mode: 'wspólnie',
    content: [
      { type: 'heading', text: '🎯 Ważne' },
      { type: 'p', text: 'Ten warsztat **nie** odpowiada na pytanie „jak korzystać z AI", bo takich kursów są tysiące, za darmo. Uczy czegoś cenniejszego: **jak zarządzać własną wiedzą ze wsparciem AI**. Wiedza jest Twoja, a AI pomaga ją uporządkować, połączyć i zsyntetyzować. Cel nadrzędny dnia to **opublikowana landing page** zbudowana na podstawie wiedzy z Twojego Second Brain i NotebookLM. To namacalny dowód, że proponowana przeze mnie metoda działa.' },
      { type: 'heading', text: '🛠️ Co robimy' },
      { type: 'ol', items: [
        'Prowadzący przedstawia **ramę dnia**: tempo (guided, czyli prowadzący prowadzi, uczestnicy podążają), rytm „poznaj → zbuduj → opublikuj" oraz rolę przerw i bufora.',
        'Ustalamy **cel nadrzędny**: opublikowana strona jako dowód metody. Do tego zdania wracamy, ilekroć zgubisz sens kolejnego kroku.',
        '**Wybierasz temat swojego Second Brain**, czyli dziedzinę, którą chcesz uporządkować (Twoja specjalizacja zawodowa, prowadzony projekt, dziedzina pasji). Przez cały dzień pracujesz na tym temacie.',
        'Jeśli nie masz pomysłu, idziesz **z góry zdefiniowaną ścieżką tematyczną UX** przygotowaną przez prowadzącego.'
      ]},
      { type: 'heading', text: '🧭 Jak działa ta metoda (i co z niej zabierasz)' },
      { type: 'p', text: 'Zanim ruszymy, poznaj **plan całego dnia** oraz to, co zostaje z Tobą na stałe. Narzędzia będą się zmieniać, sposób pracy zostaje ten sam.' },
      { type: 'p', text: '**Rytm dnia: poznaj → zbuduj → opublikuj.**' },
      { type: 'ul', items: [
        '**Rano** budujesz fundament w Claude Chat: projekt jako mentor, notatnik wiedzy w NotebookLM, ustawienia.',
        '**W południe** przenosisz się do Obsidian i Claude Code: stawiasz własny Second Brain (sejf) i zasilasz go swoją wiedzą.',
        '**Po południu** produkujesz i publikujesz: z Second Brain powstają brandbook, makieta, agenci, a na końcu żywa strona.'
      ]},
      { type: 'p', text: 'Dlaczego w ogóle przenosimy wiedzę do sejfu, zamiast zostać w czacie? Bo **Second Brain oszczędza pracę**: rozmowa w zwykłym czacie AI czyta wszystko od nowa przy każdym pytaniu, a sejf połączony odnośnikami (WikiLinki) podaje tylko to, co istotne. Raz uporządkowana wiedza pracuje wielokrotnie. Rozwiniemy to w rozdziale 05.' },
      { type: 'p', text: '**Trzy nawyki, które będziemy powtarzać przez cały dzień.** To jest właściwa lekcja, ważniejsza niż którekolwiek narzędzie. Dziś zobaczysz każdy z nich wielokrotnie, a na koniec zabierasz je jako gotową metodę:' },
      { type: 'ul', items: [
        '**„Kończę pracę".** Każdą sesję domykasz tak, że ustalenia trafiają do **trwałej pamięci**, a nie giną w historii czatu.',
        '**Raport i ingest.** Nowa wiedza wraca do sejfu jako **strona bazy wiedzy połączona** z resztą, więc rośnie sieć powiązań w bazie wiedzy, a nie sterta luźnych plików.',
        '**Wiedza oddzielona od kodu.** Wiedza mieszka w Second Brain, a kod strony powstaje w osobnym katalogu, dzięki czemu jedno nie miesza się z drugim.'
      ]},
      { type: 'callout', kind: 'warning', title: 'Ważne: to wymaga dyscypliny', text: 'Ta metoda jest **pracochłonna i wymaga systematyczności** — to jej cecha, nie wada. Second Brain działa dokładnie na tyle, na ile go karmisz i domykasz sesje. Dobra wiadomość: dziś przećwiczysz każdy z tych nawyków po kolei, więc wyjdziesz z **gotowym rytmem pracy**, a nie z samą teorią.' },
      { type: 'heading', text: '📋 Do użycia' },
      { type: 'p', text: 'Wybór tematu dopinasz na podstawie Checklisty uczestnika (sekcja „Przyjdź z jednym pomysłem").' },
      { type: 'heading', text: '💡 Zapamiętaj' },
      { type: 'quote', text: 'Przez cały dzień to **Ty wnosisz wiedzę**, a narzędzia jedynie ją porządkują. Jeśli kiedykolwiek zgubisz sens zadania, wróć do pytania: „jak to porządkuje moją wiedzę?".' }
    ],
    checkpoints: [
      'Rozumiesz, że tematem kursu jest zarządzanie wiedzą, a nie „obsługa AI”.',
      'Wiesz, jaki jest cel nadrzędny dnia (opublikowana strona).',
      'Znasz rytm dnia (poznaj → zbuduj → opublikuj) i trzy nawyki, które zabierasz jako metodę.',
      'Masz wybrany temat Second Brain albo świadomie idziesz ścieżką UX.'
    ],
    prompts: []
  },
  {
    id: '02',
    title: 'Projekt jako mentor',
    time: '8:20–9:05',
    mode: 'ćwiczenie praktyczne',
    content: [
      { type: 'callout', kind: 'info', title: 'Czym jest Claude Chat i Projekt', text: '**Claude Chat** to Claude, z którym rozmawiasz w oknie przeglądarki na `claude.ai` lub w aplikacji Claude Desktop. Każda rozmowa to osobny czat. **Projekt** to wydzielona przestrzeń w Claude Chat, która grupuje powiązane rozmowy i nadaje im **wspólne, trwałe** instrukcje oraz dokumenty. Dzięki temu Claude w danym Projekcie zna Twój kontekst w każdej rozmowie, zamiast zaczynać za każdym razem od zera. To właśnie z Projektu korzystasz w tym rozdziale.' },
      { type: 'heading', text: '🎯 Ważne' },
      { type: 'p', text: 'Zwykły czat zapomina wszystko po jego zamknięciu. **Projekt** w Claude ma trwały kontekst: instrukcje i dokumenty, które model czyta przy każdej rozmowie. W tym kroku **konfigurujesz środowisko pracy**, czyli zamieniasz Claude z „jednorazowego doradcy" w **stałego mentora** znającego Twój kontekst i cel.' },
      { type: 'heading', text: '🧩 Co ustawiasz: trzy przestrzenie Projektu' },
      { type: 'p', text: 'Różni je zmienność przechowywanych treści:' },
      { type: 'ol', items: [
        '**Instrukcje projektu** (pole tekstowe) określają, jak Claude ma się zachowywać. Zmieniają się rzadko.',
        '**Wiedza projektu** (knowledge base) to dokumenty, które Claude czyta; tu wgrasz `skills.md` (przepływy) i `persony.md` (rada doradcza).',
        '**Pamięć projektu** (memory) trzyma informacje ulotne i często zmienne (bieżący stan, ostatnie decyzje, tymczasowe dane). Claude zapisuje ją na bieżąco.'
      ]},
      { type: 'heading', text: '🛠️ Co robimy' },
      { type: 'ol', items: [
        'Wejdź do Claude → Projekty → Utwórz projekt. Nazwij go np. „Mój mentor: {{Twoja dziedzina}}".',
        'Otwórz **nową rozmowę w tym projekcie**.',
        'Weź [PROMPT 1](#blok-02-prompt-1) i **wypełnij pola `{{…}}`** (kim jesteś, dziedzina, cel, obszary). To Twoja praca myślowa.',
        'Wklej wypełniony prompt i wyślij. Claude zada Ci **3–5 pytań**; odpowiedz spokojnie, bo one uzupełnią niezbędny kontekst dla Claude.',
        'Dostajesz cztery elementy: **tekst instrukcji projektu**, **`skills.md`**, **`persony.md`** oraz **zasadę korzystania z pamięci projektu** (co jest ulotne, a co trwałe).',
        '**Wklej instrukcje** w Ustawienia projektu → Instrukcje.',
        '**Wgraj** `skills.md` i `persony.md` do **wiedzy projektu**.'
      ]},
      { type: 'heading', text: '📋 Do użycia' },
      { type: 'p', text: 'Gotowiec: [PROMPT 1: „skonfiguruj Projekt Claude jako mentora"](#blok-02-prompt-1) (z polami i promptem domykającym [„kończę pracę"](#blok-02-prompt-3)).' },
      { type: 'callout', kind: 'note', title: 'Nie pomyl „Skills" ze `skills.md`', text: 'Funkcja **„Skills"** w Claude to biblioteka gotowych umiejętności/rozszerzeń (część od Anthropic, część własne). Nasz **`skills.md`** to Twój dokument **przepływów pracy** w wiedzy projektu. Ta sama nazwa, dwie różne rzeczy.' },
      { type: 'heading', text: '▶️ Sprawdź, że mentor korzysta z wiedzy projektu' },
      { type: 'p', text: 'Zanim domkniesz sesję, zadaj Claude\'owi zadanie, które **musi** sięgnąć do tego, co przed chwilą zostało wgrane. Zrobimy to od razu na temacie, który przyda się później: [**pierwsza decyzja o Twojej landing page**](#blok-02-prompt-2). Wynik zapiszemy jako artefakt `.md` i wykorzystamy po południu.' },
      { type: 'p', text: 'Dobry znak: Claude przywołuje Twoje persony po rolach (choć nie ma ich w tej rozmowie, bo są w wiedzy projektu) i trzyma ton z instrukcji. Powstały artefakt `.md` **później dodasz do wiedzy projektu** i wykorzystasz przy budowie strony.' },
      { type: 'heading', text: '🔒 Domknięcie sesji ([„kończę pracę"](#blok-02-prompt-3))' },
      { type: 'p', text: 'Zanim przejdziemy dalej, utrwal ustalenia. Uruchom prompt domykający [„kończę pracę"](#blok-02-prompt-3) z gotowca. Claude **zaproponuje zmiany w instrukcjach projektu** (co i gdzie) oraz odda `skills.md` i `persony.md` w całości. Następnie **ręcznie**: nanieś zmiany w polu instrukcji projektu i **wgraj oba dokumenty z powrotem** do wiedzy projektu. (Claude nie edytuje pola instrukcji samodzielnie; robisz to Ty.)' },
      { type: 'p', text: 'To **najważniejszy nawyk całego kursu**: ustalenia zapisujesz w instrukcjach i dokumentach, nie zostawiasz ich w historii czatu, która się gubi.' },
      { type: 'heading', text: '💡 Zapamiętaj' },
      { type: 'quote', text: '**Trwały kontekst znaczy więcej niż historia czatu.** Mentor jest tak dobry, jak jego pamięć, a Ty budujesz tę pamięć świadomie: **instrukcje projektu** (jak ma pracować) oraz **dokumenty w wiedzy** (`skills.md`, `persony.md`). To pierwszy z **trzech nawyków** metody, „kończę pracę" (zob. rozdz. 01). Wróci dziś jeszcze wielokrotnie. Struktura Second Brain przyjdzie później; dziś stawiasz środowisko.' },
      { type: 'heading', text: '⏭️ Ograniczenia tego podejścia' },
      { type: 'p', text: 'To, co właśnie zostało zbudowane (Projekt, w którym Claude opiera się na instrukcjach i dokumentach), jest dobrym początkiem, ale w kontekście AI to już podejście **przestarzałe**, bo bywa **kosztowne i zawodne**:' },
      { type: 'ul', items: [
        '**Koszt (tokeny).** Żeby odpowiedzieć, model za każdym razem wczytuje wiedzę projektu do kontekstu. Im więcej dokumentów, tym drożej i wolniej.',
        '**Niespójność.** Za każdym razem AI może inaczej zinterpretować i połączyć te same fakty, więc kolejne odpowiedzi bywają rozbieżne.'
      ]},
      { type: 'p', text: 'Jednym z rozwiązań jest **baza wektorowa**: zamiast wczytywać wszystko, model sięga tylko po fragmenty naprawdę potrzebne do danego pytania. Najprostszą w obsłudze i ogólnodostępną bazą wektorową jest **NotebookLM**, i właśnie jego poznajemy w następnym rozdziale.' }
    ],
    checkpoints: [
      'Projekt Claude istnieje i ma wklejone instrukcje w ustawieniach.',
      'W wiedzy projektu są dwa dokumenty: `skills.md` i `persony.md`.',
      '`skills.md` zawiera przepływ „kończę pracę”.',
      'Wiesz, co trafia do pamięci projektu (ulotne), a co do instrukcji i dokumentów (trwałe).',
      'Potrafisz wskazać swoje 3–4 persony-doradcy i wiesz, o co każdy pyta.',
      'Na testowe zadanie Claude sięga do Twoich person i zasad z wiedzy projektu.'
    ],
    prompts: [
      {
        label: 'PROMPT 1 — skonfiguruj Projekt Claude jako mentora',
        text: `Jesteś moim mentorem i doradcą. Pomóż mi SKONFIGUROWAĆ środowisko pracy
w tym Projekcie Claude, tak aby stał się moim stałym mentorem w mojej
dziedzinie. NIE budujemy teraz żadnej bazy wiedzy ani struktury plików;
ustawiamy tylko, JAK ten Projekt ma ze mną pracować.

MÓJ KONTEKST
- Kim jestem: {{KIM JESTEM}}
- Moja dziedzina: {{DZIEDZINA}}
- Cel, do którego zmierzam: {{CEL DNIA}}
- Obszary, w których chcę wsparcia: {{OBSZARY WIEDZY}}

ZASADY PRACY
- Zadaj mi najpierw 3–5 pytań doprecyzowujących, jeśli czegoś Ci brakuje.
  Nie zgaduj kluczowych rzeczy, dopytaj.
- Myślenie zostaw mnie; Ty porządkujesz i proponujesz.

ZADANIE: przygotuj cztery elementy konfiguracji Projektu.

1) INSTRUKCJE PROJEKTU  (tekst do wklejenia w pole „Instrukcje projektu”)
   Trwałe instrukcje stosowane w KAŻDEJ rozmowie: kim jestem, jaki mam cel,
   w jakim języku i tonie masz odpowiadać, jakich zasad przestrzegać. Dodaj
   polecenie: „Korzystaj z dokumentów skills.md i persony.md z wiedzy projektu”.
   Podaj gotowy tekst do wklejenia.

2) skills.md  (dokument do WGRANIA do wiedzy projektu)
   Zbiór nazwanych, powtarzalnych przepływów, które uruchamiam hasłem, np.
   „nowa notatka”, „podsumuj materiał”, „przegląd tygodnia”, oraz OBOWIĄZKOWO
   „kończę pracę” (opis niżej). Dla każdego podaj: kiedy go używam i jakie
   kroki wykonujesz. Sformatuj jako gotowy plik .md.

3) persony.md  (dokument do WGRANIA do wiedzy projektu)
   Moja rada doradcza. Dobierz {{DORADCY}}, czyli 3–4 archetypy doradców
   pasujące do mojej dziedziny, OPISANE PRZEZ ROLĘ (np. „strateg treści”,
   „krytyk-sceptyk”), nie przez nazwiska. Do każdego podaj: domenę i
   charakterystyczne pytanie. Dołóż OBOWIĄZKOWO rolę „adwokata diabła”, który
   atakuje moje najbardziej ryzykowne założenie. Zasada: przy decyzji głos
   zabiera 2–4 najtrafniejszych doradców, nie wszyscy. Sformatuj jako gotowy
   plik .md.

4) ZASADA KORZYSTANIA Z PAMIĘCI PROJEKTU (memory)
   Ustal ze mną, co trafia do PAMIĘCI projektu, a co do instrukcji i dokumentów.
   Do pamięci zapisujesz informacje ULOTNE i CZĘSTO ZMIENNE: bieżący stan pracy,
   ostatnie decyzje, tymczasowe parametry, aktualne priorytety. Rzeczy TRWAŁE
   (zasady, przepływy, rada doradcza) trzymamy w instrukcjach i dokumentach.
   Uwzględnij tę zasadę także w proponowanym tekście instrukcji projektu, aby
   w trakcie pracy z własnej inicjatywy odkładać ulotne ustalenia do pamięci.

PRZEPŁYW „kończę pracę” (wpisz go do skills.md): gdy powiem „kończę pracę”,
najpierw przejrzyj pamięć projektu; to, co okazało się TRWAŁE, wskaż do
przeniesienia do instrukcji lub dokumentów, a ulotne zostaw w pamięci. Następnie
na podstawie ustaleń z sesji: dla INSTRUKCJI PROJEKTU zaproponuj konkretne zmiany
i wskaż, w którym miejscu je nanieść (samego pola instrukcji nie możesz edytować,
zrobię to ja), a skills.md i persony.md podaj w całości do wgrania.

Na koniec powiedz mi, jak sprawdzić, że Projekt jest dobrze skonfigurowany.`
      },
      {
        label: 'Pierwsza decyzja o landing page (rada doradcza)',
        text: `Zaczynam pracę nad moją landing page (dzisiejszym celem). Pomóż mi podjąć
pierwszą decyzję: do kogo mówi ta strona i jaki jest jej główny przekaz.
Zwołaj moją radę doradczą z persony.md: niech wypowiedzą się 2–4 najtrafniejsze
persony, a adwokat diabła zaatakuje moje najsłabsze założenie. Trzymaj się
zasad i tonu z instrukcji projektu. Wynik przedstaw jako artefakt w formacie
Markdown (.md): odbiorca, główny przekaz, 3 kluczowe punkty, rekomendacja rady.
Ustalenia zapisz w pamięci projektu.`
      },
      {
        label: 'M1 „kończę pracę” (domknięcie sesji)',
        text: `Kończę pracę. Na podstawie tego, co ustaliliśmy w tej sesji:
(1) dla INSTRUKCJI PROJEKTU zaproponuj konkretne zmiany i wskaż, w którym
    miejscu je nanieść (samego pola instrukcji nie możesz edytować, zrobię to ja),
(2) podaj skills.md i persony.md w całości do wgrania.`
      }
    ]
  },
  {
    id: '03',
    title: 'Poznaj NotebookLM',
    time: 'Faza 1 (poranek), wg programu',
    mode: 'pokaz (na notatniku prowadzącego) + ćwiczenie praktyczne',
    content: [
      { type: 'callout', kind: 'info', title: 'Czym jest NotebookLM', text: '**NotebookLM** to darmowe narzędzie Google (wymaga konta Google), rodzaj **inteligentnego notatnika**: wgrywasz do niego własne źródła (dokumenty, PDF-y, strony WWW), a on staje się ekspertem **wyłącznie od tych materiałów**. W metodzie z tego kursu pełni rolę **biblioteki wiedzy dziedzinowej**, z której Claude sięga po potrzebne fragmenty.' },
      { type: 'heading', text: '🎯 Ważne' },
      { type: 'p', text: 'Rozdział 02 skończył się wnioskiem, że potrzebujemy **bazy wektorowej**, a najprostszą i ogólnodostępną jest **NotebookLM**. Zanim podłączymy go do Claude, warto go zrozumieć. NotebookLM to notatnik, który odpowiada **wyłącznie na podstawie Twoich źródeł** i **cytuje** je w odpowiedziach. Dzięki temu nie ma **halucynacji** (sytuacji, w której AI zmyśla brzmiącą wiarygodnie, ale nieprawdziwą informację) i nie dryfuje, a to rozwiązuje dwa problemy z poprzedniego rozdziału: koszt i niespójność.' },
      { type: 'heading', text: '🛠️ Co robimy' },
      { type: 'p', text: 'Prowadzący pokazuje NotebookLM na gotowym **notatniku dziedzinowym o UX**. Zwróć uwagę na trzy elementy:' },
      { type: 'ol', items: [
        '**Źródła** (po lewej). Czym NotebookLM się karmi: PDF-y, dokumenty, strony WWW, wklejony tekst. Odpowiedzi powstają tylko z tego, co tu dodasz.',
        '**Czat z cytowaniami** (środek). Zadaj pytanie, a każda odpowiedź ma **przypisy do źródeł**. To sedno: możesz kliknąć przypis i sprawdzić, skąd pochodzi dana informacja.',
        '**Studio i notatki** (po prawej). Zapisujesz ważne odpowiedzi jako notatki, a Studio tworzy z materiałów dodatki (np. przegląd audio czy mapę myśli). To wspominamy, bez zagłębiania.'
      ]},
      { type: 'p', text: 'Notatnik prowadzącego z płatnymi książkami służy **tylko do pokazu z ekranu** i nie jest udostępniany. Następnie **tworzysz własny notatnik** na swoim koncie `@gmail.com` i dodajesz do niego kilka **darmowych źródeł UX** z listy.' },
      { type: 'heading', text: '📋 Do użycia' },
      { type: 'p', text: 'Lista darmowych źródeł UX do dodania w swoim notatniku: Darmowe źródła UX do własnego notatnika.' },
      { type: 'ul', items: [
        '[https://jeffgothelf.com/blog/how-to-use-the-lean-ux-canvas/](https://jeffgothelf.com/blog/how-to-use-the-lean-ux-canvas/)',
        '[https://jeffgothelf.com/wp-content/uploads/2016/12/LeanUX_canvas_v4.pdf](https://jeffgothelf.com/wp-content/uploads/2016/12/LeanUX_canvas_v4.pdf)',
        '[https://lawsofux.com/](https://lawsofux.com/)',
        '[https://www.nngroup.com/articles/ten-usability-heuristics/](https://www.nngroup.com/articles/ten-usability-heuristics/)',
        '[https://www.nngroup.com/articles/usability-101-introduction-to-usability/](https://www.nngroup.com/articles/usability-101-introduction-to-usability/)',
        '[https://www.gov.uk/guidance/content-design](https://www.gov.uk/guidance/content-design)',
        '[https://www.gov.uk/service-manual/design/writing-for-user-interfaces](https://www.gov.uk/service-manual/design/writing-for-user-interfaces)',
        '[https://webaim.org/intro/](https://webaim.org/intro/)'
      ]},
      { type: 'heading', text: '💡 Zapamiętaj' },
      { type: 'quote', text: '**NotebookLM odpowiada tylko z Twoich źródeł i cytuje je** — dzięki temu, spośród dostępnych darmowych narzędzi AI, ma najmniejszą tendencję do halucynacji. To też odróżnia go od zwykłego czatu: większa spójność, niższy koszt.' },
      { type: 'heading', text: '⏭️ Co dalej' },
      { type: 'p', text: 'Znasz już NotebookLM i masz własny notatnik. Teraz wracamy do Claude: w rozdziale 04 dostroimy ustawienia konta i przygotujemy grunt pod Claude Code. Następnie przenosimy pracę **na dysk** (Obsidian i Claude Code), a **połączenie NotebookLM z Claude przez MCP** dołożymy później, w rozdziale 10, gdy będzie już czym je zasilić.' }
    ],
    checkpoints: [
      'Rozpoznajesz trzy części interfejsu: źródła, czat, Studio i notatki.',
      'Potrafisz wskazać w odpowiedzi czatu cytowania do źródeł.',
      'Masz własny notatnik na swoim koncie z co najmniej kilkoma źródłami z listy.'
    ],
    prompts: []
  },
  {
    id: '04',
    title: 'Ustawienia Claude',
    time: '9:25–9:45',
    mode: 'ćwiczenie praktyczne',
    content: [
      { type: 'heading', text: '🎯 Ważne' },
      { type: 'p', text: 'W tym bloku przechodzisz przez **ustawienia konta Claude**: personalizację (żeby Claude znał Cię w każdej rozmowie), prywatność, kluczowe zdolności, limity, skille oraz parametry Claude Code. Ustawiasz raz, a korzystasz przez cały dzień. Samo **podłączenie MCP** robimy dopiero w rozdziale 10.' },
      { type: 'heading', text: '🧩 Dwie warstwy personalizacji' },
      { type: 'p', text: 'Claude czyta ustawienia od najogólniejszych do najbardziej szczegółowych:' },
      { type: 'ol', items: [
        '**Instrukcje na koncie** („Instructions for Claude") to kontekst o Tobie stosowany we **wszystkich** rozmowach i projektach.',
        '**Instrukcje projektu** (rozdział 02) dotyczą jednego, konkretnego projektu.'
      ]},
      { type: 'p', text: 'Warstwę 2 ustawiliśmy w rozdziale 02, teraz uzupełniamy warstwę 1. Osobno działa biblioteka **Skills** (opis niżej), która nie jest ustawieniem tonu, tylko zestawem dodatkowych umiejętności.' },
      { type: 'heading', text: '🛠️ Co robimy' },
      { type: 'p', text: 'Otwórz **Ustawienia** (ikona profilu). Przechodzimy przez cztery grupy zakładek.' },
      { type: 'heading', text: 'A. Profil i personalizacja (General, czyli Ogólne)' },
      { type: 'ol', items: [
        '**What should Claude call you?** (Jak Claude ma się do Ciebie zwracać?) oraz **What best describes your work?** (Co najlepiej opisuje Twoją pracę?). Pierwsze to imię, którym Claude Cię nazywa; drugie to Twoja rola lub zawód, dzięki czemu Claude trafniej dobiera odpowiedzi (np. „Design").',
        '**Instructions for Claude** (Instrukcje dla Claude) to konto-globalny, trwały kontekst o Tobie, uwzględniany w **każdej** rozmowie. To wpisujemy wspólnie (u prowadzącego jest już gotowy jako `CLAUDE.md`).'
      ]},
      { type: 'heading', text: 'B. Prywatność (Privacy, czyli Prywatność)' },
      { type: 'ol', items: [
        '**Help improve our AI models** (Pomóż ulepszać nasze modele AI) **→ wyłącz.** To zgoda na wykorzystanie Twoich rozmów i sesji kodowania do trenowania modeli Anthropic. Wyłączasz, bo pracujesz na własnej wiedzy.',
        '**Location metadata** (Metadane lokalizacji) **→ wyłącz.** To zgoda, by Claude używał przybliżonej lokalizacji (miasto lub region) do dopasowania działania.',
        'Zajrzyj do **Memory preferences** (Preferencje pamięci). Tu zarządzasz tym, co Claude pamięta, w tym pamięcią projektu z rozdziału 02.'
      ]},
      { type: 'heading', text: 'C. Zdolności (Capabilities, czyli Możliwości)' },
      { type: 'ol', items: [
        '**Artifacts** (Artefakty) **→ włącz.** To osobne okno obok czatu, w którym Claude tworzy kod, dokumenty i projekty. Bez tego nie powstanie ani artefakt `.md` z rozdziału 03, ani strona po południu. **Sprawdź koniecznie.**',
        '**Generate memory from chat history** (Generuj pamięć z historii rozmów) **→ włącz.** Pozwala Claude\'owi zapamiętywać istotny kontekst z rozmów. Ten sam przełącznik steruje pamięcią rozmów i projektów.',
        '**Cloud code execution and file creation** (Wykonywanie kodu w chmurze i tworzenie plików) **→ włącz.** Claude może uruchamiać kod na serwerze oraz tworzyć i edytować dokumenty, arkusze, prezentacje, PDF-y i raporty. Jest też wymagane przez skille.'
      ]},
      { type: 'heading', text: 'D. Limity (Usage, czyli Zużycie)' },
      { type: 'ol', items: [
        '**Usage credits** (Kredyty użycia) — **opcjonalnie.** To dopłata za nadwyżkę: jeśli w planie Pro wyczerpiesz okno 5 godzin, po włączeniu kredytów pracujesz dalej, zamiast czekać na odnowienie limitu. Nie każemy tego włączać, każdy decyduje sam, zależnie od planu i budżetu.',
        'Zobacz **Current session** (Bieżąca sesja). Pokazuje bieżące zużycie limitu i czas do jego odnowienia.'
      ]},
      { type: 'heading', text: 'E. Skille — dodaj wszystkie od Anthropic (Customize → Skills, czyli Umiejętności)' },
      { type: 'p', text: 'Skille to gotowe **umiejętności**, które Claude włącza, gdy są potrzebne. Przez **Browse** (Przeglądaj) i **Add** (Dodaj) **dodaj wszystkie skille autorstwa Anthropic**. Pozostają uśpione, dopóki się nie przydadzą, więc „w spoczynku" nic nie kosztują, a masz gotowy zestaw na produkcję po południu.' },
      { type: 'ul', items: [
        '**web-artifacts-builder** — buduje rozbudowane artefakty HTML (wielokomponentowe strony). Kluczowe przy budowie landing page.',
        '**theme-factory** (fabryka motywów) — nadaje artefaktom spójny styl/motyw (slajdy, dokumenty, strony HTML).',
        '**brand-guidelines** (wytyczne marki) — stosuje kolory i typografię wg wytycznych marki (uwaga: domyślnie marki Anthropic).',
        '**canvas-design** (projektowanie graficzne) — tworzy grafikę wizualną w plikach `.png` i `.pdf`.',
        '**doc-coauthoring** (współtworzenie dokumentów) — prowadzi przez uporządkowany proces pisania dokumentacji.',
        '**algorithmic-art** (sztuka algorytmiczna) — tworzy sztukę generatywną w bibliotece p5.js.',
        '**internal-comms** (komunikacja wewnętrzna) — pomaga pisać komunikację wewnętrzną w firmowych formatach.',
        '**slack-gif-creator** (twórca GIF-ów do Slacka) — tworzy animowane GIF-y zoptymalizowane pod Slacka.',
        '**skill-creator** (kreator skilli) — tworzy, modyfikuje i ulepsza własne skille.',
        '**mcp-builder** (kreator MCP) — prowadzi przez budowę wysokiej jakości serwerów MCP.'
      ]},
      { type: 'p', text: 'Dodajemy **wszystkie** skille Anthropic z katalogu (także te spoza listy, np. `learn`). Pełne opisy każdego widać w **Browse**.' },
      { type: 'heading', text: 'F. Parametryzacja Claude Code (zakładka Claude Code)' },
      { type: 'p', text: 'Claude Code (narzędzie, którym po południu zbudujesz stronę) konfigurujemy już teraz. Ustawienia zadziałają, gdy zaczniemy go używać w rozdziale 06.' },
      { type: 'ul', items: [
        '**Allow bypass permissions mode** (Zezwól na tryb pomijania uprawnień) **→ wyłącz.** Ten tryb pozwala Claude\'owi uruchamiać dowolne komendy bez pytania o zgodę, co jest ryzykowne (utrata danych, prompt injection). Kontrolę uprawnień zostawiamy włączoną.',
        '**Preview tools** (Narzędzia podglądu) **→ włącz.** Pozwala Claude\'owi uruchomić serwer deweloperski i pokazać stronę na żywo (zrzuty ekranu, inspekcja DOM). Potrzebne do budowy i weryfikacji landing page.',
        '**Dynamic workflows** (Dynamiczne przepływy pracy) — pozwala uruchamiać wielu agentów równolegle, ale **szybko zużywa limit**. Na planie Pro rozważ wyłączenie na czas kursu.',
        '**Classify session states** (Klasyfikuj stany sesji) — automatycznie oznacza sesje (zablokowana, gotowa, zakończona) i **liczy się do zużycia**. Możesz zostawić domyślnie albo wyłączyć dla oszczędności.',
        'Resztę (**Worktree location** czyli lokalizacja drzewa roboczego, **Pull requests**, wygląd) zostaw domyślnie.'
      ]},
      { type: 'callout', kind: 'note', title: 'Co ustawimy później (nie teraz)', text: '**MCP** (Developer czyli Deweloper → Local MCP servers czyli Lokalne serwery MCP) podłączamy w rozdziale 10. **Connectors** (Konektory) i **Plugins** (Wtyczki), czyli kolejne biblioteki rozszerzeń, włączamy w Fazie 4, gdy będą potrzebne.' },
      { type: 'heading', text: '📋 Do użycia' },
      { type: 'p', text: 'Warstwa projektu, do której się odwołujemy: Rozdział 02 · Projekt jako mentor.' },
      { type: 'heading', text: '💡 Zapamiętaj' },
      { type: 'quote', text: '**Ustawiasz raz, dziedziczysz wszędzie.** Instrukcje na koncie działają w każdej rozmowie, a instrukcje projektu zawężają je do jednego projektu. Ta sama filozofia „stałych instrukcji" wróci w Claude Code jako plik `CLAUDE.md`. Personalizacja to nie kosmetyka, tylko fundament pracy z asystentem, który Cię zna.' }
    ],
    checkpoints: [
      'Masz uzupełnione Instructions for Claude.',
      'Artifacts są włączone.',
      'Help improve our AI models jest wyłączone.',
      'Dodane są wszystkie skille Anthropic.',
      'Claude Code: Allow bypass permissions mode wyłączone, Preview tools włączone.',
      'Wiesz, gdzie sprawdzić zużycie (Current session) i gdzie jest pamięć.'
    ],
    prompts: []
  },
  {
    id: '05',
    title: 'Instalacja Obsidian i pierwszy pusty sejf',
    time: '10:00–10:15',
    mode: 'ćwiczenie praktyczne',
    content: [
      { type: 'callout', kind: 'info', title: 'Zanim zainstalujesz: skąd wziął się ten pomysł', text: 'Od tego rozdziału zaczynasz budować własny Second Brain, więc najpierw kilka słów o tym, czym on właściwie jest, skąd pochodzi ten pomysł i dlaczego projektujemy sejf według modelu Andreja Karpathy\'ego. Ten fragment przeczytasz raz. To tło, które nada sens wszystkim kolejnym krokom.' },
      { type: 'heading', text: '🧠 Czym jest Second Brain' },
      { type: 'p', text: '**Second Brain** (dosłownie: „drugi mózg") to **zewnętrzny, zaufany magazyn wiedzy**, do którego odkładasz to, czego nie chcesz (i nie da się) trzymać w głowie: notatki, źródła, wnioski, decyzje. Dzięki temu głowa zajmuje się myśleniem, a pamiętanie bierze na siebie system. Od teraz w tym warsztacie używam już tylko nazwy Second Brain.' },
      { type: 'p', text: 'Pomysł nie jest nowy. Uczeni od wieków prowadzili osobiste notatniki z wypisami i przemyśleniami, a niemiecki socjolog Niklas Luhmann zbudował słynny system fiszek Zettelkasten, z którego powstały setki jego publikacji. Współczesny termin spopularyzował Tiago Forte metodą Building a Second Brain. Wspólny mianownik jest zawsze ten sam: wiedza połączona siecią odnośników jest warta więcej niż luźne, oderwane notatki.' },
      { type: 'p', text: '**Co zmieniło się teraz?** Dawniej taki system trzeba było mozolnie utrzymywać ręcznie i większość ludzi po jakimś czasie go porzucała, ponieważ koszt pielęgnacji przewyższał korzyść. Dziś tę żmudną pracę, czyli porządkowanie, streszczanie, łączenie i wyłapywanie sprzeczności, wykonuje **AI** niemal bez wysiłku z Twojej strony. To właśnie czyni Second Brain dostępnym dla każdego, nie tylko dla nielicznych zapaleńców.' },
      { type: 'heading', text: '👤 Kim jest Andrej Karpathy i dlaczego jego model' },
      { type: 'p', text: '**Andrej Karpathy** to jeden z najbardziej znanych na świecie specjalistów i nauczycieli sztucznej inteligencji: współtwórca OpenAI, wcześniej szef zespołu AI odpowiedzialnego za autopilota w Tesli, autor popularnych kursów, na których uczą się inżynierowie AI. Gdy taka osoba proponuje prosty wzorzec pracy z wiedzą, warto potraktować go poważnie.' },
      { type: 'p', text: 'Karpathy opisał wzorzec, który nazwał **„LLM Wiki"** (wiki utrzymywana przez model językowy). W skrócie: zamiast wypytywać AI za każdym razem od zera, pozwalasz jej **stopniowo budować i utrzymywać trwałą, gęsto połączoną wzajemnymi linkami wiki** z Twoich materiałów. Jego porównanie jest celne: **Obsidian to edytor, model AI to programista, a Twoja wiki to kod**, który ten programista pisze i poprawia. Właśnie ten wzorzec realizujemy dziś w Twoim sejfie: „surowiec - pliki" wrzucasz do jednego miejsca, a AI syntetyzuje z nich połączone strony wiedzy.' },
      { type: 'quote', text: 'Źródło wzorca (do zajrzenia): [Andrej Karpathy, „LLM Wiki" (gist)](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).' },
      { type: 'heading', text: '💰 Dlaczego to oszczędza tokeny (i daje spójniejsze odpowiedzi)' },
      { type: 'p', text: 'Pamiętasz problem z rozdziału 02? W zwykłym Projekcie Claude model **przy każdej odpowiedzi wczytuje całą wiedzę projektu** do kontekstu. Im więcej dokumentów, tym drożej (bo więcej tokenów jest zużywanych przez LLM), wolniej i mniej spójnie, ponieważ za każdym razem LLM od nowa interpretuje te same materiały.' },
      { type: 'p', text: 'Model Karpathy\'ego rozwiązuje to inaczej: **pracę syntezy wykonujesz raz, a nie przy każdym pytaniu.** Gdy dodajesz materiał, AI czyta go jeden raz i **zapisuje wnioski jako trwałe, zwięzłe strony wiki** połączone odnośnikami. Później, odpowiadając na pytanie, model sięga tylko po **kilka naprawdę potrzebnych stron** i podąża ich linkami, zamiast wczytywać wszystko albo od nowa przetwarzać wszystkie pliki. Stąd bierze się oszczędność:' },
      { type: 'ul', items: [
        '**Mniej tokenów na zapytanie**, ponieważ czytasz garść zdestylowanych stron, a nie całe archiwum.',
        '**Spójność**, ponieważ fakty są raz uzgodnione i zapisane, a sprzeczności wyłapane, więc kolejne odpowiedzi się nie rozjeżdżają.',
        '**Kumulacja**, ponieważ wiedza narasta i łączy się w graf, zamiast rozpływać się w historii czatów.'
      ]},
      { type: 'callout', kind: 'info', title: 'A gdzie w tym NotebookLM (i czy jest niezbędny)?', text: '**Nie jest niezbędny.** Całą wiedzę możesz zapisywać bezpośrednio w wiki i to jest **najszybsze oraz najprostsze rozwiązanie**: jeden sejf, jeden graf, zero dodatkowych narzędzi. Jeśli zależy Ci tylko na jednym Second Brain, możesz spokojnie pominąć MCP. Po co więc pokazuję NotebookLM przez MCP? Z dwóch praktycznych powodów: **uczysz się budować i podłączać MCP** — to przenośna umiejętność, którą wykorzystasz do dziesiątek innych narzędzi, nie tylko do NotebookLM; oraz **gromadzisz wiedzę „ogólną" (dziedzinową), którą współdzielisz między projektami** — zamiast kopiować te same materiały do każdego sejfu, trzymasz je raz w NotebookLM i podłączasz tam, gdzie akurat są potrzebne. Krótko: wiki to Twój zsyntetyzowany mózg dla konkretnego projektu, a NotebookLM to wspólna biblioteka źródeł na żądanie, wielokrotnego użytku. Metoda w pigułce: rozdz. 01.' },
      { type: 'heading', text: '🎯 Ważne' },
      { type: 'p', text: 'Do tej pory Twoja wiedza żyła **w chmurze**: w Projekcie Claude i w NotebookLM. Teraz dostaje **realne miejsce na Twoim dysku**. **Obsidian** to darmowy program, w którym Twój Second Brain będzie mieszkał: przegląda i łączy notatki, pokazuje graf wiedzy i pozwala nad wszystkim panować lokalnie.' },
      { type: 'p', text: 'Najważniejsze w jednym zdaniu: **sejf Obsidiana to zwykły folder ze zwykłymi plikami Markdown (`.md`) na Twoim komputerze.** Nie ma tu bazy danych ani zamkniętego formatu. To sedno myśli „wiedza jest Twoja", bo pliki zostają Twoje, nawet gdybyś jutro przestał używać Obsidiana.' },
      { type: 'heading', text: '🧩 Czym jest Obsidian' },
      { type: 'p', text: '**Obsidian** to darmowa (do użytku osobistego) aplikacja do notatek, działająca **lokalnie** na Twoim komputerze, bez konta i bez wymuszonej chmury. Zyskała popularność jako narzędzie do **zarządzania wiedzą osobistą**: pozwala łączyć notatki odnośnikami `[[…]]`, pokazuje **graf** tych połączeń oraz można ją rozszerzać wtyczkami i motywami. Dla nas najważniejsze jest to, że pracuje na otwartych plikach Markdown, więc idealnie pasuje do wzorca Karpathy\'ego: to **miejsce, w którym zamieszka Twój Second Brain**, a Claude Code będzie w nim budował i utrzymywał wiki.' },
      { type: 'callout', kind: 'info', title: 'Windows i macOS', text: 'Instalacja różni się między systemami, więc każdy krok podaję osobno dla **Windows** i dla **macOS**. Jeśli brakuje wariantu dla Twojego systemu, zgłoś to prowadzącemu.' },
      { type: 'heading', text: '🧩 Co to jest „sejf" (vault)' },
      { type: 'p', text: 'Sejf to po prostu **folder wybrany przez Ciebie**, w którym Obsidian trzyma notatki. Wewnątrz pojawi się ukryty podfolder `.obsidian` z ustawieniami i wtyczkami. Cała reszta to Twoje pliki `.md`, które możesz otworzyć w dowolnym edytorze tekstu. Dziś zakładamy **pusty** sejf — treść i strukturę zbudujemy w kolejnych rozdziałach.' },
      { type: 'heading', text: '🛠️ Co robimy' },
      { type: 'p', text: '**1. Pobierz Obsidian** ze strony pobierania: [obsidian.md/download](https://obsidian.md/download). Instalator możesz mieć już z checklisty; jeśli nie, pobierz go teraz.' },
      { type: 'ul', items: [
        '**Windows:** pobierz plik instalatora `.exe`.',
        '**macOS:** pobierz plik `.dmg`. Na stronie wybierz wersję dla swojego procesora (**Apple Silicon** dla M1/M2/M3/M4 albo **Intel** dla starszych Maków).'
      ]},
      { type: 'p', text: '**2. Zainstaluj i uruchom.**' },
      { type: 'ul', items: [
        '**Windows:** uruchom pobrany `.exe`. Obsidian instaluje się dla bieżącego użytkownika, więc zwykle nie potrzeba uprawnień administratora.',
        '**macOS:** otwórz `.dmg` i przeciągnij ikonę **Obsidian** do folderu **Aplikacje** (Applications). Przy pierwszym uruchomieniu, jeśli system pokaże ostrzeżenie, kliknij ikonę prawym przyciskiem i wybierz **Otwórz** (Open), aby potwierdzić.'
      ]},
      { type: 'p', text: '**3. Utwórz nowy, pusty sejf.** Na powitalnym ekranie wybierz **Utwórz nowy sejf** (Create new vault) i podaj:' },
      { type: 'ul', items: [
        '**Nazwę** sejfu, na przykład `MojDrugiMozg` (bez polskich znaków i spacji jest najbezpieczniej).',
        '**Lokalizację** (folder nadrzędny). Wybierz miejsce, które kontrolujesz i łatwo odnajdziesz: na **Windows** np. `C:\\Users\\<Ty>\\Obsidian` (osobny folder, poza OneDrive); na **macOS** np. `~/Obsidian` (osobny folder w katalogu domowym, poza iCloud Drive).'
      ]},
      { type: 'p', text: 'Zatwierdź. Obsidian otworzy **pusty sejf** i to wystarczy na teraz.' },
      { type: 'callout', kind: 'tip', title: 'Unikaj folderów synchronizowanych automatycznie', text: 'Na start **nie** zakładaj sejfu w folderze, który sam się synchronizuje z chmurą (OneDrive, iCloud Drive, Dropbox). Taka synchronizacja potrafi wchodzić w konflikt z pracą Claude Code na plikach. Najbezpieczniejszy jest zwykły, **lokalny** folder, który **nie** jest synchronizowany. Pamiętaj, że folder **Dokumenty** bywa domyślnie objęty synchronizacją (OneDrive na Windows, iCloud Drive na macOS), więc w razie wątpliwości wskaż osobny folder poza chmurą.' },
      { type: 'p', text: '**4. Rozejrzyj się po interfejsie.** Zapamiętaj tylko cztery miejsca, resztę poznasz w praktyce:' },
      { type: 'ul', items: [
        '**Panel plików** po lewej: lista notatek i folderów sejfu (teraz pusta).',
        '**Edytor** pośrodku: tu piszesz; Obsidian pokazuje Markdown od razu w czytelnej formie.',
        '**Ustawienia** (ikona koła zębatego, lewy dolny róg): tu włączymy później motyw, wtyczki i skróty.',
        '**Widok grafu** (ikona z kropkami połączonymi liniami): dziś pusty, ale to on pokaże połączenia Twojej wiedzy, gdy zaczniemy ją budować.'
      ]},
      { type: 'heading', text: '📋 Do użycia' },
      { type: 'p', text: 'Wymagania i pobranie instalatora zawczasu: Checklista uczestnika.' },
      { type: 'heading', text: '💡 Zapamiętaj' },
      { type: 'quote', text: '**Twój sejf to zwykłe pliki na Twoim dysku.** Markdown jest formatem otwartym i czytelnym dla człowieka, więc masz pełną własność i przenośność swojej wiedzy: żaden dostawca Cię nie zamyka. To także **bezpieczeństwo i prywatność danych**: dopóki pliki nie są nigdzie wysyłane ani przegrywane na cudze serwery, zostają wyłącznie u Ciebie, co czyni je najbezpieczniejszym magazynem Twojej wiedzy. Jest jeden warunek: **regularnie rób kopie zapasowe**, bo lokalny dysk może ulec awarii, a bez kopii tracisz wszystko. Na szczęście kopia to tutaj po prostu skopiowanie folderu w bezpieczne miejsce. To fundament całego dnia, bo dopiero na tak kontrolowanym miejscu ma sens budowanie Second Brain.' },
      { type: 'heading', text: '⏭️ Co dalej' },
      { type: 'p', text: 'Masz już **puste ciało** Second Brain, ale bez „rąk", które będą w nim pracować. W następnym rozdziale wchodzi **Claude Code**, czyli asystent działający bezpośrednio na plikach tego sejfu. To on, a nie Ty ręcznie, zbuduje i będzie utrzymywał strukturę wiedzy.' }
    ],
    checkpoints: [
      'Obsidian jest zainstalowany i uruchamia się na Twoim systemie.',
      'Masz utworzony pusty sejf o znanej nazwie.',
      'Wiesz, gdzie na dysku leży folder sejfu.',
      'Umiesz otworzyć Ustawienia i wiesz, gdzie jest widok grafu.'
    ],
    prompts: []
  },
  {
    id: '06',
    title: 'Wprowadzenie do Claude Code',
    time: '10:15–10:35',
    mode: 'powtarzaj za mną (robimy razem)',
    content: [
      { type: 'callout', kind: 'info', title: 'Czym jest Claude Code', text: 'W sieci Claude Code bywa przedstawiany jako **narzędzie do programowania** i faktycznie świetnie radzi sobie z kodem. To jest jednak sztuczne zawężenie jego możliwości. W rzeczywistości jest to **potężny asystent**, który przydaje się nie tylko jako maszyna do tworzenia kodu, lecz także jako pomocnik w codziennej pracy nad zadaniami, w których dotąd trzeba było samodzielnie przetwarzać ogromne ilości danych: **liczb, tekstu, obrazu (grafika i film) oraz dźwięku**. W tym kursie używamy go właśnie w tej szerszej roli: do porządkowania i budowania Twojej wiedzy, a nie do pisania programów. **Vibe coding** (luźno: „programowanie na wyczucie") to określenie ukute przez Andreja Karpathy\'ego, tego samego, od którego pochodzi wzorzec „LLM Wiki". Oznacza budowanie oprogramowania przez **opisywanie AI zwykłym językiem, czego chcesz**, i przyjmowanie tego, co wygeneruje, zamiast ręcznego pisania kodu. Zajmiemy się nim tylko **marginalnie, na koniec kursu**, gdy z Twojej wiedzy zbudujemy landing page. **Ważna uwaga:** Twój Second Brain to **magazyn wiedzy, a nie repozytorium kodu**. Dlatego samą stronę (czyli programowanie) zbudujemy w **osobnym folderze**, trzymanym z dala od sejfu, żeby nie mieszać kodu z Twoją wiedzą. Wrócę do tego szerzej na koniec kursu.' },
      { type: 'heading', text: '🎯 Ważne' },
      { type: 'p', text: 'Masz już pusty sejf (rozdział 05). Teraz poznajesz narzędzie, które będzie w nim pracować: **Claude Code**. Do tej pory Claude odpowiadał Ci w oknie czatu. Claude Code to **ten sam Claude, ale działający bezpośrednio na plikach** Twojego sejfu. To są „ręce", które zbudują i będą utrzymywać Twój Second Brain wg wzorca Karpathy\'ego. Bez nich pozostałaby Ci ręczna, mozolna praca; z nimi wystarczy, że powiesz, co ma powstać.' },
      { type: 'heading', text: '🧩 Czat kontra Claude Code (co się zmienia)' },
      { type: 'ul', items: [
        '**Claude Chat / Projekt** to rozmowa w oknie, w chmurze, **bez dostępu do Twoich plików**. Wynik przepisujesz ręcznie.',
        '**Claude Code** to agent uruchomiony na Twoim komputerze, **z dostępem do folderu sejfu**. Czyta i tworzy pliki `.md`, łączy je odnośnikami, uruchamia narzędzia i skille. Ty piszesz polecenia zwykłym językiem, a on wykonuje pracę na plikach.'
      ]},
      { type: 'p', text: 'Krótko: **Chat doradza, Code wykonuje.**' },
      { type: 'heading', text: '🛠️ Co robimy (robimy razem)' },
      { type: 'p', text: 'Ten blok przechodzimy wspólnie: pokazuję każdy krok u siebie, a Ty od razu powtarzasz go na swoim sejfie. Claude Code zostaje z Tobą do końca dnia, więc od początku pracujesz na **własnym** Second Brain, a nie tylko patrzysz. Przejdź ze mną przez cztery rzeczy:' },
      { type: 'ol', items: [
        '**Wskazanie sejfu.** Claude Code uruchamiasz **w aplikacji Claude Desktop** (tej z checklisty, nie w terminalu) i otwierasz go na **folderze swojego sejfu** (tym z rozdziału 05). Od tej chwili to jest jego obszar pracy: widzi i zmienia tylko pliki w tym folderze, nic poza nim.',
        '**Rozmowa poleceniami.** Piszesz zwykłym językiem, czego potrzebujesz („utwórz stronę o…", „połącz te notatki"). Claude Code sam decyduje, które pliki przeczytać i które zmienić.',
        '**Zgoda przed działaniem (i tryb auto na warsztacie).** Domyślnie, zanim Claude Code cokolwiek zmieni lub uruchomi, **pyta Cię o zgodę**: widzisz, co zamierza zrobić, i akceptujesz albo odrzucasz. To Twój bezpiecznik. **Na potrzeby kursu włączymy tryb auto-zatwierdzania zmian**, żeby nie zatrzymywać się przy każdym kroku i utrzymać tempo. To wygoda warsztatowa, bo pracujemy wspólnie, na świeżym sejfie i znanych poleceniach. Uwaga: auto-zatwierdzanie to **co innego** niż ryzykowny „tryb pomijania uprawnień" z rozdziału 04, który zostaje **wyłączony**. We własnej, poważnej pracy zostaw potwierdzenia włączone, dopóki nie ufasz danej operacji.',
        '**Skille.** Standardowe skille Claude (włączone w rozdziale 04) to gotowe umiejętności, po które Claude sięga, gdy są potrzebne. W następnym rozdziale dołożysz do nich **skille Obsidiana**. I to nie koniec: świat skilli na **GitHubie** jest tak bogaty, że nic nie stoi na przeszkodzie, aby dociągnąć kolejne, przydatne w Twojej pracy (instalujesz je podobnie jak skille Obsidiana w rozdziale 07).'
      ]},
      { type: 'callout', kind: 'note', title: 'Dokładny wygląd zależy od wersji', text: 'Interfejs Claude Code bywa aktualizowany, więc konkretne przyciski i ekrany pokazuję na żywo. Zasada pozostaje stała: wskazujesz folder, piszesz polecenia, zatwierdzasz działania.' },
      { type: 'heading', text: '💰 Dlaczego lokalnie (znów o tokenach)' },
      { type: 'p', text: 'Pamiętasz z rozdziału 05, że w Projekcie Claude model wczytywał **całą** wiedzę przy każdej odpowiedzi? Claude Code pracuje inaczej: **czyta tylko te pliki, których naprawdę potrzebuje** do zadania, i zmienia je na miejscu. Nie przepisuje całego archiwum do okna czatu. Dlatego praca nawet na dużym sejfie jest tańsza i szybsza, a Twoja wiedza zostaje w plikach, a nie w ulotnej historii rozmowy. To praktyczne dopełnienie modelu Karpathy\'ego.' },
      { type: 'heading', text: '🧠 `CLAUDE.md`, czyli pamięć Claude Code (zapowiedź)' },
      { type: 'p', text: 'Jedno pojęcie na później: Claude Code czyta na starcie plik **`CLAUDE.md`** z korzenia sejfu. To jego stała instrukcja, odpowiednik instrukcji projektu z rozdziału 02. Jeszcze nie mamy takiego pliku w sejfie. W rozdziale 07 nadasz temu plikowi treść wg wzorca Karpathy\'ego i to on powie Claude Code, **jak** ma utrzymywać Twój Second Brain.' },
      { type: 'heading', text: '📋 Do użycia' },
      { type: 'p', text: 'Ustawienia ustawione wcześniej: rozdział 04 · Ustawienia Claude (tryb pomijania uprawnień wyłączony, Preview tools włączone).' },
      { type: 'heading', text: '💡 Zapamiętaj' },
      { type: 'quote', text: '**Chat rozmawia, Code działa.** Claude Code to ten sam model, ale z rękami: czyta i pisze pliki Twojego sejfu, pod Twoją kontrolą, bo domyślnie pyta o zgodę (na warsztacie dla tempa przełączamy go w tryb auto-zatwierdzania). To narzędzie, którym przez resztę dnia zbudujesz i utrzymasz Second Brain, a po południu także landing page.' },
      { type: 'heading', text: '⏭️ Co dalej' },
      { type: 'p', text: 'Masz już ciało (sejf) i ręce (Claude Code), ale brakuje **schematu**, według którego te ręce mają pracować. W następnym rozdziale dasz Claude Code plik `CLAUDE.md` wg wzorca Karpathy\'ego oraz skille Obsidiana, czyli komplet zasad i umiejętności do utrzymywania sejfu.' }
    ],
    checkpoints: [
      'Claude Code jest otwarty na folderze Twojego sejfu.',
      'Rozumiesz różnicę: Claude Chat rozmawia, Claude Code działa na plikach sejfu.',
      'Wiesz, że Claude Code pracuje w folderze wskazanego sejfu i tylko tam.',
      'Rozumiesz różnicę między auto-zatwierdzaniem (na warsztat) a „trybem pomijania uprawnień” (wyłączony).',
      'Wiesz, czym jest `CLAUDE.md` i że jego treść nadasz w bloku 07.'
    ],
    prompts: []
  },
  {
    id: '07',
    title: 'Konfiguracja sejfu wg Karpathy\'ego',
    time: '10:35–11:05',
    mode: 'powtarzaj za mną (robimy razem)',
    content: [
      { type: 'heading', text: '🎯 Ważne' },
      { type: 'p', text: 'Masz już ciało (sejf), ręce (Claude Code) i wiesz, po co to wszystko (wzorzec Karpathy\'ego z rozdziału 05). Teraz dajesz Claude Code dwie rzeczy, których mu jeszcze brakuje: **schemat**, czyli plik `CLAUDE.md` mówiący, **jak** ma utrzymywać Twój sejf, oraz **skille Obsidiana**, czyli umiejętności pracy z jego plikami. Po tym rozdziale Twój Second Brain jest gotowy, aby przyjąć pierwszą wiedzę.' },
      { type: 'heading', text: '🧩 Dwie rzeczy, które konfigurujemy' },
      { type: 'ol', items: [
        '**`CLAUDE.md`** to konstytucja Twojego sejfu: stała instrukcja, którą Claude Code czyta na starcie (poznana w rozdziale 06). Opisuje warstwy (`Źródła/`, `Wiki/`), operacje (ingest, zapytanie, przegląd) oraz zasady pracy.',
        '**Skille Obsidiana** to gotowe umiejętności pracy z otwartymi formatami: Markdown, Bases, Canvas oraz obsługa sejfu. Dają Claude Code „ręce" dostrojone specjalnie do Obsidiana.'
      ]},
      { type: 'callout', kind: 'info', title: 'Dlaczego własny szkielet, a nie gotowe repo', text: 'Karpathy udostępnił „LLM Wiki" jako **ideę do współtworzenia z agentem**, a nie jako paczkę do zainstalowania. Dlatego bierzemy **gotowy szkielet** `CLAUDE.md` i **przyjmujesz go na własność**: uzupełniasz o swoją dziedzinę i dostrajasz razem z Claude Code. To spójne z tezą kursu: schemat Twojego Second Brain jest Twój, a nie cudzy.' },
      { type: 'heading', text: '🛠️ Co robimy' },
      { type: 'p', text: 'Ten blok robimy wspólnie: pokazuję u siebie, a Ty powtarzasz na swoim sejfie.' },
      { type: 'p', text: '**1. Utwórz plik `CLAUDE.md` i wklej do niego szkielet.** Świeży sejf Obsidiana **nie ma** pliku `CLAUDE.md`, więc najpierw trzeba go **utworzyć** w korzeniu sejfu. Najprościej w Obsidianie: utwórz nową notatkę i nazwij ją dokładnie `CLAUDE` (wielkimi literami; Obsidian zapisze ją jako `CLAUDE.md`). Następnie otwórz gotowiec [„Szkielet CLAUDE.md"](#blok-07-prompt-1), skopiuj całą zawartość ramki do tego pliku i uzupełnij pola w nawiasach `<…>` (nazwa sejfu, Twoja dziedzina, język). Dopiero ten plik sprawia, że Claude Code wie, jak utrzymywać Twój sejf i zasilać go wiedzą.' },
      { type: 'p', text: '**2. Poproś Claude Code o dostosowanie schematu.** W Claude Code (otwartym na sejfie z rozdziału 06) wklej prompt [„Dostosuj schemat CLAUDE.md do mojej dziedziny"](#blok-07-prompt-2), podstawiając swoją dziedzinę w miejsce `<TWOJA-DZIEDZINA>`.' },
      { type: 'p', text: 'Claude przeczyta `CLAUDE.md` i **zaproponuje** podfoldery encji i koncepcji oraz przykładowe strony pod Twoją dziedzinę. Omawiacie propozycję, a Ty ją zatwierdzasz. **Dopiero po akceptacji** poproś Claude Code, żeby utworzył strukturę (`Źródła/`, `Wiki/…`, `Indeks.md`, `Dziennik.md`). To właśnie moment „współtworzenia" wg Karpathy\'ego.' },
      { type: 'p', text: '[**3. Zainstaluj skille Obsidiana (kepano).**](#blok-07-prompt-3) Dokładasz Claude Code umiejętności pracy z Obsidianem z repozytorium [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills). Najprościej **poprosić o to Claude Code**, wklejając gotowy prompt.' },
      { type: 'p', text: 'Claude Code wykona instalację (poprosi o zgodę na komendę) i pokaże listę skilli. Alternatywnie, jeśli masz zainstalowane Node i npm, możesz uruchomić instalację samodzielnie: `npx skills add https://github.com/kepano/obsidian-skills`.' },
      { type: 'callout', kind: 'note', title: 'Skąd te skille i co dają', text: 'Autorem jest **kepano** (Steph Ango, dyrektor Obsidiana), więc to skille „u źródła". Dają Claude Code pięć umiejętności: **Markdown** — pisze i redaguje notatki w formacie Obsidiana (wikilinki, osadzenia, callouty, właściwości), czyli tworzy poprawne, spójne strony wiki; **Bases** — buduje w sejfie widoki tabelaryczne i kartowe z filtrami i formułami, czyli zestawienia notatek działające jak prosta baza danych; **Canvas** — tworzy tablice wizualne (kafelki połączone liniami), przydatne do map myśli i schematów; **Obsługa sejfu (CLI)** — zarządza sejfem z poziomu poleceń, co pozwala automatyzować operacje na wielu plikach naraz; **Oczyszczanie stron WWW (defuddle)** — pobiera stronę internetową i wyciąga z niej czysty tekst bez reklam i nawigacji, gotowy do dodania jako źródło.' },
      { type: 'heading', text: '📋 Do użycia' },
      { type: 'p', text: 'Gotowiec: [Szkielet CLAUDE.md](#blok-07-prompt-1) (wg Karpathy\'ego) — szkielet do skopiowania + [prompt dostosowujący](#blok-07-prompt-2). Skille Obsidiana: [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills).' },
      { type: 'heading', text: '💡 Zapamiętaj' },
      { type: 'quote', text: '**`CLAUDE.md` to konstytucja Twojego Second Brain.** Im lepiej opiszesz w nim swoją dziedzinę i zasady, tym trafniej Claude Code porządkuje wiedzę. To jest żywy dokument: wracasz do niego i dopisujesz zasady, gdy zauważysz, że coś robisz powtarzalnie. Najważniejsze, że ten schemat jest **Twój, przyjęty na własność**, a nie skopiowany z cudzego repozytorium.' },
      { type: 'heading', text: '⏭️ Co dalej' },
      { type: 'p', text: 'Masz już komplet: ciało, ręce, schemat i umiejętności. Twój Second Brain jest pusty, ale gotowy. W następnym rozdziale wrzucasz pierwszy materiał: **migrujesz swoją pracę z Claude Chat** (pliki `.md`) i robisz **pierwszy ingest**, po którym zobaczysz, jak wiedza układa się w graf.' }
    ],
    checkpoints: [
      'W korzeniu sejfu jest plik `CLAUDE.md` z uzupełnionymi polami `<…>`.',
      'Istnieją foldery `Źródła/` oraz `Wiki/` (z podfolderami koncepcje / encje / analizy).',
      'Claude Code po przeczytaniu `CLAUDE.md` potrafi własnymi słowami powiedzieć, jak ma utrzymywać Twój sejf.',
      'Skille Obsidiana są zainstalowane i Claude Code je widzi.'
    ],
    prompts: [
      {
        label: 'Szkielet do skopiowania — CLAUDE.md',
        text: `# <NAZWA-SEJFU> — mój Second Brain (metoda Karpathy'ego)

To jest **schemat** sterujący agentem LLM (Claude Code), który utrzymuje ten sejf.
Agent czyta ten plik na początku każdej sesji.

## Po co istnieje ten sejf
Ten sejf to mój **Second Brain** w dziedzinie: **<TWOJA-DZIEDZINA>**.
Gromadzę tu wiedzę, łączę ją i syntetyzuję w spójną całość, z której korzystam na co dzień.
Wiedza jest moja — agent ją porządkuje, łączy i streszcza, ale jej nie zastępuje.

## Architektura: 3 warstwy

1. **\`Źródła/\` — surowe materiały (NIGDY nie edytuj).**
   Artykuły, PDF-y, transkrypcje, notatki, zrzuty, obrazy. Pliki są niezmienne:
   agent je *czyta i cytuje*, ale nigdy nie zmienia. Każdy nowy materiał to nowy plik.

2. **\`Wiki/\` — strony utrzymywane przez agenta.**
   Zsyntetyzowana wiedza w Markdownie, gęsto połączona \`[[łączami]]\`. Podfoldery:
   - \`Wiki/koncepcje/\` — pojęcia i tematy (to, *co* rozumiem).
   - \`Wiki/encje/\` — konkretne byty: osoby, organizacje, narzędzia, miejsca.
   - \`Wiki/analizy/\` — syntezy łączące wiele źródeł (przekrojowe wnioski).

3. **Schemat** — ten plik (\`CLAUDE.md\`).

Pliki śledzące w korzeniu sejfu:
- **\`Indeks.md\`** — katalog wszystkich stron wiki (mapa zawartości). Aktualizuj przy każdym ingest.
- **\`Dziennik.md\`** — dziennik dopisywany (append-only). Po każdym ingest dopisz wpis na górze.

## Operacja: INGEST
Gdy dodaję nowy materiał (plik w \`Źródła/\` lub adres URL):
1. **Zapisz źródło.** Treść z zewnątrz zapisz jako oczyszczony Markdown do
   \`Źródła/RRRR-MM-DD-<slug>.md\` z frontmatterem (\`source_url\`, \`content_type\`, \`ingested_at\`).
2. **Przeczytaj \`Indeks.md\`**, żeby ustalić, których istniejących stron dotyczy materiał.
3. **Zaktualizuj lub utwórz strony** w \`Wiki/\`:
   - Dodaj nowe fakty do istniejących stron albo utwórz nowe (koncepcja / encja / analiza).
   - Każda strona cytuje źródło: \`Źródło: [[Źródła/RRRR-MM-DD-<slug>]]\`.
   - Linkuj gęsto: wstaw \`[[łącza]]\` do powiązanych stron w obie strony.
4. **Zaktualizuj \`Indeks.md\`** — dopisz nowe strony.
5. **Dopisz wpis do \`Dziennik.md\`** (na górze): data, źródło, dotknięte strony, kluczowy wniosek.
6. **Podsumuj**: ile stron powstało lub się zmieniło i co warto zrobić dalej.

## Operacja: QUERY
Odpowiadaj **z wiki** (warstwy zsyntetyzowanej), nie skanując za każdym razem \`Źródeł/\`.
Zaczynaj od \`Indeks.md\` i podążaj \`[[łączami]]\`. Do \`Źródeł/\` sięgaj tylko po dosłowny cytat
lub weryfikację faktu.

## Operacja: LINT (przegląd porządkowy)
Na żądanie przejrzyj \`Wiki/\` i zgłoś:
- **Sieroty** — strony bez żadnych linków przychodzących ani wychodzących.
- **Martwe linki** — \`[[łącza]]\` do nieistniejących plików.
- **Luki** — byty wspomniane, ale bez własnej strony.
- **Sprzeczności** — niespójne fakty między stronami.
Zaproponuj naprawy; wprowadzaj je dopiero po mojej akceptacji.

## Zasady
- **Nigdy nie edytuj \`Źródeł/\`** — tylko czytaj i cytuj.
- **Każda strona wiki** ma frontmatter z \`typ:\` (\`koncepcja\` | \`encja\` | \`analiza\`), \`tagi:\`
  i co najmniej jednym \`[[łączem]]\`.
- **Linkuj gęsto i dwukierunkowo** — wiedza ma tworzyć graf, nie luźne notatki.
- **Wiedza się kumuluje** — dopisuj i łącz, nie zaczynaj strony od zera.
- **Język** — notatki piszę po <TWÓJ-JĘZYK>, poprawnie i naturalnie.
- **Sekrety** — nie zapisuj haseł ani kluczy prywatnych w treści.`
      },
      {
        label: 'Dostosuj schemat CLAUDE.md do mojej dziedziny',
        text: `Przeczytaj plik CLAUDE.md w tym sejfie. To schemat mojego Second Brain
wg wzorca Karpathy'ego. Moja dziedzina to: <TWOJA-DZIEDZINA>. Zaproponuj:
1. jakie podfoldery encji i koncepcji pasują do tej dziedziny (konkretne nazwy),
2. trzy przykładowe strony wiki (po jednym zdaniu opisu każda),
3. czy w schemacie warto coś dodać albo doprecyzować pod moją dziedzinę.
Nic jeszcze nie twórz; najpierw pokaż propozycję, omówimy ją, a potem zdecyduję.`
      },
      {
        label: 'Zainstaluj skille Obsidiana',
        text: `Zainstaluj w tym sejfie skille Obsidiana z repozytorium:
https://github.com/kepano/obsidian-skills
Użyj oficjalnej metody instalacji (np. polecenie "npx skills add <repo>"
albo dodanie zawartości repo do folderu .claude/ w korzeniu sejfu).
Po instalacji wypisz, jakie skille są teraz dostępne.`
      }
    ]
  },
  {
    id: '08',
    title: 'Migracja z Claude Chat i pierwszy ingest',
    time: '11:05–11:35',
    mode: 'ćwiczenie praktyczne (robimy razem)',
    content: [
      { type: 'heading', text: '🎯 Ważne' },
      { type: 'p', text: 'Twój sejf jest gotowy: ma ciało, ręce, schemat i umiejętności, ale wciąż jest pusty. W tym rozdziale wrzucasz **pierwszy materiał** i uruchamiasz **pierwszy ingest**, czyli operację, w której Claude Code zamienia surowe pliki w połączoną wiki. Na końcu **zobaczysz graf** i to jest moment, w którym metoda przestaje być teorią.' },
      { type: 'heading', text: '🧩 Dwa kroki: migracja i ingest' },
      { type: 'ol', items: [
        '**Migracja** to przeniesienie Twojej porannej pracy z Claude Chat (z chmury) do sejfu (na dysk) w postaci plików `.md`. Trafiają one do folderu **`Źródła/`**, czyli warstwy surowca.',
        '**Ingest** to operacja opisana w Twoim `CLAUDE.md`: Claude Code czyta surowce z `Źródła/`, tworzy i aktualizuje strony w `Wiki/`, łączy je odnośnikami oraz dopisuje wpis do `Indeks.md` i `Dziennik.md`. Przypomnienie z rozdziału 05: synteza dzieje się **raz**, a potem żyje w wiki.'
      ]},
      { type: 'callout', kind: 'info', title: 'Co migrujesz z Projektu', text: 'Twój pierwszy surowiec to **dane Projektu z Claude Chat**, zbudowane rano: **instrukcje Projektu**, **pamięć Projektu (memory)**, dołączone pliki **`skills.md`** i **`persony.md`** oraz **artefakt decyzji o landing page** z rozdziału 02. To już Twoja wiedza, więc Second Brain startuje z realną treścią, a nie z pustką.' },
      { type: 'heading', text: '🛠️ Co robimy' },
      { type: 'p', text: 'Ten blok robimy wspólnie: pokazuję u siebie, a Ty powtarzasz na swoim sejfie.' },
      { type: 'p', text: '**1. Wyeksportuj dane Projektu z Claude Chat (migracja).** Wróć do swojego **Projektu w Claude Chat** i otwórz w nim **nową rozmowę**. Wklej prompt, żeby Claude przygotował dane Projektu jako pliki `.md` do pobrania. Poczekaj, aż Claude wyświetli wszystkie artefakty `.md`.' },
      { type: 'p', text: '**2. Zapisz i skopiuj pliki do sejfu.** Pobierz każdy artefakt (pliki trafiają zwykle do folderu **Pobrane** / Downloads), a następnie **skopiuj** je do folderu **`Źródła/`** w swoim sejfie Obsidian. Od tej chwili Twoja poranna praca jest już na dysku, w warstwie surowca.' },
      { type: 'p', text: '**3. Poproś Claude Chat o prompt ingestujący.** Wróć do tej samej rozmowy w Claude Chat (Claude wciąż zna te pliki) i poproś go, żeby przygotował [**gotowy prompt ingestujący dla Claude Code**](#blok-08-prompt-2). Dzięki temu prompt ingestujący jest **świadomy treści** Twoich plików (Claude Chat wie, co w nich jest), a nie ogólny.' },
      { type: 'p', text: '**4. Uruchom ingest w Claude Code.** Skopiuj prompt wygenerowany przez Claude Chat i wklej go w **Claude Code** (otwartym na sejfie). Claude Code przeczyta surowce z `Źródła/`, utworzy pierwsze strony wiki wg `CLAUDE.md` i pokaże podsumowanie: ile stron powstało lub się zmieniło.' },
      { type: 'callout', kind: 'tip', title: 'Wariant skrócony', text: 'Jeśli chcesz pominąć krok 3, możesz w Claude Code po prostu napisać: „Zrób ingest folderu `Źródła/` zgodnie z zasadami z `CLAUDE.md`". Prompt przygotowany przez Claude Chat daje jednak lepszy efekt, bo z góry opisuje, co jest w plikach.' },
      { type: 'p', text: '**5. Zobacz graf wiedzy.** Otwórz w Obsidianie **widok grafu** (ikona z połączonymi kropkami). Zobaczysz swoje pierwsze strony i **linie połączeń** między nimi. Nawet kilka stron już tworzy sieć, a to jest namacalny dowód, że wiedza się łączy.' },
      { type: 'callout', kind: 'tip', title: 'Zajrzyj do ustawień grafu', text: 'W widoku grafu otwórz **ustawienia** (ikona koła zębatego). Najciekawsze są **Grupy**: pokoloruj węzły według folderu, na przykład inny kolor dla `Źródła/` (surowiec), a inny dla `Wiki/` (synteza), dzięki czemu od razu widać, co jest czym. W **Filtrach** włączysz lub wyłączysz m.in. załączniki oraz notatki niepowiązane (sieroty), a suwaki w sekcjach **Wyświetlanie** i **Siły** dostrajają wygląd i układ. Swoje ustawienia pokazuję na żywo.' },
      { type: 'callout', kind: 'note', title: 'Mały graf to nadal graf', text: 'Na starcie masz zaledwie kilka źródeł, więc graf będzie skromny. To normalne. Sedno w tym, że **mechanizm działa**: każdy kolejny ingest dokłada strony i połączenia, a graf rośnie z czasem.' },
      { type: 'heading', text: '📋 Do użycia' },
      { type: 'p', text: 'Operacja INGEST jest opisana w Twoim `CLAUDE.md` (z rozdziału 07). Artefakt do zaingestowania powstał w rozdziale 02.' },
      { type: 'heading', text: '💡 Zapamiętaj' },
      { type: 'quote', text: '**Ingest zamienia surowiec w połączoną wiedzę.** Pliki w `Źródła/` zostają niezmienne (to Twoje archiwum i dowód), a `Wiki/` rośnie: strony, streszczenia, odnośniki. Raz wykonana synteza żyje dalej, więc następnym razem pytasz wiki, zamiast przetwarzać wszystko od nowa. Tak właśnie działa Second Brain wg Karpathy\'ego.' },
      { type: 'heading', text: '⏭️ Co dalej' },
      { type: 'p', text: 'Masz pierwszą wiedzę i pierwszy graf. Twój Second Brain działa lokalnie i o własnych siłach. W następnym rozdziale nauczysz się **zbierać wiedzę z internetu**: wtyczką Web Clipper sklipujesz strony (między innymi tego kursu) prosto do sejfu i je zaingestujesz.' }
    ],
    checkpoints: [
      'W folderze `Źródła/` są pliki `.md` z Twojej porannej pracy.',
      'Po ingescie w `Wiki/` istnieją pierwsze strony, połączone odnośnikami.',
      '`Indeks.md` i `Dziennik.md` mają nowe wpisy.',
      'W widoku grafu widzisz strony i połączenia między nimi.'
    ],
    prompts: [
      {
        label: 'Przygotuj migrację danych Projektu',
        text: `Przygotuj migrację danych tego Projektu do plików Markdown.
Skopiuj poniższe do bieżącego czatu i wyświetl każde jako osobny
artefakt .md, gotowy do pobrania:
1. Instrukcje tego Projektu (pełna treść z ustawień projektu).
2. Zrzut pamięci Projektu (memory): wszystko, co masz w niej zapisane.
3. Każdy plik dołączony do wiedzy Projektu (np. skills.md, persony.md
   oraz pozostałe): pełną treść każdego przenieś do osobnego artefaktu .md.
Nie skracaj ani nie streszczaj; przenieś treść wiernie, 1:1.`
      },
      {
        label: 'Napisz prompt ingestujący dla Claude Code',
        text: `Na podstawie artefaktów, które przed chwilą powstały w tej rozmowie,
napisz gotowy PROMPT INGESTUJĄCY do wklejenia w Claude Code w moim
sejfie Obsidian. Prompt ma:
- wymienić pliki z folderu Źródła/ i krótko opisać, co zawiera każdy z nich,
- polecić Claude Code wykonać ingest zgodnie z zasadami z pliku CLAUDE.md
  (utworzyć lub uzupełnić strony w Wiki/, połączyć je odnośnikami [[…]]
  w obie strony, zaktualizować Indeks.md i Dziennik.md),
- być dopasowany do środowiska Obsidian (Markdown, wikilinki, właściwości).
Podaj sam gotowy prompt, gotowy do skopiowania.`
      }
    ]
  },
  {
    id: '09',
    title: 'Zbieranie stron z Web Clipperem',
    time: '11:25–11:45',
    mode: 'ćwiczenie praktyczne (robimy razem)',
    content: [
      { type: 'heading', text: '🎯 Ważne' },
      { type: 'p', text: 'Umiesz już zaingestować **własne pliki** (rozdział 08). Teraz uczysz się drugiego, codziennego źródła wiedzy: **stron internetowych**. Za pomocą wtyczki **Obsidian Web Clipper** zapiszesz stronę WWW jako czystą notatkę Markdown wprost do sejfu, a potem ją zaingestujesz. To umiejętność, którą będziesz wykorzystywać stale: artykuł, dokumentacja, wpis, wszystko można „sklipować" do Second Brain.' },
      { type: 'p', text: 'Na warsztacie sklipujemy **strony tego kursu** (opublikowane jako witryna WWW), żeby od razu zasilić Twój sejf realnym, uporządkowanym materiałem.' },
      { type: 'callout', kind: 'info', title: 'Czym jest Obsidian Web Clipper', text: 'To **oficjalne rozszerzenie do przeglądarki** od twórców Obsidiana. Pobiera stronę internetową, **usuwa z niej reklamy i nawigację** i zapisuje sam sens jako plik Markdown w Twoim sejfie. Działa w Chrome, Firefox, Safari i Edge, więc jest niezależne od systemu (Windows i macOS).' },
      { type: 'heading', text: '🛠️ Co robimy' },
      { type: 'p', text: 'Ten blok robimy wspólnie: pokazuję u siebie, a Ty powtarzasz na swoim sejfie.' },
      { type: 'p', text: '**1. Sprawdź wtyczkę Web Clipper.** Rozszerzenie **Obsidian Web Clipper** dodajesz do przeglądarki **przed kursem** (wg checklisty). Jeśli jeszcze go nie masz, dodaj je teraz ze strony [obsidian.md/download](https://obsidian.md/download) (sekcja Web Clipper: Chrome, Firefox, Safari, Edge).' },
      { type: 'p', text: '**2. Wskaż sejf i folder zapisu.** W ustawieniach wtyczki wskaż **swój sejf**. Klipy domyślnie trafiają do folderu **`Clippings`** w tym sejfie. Możesz zostawić ten domyślny folder albo zmienić go na **`Źródła/`**, jeśli wolisz trzymać cały surowiec w jednym miejscu. Dokładne ekrany pokazuję na żywo.' },
      { type: 'p', text: '**3. Sklipuj strony kursu.** Otwórz strony kursu (adres poda prowadzący) i sklipuj kilka rozdziałów. Każdy trafi jako czysty plik `.md` do wybranego folderu (domyślnie `Clippings`) w Twoim sejfie.' },
      { type: 'p', text: '[**4. Zaingestuj klipy.**](#blok-09-prompt-1) W **Claude Code** poproś o ingest nowych plików, podobnie jak w rozdziale 08.' },
      { type: 'p', text: '**5. Zobacz, jak graf się rozrasta.** Wróć do **widoku grafu**. Po dołożeniu treści kursu pojawi się więcej stron i połączeń niż po samej migracji. To ten sam mechanizm, tylko z bogatszym materiałem.' },
      { type: 'heading', text: '📋 Do użycia' },
      { type: 'p', text: 'Wtyczka: Obsidian Web Clipper (link podaje prowadzący). Operacja INGEST jest opisana w Twoim `CLAUDE.md` (z rozdziału 07).' },
      { type: 'heading', text: '💡 Zapamiętaj' },
      { type: 'quote', text: '**Web Clipper to Twój codzienny lejek wiedzy z internetu do Second Brain.** Zamiast zostawiać cenny artykuł w zakładkach, zapisujesz jego treść jako Markdown u siebie i ingestujesz jak każde inne źródło. Internet staje się surowcem Twojej wiki, a nie kolejną kartą, którą i tak zamkniesz.' },
      { type: 'heading', text: '⏭️ Co dalej' },
      { type: 'p', text: 'Twój sejf jest już nieźle zasilony: własna praca z rana i treści z sieci. Do kompletu brakuje jeszcze **wiedzy zewnętrznej na żądanie**. W następnym rozdziale podłączysz **NotebookLM przez MCP**, żeby po południu zasilać treści na stronę z Twojej biblioteki źródeł.' }
    ],
    checkpoints: [
      'Web Clipper wskazuje Twój sejf i zapisuje klipy (domyślnie do folderu `Clippings`).',
      'W sejfie są sklipowane strony kursu jako pliki `.md`.',
      'Po ingescie w `Wiki/` przybyło stron, a graf jest wyraźnie bogatszy.'
    ],
    prompts: [
      {
        label: 'Zaingestuj sklipowane strony kursu',
        text: `Zrób ingest nowych, sklipowanych stron kursu (folder Clippings; jeśli
kierujesz klipy do Źródła/, użyj tego folderu) zgodnie z zasadami
z CLAUDE.md: utwórz lub uzupełnij strony w Wiki/, połącz je odnośnikami
[[…]] w obie strony, zaktualizuj Indeks.md oraz Dziennik.md.
Pokaż, co powstało lub się zmieniło.`
      }
    ]
  },
  {
    id: '10',
    title: 'Podłącz NotebookLM przez MCP',
    time: '11:45–12:00',
    mode: 'powtarzaj za mną (robimy razem)',
    content: [
      { type: 'callout', kind: 'info', title: 'Co oznacza skrót MCP', text: '**MCP** to **Model Context Protocol**, czyli otwarty standard, dzięki któremu asystenci AI (jak Claude) łączą się z zewnętrznymi narzędziami i źródłami danych. Prościej: to **wtyczka**, przez którą Claude sięga do czegoś spoza siebie, na przykład do Twoich notatników w NotebookLM.' },
      { type: 'heading', text: '🎯 Ważne' },
      { type: 'p', text: 'Znasz już NotebookLM (rozdział 03) i masz **własny** notatnik dziedzinowy z dodanymi źródłami. Teraz łączysz go z Claude przez **MCP**, żeby Claude sięgał do Twoich notatników **sam**, bez ręcznego kopiowania. To most między „biblioteką" a „mózgiem".' },
      { type: 'heading', text: '🛠️ Co robimy' },
      { type: 'p', text: 'Po założeniu sejfu i instalacji skilli najtrudniejsze masz już za sobą, więc to podłączenie pójdzie spokojnie. Zamiast robić instalację ręcznie, **zlecasz ją Claude Code** z gotowego promptu. MCP wpisuje się do **aplikacji Claude Desktop** (nie do przeglądarki), a **całą pracę wykonuje za Ciebie Claude Code**. Twój jedyny możliwy ręczny krok to logowanie do Google, i to nie zawsze.' },
      { type: 'p', text: '**1. Wklej prompt w Claude Code.** Otwórz gotowiec „PROMPT: podłącz MCP do NotebookLM" i wklej go w Claude Code (w aplikacji Claude Desktop). Prompt zleca: instalację serwera NotebookLM, logowanie do Google (`nlm login`) oraz **wpisanie serwera do konfiguracji aplikacji Claude Desktop** z pełną ścieżką.' },
      { type: 'p', text: '**2. Zatwierdzaj; zaloguj się tylko w razie potrzeby.** Claude Code wykonuje **całą** pracę (na warsztacie w trybie auto-zatwierdzania z rozdziału 06). Jeśli potrzebne będzie logowanie do Google, dokończ je w przeglądarce na **właściwym koncie**. Komendę `nlm login` uruchamiasz w terminalu **sam tylko wtedy, gdy Claude Code o to poprosi** (gdy nie mógł jej wywołać, a logowania jeszcze nie ma).' },
      { type: 'p', text: '**3. Zrestartuj aplikację Claude Desktop.** Gdy Claude Code skończy, zrestartuj aplikację, żeby wczytała nowy serwer MCP.' },
      { type: 'p', text: '**4. Przetestuj.** Wpisz „Wylistuj moje notatniki NotebookLM". Jeśli zwraca Twoją listę, most działa.' },
      { type: 'callout', kind: 'note', title: 'Wariant ręczny (fallback)', text: 'Gdyby coś się nie powiodło, tę samą instalację można przeprowadzić **ręcznie** (uv, `nlm login`, wpis w konfiguracji, restart). Pełne, zweryfikowane kroki są w instrukcji MCP. To także materiał dla prowadzącego.' },
      { type: 'heading', text: '🔒 Domknięcie sesji ([SESSION-CLOSE](#blok-10-prompt-1))' },
      { type: 'p', text: 'NotebookLM działa, więc **domykasz przedpołudniową sesję**. Robisz to po raz pierwszy: pełny [**SESSION-CLOSE**](#blok-10-prompt-1) to rozwinięta wersja nawyku **„kończę pracę"** z rozdziału 02, teraz uruchomiona w Twoim Second Brain. Poproś o to Claude Code.' },
      { type: 'callout', kind: 'info', title: 'Dlaczego robisz to na koniec sesji', text: 'Praca w rozmowie jest **ulotna**: zamkniesz okno i kontekst znika. SESSION-CLOSE przenosi to, co ważne, z ulotnej rozmowy do **trwałej pamięci** Second Brain, żeby następnym razem zacząć od miejsca, w którym praca się urwała, a nie od zera. To ta sama zasada, co nawyk „kończę pracę" z rozdziału 02: **ustalenia zapisujesz, nie zostawiasz ich w historii czatu**. Kolejność jest celowa: najpierw **pamięć** (co się wydarzyło), potem **strategia** (dokąd zmierzam), na końcu **workflow** (jak pracuję), czyli od faktów, przez kierunek, po metodę.' },
      { type: 'callout', kind: 'tip', title: 'Zapisz to jako swój rytuał', text: 'Ten rytuał możesz opisać w swoim `CLAUDE.md` (albo w `skills.md`), żeby następnym razem wywołać go jednym hasłem, na przykład „kończę pracę". Wtedy nie musisz pamiętać całego promptu.' },
      { type: 'heading', text: '📋 Do użycia' },
      { type: 'p', text: 'Gotowiec (prompt do wklejenia): PROMPT: podłącz MCP do NotebookLM. Instrukcja ręczna (fallback / prowadzący): Instrukcja MCP do NotebookLM.' },
      { type: 'heading', text: '💡 Zapamiętaj' },
      { type: 'quote', text: '**MCP to wtyczki dla Twojego Claude.** Dziś podłączasz NotebookLM, ale ta sama mechanika (serwer, wpis w konfiguracji, restart) otwiera Claude na dziesiątki innych narzędzi. Jeden szczegół zapamiętaj na zawsze: w konfiguracji podajesz **pełną ścieżkę do serwera**, bo aplikacja graficzna nie widzi PATH z terminala.' },
      { type: 'callout', kind: 'tip', title: 'Nie wszystko trzeba stawiać ręcznie', text: 'To był sposób „ręczny" (własny serwer MCP), potrzebny dla narzędzi bez gotowej integracji, jak NotebookLM. Wiele popularnych narzędzi (Slack, Notion, Google Drive, GitHub i inne) ma w aplikacji Claude **gotowe konektory**, które podłączasz **jednym kliknięciem** w Ustawienia → Konektory. Zasada jest ta sama, czyli rozszerzasz Claude o zewnętrzne narzędzia, tylko bez konfiguracji.' },
      { type: 'heading', text: '⏭️ Co dalej' },
      { type: 'p', text: 'Most do wiedzy zewnętrznej jest gotowy: Claude sięga do Twoich notatników NotebookLM **sam**. Po SESSION-CLOSE przedpołudnie jest domknięte, a pamięć zapisana. Po lunchu wchodzimy w **produkcję**: z Twojej wiedzy (wiki + NotebookLM przez MCP) zbudujesz landing page. Zaczynamy od **brandbooka**.' }
    ],
    checkpoints: [
      '`nlm login` zakończył się sukcesem (jesteś na właściwym koncie Google).',
      'Wpis `notebooklm-mcp` jest w konfiguracji aplikacji Claude Desktop (z pełną ścieżką).',
      'Po restarcie aplikacji na prośbę „wylistuj notatniki” Claude zwraca Twoją listę.',
      'Wykonano pierwszy SESSION-CLOSE: pamięć Second Brain jest zaktualizowana.'
    ],
    prompts: [
      {
        label: 'SESSION-CLOSE (domknięcie sesji pracy nad Second Brain)',
        text: `Domknij tę sesję pracy nad moim Second Brain (SESSION-CLOSE). Wykonaj w tle,
po kolei:
1. MEMORY-UPDATE: zapisz trwale to, co z tej sesji jest ważne, a dotąd żyło
   tylko w rozmowie (co zostało zrobione, na czym praca się zatrzymała,
   kluczowe ustalenia).
2. STRATEGY-UPDATE (jeśli dotyczy): jeśli sesja zmieniła mój kierunek lub cel,
   zaktualizuj odpowiednie notatki.
3. WORKFLOW-UPDATE (jeśli dotyczy): jeśli pojawił się powtarzalny sposób pracy,
   zapisz go jako procedurę na przyszłość.
Na końcu wypisz krótko, co zapisałeś i gdzie.`
      }
    ]
  },
  {
    id: '11',
    title: 'Brandbook (tożsamość Twojej strony)',
    time: '12:30–12:45',
    mode: 'powtarzaj za mną (każdy robi u siebie)',
    content: [
      { type: 'callout', kind: 'info', title: 'Co to jest brandbook', text: '**Brandbook** (księga marki) to krótki zestaw decyzji o tym, jak marka **wygląda i mówi**: nazwa, ton głosu, kolory, typografia, zasady logo. Nie jest ozdobą, tylko **instrukcją spójności**: dzięki niemu każda sekcja strony gra do jednej bramki, zamiast wyglądać jak sklejka z przypadkowych stylów.' },
      { type: 'heading', text: '🎯 Ważne' },
      { type: 'p', text: 'Po lunchu zaczyna się **produkcja**, i to Ty ją prowadzisz na swoim sejfie. Zanim powstanie choćby jeden ekran, strona potrzebuje **tożsamości**, inaczej wyjdzie z niej generyczny, „ai-owy" szablon, jakich pełno w sieci. Tożsamość nie bierze się znikąd: **generujesz ją z własnej wiedzy** zebranej rano i z własnego notatnika NotebookLM przez most z rozdziału 10. Potem oddajesz brandbook z powrotem do Second Brain przez **ingest**, żeby przy budowie strony agenci traktowali go jako **wiążące wytyczne**, a nie luźną sugestię.' },
      { type: 'heading', text: '🛠️ Co robimy' },
      { type: 'p', text: 'Prowadzący robi to na swoim ekranie i mówi, co robić; Ty **powtarzasz na swoim sejfie**. To zarazem pierwszy sprawdzian, czy Twój most do NotebookLM z rozdziału 10 realnie pracuje.' },
      { type: 'p', text: '**1. Przypomnij sobie, z czego składa się brandbook.** Prowadzący pokazuje gotowy przykład (demo projektu landing page, sekcja 2). Zwróć uwagę na sześć elementów: nazwę i propozycję wartości, ton głosu, zasady wezwań do działania (CTA), paletę kolorów z notą o kontraście, typografię oraz listę „czego unikać".' },
      { type: 'p', text: '[**2. Wygeneruj swój brandbook z własnego Second Brain.**](#blok-11-prompt-1) Wklej w Claude Code prompt, który zbuduje brandbook z Twojej wiedzy w sejfie, a zasady tonu i dostępności zaczerpnie z **Twojego** notatnika NotebookLM przez MCP.' },
      { type: 'p', text: '**3. Sprawdź efekt ingestu.** Prompt zostawia dwie rzeczy: surowy plik w `Źródła/` (Twój zapis „na twardo") oraz **stronę brandbooka w `Wiki/`**, połączoną odnośnikami ze stroną projektu strony. Od tej chwili tożsamość Twojej marki żyje w Second Brain jak każda inna wiedza.' },
      { type: 'callout', kind: 'warning', title: 'Plan awaryjny (nie zatrzymuj się)', text: 'Jeśli idziesz przygotowaną **ścieżką UX** albo generowanie u Ciebie się nie powiedzie (most MCP kaprysi, notatnik pusty), **nie blokuj się**. Weź gotowy brandbook awaryjny (UX), skopiuj jego treść do pliku w `Źródła/` i zaingestuj tak jak w rozdziale 08. Efekt końcowy jest ten sam: brandbook w `Wiki/`. Po warsztacie wrócisz i wygenerujesz własny.' },
      { type: 'callout', kind: 'info', title: 'Pierwsza realna korzyść z mostu MCP', text: 'To pierwszy moment, w którym **NotebookLM przez MCP** naprawdę pracuje na produkcję, a nie „na pokaz na przyszłość". Ton głosu i zasady dostępności w Twoim brandbooku wprost korzystają z wiedzy w Twoim notatniku. Most zbudowany w rozdziale 10 zaczyna się zwracać.' },
      { type: 'callout', kind: 'tip', title: 'Bez grafika i bez Canvy', text: 'Na jednodniową stronę **nie potrzebujesz rysowanego logo**. Wystarczy logotyp tekstowy złożony z nazwy i koloru akcentu (zbuduje go później Claude Code w CSS). Skupiamy się na decyzjach, które realnie zmieniają wygląd strony: kolory, typografia, ton.' },
      { type: 'heading', text: '📋 Do użycia' },
      { type: 'p', text: 'Plan awaryjny (gotowy do ingestu): Brandbook awaryjny (UX). Gotowy przykład z personami i ścieżkami: Demo projektu landing page (UX), sekcja 2. Operacja INGEST jest opisana w Twoim `CLAUDE.md` (z rozdziału 07).' },
      { type: 'heading', text: '💡 Zapamiętaj' },
      { type: 'quote', text: '**Marka to spójność, a spójność bierze się z decyzji zapisanych raz.** Brandbook zamienia „jakoś to wyjdzie" w zestaw reguł, których trzyma się cała strona. Robisz go raz, oddajesz do Second Brain przez ingest, a potem każdy kolejny krok (agenci, budowa strony) po prostu z niego korzysta. To ta sama zasada, co przy wiedzy: **synteza raz, użycie wiele razy.**' },
      { type: 'heading', text: '⏭️ Co dalej' },
      { type: 'p', text: 'Strona ma już tożsamość: wie, jak wygląda i jak mówi. W następnym rozdziale nadajesz jej **szkielet**, czyli wireframe. Zobaczysz, jak z propozycji wartości i ścieżki użytkownika powstaje układ sekcji (Claude Design, ze wzmianką o Figma MCP).' }
    ],
    checkpoints: [
      'Rozumiesz, że brandbook to zestaw wiążących decyzji, a nie ozdoba.',
      'Masz brandbook z sześcioma elementami (nazwa, ton, CTA, kolory, typografia, „czego unikać”), wygenerowany z własnego sejfu albo wzięty z planu awaryjnego.',
      'Kolory mają kontrast min. 4,5:1 (do sprawdzenia narzędziem przed publikacją).',
      'Brandbook trafił do `Źródła/` i po ingeście istnieje jako strona w `Wiki/`, połączona ze stroną projektu.'
    ],
    prompts: [
      {
        label: 'Zbuduj brandbook z mojego Second Brain',
        text: `Zbuduj brandbook dla mojej landing page. Oprzyj się na mojej wiedzy z sejfu
(strony w Wiki/ dotyczące tematu strony). Zasady dotyczące tonu tekstów oraz
dostępności zaczerpnij z mojego notatnika NotebookLM (przez MCP), jeśli temat
strony tego dotyczy. Brandbook ma zawierać:
- nazwę i krótką propozycję wartości,
- ton głosu oraz 3–5 zasad pisania (prosty język, język korzyści),
- zasady wezwań do działania (CTA): czasownik + konkret, 2–4 słowa,
- paletę kolorów (HEX) z notą o kontraście WCAG min. 4,5:1,
- typografię (nagłówki i treść),
- logo jako logotyp tekstowy, bez grafiki,
- listę „czego unikać”.
Zapisz wynik do folderu Źródła/ (nazwa: RRRR-MM-DD-brandbook-temat.md),
a następnie wykonaj ingest zgodnie z CLAUDE.md: utwórz stronę w Wiki/, połącz
ją odnośnikami [[…]] ze stroną projektu landing page, zaktualizuj Indeks.md
i Dziennik.md. Na końcu pokaż, co powstało.`
      }
    ]
  },
  {
    id: '12',
    title: 'Wireframe: makieta wyglądu strony',
    time: '12:45–13:20',
    mode: 'powtarzaj za mną (prowadzący pokazuje krok, Ty powtarzasz u siebie)',
    content: [
      { type: 'callout', kind: 'info', title: 'Wireframe w tym kursie to makieta wysokiej wierności', text: 'W klasycznym rozumieniu wireframe to **surowy szkic** układu. My robimy inaczej: budujemy **makietę wysokiej wierności**, czyli wygląd **jak najbliższy finalnej stronie** — z kolorami i typografią z brandbooka oraz realistyczną treścią. Powód jest prosty: **to na jej podstawie zatwierdzasz wygląd**. Ta makieta staje się **wizualnym kontraktem**, który budowa strony w rozdziale 14 ma **odwzorować**, a nie interpretować.' },
      { type: 'heading', text: '🎯 Ważne' },
      { type: 'p', text: 'Brandbook z rozdziału 11 powiedział, **jak** marka wygląda i mówi. Teraz zamieniasz to w **konkretny wygląd strony** i go **zatwierdzasz**. Najlepsze jest to, że **nie piszesz tego promptu sam**: Twój Second Brain zna już propozycję wartości, ścieżkę użytkownika i brandbook, więc to **Claude Code przygotuje pełny brief** dla narzędzia projektowego. Ty przenosisz brief do Claude Design, dopracowujesz makietę, aż wygląda jak strona, którą chcesz opublikować, i odsyłasz ją do sejfu jako **zatwierdzony wzorzec wyglądu**.' },
      { type: 'heading', text: '🛠️ Co robimy' },
      { type: 'p', text: 'Trzy narzędzia, jeden ciąg: **Claude Code** pisze brief → **Claude Design** rysuje makietę → **sejf** przyjmuje ją jako zatwierdzony wzorzec. Prowadzący pokazuje każdy krok, Ty powtarzasz u siebie.' },
      { type: 'p', text: '[**1. Poproś Claude Code, żeby napisał brief.**](#blok-12-prompt-1) Claude Code siedzi na Twoim sejfie i zna Twój brandbook oraz ścieżkę użytkownika, więc potrafi **złożyć kompletny brief z kontekstem** dla Claude Design. Claude Code oddaje **gotowy, nasycony kontekstem brief**, a nie ogólnik. To ta sama sztuczka, co przy ingeście w rozdziale 08: brief jest świadomy Twojej wiedzy.' },
      { type: 'p', text: '[Przykładowy pełny brief](#blok-12-prompt-2) (instancja demo „Maria Nowak · Lean UX") pokazuje, jak może wyglądać brief zwrócony przez Claude Code: markę i grupę docelową, ton i teksty, dokładną paletę kolorów (HEX) z notą o kontraście WCAG, typografię (Inter), układ sekcji w kolejności ścieżki użytkownika (pasek górny z CTA, hero z propozycją wartości, dowód/case study z metryką „było → jest", proces w 3 krokach, sekcja kontaktu z formularzem, stopka na ciemnym tle) oraz zasady: jedno główne CTA powtórzone w trzech miejscach, etykiety przycisków jako czasownik + konkret, wersje na szeroki ekran i telefon. Potraktuj go jako wzorzec docelowej jakości, a na ścieżce UX wklej go wprost do Claude Design.' },
      { type: 'p', text: '**2. Wygeneruj makietę w Claude Design.** Otwórz Claude Design (pozycja „Design" w Claude Desktop), wybierz szablon **Prototype** i wklej brief przygotowany przez Claude Code. Obejrzyj podgląd i **dopracuj wygląd**: to jest moment, w którym zatwierdzasz stronę, więc proś o poprawki w tej samej rozmowie, aż makieta wygląda jak strona, którą chcesz opublikować.' },
      { type: 'callout', kind: 'info', title: 'Gdzie jest Claude Design', text: '**Claude Design** (na razie w wersji **Beta**) to część **aplikacji Claude Desktop**: otwierasz ją pozycją **„Design"** na dole lewego panelu (obok zakładek Chat / Cowork / Code). Powita Cię pytanie „What will you design today?" oraz gotowe szablony: **Prototype, Slides, Document, Wireframe, Animation**. Dla makiety wysokiej wierności najlepszy jest **Prototype** (Wireframe daje układ niższej wierności). Można wybrać model i wyeksportować kod strony (ikona `</>`).' },
      { type: 'callout', kind: 'info', title: 'Wzmianka: Figma MCP', text: '**Figma** to profesjonalne narzędzie do projektowania interfejsów. Istnieje **Figma MCP**, czyli most (jak ten do NotebookLM z rozdziału 10), który pozwala Claude sięgać do projektów w Figmie: pobierać z nich układy albo tworzyć nowe. Dziś tego **nie robimy**, bo na jednodniową stronę wystarcza Claude Design. Wspominamy o tym, żebyś wiedział, że taka droga istnieje, gdy zechcesz pracować z projektantem w Figmie.' },
      { type: 'p', text: '**3. Zapisz makietę jako plik.** Wyeksportuj wynik do **HTML** (ikona `</>`) i/lub zapisz **PNG** (zrzut/eksport podglądu). HTML niesie realny układ i style (przyda się przy budowie), PNG niesie obraz zatwierdzonego wyglądu. Dobrze mieć oba.' },
      { type: 'p', text: '[**4. Wgraj do sejfu i zaingestuj jako zatwierdzony wygląd.**](#blok-12-prompt-3) Skopiuj plik(i) do folderu `Źródła/` w sejfie, a potem zleć ingest w Claude Code.' },
      { type: 'callout', kind: 'warning', title: 'Plan awaryjny (nie zatrzymuj się)', text: 'Jeśli podgląd nie chce się wygenerować, **nie blokuj się**. Poproś Claude Code, żeby zamiast promptu do Claude Design **opisał makietę słowami** (sekcje po kolei, co w każdej, kolory i CTA z brandbooka), zapisał to do `Źródła/` i zaingestował jako wzorzec. Do budowy strony w rozdziale 14 wystarczy **precyzyjny opis wyglądu**; wygenerowany podgląd jest lepszy, ale nie jest warunkiem.' },
      { type: 'callout', kind: 'tip', title: 'To jest moment zatwierdzenia wyglądu', text: 'Nie traktuj tego kroku po macoszemu. Makieta, którą tu zatwierdzisz, jest **punktem odniesienia dla całej budowy strony**. Warto poświęcić chwilę na iteracje (kolory, nagłówki, rozmieszczenie CTA), bo każda decyzja podjęta teraz oszczędza poprawek później. Zmiana wyglądu po zbudowaniu strony kosztuje znacznie więcej niż poprawka makiety.' },
      { type: 'heading', text: '📋 Do użycia' },
      { type: 'p', text: 'Wygenerowana makieta demo (do pokazu efektu): makieta PDF · kod HTML. Ścieżka użytkownika i propozycja wartości (wejście dla briefu): Demo projektu landing page (UX), sekcja 3. Brandbook (kolory, typografia, ton, CTA) powstał w rozdziale 11. Zapis do `Źródła/` i ingest działają jak w rozdziale 08; operacja INGEST jest w Twoim `CLAUDE.md`.' },
      { type: 'heading', text: '💡 Zapamiętaj' },
      { type: 'quote', text: '**Second Brain nie tylko przechowuje wiedzę, on pisze brief dla innych narzędzi.** Nie układałeś strony w głowie ani nie pisałeś promptu z pamięci: Claude Code wyprowadził go z Twojego brandbooka i ścieżki użytkownika. A makieta, którą zatwierdzasz, przestaje być szkicem i staje się **wizualnym kontraktem**: budowa strony ma ją odwzorować, więc wygląd zapada raz i świadomie, a nie przypadkiem przy kodowaniu.' },
      { type: 'heading', text: '⏭️ Co dalej' },
      { type: 'p', text: 'Masz już tożsamość (brandbook) i **zatwierdzony wygląd** (makieta), oba w Second Brain. W następnym rozdziale zakładasz osobny **katalog DEV** i budujesz **agentów** (webmastera i specjalistę UX), którzy wezmą Twój brandbook i zatwierdzoną makietę i **odwzorują ją** jako prawdziwą, działającą stronę.' }
    ],
    checkpoints: [
      'Claude Code przygotował brief z kontekstem (brandbook + ścieżka), a nie ogólnik.',
      'W Claude Design powstała makieta wysokiej wierności (kolory i typografia z brandbooka, realistyczna treść), którą zatwierdzasz jako wygląd strony.',
      'Makieta jest wyeksportowana do HTML i/lub PNG i wgrana do `Źródła/`.',
      'Po ingeście istnieje strona w `Wiki/` „zatwierdzony wygląd strony”, oznaczona jako wiążący wzorzec, połączona ze stroną projektu i z brandbookiem.'
    ],
    prompts: [
      {
        label: 'Przygotuj brief na makietę dla Claude Design',
        text: `Przygotuj pełny prompt (wraz z kontekstem) do wygenerowania makiety mojej
landing page w Claude Design. Makieta ma być WYSOKIEJ WIERNOŚCI, jak najbliższa
finalnej stronie, bo na jej podstawie zatwierdzam wygląd. Zbierz kontekst
z mojego sejfu: propozycję wartości i ścieżkę użytkownika (kolejność sekcji)
oraz brandbook (kolory HEX, typografia, ton, główne CTA i jego etykieta).
Gotowy prompt ma polecić Claude Design:
- ułożyć sekcje w kolejności z mojej ścieżki użytkownika (hero z propozycją
  wartości, dowód z wynikiem, krótko o podejściu, sekcja kontaktu z CTA),
- ZASTOSOWAĆ mój brandbook w całości: dokładne kolory (HEX), typografię i ton,
- użyć realistycznej treści zgodnej z moją propozycją wartości (nie tekstu
  zastępczego typu „lorem ipsum”),
- dać jedno główne wezwanie do działania, powtórzone na dole, z etykietą
  z brandbooka,
- przygotować układ na szeroki ekran i na telefon.
Podaj sam gotowy prompt, gotowy do skopiowania do Claude Design.`
      },
      {
        label: 'Przykładowy pełny brief do Claude Design (wzorzec jakości, gotowiec ścieżki UX)',
        text: `Zaprojektuj makietę wysokiej wierności jednostronicowej landing page. Ma
wyglądać jak gotowa, opublikowana strona, nie jak szkic.

MARKA
- Nazwa (logotyp tekstowy): „Maria Nowak” grafitem + „· Lean UX” w kolorze
  akcentu (indygo).
- Kim jest: projektantka Lean UX; projektuje interfejsy na podstawie hipotez
  i mierzalnych wyników.
- Do kogo mówi strona: founderzy i product managerowie we wczesnych startupach
  oraz liderzy projektowania rekrutujący projektanta.

TON I TEKSTY
- Rzeczowy, konkretny, oparty na dowodach. Prosty język, jedno zdanie to jedna
  myśl, język korzyści, bez żargonu. Użyj realistycznej treści, nie „lorem ipsum”.

KOLORY (zastosuj dokładnie te wartości)
- Tekst / atrament: #111827
- Sekcje ciemne i stopka: #1E293B
- Akcent / CTA (tło przycisku z białym tekstem) oraz aktywne linki: #4F46E5
- Wyróżnienia i liczby (metryki): #F59E0B
- Tło jasne (rozdzielenie sekcji): #F8FAFC
- Biel: #FFFFFF
- Dostępność: kontrast tekstu do tła min. 4,5:1; nie wyróżniaj samym kolorem.

TYPOGRAFIA
- Nagłówki i treść: Inter. Liczby i etykiety metryk mogą być monospace.
  Wyrównanie do lewej, bez Wersalików.

UKŁAD SEKCJI (dokładnie w tej kolejności, wg ścieżki użytkownika)
1. Pasek górny: logotyp po lewej, po prawej jedno CTA „Umów konsultację”.
2. Hero: duży nagłówek = „Projektuję interfejsy, które da się zmierzyć: od
   hipotezy, przez szybki test, po wynik.”; pod nim jedno–dwa zdania rozwinięcia
   i przycisk „Umów konsultację”. Bez zdjęć stockowych.
3. Dowód (case study): jeden przykład z metryką „było → jest”, np. „konwersja
   formularza: 2,1% → 5,8% w 6 tygodni”, plus zdanie, co zmieniono. Liczbę
   wyróżnij bursztynem (#F59E0B).
4. Podejście (proces Lean UX w 3 krokach): Hipoteza → Szybki test → Wynik,
   po jednym zdaniu na krok.
5. Kontakt: krótkie zaproszenie, powtórzone CTA „Umów konsultację” i prosty
   formularz (imię, e-mail, wiadomość).
6. Stopka na ciemnym tle (#1E293B): logotyp rewersowy i minimalne linki.

ZASADY
- Jedno główne CTA na stronie („Umów konsultację”), powtórzone w pasku górnym,
  w hero i w sekcji kontaktu. Bez konkurencyjnych przycisków.
- Etykiety przycisków: czasownik + konkret, 2–4 słowa, bez wykrzykników.
- Przygotuj wersję na szeroki ekran i na telefon (na telefonie sekcje układają
  się w jedną kolumnę, CTA pozostaje łatwo dostępne).`
      },
      {
        label: 'Zaingestuj makietę jako zatwierdzony wygląd strony',
        text: `Zrób ingest makiety z folderu Źródła/ (plik HTML i/lub PNG) zgodnie z CLAUDE.md:
utwórz w Wiki/ stronę „zatwierdzony wygląd strony” — opisz układ (sekcje po
kolei, co w każdej, gdzie CTA) i zaznacz, że to WIĄŻĄCY wzorzec wyglądu, który
budowa strony ma odwzorować. Połącz stronę odnośnikami [[…]] ze stroną projektu
oraz z brandbookiem, zaktualizuj Indeks.md i Dziennik.md. Na końcu pokaż,
co powstało.`
      }
    ]
  },
  {
    id: '13',
    title: 'Katalog DEV i agenci (webmaster, UX)',
    time: '13:20–14:30 (praca 13:20–14:15, potem przerwa 2)',
    mode: 'powtarzaj za mną i ćwiczenie',
    content: [
      { type: 'callout', kind: 'info', title: 'Co to jest agent i co to jest skill', text: '**Agent** (podagent) to wyspecjalizowany asystent z jasną **rolą** i dostępem do wybranych umiejętności. Zamiast jednego Claude „od wszystkiego" tworzysz dwóch specjalistów, każdy z wąskim zadaniem. **Skill** to gotowa, powtarzalna umiejętność, po którą agent sięga, gdy jej potrzebuje (poznałeś je w rozdziałach 04 i 06–07). Krótko: **agent to rola, skill to narzędzie w jego ręku.**' },
      { type: 'heading', text: '🎯 Ważne' },
      { type: 'p', text: 'Masz tożsamość (brandbook) i zatwierdzony wygląd (makieta). Teraz składasz **mały zespół**, który zamieni to w prawdziwą stronę: **webmastera** (buduje) i **recenzenta UX** (sprawdza przed publikacją). Dwie rzeczy są tu ważne. Po pierwsze, kod strony mieszka w **osobnym katalogu DEV**, z dala od sejfu (bo sejf to magazyn wiedzy, nie repozytorium kodu, jak w rozdziale 06). Po drugie, agentów **najpierw opisujesz w sejfie** (bo opis roli to wiedza), a **potem budujesz** w katalogu DEV (bo agent to konfiguracja). To znów wzorzec „plan w mózgu, wykonanie w kodzie", i obejmuje już pierwszy krok: nawet **prompt inicjujący** katalog DEV piszesz w sejfie (bo zna Twój kontekst i własną ścieżkę), a dopiero wykonujesz go w DEV.' },
      { type: 'heading', text: '🛠️ Co robimy' },
      { type: 'p', text: 'Trzy kroki, a na koniec bloku przerwa: założysz katalog DEV, opiszesz agentów w sejfie i zbudujesz ich w Claude Code, po czym odpoczniesz przed budową strony.' },
      { type: 'p', text: '**1. Załóż katalog DEV, a prompt inicjujący wygeneruj w sejfie.** Najpierw utwórz nowy, pusty folder na stronę, **osobny od sejfu** (na przykład na pulpicie folder `landing-dev`).' },
      { type: 'p', text: 'Teraz najważniejsza zmiana wzorca: polecenia inicjującego **nie piszesz ręcznie w katalogu DEV, tylko generujesz je w sejfie**. Wróć do Claude Code otwartego na **sejfie**, bo to on zna Twój brandbook i persony oraz swoją własną ścieżkę na dysku. Poproś go o gotowy [prompt inicjujący katalog DEV](#blok-13-prompt-1).' },
      { type: 'p', text: 'Dostajesz **gotowy prompt inicjujący**, w który sejf sam wpisał Twój podmiot i CTA oraz **poprawną ścieżkę sejfu** (tę samą na Windows i macOS, bez ręcznego przepisywania). Skopiuj go.' },
      { type: 'p', text: '**Teraz go wykonaj.** Utwórz nową sesję w Claude Code i wskaż pusty folder `landing-dev` (tak jak w rozdziale 06 wskazałeś sejf), wklej skopiowany prompt i wyślij. Claude Code utworzy README oraz pustą strukturę na kod, a na końcu poda dokładną ścieżkę katalogu DEV.' },
      { type: 'callout', kind: 'info', title: 'Po co w prompcie jest ścieżka sejfu', text: 'Konkrety (podmiot, CTA) są wpisane w prompt na twardo, więc katalog DEV jest **samowystarczalny**. Ścieżkę sejfu dokładasz jako **źródło tylko do odczytu**, żeby agenci mogli w razie potrzeby sięgnąć po szczegół z Twojej bazy wiedzy, ale niczego w niej nie zmieniają ani jej nie kopiują. Kod zostaje w DEV, wiedza zostaje w sejfie.' },
      { type: 'callout', kind: 'info', title: 'Dlaczego osobny katalog', text: 'Kod i wiedza rządzą się różnymi prawami: kod się kompiluje, wersjonuje i wdraża, a wiedza się łączy i syntetyzuje. Mieszanie ich w jednym folderze zaśmieca graf sejfu i utrudnia publikację. Dlatego strona żyje w DEV, a sejf zostaje czysty. To domknięcie uwagi z rozdziału 06.' },
      { type: 'p', text: '[**2. Wygeneruj w sejfie opis dwóch agentów (z ich skillami).**](#blok-13-prompt-2) Zostań w Claude Code na **sejfie**. Ma on już Twój brandbook (z rozdziału 11), zatwierdzoną makietę (z rozdziału 12) i persony, więc opis agentów zbuduje z Twojej wiedzy, a nie z niczego.' },
      { type: 'p', text: 'Dostajesz **notatkę z opisem obu agentów**, dopasowaną do Twojego tematu, wraz z listą potrzebnych skilli. To ona zasili krok 3.' },
      { type: 'ul', items: [
        '**Webmaster** buduje stronę: odwzorowuje makietę 1:1 jako czysty, responsywny HTML i CSS, zgodny z brandbookiem.',
        '**Recenzent UX** sprawdza stronę przed publikacją: czy prowadzi persony do CTA, czy zgadza się ze ścieżką, czy spełnia minimum dostępności (WCAG), i zgłasza konkretne poprawki.'
      ]},
      { type: 'callout', kind: 'tip', title: 'Dlaczego dwaj, a nie jeden', text: 'Rozdzielasz **budowanie** od **sprawdzania**. Autor łatwo nie widzi własnych błędów; recenzent patrzy krytycznie, oczami odbiorcy. To ta sama zasada, co adwokat diabła w radzie doradczej z rozdziału 02.' },
      { type: 'p', text: '[**3. Wygeneruj w sejfie prompt budujący agentów, a wykonaj go w DEV.**](#blok-13-prompt-3) Tak samo jak przy zakładaniu katalogu, polecenia **nie sklejasz ręcznie w DEV**. Wróć do Claude Code na **sejfie**, bo to on ma opis agentów z kroku 2. Poproś, żeby zapisał go w jednym, samowystarczalnym poleceniu.' },
      { type: 'p', text: 'Skopiuj wygenerowany prompt, przełącz się na Claude Code otwarty na **katalogu DEV** i wklej go. Claude Code tworzy pliki agentów i skilli, a na końcu pokazuje **raport**. Zespół jest gotowy; stronę zbudujesz nim w następnym rozdziale.' },
      { type: 'callout', kind: 'info', title: 'Reużyj, zanim zbudujesz, ale sprawdź, zanim zaufasz', text: 'Zanim Claude Code napisze skille od zera, warto sprawdzić, co można wziąć gotowe. Menedżer otwierasz poleceniem `/plugin` (zakładka Discover): masz tam **oficjalny katalog Anthropic** (`claude-plugins-official`) oraz **katalog społecznościowy** (`claude-plugins-community`, ze wstępnym prześwietleniem bezpieczeństwa). Wtyczka może nieść nie tylko skille, ale i gotowych **agentów**. **Zasada bezpieczeństwa:** cudza wtyczka działa z Twoimi uprawnieniami i nie jest odizolowana w piaskownicy. Dlatego trzymaj się dwóch oficjalnych katalogów, przejrzyj listę „co zostanie zainstalowane" przed włączeniem, instaluj najpierw lokalnie (tylko ten projekt) i **nie włączaj trybu pomijania uprawnień** (wyłączamy go w rozdziale 04 właśnie po to). Krótko: reużywaj z oficjalnych źródeł, resztę wygeneruj sam, a cokolwiek z niepewnego źródła zostaw do świadomej decyzji.' },
      { type: 'callout', kind: 'note', title: '☕ Przerwa 2 (14:15–14:30)', text: 'Dobry moment na oddech: **zespół agentów jest gotowy** (opisany i zbudowany). Po przerwie w rozdziale 14 spuszczasz ich ze smyczy i budujesz stronę.' },
      { type: 'callout', kind: 'warning', title: 'Plan awaryjny (nie zatrzymuj się)', text: 'Jeśli opis własnych agentów zajmuje za dużo czasu, weź **gotowy** opis 2 agentów (UX) i użyj go wprost. Efekt jest ten sam: dwaj agenci w katalogu DEV, gotowi do budowy strony.' },
      { type: 'heading', text: '📋 Do użycia' },
      { type: 'p', text: 'Gotowy opis agentów + prompt inicjujący: Opis 2 agentów + skille. Wejścia dla agentów (persony, ścieżka, brandbook): Demo projektu landing page (UX). Zatwierdzona makieta (wejście webmastera) powstała w rozdziale 12.' },
      { type: 'heading', text: '💡 Zapamiętaj' },
      { type: 'quote', text: '**Zespół agentów to podział ról, nie magia.** Zamiast prosić jednego Claude „zrób mi stronę", tworzysz dwóch specjalistów z wąskimi zadaniami i jasnymi wejściami z Twojego Second Brain. Budowniczy i recenzent to różne role, bo autor rzadko widzi własne błędy. Opis roli to wiedza (sejf), a sam agent to konfiguracja (katalog DEV): rozdzielasz „co ma robić" od „gdzie żyje".' },
      { type: 'heading', text: '⏭️ Co dalej' },
      { type: 'p', text: 'Masz zespół: webmastera i recenzenta UX, obu opartych na Twoim Second Brain. W następnym rozdziale **spuszczasz ich ze smyczy**: webmaster zbuduje stronę z Twojej makiety i brandbooka (wsparty treścią z NotebookLM przez MCP), a recenzent UX sprawdzi ją przed publikacją.' }
    ],
    checkpoints: [
      'Istnieje osobny katalog DEV na stronę (poza sejfem), zainicjowany w Claude Code.',
      'W sejfie jest opis dwóch agentów (webmaster, recenzent UX) z rolami, wejściami i zasadami.',
      'W katalogu DEV Claude Code utworzył agentów i skille i pokazał raport.',
      'Rozumiesz podział: webmaster buduje, recenzent UX sprawdza.'
    ],
    prompts: [
      {
        label: 'Napisz prompt inicjujący katalog DEV',
        text: `Pracuję teraz w moim sejfie z wiedzą. Napisz mi „prompt inicjujący katalog DEV”,
który wkleję w osobnej sesji Claude Code otwartej na pustym folderze mojej strony.
W tym prompcie:
- wpisz wprost cel strony: kto jest jej podmiotem i jakie ma być jedno główne
  wezwanie do działania (weź to z mojego brandbooka i person),
- podaj pełną, systemową ścieżkę TEGO sejfu jako źródło wiedzy tylko do odczytu
  (bez kopiowania i bez zmieniania),
- każ zainicjować projekt: krótki plik README z celem strony oraz czytelną, pustą
  strukturę na kod,
- na końcu każ wypisać dokładną ścieżkę katalogu DEV i pokazać, co powstało.
Podaj gotowy prompt do skopiowania.`
      },
      {
        label: 'Opisz agentów webmastera i recenzenta UX',
        text: `W moim sejfie mam już brandbook, zatwierdzoną makietę i persony ze ścieżką
użytkownika. Na tej podstawie napisz opis dwóch agentów do budowy mojej landing
page: webmastera (buduje stronę) i recenzenta UX (sprawdza ją przed publikacją).
Dla każdego podaj: rolę, wejścia z mojego Second Brain (skąd bierze makietę,
brandbook, persony i ścieżkę), zadania oraz zasady. Wypisz też, jakich skilli
(umiejętności) każdy agent potrzebuje, i zaznacz, które z nich to prawdopodobnie
gotowce do reużycia, a które trzeba dorobić. Zapisz całość jako notatkę w moim
sejfie i połącz ją odnośnikami z brandbookiem i makietą. Nie buduj jeszcze
niczego w kodzie.`
      },
      {
        label: 'Napisz prompt budujący agentów i skille',
        text: `Mam w tym sejfie opis dwóch agentów (webmaster i recenzent UX) oraz ich skilli.
Napisz mi „prompt budujący agentów”, który wkleję w sesji Claude Code otwartej
na moim katalogu DEV. W ten prompt:
- wpisz pełny opis obu agentów (rola, wejścia: skąd biorą makietę, brandbook,
  persony i ścieżkę, oraz zasady), tak żeby katalog DEV nie musiał zaglądać do
  sejfu, żeby ich utworzyć,
- podaj systemową ścieżkę tego sejfu jako źródło tylko do odczytu (stamtąd
  agenci wezmą później swoje wejścia),
- każ utworzyć w katalogu DEV te dwa podagenty i potrzebne skille, ale najpierw
  reużyj to, co gotowe: sprawdź oficjalny i społecznościowy katalog Claude Code
  (menedżer \`/plugin\`), wskaż konkretne skille lub wtyczki po nazwie i źródle,
  a od zera pisz tylko to, czego naprawdę brakuje,
- z niepewnego źródła nie instaluj niczego, co wymaga szerokich uprawnień —
  oznacz to jako „do mojej ręcznej weryfikacji” zamiast włączać samodzielnie,
- zaznacz wyraźnie: NIE buduj jeszcze strony, przygotuj tylko agentów i skille,
- na końcu każ pokazać raport i rozdzielić w nim: co reużyłeś (i z jakiego
  źródła), co zbudowałeś od zera, a co wymaga mojej decyzji przed użyciem.
Podaj gotowy prompt do skopiowania.`
      }
    ]
  },
  {
    id: '14',
    title: 'Budowa strony',
    time: '14:30–15:20',
    mode: 'ćwiczenie → powtarzaj za mną (robimy razem)',
    content: [
      { type: 'heading', text: '🎯 Ważne' },
      { type: 'p', text: 'To jest moment, do którego zmierzał cały dzień. Wszystko, co zbudowałeś, **zbiega się w jednej budowie**: brandbook (jak marka wygląda i mówi), zatwierdzona makieta (wzór wyglądu), persony i ścieżka użytkownika (dla kogo i którędy) oraz dwaj agenci (kto buduje, kto sprawdza). Najpierw Claude Code **napisze z Twojego Second Brain jeden brief** (prompt finalny), a potem Twoi agenci **zbudują z niego prawdziwą stronę** w katalogu DEV, zaciągając treść merytoryczną z NotebookLM przez MCP. Pierwszy raz zobaczysz, jak Twoja wiedza staje się **działającym produktem**.' },
      { type: 'heading', text: '🛠️ Co robimy' },
      { type: 'p', text: 'Jeden ciąg: sejf pisze brief, agenci budują, recenzent sprawdza, wynik wraca do sejfu.' },
      { type: 'p', text: '[**1. Poproś Claude Code, żeby napisał prompt finalny (w sejfie).**](#blok-14-prompt-1) Wróć do Claude Code otwartego na **sejfie**. To on zna Twój brandbook, makietę, persony i ścieżkę, więc złoży z nich jeden kompletny brief. Dostajesz **prompt finalny** (samowystarczalny brief) i od razu masz go zapisanego w wiki jako udokumentowaną decyzję.' },
      { type: 'p', text: '**2. Otwórz katalog DEV.** [Prompt finalny](#blok-14-prompt-1) masz już w schowku (z kroku 1) i zawiera ścieżkę Twojego sejfu jako źródło tylko do odczytu, więc webmaster odczyta makietę wprost z sejfu. Jeśli wolisz mieć wzór pod ręką w DEV albo dostęp do ścieżki sejfu okaże się niewygodny, **skopiuj plik makiety (HTML)** z sejfu do katalogu DEV jako plan awaryjny.' },
      { type: 'p', text: '**3. Uruchom budowę w Claude Code (katalog DEV).** Przełącz się na sesję Claude Code otwartą na **katalogu DEV** i wklej [**prompt finalny**](#blok-14-prompt-1). Webmaster odwzorowuje makietę jako prawdziwą stronę wg brandbooka i **zaciąga treść merytoryczną z NotebookLM przez MCP**, a recenzent UX sprawdza wynik i zgłasza poprawki. Na końcu dostajesz **raport**: co powstało i co recenzent zalecił.' },
      { type: 'callout', kind: 'info', title: 'NotebookLM realnie pracuje na treść', text: 'Tu spłaca się most z rozdziału 10 po raz drugi i mocniej: sekcje merytoryczne strony (na przykład „o podejściu" czy opis projektu) **nie są zmyślone**, tylko oparte na Twoim notatniku. Wiedza z NotebookLM wchodzi wprost do produktu.' },
      { type: 'p', text: '**4. Popraw stronę wg recenzji UX.** Jeśli recenzent UX zgłosił poprawki (kontrast, kolejność, jasność CTA), poproś webmastera, żeby je wprowadził. To krótka pętla **zbuduj → sprawdź → popraw**, dokładnie po to rozdzieliłeś role w rozdziale 13.' },
      { type: 'p', text: '[**5. Zaingestuj wynik do sejfu.**](#blok-14-prompt-2) Na koniec udokumentuj, co powstało, w Second Brain.' },
      { type: 'callout', kind: 'warning', title: 'Plan awaryjny (nie zatrzymuj się)', text: 'Jeśli budowa się zacina albo NotebookLM nie odpowiada, **zbuduj najpierw stronę z samej makiety i brandbooka**, a treść merytoryczną wstaw jako miejsce zastępcze (i uzupełnij z NotebookLM po warsztacie). Cel bloku to **działająca strona**, gotowa do publikacji; dopieszczanie treści może poczekać.' },
      { type: 'heading', text: '📋 Do użycia' },
      { type: 'p', text: 'Twoi agenci (webmaster, recenzent UX) powstali w rozdziale 13; wzorzec: Opis 2 agentów. Zatwierdzona makieta (wzór 1:1) powstała w rozdziale 12. Brandbook, persony i ścieżka: Demo projektu landing page (UX).' },
      { type: 'heading', text: '💡 Zapamiętaj' },
      { type: 'quote', text: '**Cały dzień prowadził do jednego briefu.** Nie budowałeś strony „na czuja": Twój Second Brain złożył z brandbooka, makiety, person i ścieżki jedno polecenie, a agenci je wykonali. To sedno metody: gdy wiedza jest uporządkowana i połączona, **produkt daje się z niej wyprowadzić**, a nie wymyślić od zera. Podział na budowniczego i recenzenta sprawił, że strona jest nie tylko zbudowana, ale i sprawdzona.' },
      { type: 'heading', text: '⏭️ Co dalej' },
      { type: 'p', text: 'Masz **działającą, sprawdzoną stronę** w katalogu DEV, a jej stan zapisany w Second Brain. Zostało ją **pokazać światu**: w następnym rozdziale publikujemy stronę na żywo (GitHub → serwer → adres w internecie).' }
    ],
    checkpoints: [
      'Claude Code napisał prompt finalny (samowystarczalny brief) i zaingestował go do wiki.',
      'Webmaster ma dostęp do makiety — odczytuje ją z sejfu przez ścieżkę w prompcie finalnym (albo masz jej kopię w DEV).',
      'W DEV powstała działająca strona: webmaster odwzorował makietę, treść merytoryczna pochodzi z NotebookLM przez MCP.',
      'Recenzent UX zgłosił poprawki, a te ważne zostały wprowadzone.',
      'Wynik budowy jest zaingestowany z powrotem do sejfu.'
    ],
    prompts: [
      {
        label: 'Napisz prompt finalny do budowy strony',
        text: `Napisz „prompt finalny”: jedno kompletne polecenie, które w moim katalogu DEV
zleci moim agentom zbudowanie landing page. Zbierz kontekst z mojego sejfu:
zatwierdzoną makietę (wzór wyglądu 1:1), brandbook (kolory, typografia, ton,
etykieta CTA), ścieżkę użytkownika (kolejność sekcji) oraz persony. Prompt ma
polecić:
- webmasterowi: odwzoruj makietę 1:1 jako czysty, statyczny, responsywny HTML
  i CSS zgodny z brandbookiem; treść sekcji merytorycznych zaciągnij z mojego
  notatnika NotebookLM przez MCP; przygotuj stronę do publikacji,
- recenzentowi UX: sprawdź gotową stronę wg person, ścieżki użytkownika oraz
  dostępności (WCAG) i zgłoś konkretne poprawki.
WAŻNE: wpisz do promptu finalnego konkretne wartości (kolory HEX, fonty,
etykietę CTA, kolejność sekcji), żeby był samowystarczalny, a dodatkowo podaj
w nim pełną, systemową ścieżkę tego sejfu jako źródło tylko do odczytu (stąd
webmaster odczyta makietę i dobierze szczegóły, ale nic tu nie kopiuje ani nie
zmienia). Podaj gotowy prompt finalny do skopiowania, a następnie zapisz go
do sejfu i zaingestuj jako stronę „jak budujemy stronę”.`
      },
      {
        label: 'Zaingestuj efekt budowy strony',
        text: `Zrób ingest efektu budowy strony: utwórz w Wiki/ stronę „stan landing page”
(co zbudowano, jakie sekcje, które treści pochodzą z NotebookLM, co zalecił
recenzent UX i co poprawiono). Połącz ją odnośnikami [[…]] ze stroną projektu,
brandbookiem i zatwierdzoną makietą. Zaktualizuj Indeks.md i Dziennik.md.`
      }
    ]
  },
  {
    id: '15',
    title: 'Publikacja: strona na żywo (GitHub Pages)',
    time: '15:45–15:55',
    mode: 'pokaz (prowadzący pokazuje, Ty obserwujesz i rozumiesz, żeby móc powtórzyć samodzielnie)',
    content: [
      { type: 'heading', text: '🎯 Ważne' },
      { type: 'p', text: 'Strona już istnieje, ale mieszka tylko na jednym dysku, w katalogu DEV. Publikacja to ostatni krok, który zamienia ją w **namacalny dowód**: adres w internecie, który można otworzyć na dowolnym urządzeniu i wysłać komukolwiek. To jest ta „żywa strona" z celu dnia.' },
      { type: 'p', text: 'Publikujemy przez **GitHub Pages**, bo to najszybsza droga „na żywo": nie potrzebujesz własnego serwera, a stronę statyczną (dokładnie taką jak nasza) GitHub udostępni za darmo pod gotowym adresem. Prowadzący pokazuje to na ekranie, a Ty masz niżej wszystkie kroki, żeby powtórzyć u siebie.' },
      { type: 'heading', text: '🛠️ Co robimy' },
      { type: 'p', text: 'Publikacja przez GitHub Pages opiera się na dwóch pojęciach. Warto je rozumieć, bo to one, nie konkretne komendy, przenoszą się na każdy przyszły projekt.' },
      { type: 'p', text: '**1. GitHub — magazyn i serwer strony (skąd i gdzie).** Strona z rozdziału 14 to zwykłe pliki statyczne (HTML i CSS). Najpierw trafiają pod **kontrolę wersji** (Git) i lądują w **repozytorium na GitHubie** — zdalnym magazynie w chmurze, z jednym źródłem prawdy zamiast lokalnej kopii na jednym komputerze. Po włączeniu **GitHub Pages** ten sam GitHub zaczyna te pliki **serwować**: gdy ktoś wejdzie na adres, dostaje Twoją stronę. Jeden GitHub pełni więc dwie role naraz, magazynu kodu i serwera WWW.' },
      { type: 'callout', kind: 'info', title: 'To ten sam sposób myślenia, co w sejfie', text: 'Kontrola wersji nie jest nowym pomysłem tego bloku. Twój sejf też jest wersjonowany na dysku, a każdy ingest to zapisana zmiana. Tu stosujesz tę samą zasadę do strony: historia zmian plus kopia poza jednym urządzeniem.' },
      { type: 'p', text: '**2. Adres — pod którym strona żyje (jak się tam dostać).** GitHub Pages nadaje stronie automatyczny adres w domenie `[github.io](https://github.io)`. Ktokolwiek go wpisze, trafia na Twoją stronę i w tym momencie jest ona **live** — prowadzący otwiera adres na telefonie i na ekranie widać ten sam, opublikowany produkt. Własną domenę, na przykład `mojastrona.pl`, można podpiąć później, ale to opcja, a nie warunek.' },
      { type: 'callout', kind: 'info', title: 'Cały łańcuch w jednym zdaniu', text: 'Pliki z DEV → **GitHub** (magazyn) → **GitHub Pages** (serwer) → **adres** `[github.io](https://github.io)` → strona otwiera się pod adresem w internecie.' },
      { type: 'callout', kind: 'tip', title: 'Publikacja krok po kroku (GitHub Pages)', text: 'Tę drogę pokazuje prowadzący, a Ty powtórzysz ją u siebie. Statyczne pliki (dokładnie takie jak nasze) GitHub Pages udostępni **za darmo** pod gotowym adresem: (1) załóż na GitHubie **puste repozytorium** na stronę; (2) w Claude Code (w katalogu DEV) poproś o wysłanie strony do tego repo, zadbaj, żeby w **korzeniu repo** znalazł się plik `index.html`; (3) ustaw repo jako **publiczne** (Settings → General → sekcja „Danger Zone" → Change visibility → Make public), bo darmowe Pages działa tylko dla repozytoriów publicznych; (4) włącz publikację: Settings → Pages → Source: Deploy from a branch → gałąź main → folder / (root) → Save; (5) po chwili odśwież stronę Pages i skopiuj adres w domenie `[github.io](https://github.io)`. Przykład z pokazu: repozytorium `jtomeczek-dev/landing-ux` publikuje się pod adresem [https://jtomeczek-dev.github.io/landing-ux/](https://jtomeczek-dev.github.io/landing-ux/). Jeszcze prościej, przez Netlify ([netlify.com](https://netlify.com)): wchodzisz na [app.netlify.com/drop](https://app.netlify.com/drop) i przeciągasz folder ze stroną prosto w okno przeglądarki (albo podłączasz repo z GitHuba), a hosting stawia ją sam i od razu daje adres, bez żadnych ustawień serwera. Wszystko dzieje się w przeglądarce, tak samo na Windows i macOS. Różnica względem VPS: mniej kontroli, za to zero konfiguracji serwera. Do landing page zbudowanej dziś to najszybsza droga „na żywo" o własnych siłach.' },
      { type: 'heading', text: '📋 Do użycia' },
      { type: 'p', text: 'Pliki do publikacji to gotowa strona z rozdziału 14 (katalog DEV). Konto GitHub (z checklisty) — na repozytorium strony i włączenie Pages. Hosting: GitHub Pages (główny) albo Netlify jako jeszcze prostsza alternatywa.' },
      { type: 'heading', text: '💡 Zapamiętaj' },
      { type: 'quote', text: '**Publikacja to przenosiny, nie tworzenie.** Cała praca została wykonana wcześniej, w Twoim Second Brain i w budowie strony. Dziś gotowy produkt zostaje tylko przeniesiony tam, gdzie widzą go inni. Warto zapamiętać sam łańcuch (skąd → gdzie → jak), bo powtórzysz go dla każdej kolejnej strony, a do prostej strony statycznej nie potrzeba nawet serwera: wystarczy hosting zarządzany.' },
      { type: 'heading', text: '⏭️ Co dalej' },
      { type: 'p', text: 'Strona jest **live** — cel dnia został osiągnięty. Ale landing page to tylko dowód, a nie sedno. W ostatnim rozdziale domykamy dzień: co tak naprawdę zabierasz ze sobą i jak dbać o swój Second Brain po warsztacie.' }
    ],
    checkpoints: [
      'Rozumiesz łańcuch publikacji: GitHub (magazyn kodu i, po włączeniu Pages, serwer) → adres `github.io` (żywa strona).',
      'Strona została pokazana pod prawdziwym adresem, na innym urządzeniu niż to, na którym powstała.',
      'Wiesz, że własną statyczną stronę opublikujesz samodzielnie i za darmo hostingiem zarządzanym (GitHub Pages / Netlify), bez stawiania serwera.'
    ],
    prompts: []
  },
  {
    id: '16',
    title: 'Domknięcie i co dalej',
    time: '15:55–16:00',
    mode: 'wspólnie (rozmowa i Q&A)',
    content: [
      { type: 'heading', text: '🎯 Ważne' },
      { type: 'p', text: 'Masz opublikowaną stronę i to jest dowód, ale nie nagroda. Prawdziwą nagrodą jest **metoda** i **Second Brain**, który dziś powstał i który zabierasz ze sobą. Landing page pokazała, że wiedza uporządkowana ze wsparciem AI daje się zamienić w produkt. Od jutra ta sama wiedza pomoże Ci pisać, decydować i tworzyć **każdą kolejną rzecz**, nie tylko stronę.' },
      { type: 'p', text: 'Warto to powiedzieć wprost, bo łatwo zapamiętać dzień jako „zrobiliśmy stronę". Zrobiliśmy coś trwalszego: **sposób pracy z własną wiedzą**. Strona zniknie albo się zmieni, sposób pracy zostaje.' },
      { type: 'heading', text: '🛠️ Co zabierasz ze sobą' },
      { type: 'p', text: 'Przez cały dzień wracały **trzy nawyki** zapowiedziane w rozdziale 01. To one, a nie konkretne narzędzia, są sednem metody i to je warto stosować dalej:' },
      { type: 'ul', items: [
        '**„Kończę pracę".** Każdą sesję domykaj SESSION-CLOSE: to, co ustalone, przenieś z ulotnej rozmowy do trwałej pamięci Second Brain. Ten nawyk pojawił się już przed lunchem w rozdziale 10. Dzięki temu następnym razem zaczynasz od miejsca, w którym praca się urwała, a nie od zera.',
        '**Raport i ingest.** Nowa wiedza nie ląduje luzem, tylko wraca do sejfu jako **strona połączona odnośnikami** z resztą. Tak z notatek robi się sieć, a nie sterta plików. To była każda operacja „ingest" tego dnia.',
        '**Wiedza oddzielona od kodu.** Wiedza mieszka w Second Brain (Obsidian), a kod strony powstaje w osobnym katalogu (DEV). Tak zbudowaliśmy stronę w rozdziałach 13–14: sejf napisał brief, agenci go wykonali.'
      ]},
      { type: 'p', text: 'Aby Second Brain żył, karm go dalej: co jakiś czas **ingest** nowego materiału (artykuł, notatka, transkrypcja) i domknięcie sesji. Kilka minut co jakiś czas wystarczy, żeby wiedza rosła jako połączona całość zamiast się rozsypywać.' },
      { type: 'callout', kind: 'success', title: 'Sprawdź, że dzień się domknął', text: 'Masz **żywą stronę pod adresem** (dowód) oraz **działający Second Brain** na własnym dysku: schemat `CLAUDE.md`, sejf z grafem wiedzy, podłączony NotebookLM i trzy nawyki, które go utrzymują. To jest komplet, który zabierasz z warsztatu.' },
      { type: 'heading', text: '📋 Do użycia' },
      { type: 'p', text: 'Trzy nawyki od strony metody (tam je pierwszy raz zapowiedzieliśmy): rozdz. 01 · Jak działa ta metoda. Cały dzień do powtórki: Spis treści podręcznika. Gotowce (prompty, checklisty) do wielokrotnego użytku: folder materiały. Ankieta końcowa uczestnika — kilka minut feedbacku, wypełniana tu albo po warsztacie.' },
      { type: 'heading', text: '💡 Zapamiętaj' },
      { type: 'quote', text: '**Wiedza jest Twoja; AI ją porządkuje.** To zdanie otwierało dzień i tym samym go zamyka. Ten dzień nie był o „obsłudze AI", tylko o **zarządzaniu własną wiedzą ze wsparciem AI**. Narzędzia będą się zmieniać, ta umiejętność zostaje z Tobą.' },
      { type: 'heading', text: '💬 Q&A' },
      { type: 'p', text: 'Pytania, wątpliwości, pomysły na własne zastosowania. Najlepszy moment, żeby zapytać o rzecz, którą chcesz zrobić u siebie, a nie wiesz jeszcze jak.' },
      { type: 'heading', text: '🎓 Na koniec' },
      { type: 'p', text: 'Dziękujemy za wspólny dzień. Wychodzisz z **żywą stroną** i **Second Brain**, który dopiero zaczyna pracować. Powodzenia w budowaniu dalej.' }
    ],
    checkpoints: [
      'Rozumiesz, że dowodem jest strona, a nagrodą metoda i Second Brain.',
      'Potrafisz nazwać trzy nawyki do domu: „kończę pracę”, raport i ingest, wiedza oddzielona od kodu.',
      'Wiesz, jak utrzymać Second Brain przy życiu: regularny ingest i domknięcie sesji.'
    ],
    prompts: []
  }
];

/* ==========================================================================
   Renderowanie treści bloku (content: nagłówki, akapity, listy, ramki, cytaty)
   ========================================================================== */

/* Parsuje **pogrubienia** oraz [tekst](url) w tekście i zwraca tablicę
   DOM-node'ów (tekst zwykły + <strong> + <a>), bez użycia innerHTML.
   Oba wzorce mogą występować razem, w dowolnej kolejności. */
function renderInline(text) {
  const str = String(text);
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes = [];
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(str)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(document.createTextNode(str.slice(lastIndex, match.index)));
    }
    if (match[1] !== undefined) {
      nodes.push(h('strong', null, match[1]));
    } else {
      /* Tekst linku może zawierać zagnieżdżone **pogrubienie**
         (np. `[**pierwsza decyzja**](#kotwica)`), więc parsujemy go
         rekurencyjnie zamiast wstawiać jako zwykły tekst. Kotwice
         wewnątrz strony (zaczynające się od `#`) otwieramy w tej samej
         karcie; adresy zewnętrzne — jak dotąd, w nowej karcie. */
      const url = match[3];
      const isInternalAnchor = url.startsWith('#');
      const linkAttrs = isInternalAnchor
        ? { href: url }
        : { href: url, target: '_blank', rel: 'noopener noreferrer' };
      nodes.push(h('a', linkAttrs, ...renderInline(match[2])));
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < str.length) {
    nodes.push(document.createTextNode(str.slice(lastIndex)));
  }
  return nodes;
}

const CALLOUT_EMOJI = {
  warning: '⚠️ ',
  tip: '💡 ',
  info: 'ℹ️ ',
  success: '✅ ',
  note: '📝 '
};

function renderContentNode(node) {
  switch (node.type) {
    case 'heading':
      return h('h3', { class: 'block-detail__section-heading' }, ...renderInline(node.text));
    case 'p':
      return h('p', { class: 'block-detail__p' }, ...renderInline(node.text));
    case 'ul':
    case 'ol': {
      const list = h(node.type, null);
      node.items.forEach((item) => {
        list.appendChild(h('li', null, ...renderInline(item)));
      });
      return list;
    }
    case 'callout': {
      const emoji = CALLOUT_EMOJI[node.kind] || '';
      const title = h('div', { class: 'callout__title' }, `${emoji}${node.title}`);
      const text = h('div', { class: 'callout__text' }, ...renderInline(node.text));
      return h('div', { class: `callout callout--${node.kind}` }, title, text);
    }
    case 'quote':
      return h('blockquote', { class: 'callout-quote' }, ...renderInline(node.text));
    default:
      return h('p', null);
  }
}

/* ==========================================================================
   Stan w localStorage
   ========================================================================== */

const STORAGE_KEY_DONE = 'akademia-postep';
const STORAGE_KEY_CHECKPOINTS = 'akademia-postep-checkpointy';

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* localStorage niedostępny (np. tryb prywatny) — po prostu nie zapisujemy */
  }
}

let doneState = loadJSON(STORAGE_KEY_DONE, {});
let checkpointState = loadJSON(STORAGE_KEY_CHECKPOINTS, {});

function isBlockDone(blockId) {
  return doneState[blockId] === true;
}

function setBlockDone(blockId, value) {
  doneState[blockId] = value;
  saveJSON(STORAGE_KEY_DONE, doneState);
  updateProgressBar();
}

function getCheckpointArray(block) {
  const arr = checkpointState[block.id];
  if (Array.isArray(arr) && arr.length === block.checkpoints.length) return arr;
  return block.checkpoints.map(() => false);
}

function setCheckpoint(block, index, value) {
  const arr = getCheckpointArray(block).slice();
  arr[index] = value;
  checkpointState[block.id] = arr;
  saveJSON(STORAGE_KEY_CHECKPOINTS, checkpointState);
}

/* ==========================================================================
   Wykrywanie aktualnego bloku wg godziny
   ========================================================================== */

function parseTimeRange(label) {
  const match = label.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const [, h1, m1, h2, m2] = match;
  const start = parseInt(h1, 10) * 60 + parseInt(m1, 10);
  const end = parseInt(h2, 10) * 60 + parseInt(m2, 10);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  return { start, end };
}

function isBlockCurrent(block) {
  const range = parseTimeRange(block.time);
  if (!range) return false;
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  return minutesNow >= range.start && minutesNow < range.end;
}

/* ==========================================================================
   Renderowanie: pasek postępu
   ========================================================================== */

function updateProgressBar() {
  const total = BLOCKS.length;
  const done = BLOCKS.filter((b) => isBlockDone(b.id)).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const textEl = document.getElementById('progress-text');
  const percentEl = document.getElementById('progress-percent');
  const fillEl = document.getElementById('progress-fill');
  const trackEl = document.getElementById('progress-track');

  if (textEl) textEl.textContent = `Ukończono ${done} z ${total} bloków`;
  if (percentEl) percentEl.textContent = `${percent}%`;
  if (fillEl) fillEl.style.width = `${percent}%`;
  if (trackEl) trackEl.setAttribute('aria-valuenow', String(done));
}

/* ==========================================================================
   Renderowanie: lista bloków
   ========================================================================== */

let selectedBlockId = null;

function renderBlockList() {
  const container = document.getElementById('block-list-items');
  if (!container) return;
  container.textContent = '';

  for (const block of BLOCKS) {
    const li = h('li', { class: buildBlockItemClasses(block) });

    const checkbox = h('input', {
      type: 'checkbox',
      class: 'block-item__checkbox',
      'aria-label': `Oznacz blok ${block.id} „${block.title}" jako ukończony`,
      onchange: (e) => {
        setBlockDone(block.id, e.target.checked);
        li.className = buildBlockItemClasses(block);
      }
    });
    checkbox.checked = isBlockDone(block.id);

    const num = h('span', { class: 'block-item__num' }, `Blok ${block.id}`);
    const title = h('span', { class: 'block-item__title' }, block.title);
    const time = h('span', { class: 'block-item__time' }, block.time);
    const mode = h('span', { class: 'block-item__mode' }, block.mode);
    const meta = h('span', { class: 'block-item__meta' }, time, mode);

    const buttonChildren = [num, title, meta];
    if (isBlockCurrent(block)) {
      buttonChildren.push(h('span', { class: 'block-item__current-tag' }, 'w toku'));
    }

    const button = h(
      'button',
      {
        type: 'button',
        class: 'block-item__button',
        'aria-label': `Otwórz szczegóły bloku ${block.id}: ${block.title}`,
        'aria-current': selectedBlockId === block.id ? 'true' : null,
        onclick: () => selectBlock(block.id, { focus: true })
      },
      ...buttonChildren
    );

    const row = h('div', { class: 'block-item__row' }, checkbox, button);
    li.appendChild(row);
    container.appendChild(li);
  }
}

function buildBlockItemClasses(block) {
  const classes = ['block-item'];
  if (isBlockCurrent(block)) classes.push('block-item--current');
  if (selectedBlockId === block.id) classes.push('block-item--selected');
  return classes.join(' ');
}

/* ==========================================================================
   Renderowanie: panel szczegółu bloku
   ========================================================================== */

function selectBlock(blockId, opts) {
  selectedBlockId = blockId;
  renderBlockList();
  renderBlockDetail(blockId);
  if (opts && opts.focus) {
    const detail = document.getElementById('block-detail');
    if (detail) {
      detail.focus();
      detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function renderBlockDetail(blockId) {
  const container = document.getElementById('block-detail');
  if (!container) return;
  container.textContent = '';

  const block = BLOCKS.find((b) => b.id === blockId);
  if (!block) {
    container.appendChild(
      h('p', { class: 'block-detail__placeholder' }, 'Wybierz blok z listy, żeby zobaczyć jego szczegóły, checkpointy i prompty do skopiowania.')
    );
    return;
  }

  container.appendChild(h('p', { class: 'block-detail__eyebrow' }, `Blok ${block.id}`));
  container.appendChild(h('h2', { class: 'block-detail__title' }, block.title));
  container.appendChild(
    h('p', { class: 'block-detail__meta' }, `${block.time} · ${block.mode}`)
  );
  block.content.forEach((node) => {
    container.appendChild(renderContentNode(node));
  });

  const checkpointArr = getCheckpointArray(block);
  if (block.checkpoints.length > 0) {
    const list = h('ul', { class: 'checkpoints' });
    block.checkpoints.forEach((text, index) => {
      const inputId = `checkpoint-${block.id}-${index}`;
      const checkbox = h('input', {
        type: 'checkbox',
        class: 'checkpoints__checkbox',
        id: inputId,
        onchange: (e) => setCheckpoint(block, index, e.target.checked)
      });
      checkbox.checked = checkpointArr[index] === true;
      const label = h('label', { class: 'checkpoints__label', for: inputId }, text);
      list.appendChild(h('li', { class: 'checkpoints__item' }, checkbox, label));
    });
    container.appendChild(list);
  } else {
    container.appendChild(
      h('p', { class: 'checkpoints__empty' }, 'Ten blok nie ma checkpointów do zaznaczenia.')
    );
  }

  if (block.prompts.length > 0) {
    block.prompts.forEach((prompt, index) => {
      container.appendChild(renderPromptCard(block, prompt, index));
    });
  } else {
    container.appendChild(
      h('p', { class: 'no-prompts-note' }, 'Ten blok nie ma promptu do skopiowania.')
    );
  }
}

function renderPromptCard(block, prompt, index) {
  const anchorId = `blok-${block.id}-prompt-${index + 1}`;
  const card = h('div', { class: 'prompt-card', id: anchorId });

  const label = h('span', { class: 'prompt-card__label' }, prompt.label);
  const COPY_LABEL_DEFAULT = 'Kopiuj';
  const COPY_ARIA_DEFAULT = `Kopiuj prompt: ${prompt.label}`;
  const copyBtn = h('button', {
    type: 'button',
    class: 'btn btn--copy',
    'aria-label': COPY_ARIA_DEFAULT
  }, COPY_LABEL_DEFAULT);
  const copyStatus = h('span', { class: 'sr-only', role: 'status', 'aria-live': 'polite' });
  let resetTimeoutId = null;

  copyBtn.addEventListener('click', () => {
    if (resetTimeoutId !== null) {
      clearTimeout(resetTimeoutId);
      resetTimeoutId = null;
    }
    /* Feedback na przycisku jest SYNCHRONICZNY i następuje natychmiast po
       kliknięciu — nie czeka na rozstrzygnięcie navigator.clipboard.writeText().
       Ta obietnica potrafi w niektórych warunkach przeglądarki (np. utrata
       fokusu dokumentu w momencie kliknięcia) nigdy się nie rozstrzygnąć —
       ani nie zwrócić błędu, ani go nie rzucić — więc uzależnianie od niej
       widocznej zmiany etykiety robiło ją niewiarygodną. Samo kopiowanie do
       schowka wykonujemy w tle, najlepszym możliwym wysiłkiem; użytkownik
       zawsze widzi potwierdzenie, niezależnie od wyniku operacji schowka. */
    copyBtn.textContent = 'Skopiowano ✓';
    copyBtn.setAttribute('data-copied', 'true');
    copyBtn.setAttribute('aria-label', `Skopiowano prompt: ${prompt.label}`);
    copyStatus.textContent = `Skopiowano prompt do schowka: ${prompt.label}`;
    resetTimeoutId = setTimeout(() => {
      copyBtn.textContent = COPY_LABEL_DEFAULT;
      copyBtn.removeAttribute('data-copied');
      copyBtn.setAttribute('aria-label', COPY_ARIA_DEFAULT);
      copyStatus.textContent = '';
      resetTimeoutId = null;
    }, 1500);
    copyToClipboard(prompt.text).catch(() => {
      /* Kopiowanie w tle się nie powiodło — feedback na przycisku i tak
         już się pokazał, więc nie ma tu nic więcej do zrobienia. */
    });
  });

  const header = h('div', { class: 'prompt-card__header' }, label, copyBtn, copyStatus);
  const pre = h('pre', { class: 'prompt-card__code' }, h('code', null, prompt.text));

  card.appendChild(header);
  card.appendChild(pre);
  return card;
}

function copyToClipboard(text) {
  if (!(navigator.clipboard && navigator.clipboard.writeText)) {
    return fallbackCopy(text);
  }
  /* Niektóre przeglądarki/konteksty (np. brak trwałego uprawnienia
     clipboard-write albo utrata fokusu dokumentu) potrafią pozostawić tę
     obietnicę wiszącą bez rozstrzygnięcia — ani sukces, ani błąd. Wyścig
     z krótkim limitem czasu gwarantuje, że ta funkcja się rozstrzygnie
     i w razie potrzeby przełączy na zapasowe kopiowanie przez zaznaczenie
     tekstu (execCommand). Uwaga: to NIE jest już mechanizm odpowiedzialny
     za widoczny feedback na przycisku — ten jest synchroniczny i ustawiany
     w handlerze kliknięcia niezależnie od wyniku tej funkcji. */
  const viaClipboardApi = navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  const timeoutFallback = new Promise((resolve) => setTimeout(() => resolve(false), 800));
  return Promise.race([viaClipboardApi, timeoutFallback]).then((succeeded) => {
    if (!succeeded) return fallbackCopy(text);
  });
}

function fallbackCopy(text) {
  return new Promise((resolve) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      /* nic nie robimy — kopiowanie po prostu się nie uda */
    }
    document.body.removeChild(textarea);
    resolve();
  });
}

/* ==========================================================================
   Obsługa location.hash przy starcie
   ========================================================================== */

function handleInitialHash() {
  const hash = location.hash.replace(/^#/, '');
  if (!hash) return;

  const promptMatch = hash.match(/^blok-(\d{2})-prompt-(\d+)$/);
  if (promptMatch) {
    const blockId = promptMatch[1];
    if (BLOCKS.some((b) => b.id === blockId)) {
      selectBlock(blockId);
      requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    return;
  }

  const blockMatch = hash.match(/^blok-(\d{2})$/);
  if (blockMatch) {
    const blockId = blockMatch[1];
    if (BLOCKS.some((b) => b.id === blockId)) {
      selectBlock(blockId, { focus: true });
    }
  }
}

/* ==========================================================================
   Inicjalizacja
   ========================================================================== */

function renderAppVersion() {
  const el = document.getElementById('app-version');
  if (el) el.textContent = `wersja ${APP_VERSION}`;
}

function init() {
  renderBlockList();
  updateProgressBar();
  handleInitialHash();
  renderAppVersion();
}

document.addEventListener('DOMContentLoaded', init);
