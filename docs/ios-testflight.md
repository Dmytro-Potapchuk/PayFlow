# iOS TestFlight

## Cel

Ten projekt obsługuje teraz dwa natywne buildy iOS:

- `ios-preview` dla testerów w TestFlight
- `production` dla docelowych buildów iOS

Obecna wersja Expo/web pozostaje bez zmian.

## Wymagania

- konto Apple Developer
- skonfigurowane App Store Connect
- zalogowane EAS: `npx eas login`

## Profile buildów

- `npm run build:ios-preview`
  buduje wersję testerską iOS pod TestFlight

- `npm run build:ios-production`
  buduje wersję docelową iOS

- `npm run submit:ios-preview`
  wysyła build iOS do App Store Connect / TestFlight

- `npm run submit:ios-production`
  wysyła docelowy build iOS do App Store Connect

## Zalecany workflow dla testerów

1. Zbuduj wersję testerską:

```bash
npm run build:ios-preview
```

2. Po zakończeniu buildu wyślij ją do TestFlight:

```bash
npm run submit:ios-preview
```

3. W App Store Connect:
- otwórz aplikację
- przejdź do `TestFlight`
- dodaj testerów wewnętrznych lub zewnętrznych

## PayU i powrót do aplikacji

Natywny iOS używa schematu:

```text
payflow://payu-result
```

Po zakończeniu płatności PayU sandbox aplikacja może wrócić do natywnego ekranu i odświeżyć saldo oraz historię.

## Przydatne komendy EAS

```bash
npx eas build --platform ios --profile ios-preview
npx eas build --platform ios --profile production
npx eas submit --platform ios --profile ios-preview
npx eas submit --platform ios --profile production
```
