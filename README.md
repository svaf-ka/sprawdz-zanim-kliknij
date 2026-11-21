<h1 align="center">🛡️ Sprawdź, zanim klikniesz</h1>

<p align="center">
  Sprawdzacz linków pod kątem phishingu i kalkulator czasu łamania hasła.<br>
  Działa w przeglądarce. Nic, co wpiszesz, nie jest nigdzie wysyłane.
</p>

<p align="center">
  <a href="https://svaf-ka.github.io/sprawdz-zanim-kliknij/"><img alt="Demo online" src="https://img.shields.io/badge/demo-online-2ea44f?style=for-the-badge"></a>
</p>

<p align="center">
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-e34f26?logo=html5&logoColor=white">
  <img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572b6?logo=css3&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-f7df1e?logo=javascript&logoColor=black">
  <img alt="Bez zależności" src="https://img.shields.io/badge/zależności-brak-informational">
</p>

---

## Spis treści

- [Dlaczego to powstało](#dlaczego-to-powstało)
- [Funkcje](#funkcje)
- [Jak działa ocena linku](#jak-działa-ocena-linku)
- [Jak działa kalkulator hasła](#jak-działa-kalkulator-hasła)
- [Prywatność](#prywatność)
- [Uruchomienie](#uruchomienie)
- [Struktura projektu](#struktura-projektu)
- [Ograniczenia](#ograniczenia)
- [Plany](#plany)
- [English summary](#english-summary)

## Dlaczego to powstało

Większość oszustw w sieci zaczyna się od jednego kliknięcia: fałszywa wiadomość o dopłacie do paczki, „logowanie” do banku, nagroda do odebrania. Te adresy często zdradzają się już samym wyglądem, ale trzeba wiedzieć, na co patrzeć. To narzędzie pokazuje, na co zwrócić uwagę, i tłumaczy to prostym językiem.

## Funkcje

### 🔗 Sprawdzacz linków

Wklejasz podejrzany adres i dostajesz:

- ocenę ryzyka w skali od 0 do 100,
- werdykt: *Wygląda w porządku*, *Uważaj* albo *Bardzo podejrzany*,
- listę konkretnych powodów, dlaczego adres wzbudził podejrzenia,
- krótką radę, co zrobić dalej.

### 🔑 Kalkulator hasła

Wpisujesz hasło i dostajesz:

- ocenę siły: Słabe, Średnie, Dobre albo Bardzo mocne,
- szacowany czas złamania w trzech scenariuszach ataku,
- wskazówki, co poprawić.

## Jak działa ocena linku

Strona analizuje sam adres i dodaje punkty za każdą podejrzaną cechę. Suma jest ograniczona do 100.

| Cecha | Punkty |
| --- | :---: |
| Domena udaje znaną markę (np. `allegro-paczka.xyz`) | 35 |
| Znak `@` w adresie (wszystko przed nim to atrapa) | 25 |
| Obce litery udające zwykłe (punycode, `xn--`) | 25 |
| Numer IP zamiast nazwy strony | 30 |
| Brak szyfrowania (`http` zamiast `https`) | 20 |
| Skracacz linków (np. bit.ly) | 20 |
| Podejrzana końcówka domeny (np. `.xyz`, `.top`, `.click`) | 15 |
| Słowa typowe dla oszustw (`login`, `weryfikacja`, `doplata`...) | 10 |
| Bardzo dużo członów w domenie (5 lub więcej) | 10 |
| Dużo myślników w domenie (3 lub więcej) | 10 |
| Bardzo długi adres (ponad 75 znaków) | 10 |

Progi werdyktu:

| Wynik | Werdykt |
| :---: | --- |
| 0 – 24 | Wygląda w porządku |
| 25 – 54 | Uważaj |
| 55 – 100 | Bardzo podejrzany |

Wykrywanie podróbek marek uwzględnia też podmianę liter na cyfry, np. `paypa1` zamiast `paypal`.

### Przykłady

| Adres | Wynik |
| --- | :---: |
| `https://allegro.pl` | 0/100 |
| `https://allegro-paczka.xyz/login` | 60/100 |
| `http://paypa1-secure.top/verify` | 80/100 |

## Jak działa kalkulator hasła

Siła hasła jest liczona jako entropia: długość hasła razy logarytm z liczby możliwych znaków (małe i duże litery, cyfry, znaki specjalne, polskie litery). Na tej podstawie szacowana jest liczba prób potrzebna do zgadnięcia hasła.

Czas łamania jest liczony dla trzech scenariuszy:

| Scenariusz | Założona szybkość |
| --- | --- |
| Atak przez formularz logowania | 100 prób na sekundę |
| Wyciek bazy, wolny hash (bcrypt) | 100 tysięcy prób na sekundę |
| Wyciek bazy, szybki hash (MD5) | 10 miliardów prób na sekundę |

Kalkulator obniża ocenę, gdy hasło jest na liście najpopularniejszych, składa się z powtórzeń, jest ciągiem z klawiatury lub alfabetu albo ma wzór „słowo + cyfry na końcu”.

## Prywatność

Cała analiza dzieje się w twojej przeglądarce. Strona nie ma serwera, nie korzysta z żadnych zewnętrznych usług i nie zapisuje tego, co wpisujesz. Mimo to najlepiej sprawdzaj hasła podobne do swoich, a nie to, którego naprawdę używasz.

## Uruchomienie

**Online:** https://svaf-ka.github.io/sprawdz-zanim-kliknij/

**Lokalnie:**

1. Pobierz repozytorium (przycisk **Code**, potem **Download ZIP**) i rozpakuj je.
2. Kliknij dwa razy `index.html`.

Nie trzeba niczego instalować.

## Struktura projektu

```text
.
├── index.html   # struktura strony
├── style.css    # wygląd (ciemny i jasny motyw)
├── script.js    # logika sprawdzacza linków i kalkulatora
└── README.md
```

## Ograniczenia

- Sprawdzacz ocenia tylko wygląd adresu. Nie otwiera strony i nie korzysta z baz znanych oszustw.
- Wynik to szacunek, a nie gwarancja. Niska ocena nie znaczy, że link jest bezpieczny.
- Czas łamania hasła zakłada zgadywanie na ślepo. Hasła ze słownika lub z osobistymi danymi łamie się znacznie szybciej.
- Lista marek i podejrzanych końcówek jest krótka i ręcznie wybrana.

## Plany

- [ ] Sprawdzanie, czy adres e-mail pojawił się w znanych wyciekach danych
- [ ] Więcej marek i końcówek domen na liście
- [ ] Zrzuty ekranu w tym README

## English summary

A small browser-only tool with two features: a phishing link checker that scores a URL from 0 to 100 and explains what looks suspicious, and a password cracking time calculator. Everything runs locally in your browser and no data is sent anywhere. Open `index.html` to run it, or use the [live demo](https://svaf-ka.github.io/sprawdz-zanim-kliknij/).
