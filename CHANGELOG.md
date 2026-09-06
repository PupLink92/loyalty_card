# Changelog

Tutte le modifiche rilevanti al progetto Portacarte sono documentate in questo file.

## [0.1.1] - 2026-09-06

### Corretto

- **`web/`**: il visualizzatore QR non apriva le carte di tipo QR Code. Causa: la libreria caricata da CDN (`qrcode@1.5.3/build/qrcode.min.js`) non esiste nel pacchetto npm pubblicato, quindi lo script falliva silenziosamente e il tap sulla carta non produceva alcun effetto. Sostituita con `qrcode-generator`, verificata funzionante.

### Aggiunto

- **`web/`**: il tipo di codice (barcode Code128/EAN-13/UPC-A o QR) viene ora rilevato automaticamente mentre si digita il valore nel form di aggiunta/modifica carta, in base al formato del testo inserito.

## [0.1] - 2026-09-06

### Aggiunto

- Prima versione pubblica del progetto, con due implementazioni parallele:
  - **`web/`**: PWA installabile da Safari su iPhone, funzionante offline tramite service worker.
    - Aggiunta, modifica ed eliminazione di carte fedeltà (nome, colore, tipo e valore del codice).
    - Generazione di barcode (Code128, EAN-13, UPC-A) e QR code a schermo intero.
    - Scansione del codice tramite fotocamera (libreria `html5-qrcode`).
    - Esportazione/importazione dei dati come backup JSON.
    - Persistenza locale via `localStorage`, nessun account e nessun server.
  - **`ios/LoyaltyWallet/`**: app nativa SwiftUI + SwiftData (richiede Xcode/Mac per la compilazione).
    - Elenco carte, aggiunta/modifica/eliminazione, persistenza con SwiftData.
    - Generazione nativa di barcode Code128 e QR code tramite Core Image.
    - Scansione da fotocamera con AVFoundation.
    - Vista a schermo intero con luminosità massima e schermo sempre acceso.
- README con istruzioni di installazione e panoramica delle funzionalità.
