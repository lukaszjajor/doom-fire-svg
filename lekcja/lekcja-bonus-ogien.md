# Lekcja bonusowa. Ogień

*Efekt z 1995 roku przeniesiony na filtry SVG — i co się po drodze psuje*

Ta lekcja jest poza numeracją i poza obowiązkiem. Nie potrzebujesz jej do niczego praktycznego. Jest tu po to, żeby pokazać, jak daleko sięga sufit tego formatu, kiedy przestać traktować go jak sposób zapisu ikon.

Korzysta z trzech rzeczy omówionych wcześniej w [kursie SVG](https://ifox.pl/kurs-svg/) — filtrów, animacji i sanityzacji — ale da się ją czytać bez nich. Wszystko, co potrzebne, tłumaczę po drodze.

Zrobimy ogień. Najpierw tak, jak robiono go trzydzieści lat temu, a potem jeszcze raz — bez ani jednej linijki JavaScriptu.

## Skąd to jest

Wersja, którą większość ludzi kojarzy, pochodzi z portu **DOOM-a na PlayStation** i z **DOOM 64**, nie z pecetowego oryginału z 1993 roku. Zespół portujący uporał się z robotą na tyle sprawnie, że został mu zapas mocy procesora. Przeznaczono go na animowany ogień w intrze i w tle rozgrywki — czyli na rzecz zupełnie niepotrzebną, zrobioną dlatego, że było z czego.

Kod odtworzył z asemblera wersji na Nintendo 64 [Samuel Villarreal](https://codepen.io/svkaiser/pen/xXmOvY), programista znany z portów i rekonstrukcji starych silników, a [Fabien Sanglard opisał go w 2018 roku](https://fabiensanglard.net/doom_fire_psx/). Sam Sanglard nazywa efekt klasykiem demosceny i stawia obok fal na wodzie — drugiej wprawki, którą w latach 90. pisał chyba każdy, kto zaczynał z grafiką.

Jeden szczegół dobrze mówi o epoce. Ogień w wersji PSX liczony jest na pasku szerokim na **32 teksele** — i tylko tyle naprawdę kosztuje procesor. Przy rysowaniu układ graficzny rozciąga ten pasek dwukrotnie, więc na ekranie zajmuje 64 piksele, a potem odbija go **cztery razy obok siebie**. Cztery kafle po 64 piksele dają 256 pikseli, czyli całą szerokość ekranu.

Warto rozdzielić te dwa kroki, bo łatwo je pomylić: dwójka bierze się z rozciągania, czwórka z powielania. Ogień powtarza się więc na ekranie czterokrotnie — ten sam wzór, ten sam układ języków. Teoretycznie da się to wypatrzeć, praktycznie nie, bo wzór zmienia się co klatkę, a płomień nie ma stałych punktów, o które oko mogłoby zaczepić. W zamian liczysz jedną ósmą tego, co widzisz.

> **Teksel a piksel.** Piksel to element ekranu. Teksel to element tekstury, czyli obrazka, który dopiero ma zostać gdzieś narysowany. Nazwa powstała przez analogię — *picture element* dało *pixel*, więc *texture element* dało *texel*.
>
> Rozróżnienie przydaje się, bo jedno rzadko odpowiada drugiemu jeden do jednego. Tekstury się rozciąga, ściska i obraca, więc trzeba umieć powiedzieć, czy mówi się o punkcie w źródle, czy o punkcie na ekranie. Tutaj pasek ma 32 teksele szerokości, a zajmuje 64 piksele — jeden teksel przypada na dwa sąsiednie piksele. Ponieważ nie ma żadnego wygładzania, oba dostają identyczny kolor i obraz jest schodkowy. Ogniowi akurat to nie szkodzi; schodki dodają mu ziarna.

## Rzecz, od której wszystko zależy: liczba to temperatura

Zanim pojawi się jakikolwiek algorytm, trzeba przestawić jedno założenie. Bufor, w którym powstaje ogień, **nie jest obrazkiem**. To mapa ciepła.

Wyobraź sobie blachę rozgrzewaną od dołu palnikiem i termometr przyłożony do każdego jej punktu. Zapisujesz odczyty w tablicy — po jednej liczbie na punkt. Ta tablica nie ma kolorów. Ma temperatury.

W wersji DOOM-owej zakres to 0–36. **Zero oznacza zimno**, czyli brak energii. **Trzydzieści sześć oznacza maksymalny żar.** Cała siła efektu bierze się stąd, że te dwie skrajności mają naturalne odpowiedniki w świecie: rozgrzewany metal najpierw ciemnieje do czerwoności, potem robi się pomarańczowy, żółty, a w końcu biały. Im goręcej, tym jaśniej i tym bliżej bieli.

To nie jest konwencja graficzna, tylko fizyka — tak świeci każde gorące ciało. I dlatego paleta może być tak prosta: **czerń to brak energii, biel to jej nadmiar**, a wszystko po drodze to jedna skala, po której temperatura się przesuwa.

Kiedy to siedzi w głowie, reszta lekcji staje się oczywista. „Chłodzenie" nie będzie już dziwnym odejmowaniem od losowej liczby, tylko dokładnie tym, czym jest: ubytkiem energii. A „paleta" nie będzie tabelą kolorów, tylko termometrem.

## Jak działa bufor

Dolny rząd tablicy to **palnik**. Wpisujesz w niego maksymalną wartość i nigdy jej nie liczysz — on po prostu jest gorący, bo taka jest umowa. To źródło energii dla całej reszty.

Wszystkie pozostałe rzędy liczysz od dołu do góry. Każdy piksel patrzy w dół, bierze energię od tego, co jest pod nim, i **traci po drodze jej część**. To jest cały mechanizm. Ciepło może wędrować wyłącznie w górę, bo nigdzie w kodzie nie ma instrukcji, która pozwalałaby mu iść w dół.

### Krok po kroku na jednej kolumnie

Weźmy pojedynczą pionową kolumnę pikseli i prześledźmy trzy klatki. Palnik jest na dole i ma stale wartość 36. Załóżmy na razie, że każdy piksel traci dokładnie 1 punkt.

Klatka pierwsza — tablica jest jeszcze pusta, więc wszędzie zero, poza palnikiem:

```
góra   0
       0
       0
       0
palnik 36
```

Klatka druga. Liczymy od dołu. Piksel bezpośrednio nad palnikiem bierze 36, traci 1, zostaje mu 35. Piksele wyżej biorą od zer, więc dalej mają zero:

```
góra   0
       0
       0
       35   ← wziął od palnika, stracił 1
palnik 36
```

Klatka trzecia. Ten sam ruch, tylko teraz jest już od kogo brać dwa poziomy wyżej:

```
góra   0
       0
       34   ← wziął 35, stracił 1
       35
palnik 36
```

Widzisz, co się dzieje? **Ciepło pełznie w górę o jeden rząd na klatkę**, gubiąc po punkcie na każdym kroku. Po kilkudziesięciu klatkach kolumna wygląda tak:

```
góra   0
       12
       24
       35
palnik 36
```

I to jest już płomień: gorąco na dole, chłodno u góry, a gdzieś po drodze temperatura spada do zera i ogień się kończy. **Kształt płomienia to nic innego jak wykres strat energii.**

Gdyby strat nie było — gdyby każdy piksel kopiował wartość bez odejmowania — ciepło doszłoby do samej góry z wartością 36 i cały ekran świeciłby jednolitą bielą. Chłodzenie nie jest ozdobnikiem. Bez niego nie ma ognia, jest lampa.

### Dlaczego to wygląda na ruch

W kolumnie powyżej nic fizycznie się nie przemieszcza. Każda klatka jest liczona od zera, na podstawie poprzedniej. Wrażenie ruchu bierze się stąd, że wartość, która w jednej klatce była w rzędzie piątym, w następnej pojawia się w czwartym. To taśmociąg, nie podróż cząstki.

Dlatego właśnie kolejność liczenia ma znaczenie i dlatego w oryginale nie trzeba było drugiej tablicy. Skoro liczysz od dołu do góry, to rząd, z którego czytasz, jest już policzony i nikt do niego nie wróci — możesz nadpisywać w miejscu. W czasach, gdy pamięci było 640 kB, takie oszczędności nie były sportem.

### Skąd biorą się języki

Gdyby wszystko odbywało się dokładnie tak, jak wyżej, ogień byłby równym gradientem: identycznym w każdej kolumnie, nieruchomym, nudnym. Sanglard pokazuje ten etap w swoim artykule i wygląda on dokładnie tak nieciekawie, jak brzmi.

Potrzebne są dwa zaburzenia i oba są losowe.

**Pierwsze: nierówne straty.** Zamiast odejmować zawsze 1, odejmujesz losowo 0 albo 1. Nagle sąsiednie kolumny stygną w różnym tempie, więc jedna sięga wyżej niż druga. Krawędź płomienia przestaje być linią, a robi się postrzępiona.

**Drugie: znoszenie w bok.** Ciepło nie trafia dokładnie nad siebie, tylko o jedno pole w lewo, nad siebie albo o jedno w prawo — też losowo. To sprawia, że gorące pasma nie rosną prosto jak słupki, tylko wiją się i zlewają ze sobą. Właśnie stąd biorą się języki.

W wersji DOOM-owej oba zaburzenia załatwia jedna losowa liczba i całość mieści się w trzech linijkach:

```js
function spreadFire(from) {
  var rand = Math.round(Math.random() * 3.0) & 3;
  var to   = from - FIRE_WIDTH - rand + 1;
  firePixels[to] = firePixels[from] - (rand & 1);
}
```

Rozłóżmy to na czynniki. `rand` to losowa liczba 0–3. `from - FIRE_WIDTH` to pole dokładnie nad źródłem, bo odjęcie szerokości ekranu cofa nas o jeden rząd w tablicy zapisanej liniowo. Dopisane `- rand + 1` przesuwa cel o jedno pole w lewo, zero albo... i tak dalej, czyli daje ten boczny znos. A `rand & 1` to sprawdzenie, czy losowa liczba jest nieparzysta — w połowie przypadków odejmuje 1, w połowie 0, czyli robi nierówne straty.

Jedna losowa liczba, dwa efekty. To jest właśnie ten rodzaj oszczędności, który wtedy był koniecznością, a dziś wygląda jak sztuczka magiczna.

### Druga rodzina: uśrednianie

Wariant demoscenowy, starszy i bardziej rozpowszechniony, robi to inaczej. Piksel nie kopiuje jednej wartości, tylko bierze **średnią z kilku sąsiadów** w rzędzie poniżej — zwykle z pola pod sobą oraz z pól po lewej i prawej.

Uśrednianie ma tę własność, że wygładza. Jeżeli jedna kolumna jest gorąca, a sąsiednia zimna, to po uśrednieniu obie zbliżają się do siebie. Losowość dalej wchodzi przez chłodzenie, ale jest natychmiast rozsmarowywana na sąsiadów. Efekt: języki są bardziej miękkie, spójniejsze, mniej ziarniste.

Krótko: **DOOM przesuwa energię, demoscena ją rozmazuje.** Wspólne mają to, że jedna i druga wersja pozwalają ciepłu iść wyłącznie w górę i obie zabierają mu po drodze część energii.

<div class="fire-demo-embed"></div>

> Przełącz między algorytmami i patrz na krawędzie płomienia. DOOM jest bardziej rwany, bo losowość działa tam na pojedynczych pikselach i nic jej nie uśrednia. Demoscena jest gładsza. Potem podkręć **chłodzenie** — płomień opada, bo energia kończy się niżej. To dosłownie ta sama liczba, którą odejmowaliśmy w kolumnie z liczbami.

### Paleta, czyli termometr

Zostaje ostatni krok: zamienić temperatury na kolory. To po prostu tablica — indeks wchodzi, kolor wychodzi. DOOM używał **trzydziestu siedmiu** kolorów, stąd zakres 0–36.

Dwie rzeczy w tej palecie są przemyślane.

Po pierwsze, mało kolorów to wybór, nie oszczędność. Przy trzydziestu siedmiu stopniach widać delikatne pasmowanie i to **dodaje płomieniowi ostrości**. Gładki gradient z 256 odcieni wygląda jak mgła — ładna, ale mało podobna do ognia.

Po drugie, odcienie nie są rozłożone równomiernie. Prawie połowa palety to droga od czerni do ciemnej czerwieni, a biel zajmuje kilka ostatnich pozycji. Wynika to wprost z chłodzenia: skoro energia szybko spada, to górna połowa płomienia żyje w niskich wartościach — i właśnie tam potrzeba najwięcej odcieni, żeby było co pokazywać. Gdyby paleta była równomierna, ogień byłby pomarańczowym słupem z żółtą czapką i niczym więcej.

Trzeci szczegół widać dopiero w oryginalnym kodzie. Najciemniejszy kolor palety to nie czysta czerń, tylko `0x070707` — ledwie odróżnialna od czerni szarość. Ogień nigdy nie stygnie do zera; nawet tam, gdzie już go nie ma, zostaje ślad. To drobiazg, ale dobrze pokazuje, że te trzydzieści siedem wartości ktoś dobierał ręcznie, a nie wygenerował wzorem.

## Ogień, który jest niebem

W oryginale bufor ma 64 piksele szerokości i **128 wysokości** — jest więc wyraźnie wyższy niż szerszy, co zupełnie nie pasuje do proporcji ekranu. Powód jest taki, że to wcale nie jest obraz. To **tekstura nieba**.

Żeby zrozumieć, czemu akurat niebo, trzeba wiedzieć, jak DOOM je rysuje — bo robi to inaczej, niż podpowiada intuicja. Niebo nie jest sufitem. Sektor dostaje specjalny sufit o nazwie `F_SKY1`, którego silnik **w ogóle nie rysuje**: traktuje go jak dziurę i w to miejsce wstawia teksturę nieba. Co więcej, rysuje ją kolumnami, jak ścianę, a nie jak powierzchnię poziomą — z górną krawędzią przyklejoną do górnej krawędzi okna. I robi to zawsze w **pełnej jasności**, z pominięciem całej matematyki oświetlenia i przyciemniania z odległością.

Z tych kilku faktów wynika naraz wszystko, co w tym efekcie wygląda na dziwne.

**Silnika nie trzeba było ruszać.** Niebo to zwykła tekstura pobierana z pamięci. Jeśli co klatkę nadpiszesz tę pamięć świeżo policzonym ogniem, renderer nawet nie zauważy — dalej robi dokładnie to samo, co przy każdej innej teksturze. Efekt wchodzi do gry bez jednej zmiany w kodzie rysującym.

**Paleta zostaje nietknięta.** Gdyby ogień był zwykłą powierzchnią, silnik przyciemniałby go zależnie od odległości i te trzydzieści siedem starannie dobranych kolorów zamieniłoby się w błoto. Niebo jest rysowane w pełnej jasności, więc paleta trafia na ekran dokładnie taka, jaka została zapisana. Efekt, który cały opiera się na palecie, dostał jedyne miejsce w silniku, gdzie paleta jest bezpieczna.

**Stąd też proporcje.** Tekstury nieba w DOOM-ie mają 128 jednostek wysokości. Bufor 64 × 128 nie jest więc dziwnym wyborem, tylko po prostu teksturą o wymaganym rozmiarze.

Zostaje orientacja, która na pierwszy rzut oka przeczy sama sobie. Palnik siedzi na dole bufora i ciepło idzie w górę — ale skoro to niebo, to patrzysz na nie **w górę**. Płomienie wypadają zatem przy dolnej krawędzi nieba, czyli **na linii horyzontu**, i liżą w stronę zenitu. To nie jest ognisko na ziemi, tylko płonący horyzont. Jak na piekło, trudno o lepszy pomysł.

> **Cztery, ale dwa razy z innego powodu.** W intrze pasek ognia jest rysowany cztery razy obok siebie, żeby wypełnić 256 pikseli ekranu. W rozgrywce tekstury nieba w DOOM-ie mają 256 jednostek szerokości i również powtarzają się czterokrotnie — tym razem dlatego, że tyle potrzeba na pełny obrót o 360 stopni wokół gracza. Ta sama liczba, dwa zupełnie niezwiązane powody. Łatwo je pomylić, więc warto je rozdzielić.

## Dlaczego tego nie ma w playgroundzie

Bo się nie da. I to jest najciekawsza rzecz w tej lekcji.

Playground kursu przepuszcza każdy wklejony kod przez sanityzator, zanim go wyrenderuje. Sanityzator usuwa `script`, `foreignObject`, `iframe`, `embed`, `object` oraz wszystkie atrybuty zaczynające się od `on`. Robi dokładnie to, o czym mówi lekcja [**Bezpieczeństwo**](https://ifox.pl/lekcja-19-bezpieczenstwo/) — traktuje SVG jak kod, bo SVG jest kodem.

Efekt buforowy potrzebuje pętli, która co klatkę przelicza całą tablicę. Pętla potrzebuje `script`. `script` leci do kosza. Koniec rozmowy.

To nie jest usterka do obejścia, tylko granica, która ma sens. Prowadzi za to do pytania znacznie ciekawszego niż jej obchodzenie: **czy ten sam efekt da się opisać deklaratywnie?** Nie „policzyć klatka po klatce", tylko „opisać, jak ma wyglądać, i pozwolić przeglądarce to animować".

Da się. Wychodzi inaczej i to „inaczej" też jest lekcją.

## Ten sam ogień, zero JavaScriptu

Cztery klocki z lekcji [**Filtry**](https://ifox.pl/lekcja-11-filtry/) składają się na komplet. Każdy zastępuje jeden element wersji buforowej:

| w buforze | w filtrze |
|---|---|
| temperatura spadająca z wysokością | pionowy gradient od bieli do czerni |
| losowość palnika i chłodzenia | `feTurbulence` |
| znoszenie w bok, rozmycie | `feDisplacementMap` |
| paleta 37 kolorów | `feComponentTransfer` |

Pierwszy wiersz jest kluczowy i wart zatrzymania. W buforze rozkład temperatur **powstawał** — klatka po klatce, w wyniku strat energii. W filtrze go po prostu **rysujemy**: biel na dole, czerń u góry, płynne przejście między nimi. To gotowy wynik chłodzenia, narysowany od razu, bez liczenia. Ta jedna zamiana wywraca całą filozofię efektu do góry nogami i jest powodem, dla którego reszta w ogóle się udaje.

Skoro mamy gotowy rozkład temperatur, brakuje tylko nieregularności. Tu wchodzą dwa pozostałe klocki.

`feTurbulence` generuje **szum Perlina** — chmurkę losowych, ale gładko zmieniających się wartości. To odpowiednik losowej liczby z pętli, tylko rozlany na cały obraz naraz.

> **Szum Perlina.** Zwykła funkcja losowa daje wartości niezależne od siebie: sąsiednie punkty mogą się różnić maksymalnie, więc wynik wygląda jak śnieg na starym telewizorze. W naturze tak nie jest — dwa punkty obok siebie mają zwykle podobną temperaturę, wysokość czy jasność.
>
> Ken Perlin wymyślił w 1983 roku, przy okazji efektów do filmu *Tron*, sposób na losowość, która **zmienia się płynnie**. W skrócie: losuje się wartości tylko w węzłach rzadkiej siatki, a wszystko pomiędzy wygładza się przejściem od węzła do węzła. Wynik wygląda jak chmury, dym albo żyłkowanie marmuru, a nie jak śnieg.
>
> Dokłada się do tego zwykle kilka warstw tego samego szumu, każda gęstsza i słabsza od poprzedniej. Te warstwy to **oktawy** — nazwa z muzyki, bo każda kolejna ma dwa razy wyższą częstotliwość. Jedna oktawa daje miękkie plamy, cztery dodają im drobnych szczegółów. W presecie odpowiada za to suwak `numOctaves`.

`feDisplacementMap` używa tej chmurki jako **mapy przesunięć**. Dla każdego piksela odczytuje z szumu dwie liczby: jedną decyduje, o ile przesunąć w poziomie, drugą — o ile w pionie. Gładki gradient rozpada się przez to na języki, bo różne jego fragmenty wędrują w różne strony.

Warto wiedzieć jedno: wartość **0,5 oznacza brak przesunięcia**. Mniej niż połowa przesuwa w jedną stronę, więcej — w drugą. Ta liczba wróci jeszcze w sekcji o pułapkach i będzie tam sprawcą kłopotu.

<div class="svgp-root" data-preset="ogien-ksztalt"></div>

> Zjedź **rozproszenie** do zera. Zostanie goły gradient — i to jest prawdziwa treść tego obrazka. Cały płomień to jeden prostokąt z gradientem, tylko odpowiednio wykrzywiony. Potem popatrz na dwie wartości `baseFrequency`: pierwsza dotyczy poziomu, druga pionu. W ogniu szum jest ponad trzykrotnie gęstszy w pionie, więc języki są wysokie i wąskie zamiast okrągłe.

Zostaje kolor — i tu trzeba uważać, bo w tym filtrze są **dwa miejsca z liczbami** i łatwo je pomylić.

### Gradient to temperatury, nie kolory

Pierwsze miejsce to `<stop>` w gradiencie:

```html
<stop offset="0"    stop-color="#ffffff"/>
<stop offset="0.20" stop-color="#bbbbbb"/>
<stop offset="0.56" stop-color="#333333"/>
<stop offset="0.92" stop-color="#000000"/>
```

Zwróć uwagę, że wszystkie są **szare**. To nie przypadek i nie tymczasowość. Ten gradient odpowiada dokładnie tablicy liczb z wersji buforowej: biel to maksimum energii, czerń to zero, a szarości pomiędzy to wszystko po drodze. `offset` mówi, na jakiej wysokości płomienia dana temperatura wypada.

Zmieniając te liczby, zmieniasz **kształt i zasięg** ognia, nie jego barwę. Przesuń `0.20` na `0.35` — płomień urośnie, bo jasne wartości sięgną wyżej. Ściągnij na `0.10` — opadnie, bo energia skończy się niżej. To ten sam suwak, którym w buforze było chłodzenie.

### Termometr to `feComponentTransfer`

Drugie miejsce to tabele przekształcenia:

```html
<feFuncR type="table" tableValues="0 0.16 0.63 0.9 1 1"/>
<feFuncG type="table" tableValues="0 0    0.08 0.43 0.86 1"/>
<feFuncB type="table" tableValues="0 0    0    0    0.24 1"/>
```

Każdy wiersz to jeden kanał koloru, a sześć liczb to sześć przystanków na drodze od najzimniejszego do najgorętszego. Filtr płynnie interpoluje między nimi, więc z osiemnastu liczb powstaje pełna, gładka paleta.

Przeczytaj je pionowo, kolumna po kolumnie, a zobaczysz drogę rozgrzewanego metalu. Pierwsza kolumna to `0 0 0` — czerń. Druga `0.16 0 0` — sama czerwień, bardzo ciemna. Czwarta `0.9 0.43 0` — pomarańcz. Piąta `1 0.86 0.24` — żółć. Ostatnia `1 1 1` — biel. **Czerwony rośnie pierwszy, zielony dogania go w połowie, niebieski budzi się na samym końcu** — i dlatego biel pojawia się dopiero na szczycie skali.

Trzy zasady rządzą tymi tabelami i wystarczą, żeby układać własne:

1. Wszystkie trzy kanały zaczynają się od zera, bo najzimniejszy punkt musi być czarny.
2. Wszystkie kończą się jedynką, jeśli chcesz, żeby najgorętszy punkt świecił bielą.
3. **Kanał, który rośnie najwcześniej, decyduje o barwie całości** — bo to on rządzi tą częścią skali, w której płomień spędza najwięcej czasu.

### Do wklejenia

Podmień wszystkie trzy wiersze naraz, a ten sam ogień zmieni żywioł:

**Lód** — najpierw budzi się niebieski, więc chłodna część skali jest granatowa, a szczyt lodowo błękitny:

```html
<feFuncR type="table" tableValues="0 0    0    0.12 0.50 1"/>
<feFuncG type="table" tableValues="0 0.03 0.22 0.62 0.90 1"/>
<feFuncB type="table" tableValues="0 0.20 0.55 0.90 1    1"/>
```

**Plazma** — niebieski i czerwony rosną razem, zielony zostaje z tyłu, więc środek skali jest fioletowy, a wyżej przechodzi w magentę:

```html
<feFuncR type="table" tableValues="0 0.18 0.52 0.85 1    1"/>
<feFuncG type="table" tableValues="0 0    0.06 0.22 0.68 1"/>
<feFuncB type="table" tableValues="0 0.30 0.70 0.95 1    1"/>
```

**Kwas** — zielony prowadzi od początku, czerwony dochodzi później, więc płomień jest jadowicie zielony z żółtym czubkiem:

```html
<feFuncR type="table" tableValues="0 0    0.06 0.35 0.78 1"/>
<feFuncG type="table" tableValues="0 0.05 0.24 0.58 0.88 1"/>
<feFuncB type="table" tableValues="0 0    0.02 0.08 0.40 1"/>
```

**Stary monitor** — wszystkie trzy kanały identyczne, czyli brak jakiejkolwiek barwy. Zobaczysz surowe temperatury, dokładnie takie, jakie wychodzą z mapy przesunięć:

```html
<feFuncR type="table" tableValues="0 0.2 0.4 0.6 0.8 1"/>
<feFuncG type="table" tableValues="0 0.2 0.4 0.6 0.8 1"/>
<feFuncB type="table" tableValues="0 0.2 0.4 0.6 0.8 1"/>
```

Ta ostatnia wersja jest najbardziej pouczająca. Pokazuje, że **kolor nie jest własnością ognia**, tylko warstwą nałożoną na koniec. Płomień w szarościach wygląda dokładnie tak samo pod względem ruchu i kształtu — po prostu nikt nie powiedział mu jeszcze, jak ma świecić.

Jeśli będziesz układać własne zestawy, jest jedna pułapka. Oko nie odbiera kanałów jednakowo: zielony wydaje się znacznie jaśniejszy od czerwonego przy tej samej wartości, a niebieski znacznie ciemniejszy. Paleta, w której zielony rośnie tak szybko jak czerwony w ogniu, da płomień wyraźnie większy i bardziej rozmyty, bo ciemny ogon zrobi się jasny za wcześnie. Trzy zestawy powyżej są pod tym kątem wyrównane — mają niemal identyczny rozkład jasności co ogień, więc zmieniają wyłącznie barwę, a kształt zostawiają w spokoju.

## Ruch bez skoku

Zostaje animacja. Naiwnie: przewijamy szum w górę przez `feOffset` z `animate`, poznanym w lekcji [**Trzy drogi animacji**](https://ifox.pl/lekcja-12-trzy-drogi-animacji/), żeby wzór płynął, tak jak płynęło ciepło w buforze.

Problem w tym, że szum nie jest okresowy. Po dojściu do końca skacze z powrotem na początek i widać wyraźne szarpnięcie.

Rozwiązanie jest stare jak demoscena: **dwa szumy zamiast jednego**. Oba przewijają się i oba skaczą, ale ich cykle są przesunięte o pół okresu. Wagi w miksie animujemy tak, żeby skok każdego z nich wypadał dokładnie w chwili, gdy jego waga wynosi zero. Widz nigdy nie widzi skoku, bo w tym momencie patrzy w całości na drugi szum.

Miksem zajmuje się `feComposite` w trybie `arithmetic`, który liczy `k2·A + k3·B`. Wystarczy animować `k2` i `k3` przeciwnymi trójkątami — jeden rośnie, gdy drugi opada.

> **Crossfade.** Termin z realizacji dźwięku i montażu obrazu: płynne przejście, w którym jedno źródło cichnie dokładnie w tym samym tempie, w jakim drugie narasta. Suma obu jest przez cały czas mniej więcej stała, więc słuchacz nie słyszy szwu między utworami, a widz nie widzi cięcia między ujęciami.
>
> Tutaj używamy go do czegoś podstępniejszego niż zwykłe przejście. Nie chodzi o to, żeby ładnie połączyć dwa obrazy, tylko o to, żeby **schować w zerowej głośności moment, w którym jedno ze źródeł się psuje**. Szum przewinięty do końca musi skoczyć na początek — więc planujemy ten skok na chwilę, w której jego waga wynosi zero i nikt na niego nie patrzy.
>
> Uczciwie: to ma swoją cenę. W połowie przejścia patrzysz na średnią dwóch niezależnych szumów, a średnia jest zawsze bardziej płaska niż składniki. Płomień na moment lekko się uspokaja. Można to kompensować, podbijając w tym samym rytmie siłę przesunięcia — albo uznać za oddech ognia i zostawić.

<div class="svgp-root" data-preset="ogien-pelny"></div>

> **Wiatr** to `skewX` z osią przesuniętą na wysokość palnika — dół stoi w miejscu, góra się pochyla, dokładnie jak w rzeczywistości, gdzie podstawa ognia jest osłonięta, a czubek znoszony. **Temperatura** przesuwa próg gradientu: wyżej znaczy, że wysokie wartości sięgają dalej, zanim wejdą w ciemny ogon. To ten sam efekt, który w buforze dawało słabsze chłodzenie.

Uczciwie o cenie. Wersja filtrowa wygląda gładziej, ale traci coś, co miał bufor. Tam każdy język miał własną historię — wyrastał z konkretnej dziury w palniku, rósł, słabł i gasł, a jego kształt w tej klatce zależał od poprzedniej. Tu wszystko jest jednym oddychającym polem szumu i po chwili oko wyłapuje, że to bliżej zorzy niż ognia. `feDisplacementMap` liczy każdą klatkę od nowa i nie pamięta poprzedniej. Automat komórkowy pamiętał — bo w istocie był samą pamięcią.

> **Automat komórkowy.** Tak nazywa się układ, w którym siatka komórek zmienia stan według jednej prostej reguły, a każda komórka patrzy wyłącznie na swoich najbliższych sąsiadów. Nikt nie zarządza całością, nie ma planu ani celu — jest tylko reguła powtarzana w kółko dla każdej komórki z osobna.
>
> Najbardziej znanym przykładem jest **Gra w życie** Johna Conwaya z 1970 roku, gdzie komórka żyje albo umiera zależnie od tego, ilu ma żywych sąsiadów. Z tej jednej zasady wyłaniają się struktury, które pełzają po planszy, pulsują albo produkują kolejne struktury — mimo że nigdzie nie zostały zaprogramowane.
>
> Nasz ogień jest dokładnie tym samym. Reguła brzmi „weź ciepło od sąsiadów poniżej i trochę go zgub", nikt nie rysuje żadnego płomienia, a płomień i tak powstaje. Kluczowa jest tu **pamięć**: każda klatka jest wyliczona z poprzedniej, więc język ognia może mieć ciągłość i historię. Filtr SVG tej ciągłości nie ma — dostaje szum i gradient, a poprzedniej klatki nigdy nie widział.

Innymi słowy: prostszy algorytm z 1995 roku jest bliżej fizyki niż wyrafinowany graf filtrów z 2026.

Nie jest to zresztą problem wyłącznie SVG. Gdy na forum ZDoom pytano, czy dałoby się odtworzyć ten ogień shaderem w GZDoom, odpowiedź brzmiała: nie bardzo, bo każda klatka modyfikuje poprzednią, a shader nie ma jak sięgnąć do wyniku wcześniejszego renderu. Dwadzieścia lat i zupełnie inna technologia, a ściana dokładnie ta sama. **Efekt, który żyje z pamięci, źle się czuje w systemach, które liczą wszystko od nowa.**

## Trzy pułapki, w które wpadłem

Ta część jest najbardziej praktyczna z całej lekcji, bo dotyczy rzeczy, których dokumentacja nie opisuje. Wszystkie trzy mają wspólne źródło: **region filtra**.

Filtr nie działa na całym płótnie, tylko na prostokątnym obszarze — domyślnie nieco większym niż obrys elementu. Poza tym obszarem nie ma nic. A konkretnie: jest **przezroczysta czerń**, która wchodzi do obliczeń jak każdy inny piksel i niczego o sobie nie mówi.

**Pułapka pierwsza: szum ucieka poza region.** Przewijasz szum w górę i po kilkunastu sekundach dolna część regionu jest już pusta, bo szum z niej wyjechał. Objaw jest podstępny: ostra pozioma linia wędrująca w górę, a pod nią gradient bez języków. Wygląda jak błąd animacji, jest błędem geometrii. Skoro szum jedzie w górę, nowy musi wchodzić od dołu — czyli region trzeba rozszerzyć **w dół**, nie w górę, choć intuicja podpowiada odwrotnie.

**Pułapka druga: mapa czyta pustkę.** Tam, gdzie `feDisplacementMap` odczytuje przezroczysty piksel, dostaje zera w obu kanałach. Pamiętasz, że 0,5 oznacza brak przesunięcia? Zero oznacza więc przesunięcie maksymalne w jedną stronę: `(0 − 0,5) × scale`. Przy `scale="90"` to równe 45 pikseli, i to dla wszystkich pikseli jednakowo. Objawem jest ciemny pasek przy krawędzi kadru i gradient bez kształtu, czego nijak nie da się powiązać z kodem, dopóki nie wiadomo, skąd bierze się akurat liczba 45.

**Pułapka trzecia: region rozpycha stronę.** `filterUnits="userSpaceOnUse"` pozwala podać region w liczbach bezwzględnych, a przy przewijanym szumie trzeba go zrobić bardzo wysokim. Jeśli SVG nie ma jawnie ustawionego przycięcia, przeglądarka liczy wysokość elementu razem z regionem i layout się rozjeżdża — tło wylewa się daleko poza kadr. Lekarstwo to `overflow: hidden` na samym `<svg>` plus `clipPath` na grupie z filtrem.

Wspólny morał jest ładny. W tablicy pikseli granice same się o siebie upominają: tablica jest skończona, a ty jawnie decydujesz, co dzieje się na brzegu. W filtrze SVG „poza obrazem" jest niewidzialne, przecieka do wyniku po cichu i **udaje zupełnie inny błąd**. Wszystkie trzy razy najpierw diagnozowałem coś innego, zanim doszedłem do regionu.

## Podsumowanie

- Efekt pochodzi z portów DOOM-a na PlayStation i Nintendo 64, nie z wersji pecetowej. Jest wariantem klasycznego triku demoscenowego.
- Bufor trzyma **temperatury, nie kolory**. Zero to zimno, maksimum to biały żar — bo tak świecą rozgrzane ciała.
- Kształt płomienia to wykres strat energii. Bez chłodzenia cały ekran byłby biały.
- Języki biorą się z dwóch losowych zaburzeń: nierównych strat i znoszenia w bok.
- Istnieją dwie rodziny algorytmu: DOOM-owa przesuwa energię, demoscenowa ją uśrednia i przez to wygładza.
- W grze ogień był **teksturą nieba** — bo niebo rysuje się jak ściana, w pełnej jasności i bez ingerencji w silnik. Stąd bufor 64 × 128 i płomienie na horyzoncie, nie na ziemi.
- W SVG to samo składa się z czterech klocków: gradient rysuje gotowy rozkład temperatur, `feTurbulence` daje losowość, `feDisplacementMap` kształt, `feComponentTransfer` paletę.
- Nieokresowy szum zapętla się przez crossfade dwóch kopii przesuniętych o pół cyklu.
- Większość błędów w filtrach to błędy regionu, nie efektu.

---

**Do wypróbowania:** w presecie **ogień · pełny** ustaw rozerwanie na minimum, a cykl na maksimum. Zobaczysz gradient falujący jak woda — ten sam graf filtrów, zupełnie inne wrażenie.

Potem spróbuj czegoś, czego w lekcji nie pokazałem: ułóż paletę, która **nie kończy się bielą**. Zamiast jedynek w ostatniej kolumnie wstaw na przykład `0.75 0.15 0.15` i patrz, co się stanie. Płomień straci rozgrzany rdzeń i zrobi się płaski, bo zniknie mu najgorętszy punkt — a to najlepszy dowód na to, że biel na szczycie skali nie jest ozdobą, tylko informacją o temperaturze.

---

## Źródła

- [Fabien Sanglard, *How DOOM fire was done*](https://fabiensanglard.net/doom_fire_psx/) — opis algorytmu z ilustracjami kolejnych etapów, od nudnego gradientu do gotowego płomienia. Punkt wyjścia dla tej lekcji.
- [Samuel Villarreal, *PSX Doom / Doom 64 Firesky*](https://codepen.io/svkaiser/pen/xXmOvY) — oryginalna rekonstrukcja z 2017 roku, przepisana wprost z asemblera Nintendo 64. Widać w niej pełną paletę 37 kolorów i bufor 64 × 128, a struktura pętli wciąż zdradza asemblerowy rodowód.
- [Fabien Sanglard, *DoomFirePSX*](https://github.com/fabiensanglard/DoomFirePSX) — wersja Villarreala posprzątana do czytelnego JavaScriptu. Dobra do czytania, jeśli oryginał wydaje się zbyt gęsty.
- [Fabien Sanglard, *The polygons of DOOM: PSX*](https://fabiensanglard.net/doom_psx/) — stąd pochodzi szczegół o pasku 32 tekseli rysowanym cztery razy w poprzek ekranu.
- [Doom Wiki: *Sky*](https://doomwiki.org/wiki/Sky) — jak silnik traktuje `F_SKY1` i dlaczego niebo rysowane jest jak ściana, a nie jak sufit.
- [Wątek na forum ZDoom o ogniu z PSX](https://forum.zdoom.org/viewtopic.php?t=63068) — próba przeniesienia efektu na shadery w GZDoom i wyjaśnienie, dlaczego to trudne.
- [MDN: `feTurbulence`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence) i [`feDisplacementMap`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap) — dokumentacja dwóch filtrów, na których stoi wersja SVG.
