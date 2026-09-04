# Ogień w SVG

*[English version](README.md) — główny opis repozytorium jest po angielsku.*

Efekt ognia z portu DOOM-a na PlayStation i Doom 64, odtworzony **wyłącznie filtrami SVG i animacją SMIL**. Bez JavaScriptu, bez canvasu, bez ani jednej klatki obrazu. Gotowy plik waży nieco ponad 3 kB.

W repozytorium są dwie implementacje tego samego efektu — historyczna, oparta na buforze pikseli przeliczanym co klatkę, i deklaratywna, opisana w całości w SVG. Porównanie ich jest właściwym tematem tego materiału.

## Podgląd

Otwórz `index.html` w przeglądarce albo któryś z plików w `svg/` bezpośrednio — to samodzielne, animowane obrazki.

| plik | wariant |
|---|---|
| `svg/ogien.svg` | paleta oryginalna: czerń → czerwień → pomarańcz → żółć → biel |
| `svg/ogien-lod.svg` | lód — niebieski budzi się pierwszy |
| `svg/ogien-plazma.svg` | plazma — czerwony i niebieski rosną razem |
| `svg/ogien-kwas.svg` | kwas — zielony prowadzi od początku |

Wszystkie cztery mają **identyczny filtr i identyczną animację**. Różnią się osiemnastoma liczbami w `feComponentTransfer` — po sześć na kanał koloru.

## Zawartość

```
├── index.html                     strona z podglądem czterech wariantów
├── svg/                           samodzielne pliki SVG, gotowe do użycia
├── demo/index.html                wersja historyczna: bufor pikseli w JS,
│                                  z przełącznikiem DOOM ↔ demoscena
├── lekcja/lekcja-bonus-ogien.md   pełne wyjaśnienie, ok. 30 minut czytania
└── playground/                    presety do playgroundu kursu SVG na iFox.pl
```

## Jak to działa, w skrócie

Bufor w wersji historycznej nie trzyma kolorów, tylko **temperatury**. Dolny rząd to palnik o stałej wartości maksymalnej; każdy piksel wyżej bierze energię od pikseli pod sobą i część jej gubi. Kształt płomienia to po prostu wykres strat energii. Paleta zamienia temperatury na kolory na samym końcu.

Wersja na filtrach zastępuje każdy z tych elementów czymś deklaratywnym:

| bufor | filtr SVG |
|---|---|
| temperatura spadająca z wysokością | pionowy gradient od bieli do czerni |
| losowość palnika i chłodzenia | `feTurbulence` |
| znoszenie w bok, rozmycie | `feDisplacementMap` |
| paleta kolorów | `feComponentTransfer` |

Nieokresowy szum zapętla się przez crossfade dwóch kopii przesuniętych o pół cyklu, tak żeby skok każdej z nich wypadał w chwili, gdy jej waga wynosi zero.

Pełne wyprowadzenie, razem z trzema pułapkami regionu filtra, jest w [lekcji](lekcja/lekcja-bonus-ogien.md).

## Użycie

Pliki z `svg/` są samodzielne. Wstaw je jak każdy inny obrazek:

```html
<img src="ogien.svg" alt="Płomień" width="520" height="360">
```

Uwaga: w `<img>` animacja SMIL **działa**, ale skrypty nie — co akurat tutaj nie ma znaczenia, bo ich nie ma. Jeśli chcesz sterować efektem z zewnątrz (zmieniać paletę, wiatr, temperaturę), wklej SVG bezpośrednio do dokumentu zamiast ładować przez `<img>`.

Żeby zmienić kolor, podmień trzy wiersze `tableValues`. Żeby zmienić wysokość płomienia, przesuń `offset` drugiego `<stop>` w gradiencie — wyżej znaczy wyższy ogień.

## Kompatybilność

Wymaga obsługi animacji SMIL na elementach filtrujących. Działa w Chrome, Safari i Firefoksie. Nie działa w Internet Explorerze, którego i tak już nie ma.

Filtry są kosztowne obliczeniowo — cztery takie płomienie naraz obciążą słabszy sprzęt. Na produkcji rozważ jeden, a resztę jako statyczne obrazy.

## Pochodzenie

Efekt pochodzi z portów DOOM-a na PlayStation i Nintendo 64. Zespół portujący uporał się z pracą na tyle sprawnie, że został mu zapas mocy procesora, który przeznaczył na animowane niebo.

- [Fabien Sanglard, *How DOOM fire was done*](https://fabiensanglard.net/doom_fire_psx/) — opis algorytmu
- [Samuel Villarreal, *PSX Doom / Doom 64 Firesky*](https://codepen.io/svkaiser/pen/xXmOvY) — oryginalna rekonstrukcja z asemblera N64
- [Fabien Sanglard, *DoomFirePSX*](https://github.com/fabiensanglard/DoomFirePSX) — wersja posprzątana do czytelnego JS
- [Doom Wiki: *Sky*](https://doomwiki.org/wiki/Sky) — dlaczego ogień był teksturą nieba

Ta implementacja jest napisana od zera i nie zawiera żadnego kodu ani zasobów id Software.

## Powiązane

Materiał powstał jako lekcja bonusowa do [kursu SVG na iFox.pl](https://ifox.pl/kurs-svg/). Bezpośrednio nawiązuje do lekcji o [filtrach](https://ifox.pl/lekcja-11-filtry/), [animacji](https://ifox.pl/lekcja-12-trzy-drogi-animacji/) i [bezpieczeństwie](https://ifox.pl/lekcja-19-bezpieczenstwo/).

Katalog `playground/` zawiera presety do interaktywnego playgroundu kursu — przydatne tylko wtedy, gdy uruchamiasz ten playground u siebie.

## Licencja

MIT — patrz [LICENSE](LICENSE).
