# Portacarte

Un'app per le carte fedeltà, senza pubblicità: tocchi una carta e mostri il codice a barre o QR a schermo intero.

Niente account, niente tracciamento, niente sincronizzazione cloud: le carte restano salvate solo sul tuo dispositivo.

## Due implementazioni

Il progetto vive in due cartelle indipendenti:

- **[`web/`](web/)** — una **PWA** (Progressive Web App) installabile direttamente da Safari su iPhone, senza bisogno di un Mac o dell'App Store. Funziona anche offline grazie a un service worker. È la versione pensata per l'uso quotidiano.
- **[`ios/LoyaltyWallet/`](ios/LoyaltyWallet/)** — un'app nativa **SwiftUI + SwiftData**, da aprire e compilare con Xcode su Mac. Resta nel repository per quando sarà disponibile un Mac su cui lavorarci.

Le due versioni condividono lo stesso concetto e le stesse funzionalità di base, ma hanno dati separati (la PWA usa `localStorage` del browser, l'app nativa usa SwiftData): non si sincronizzano tra loro.

## Portacarte (PWA) — `web/`

### Installazione su iPhone

1. Apri il sito pubblicato su GitHub Pages con **Safari** (deve essere Safari, non un altro browser, per l'installazione).
2. Tocca l'icona di condivisione (il quadrato con la freccia verso l'alto).
3. Scegli **"Aggiungi alla schermata Home"**.
4. Da quel momento Portacarte si apre come un'app a schermo intero, con la sua icona, e funziona anche senza connessione.

### Funzionalità

- Aggiunta di una carta fedeltà con nome, colore e codice (barcode Code128/EAN-13/UPC-A oppure QR code).
- **Scansione della fotocamera** per acquisire il codice da una carta fisica, invece di digitarlo a mano.
- Visualizzazione **a schermo intero** del codice, con luminosità e schermo sempre acceso (dove supportato dal browser) per facilitare la lettura alla cassa.
- Modifica ed eliminazione delle carte salvate.
- **Esportazione/importazione** dei dati in un file JSON, utile come backup manuale.
- Funzionamento **offline** dopo il primo caricamento (service worker).
- Nessun account, nessuna pubblicità, nessun server: tutti i dati restano sul dispositivo.

### Stack tecnico

Pagina statica in HTML/CSS/JavaScript puro (nessun build step). Librerie di generazione e scansione codici caricate da CDN:

- [JsBarcode](https://github.com/lindell/JsBarcode) — generazione barcode (Code128, EAN-13, UPC-A).
- [qrcode](https://github.com/soldair/node-qrcode) — generazione QR code.
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) — scansione da fotocamera.

## LoyaltyWallet (app nativa) — `ios/LoyaltyWallet/`

Progetto Xcode con SwiftUI e SwiftData:

- Elenco delle carte con griglia colorata, aggiunta/modifica/eliminazione.
- Generazione di codici a barre (Code128) e QR **nativamente**, tramite Core Image, senza dipendenze esterne.
- Scansione da fotocamera con `AVFoundation`.
- Vista a schermo intero con luminosità al massimo e schermo sempre acceso.
- Persistenza locale con SwiftData (nessun server, nessuna sincronizzazione).

Richiede Xcode 16+ e un dispositivo/simulatore con iOS 17+. Apri `ios/LoyaltyWallet/LoyaltyWallet.xcodeproj`.

## Versione

Versione corrente: **v0.1**. Vedi [CHANGELOG.md](CHANGELOG.md) per la cronologia delle modifiche.
