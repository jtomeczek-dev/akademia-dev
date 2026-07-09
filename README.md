# akademia-dev

Statyczna, jednostronicowa strona narzędziowa dla uczestników prawdziwego,
jednodniowego warsztatu **„drugi mózg z AI"** (JT CONSULTING, marka AI for
Everyone), warsztat odbywa się **10.07.2026**.

Docelowy adres: `akademia.aiforeveryone.com.pl`.

## Cel strony

Strona wspiera uczestnika warsztatu, pracującego samodzielnie na komputerze
w trakcie kursu. Dwie funkcje, bez logowania:

1. **Śledzenie postępu** przez program dnia (checkpointy kolejnych bloków).
2. **Biblioteka gotowych promptów** do skopiowania.

Jedno główne wezwanie do działania w nagłówku — przycisk „Skontaktuj się" —
prowadzi do kotwicy `#kontakt` na tej samej stronie, gdzie docelowo zostanie
osadzony prawdziwy formularz HubSpot (kod embed dojdzie w kroku budowy;
na razie w strukturze jest tylko zarezerwowane na niego miejsce, nic nie jest
jeszcze osadzone).

## Baza wiedzy (tylko do odczytu)

Cała wiedza o tym projekcie — treść kursu, brandbook, decyzje projektowe,
opis zespołu agentów — znajduje się w sejfie Obsidian pod ścieżką:

```
/Users/juliusz/Obsidian/CyfrowySejf
```

To źródło jest **wyłącznie do odczytu**: z tego katalogu tylko się czyta, żeby
zrozumieć kontekst — nic się w nim nie zmienia, nie kasuje ani nie dopisuje.
Kod tego projektu żyje wyłącznie w tym folderze DEV.

## Stan projektu i kolejne kroki

To jest **krok 0 — inicjacja**: sam README i pusty szkielet plików na kod,
bez treści.

Kolejne kroki (na wyraźne polecenie w osobnych promptach, nie teraz):

1. **Złożenie zespołu 4 agentów** (webmaster, recenzent bezpieczeństwa,
   recenzent UX/dostępności, recenzent treści) wraz z zasadą sourcingu
   skilli.
2. **Właściwa budowa strony** — treść, styl wg brandbooka, logika śledzenia
   postępu i biblioteki promptów, osadzenie prawdziwego formularza HubSpot
   w sekcji `#kontakt`.
