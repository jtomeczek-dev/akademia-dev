'use strict';

/* ==========================================================================
   Akademia — drugi mózg z AI
   Dane 17 bloków programu dnia + biblioteka promptów, śledzenie postępu
   w localStorage. Czysty vanilla JS, bez frameworka, bez backendu.
   ========================================================================== */

/* Wersja aplikacji (semver) — jedno miejsce do podbicia przy każdej zmianie.
   Wyświetlana w stopce strony i śledzona w CHANGELOG.md. */
const APP_VERSION = '1.2.0';

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
    desc: 'Warsztat jest intensywny i praktyczny — pracujesz na komputerze od pierwszej godziny. Piętnaście minut przygotowania oszczędza godzinę frustracji. Przygotuj sprzęt, konta i pomysł na temat swojego drugiego mózgu (albo idź gotową ścieżką UX).',
    checkpoints: [
      'Wchodzę do NotebookLM (konto Google) i widzę interfejs narzędzia.',
      'Wchodzę do aplikacji Claude, subskrypcja jest aktywna.',
      'Mam Obsidian lub jego instalator.',
      'Mam dodane rozszerzenie Web Clipper w przeglądarce.',
      'Mam temat drugiego mózgu albo wiem, że pójdę ścieżką UX.'
    ],
    prompts: []
  },
  {
    id: '01',
    title: 'Cel dnia i wybór tematu',
    time: '8:00–8:20',
    mode: 'wspólnie',
    desc: 'Warsztat uczy zarządzania własną wiedzą ze wsparciem AI, nie „obsługi AI”. Cel nadrzędny dnia to opublikowana landing page zbudowana z Twojego drugiego mózgu. Rytm dnia: poznaj → zbuduj → opublikuj, a trzy nawyki („kończę pracę”, raport i ingest, myślenie oddzielone od wykonania) wracają przez cały dzień.',
    checkpoints: [
      'Rozumiesz, że tematem kursu jest zarządzanie wiedzą, a nie „obsługa AI”.',
      'Wiesz, jaki jest cel nadrzędny dnia (opublikowana strona).',
      'Znasz rytm dnia (poznaj → zbuduj → opublikuj) i trzy nawyki, które zabierasz jako metodę.',
      'Masz wybrany temat drugiego mózgu albo świadomie idziesz ścieżką UX.'
    ],
    prompts: []
  },
  {
    id: '02',
    title: 'Projekt jako mentor',
    time: '8:20–9:05',
    mode: 'ćwiczenie praktyczne',
    desc: 'Zwykły czat zapomina wszystko po zamknięciu. Projekt w Claude ma trwały kontekst: instrukcje, wiedzę projektu (skills.md, persony.md) i pamięć. W tym kroku konfigurujesz Projekt jako stałego mentora, testujesz go pierwszą decyzją o landing page i domykasz sesję.',
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
    desc: 'NotebookLM to darmowe narzędzie Google — inteligentny notatnik, który staje się ekspertem wyłącznie od Twoich źródeł i cytuje je w odpowiedziach. Trzy elementy interfejsu: źródła, czat z cytowaniami, Studio i notatki. Zakładasz własny notatnik i dodajesz do niego kilka źródeł.',
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
    desc: 'Przechodzisz przez ustawienia konta Claude: personalizację, prywatność, kluczowe zdolności (Artifacts, generowanie pamięci, wykonywanie kodu w chmurze), limity, skille od Anthropic oraz parametry Claude Code (auto-zatwierdzanie zamiast trybu pomijania uprawnień, Preview tools). Ustawiasz raz, korzystasz cały dzień.',
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
    desc: 'Drugi mózg to zewnętrzny, zaufany magazyn wiedzy — zwykły folder ze zwykłymi plikami Markdown na Twoim komputerze, bez konta i bez wymuszonej chmury. Pracujesz wg modelu „LLM Wiki” Andreja Karpathy\'ego: AI stopniowo buduje i utrzymuje trwałą, połączoną wiki z Twoich materiałów. Instalujesz Obsidian i zakładasz pusty sejf w lokalnym folderze poza chmurą.',
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
    desc: 'Claude Code to agent uruchomiony na Twoim komputerze, z dostępem do folderu sejfu — czyta i tworzy pliki, łączy je odnośnikami, uruchamia narzędzia. Chat doradza, Code wykonuje. Otwierasz Claude Code na folderze swojego sejfu i włączasz tryb auto-zatwierdzania zmian na czas warsztatu (to nie to samo co ryzykowny „tryb pomijania uprawnień”).',
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
    desc: 'Dajesz Claude Code schemat (`CLAUDE.md`) i skille Obsidiana (kepano/obsidian-skills: Markdown, Bases, Canvas, obsługa sejfu, oczyszczanie stron WWW). Uzupełniasz szkielet `CLAUDE.md` o swoją dziedzinę, dostrajasz go razem z Claude Code i tworzysz strukturę folderów `Źródła/` i `Wiki/`.',
    checkpoints: [
      'W korzeniu sejfu jest plik `CLAUDE.md` z uzupełnionymi polami `<…>`.',
      'Istnieją foldery `Źródła/` oraz `Wiki/` (z podfolderami koncepcje / encje / analizy).',
      'Claude Code po przeczytaniu `CLAUDE.md` potrafi własnymi słowami powiedzieć, jak ma utrzymywać Twój sejf.',
      'Skille Obsidiana są zainstalowane i Claude Code je widzi.'
    ],
    prompts: [
      {
        label: 'Szkielet do skopiowania — CLAUDE.md',
        text: `# <NAZWA-SEJFU> — mój drugi mózg (metoda Karpathy'ego)

To jest **schemat** sterujący agentem LLM (Claude Code), który utrzymuje ten sejf.
Agent czyta ten plik na początku każdej sesji.

## Po co istnieje ten sejf
Ten sejf to mój **drugi mózg** w dziedzinie: **<TWOJA-DZIEDZINA>**.
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
        text: `Przeczytaj plik CLAUDE.md w tym sejfie. To schemat mojego drugiego mózgu
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
    desc: 'Wrzucasz pierwszy materiał do sejfu i uruchamiasz pierwszy ingest: migrujesz instrukcje, pamięć projektu, `skills.md`, `persony.md` i artefakt decyzji o landing page z bloku 02 do folderu `Źródła/`, a Claude Code zamienia je w połączoną wiki i aktualizuje `Indeks.md` oraz `Dziennik.md`. Na końcu oglądasz graf wiedzy.',
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
    desc: 'Uczysz się drugiego, codziennego źródła wiedzy: stron internetowych. Wtyczka Obsidian Web Clipper zapisuje stronę WWW jako czystą notatkę Markdown wprost do sejfu. Klipujesz strony kursu, a potem ingestujesz je tak samo jak w bloku 08.',
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
    desc: 'MCP (Model Context Protocol) to otwarty standard, dzięki któremu Claude łączy się z zewnętrznymi narzędziami, np. Twoimi notatnikami NotebookLM. Całą pracę instalacyjną wykonuje Claude Code; Twój jedyny ręczny krok to logowanie do Google. Po restarcie aplikacji testujesz most i domykasz przedpołudniową sesję rytuałem SESSION-CLOSE.',
    checkpoints: [
      '`nlm login` zakończył się sukcesem (jesteś na właściwym koncie Google).',
      'Wpis `notebooklm-mcp` jest w konfiguracji aplikacji Claude Desktop (z pełną ścieżką).',
      'Po restarcie aplikacji na prośbę „wylistuj notatniki” Claude zwraca Twoją listę.',
      'Wykonano pierwszy SESSION-CLOSE: pamięć drugiego mózgu jest zaktualizowana.'
    ],
    prompts: [
      {
        label: 'SESSION-CLOSE (domknięcie sesji pracy nad drugim mózgiem)',
        text: `Domknij tę sesję pracy nad moim drugim mózgiem (SESSION-CLOSE). Wykonaj w tle,
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
    desc: 'Brandbook to krótki zestaw wiążących decyzji o tym, jak marka wygląda i mówi: nazwa, ton głosu, CTA, kolory, typografia, „czego unikać”. Generujesz go z własnej wiedzy w sejfie i notatnika NotebookLM (przez MCP), a wynik wraca do drugiego mózgu przez ingest.',
    checkpoints: [
      'Rozumiesz, że brandbook to zestaw wiążących decyzji, a nie ozdoba.',
      'Masz brandbook z sześcioma elementami (nazwa, ton, CTA, kolory, typografia, „czego unikać”), wygenerowany z własnego sejfu albo wzięty z planu awaryjnego.',
      'Kolory mają kontrast min. 4,5:1 (do sprawdzenia narzędziem przed publikacją).',
      'Brandbook trafił do `Źródła/` i po ingeście istnieje jako strona w `Wiki/`, połączona ze stroną projektu.'
    ],
    prompts: [
      {
        label: 'Zbuduj brandbook z mojego drugiego mózgu',
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
    desc: 'Wireframe w tym kursie to makieta wysokiej wierności — wygląd jak najbliższy finalnej stronie, z kolorami i typografią z brandbooka. To wizualny kontrakt, który budowa strony (blok 14) ma odwzorować. Claude Code pisze brief, Claude Design rysuje makietę, sejf przyjmuje ją jako zatwierdzony wzorzec.',
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
    desc: 'Zakładasz osobny katalog DEV na kod strony, z dala od sejfu. W sejfie opisujesz dwóch agentów — webmastera (buduje stronę) i recenzenta UX (sprawdza ją przed publikacją) — a potem budujesz ich w katalogu DEV, reużywając gotowe skille i wtyczki tam, gdzie to możliwe.',
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
Dla każdego podaj: rolę, wejścia z mojego drugiego mózgu (skąd bierze makietę,
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
    desc: 'Wszystko, co zbudowałeś, zbiega się w jednej budowie: brandbook, zatwierdzona makieta, persony i ścieżka użytkownika oraz dwaj agenci. Claude Code pisze z Twojego drugiego mózgu jeden prompt finalny, a agenci budują z niego prawdziwą stronę w katalogu DEV, zaciągając treść merytoryczną z NotebookLM przez MCP. Wynik wraca do sejfu przez ingest.',
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
    desc: 'Publikacja zamienia stronę w namacalny dowód: adres w internecie, który można otworzyć na dowolnym urządzeniu. Łańcuch: pliki z DEV → GitHub (magazyn) → GitHub Pages (serwer) → adres github.io. Alternatywa: przeciągnięcie folderu strony na app.netlify.com/drop.',
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
    desc: 'Opublikowana strona jest dowodem, nie nagrodą — prawdziwą nagrodą jest metoda i drugi mózg, który dziś powstał. Trzy nawyki zabierasz do domu: „kończę pracę”, raport i ingest, myślenie oddzielone od wykonania. Drugi mózg żyje dalej dzięki regularnemu ingestowi i domykaniu sesji.',
    checkpoints: [
      'Rozumiesz, że dowodem jest strona, a nagrodą metoda i drugi mózg.',
      'Potrafisz nazwać trzy nawyki do domu: „kończę pracę”, raport i ingest, myślenie oddzielone od wykonania.',
      'Wiesz, jak utrzymać drugi mózg przy życiu: regularny ingest i domknięcie sesji.'
    ],
    prompts: []
  }
];

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
  container.appendChild(h('p', { class: 'block-detail__desc' }, block.desc));

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
