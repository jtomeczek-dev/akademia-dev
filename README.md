# akademia-dev

Statyczna, jednostronicowa strona narzędziowa dla uczestników mojego
prawdziwego, jednodniowego warsztatu **„drugi mózg z AI"** (JT CONSULTING,
marka AI for Everyone). Warsztat odbywa się **10.07.2026**. Jestem jego
jedynym autorem i prowadzącym.

**Strona działa pod adresem:**
[https://jtomeczek-dev.github.io/akademia-dev/](https://jtomeczek-dev.github.io/akademia-dev/)
(GitHub Pages).

## Cel strony

Strona wspiera uczestnika warsztatu, pracującego samodzielnie na komputerze
w trakcie kursu. Dwie funkcje, bez logowania:

1. **Śledzenie postępu** przez program dnia (checkpointy kolejnych bloków).
2. **Biblioteka gotowych promptów** do skopiowania.

Jedno główne wezwanie do działania w nagłówku — przycisk „Skontaktuj się" —
prowadzi do kotwicy `#kontakt` na tej samej stronie, gdzie osadzony jest
formularz HubSpot (rejestracja do przyszłej wersji komercyjnej + opinia
o warsztacie).

## Hosting: GitHub Pages, nie VPS

Świadomie zrezygnowałem z wdrożenia na własnym serwerze (VPS). Strona jest
w pełni statyczna, więc nie ma powodu utrzymywać kontenera ani serwera:
GitHub Pages serwuje ją za darmo, bezpośrednio z tego repozytorium. Z tego
powodu w projekcie nie ma już `Dockerfile` ani `.dockerignore` — zostały
świadomie usunięte, gdy zapadła ta decyzja.

## Jak powstał kod

Kod tej strony napisałem przy wsparciu wyspecjalizowanych podagentów Claude
Code — narzędzi AI, a nie zespołu ludzi: webmastera (budowa strony),
recenzenta bezpieczeństwa, recenzenta UX/dostępności i recenzenta treści.
Każdy z nich pełni rolę wąsko wyspecjalizowanego narzędzia kontroli jakości,
uruchamianego przeze mnie w toku pracy nad projektem.

## Baza wiedzy (tylko do odczytu)

Cała wiedza o tym projekcie — treść kursu, brandbook, decyzje projektowe,
opis podagentów — znajduje się w moim sejfie Obsidian pod ścieżką:

```
/Users/juliusz/Obsidian/CyfrowySejf
```

To źródło jest **wyłącznie do odczytu**: z tego katalogu tylko się czyta, żeby
zrozumieć kontekst — nic się w nim nie zmienia, nie kasuje ani nie dopisuje.
Kod tego projektu żyje wyłącznie w tym folderze DEV. Ta zasada obowiązuje
też przy każdej przyszłej zmianie strony.

## Historia zmian

Zobacz [`CHANGELOG.md`](CHANGELOG.md).
