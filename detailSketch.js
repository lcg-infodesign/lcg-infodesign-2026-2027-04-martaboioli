let dati;

// riga del paese scelto nella pagina d'insieme (-1 = non trovato)
let rigaScelta = -1;

// l'ordine è dal più scuro al più chiaro
// nomi delle bevande nel dataset
let bevande = ["espresso", "americano", "cappuccino", "latte"];
// nomi delle bevande nel grafico
let nomiBevande = ["Espresso", "Americano/filtro", "Cappuccino", "Caffellatte"];
let coloriBevande = ["#3B2116", "#7A4E33", "#B98A5E", "#E6CFAF"];

// TO DO mettere griglia di 100 tazzine per la percentuale totale delle bevande
// griglia delle 100 tazzine (100%) = 5 file x 20 colonne
let colonne = 20;
let file = 5;

// tazzine con ripieno colorato in base alla bevanda
// scontrino con legenda
// bottone per tornare alla pagina principale

async function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES); // imposto angoli in gradi
  textFont("Futura, sans-serif");

  // carico il dataset (percorso, separatore, opzioni)
  dati = await loadTable("assets/caffe.csv", ",", "header");

  /* leggo i parametri scritti nell'indirizzo della pagina:
  per detail.html?paese=ITA, params.paese vale "ITA" */
  let params = getURLParams();

  // cerco nel dataset la riga che ha quell'id
  for (let riga = 0; riga < dati.getRowCount(); riga++) {
    if (dati.getString(riga, "id") == params.paese) {
      rigaScelta = riga;
    }
  }
}

function draw() {
    // stesso colore sfondo dell'altra pagina
    background("#EFE4D6");

    drawTitolo();

    // vassoio con stesse misure della pagina d'insieme
  let xVassoio = 50;
  let yVassoio = 150;
  let larghezzaVassoio = width - 100;
  let altezzaVassoio = height - yVassoio - 50;
  drawVassoio(xVassoio, yVassoio, larghezzaVassoio, altezzaVassoio);

  // area per le tazzine dentro il vassoio e sotto lo scontrino
  let sinistra = xVassoio + 60;
  let destra = xVassoio + larghezzaVassoio - 60;
  let alto = 340;
  let basso = yVassoio + altezzaVassoio - 50;

  let cellaX = (destra - sinistra) / colonne; // 20 celle in larghezza
  let cellaY = (basso - alto) / file; // 5 celle in altezza
  // la tazzina occupa il 60% del lato più corto della cella, così non esce mai dalla cella
  let w = min(cellaX, cellaY) * 0.6;

}

// titolo con nome paese + sottotitolo con numero kg caffè per persona
function drawTitolo() {
  noStroke();
  textAlign(LEFT, TOP);
  fill("#3B2116");
  textSize(38);
  text(dati.getString(rigaScelta, "paese"), 40, 35);

  fill("#7A4E33");
  textSize(18);
  text(dati.getNum(rigaScelta, "kg_procapite") + " kg di caffè per persona all'anno", 42, 88);
}

// vassoio di legno con le maniglie ai lati (uguale alla pagina d'insieme)
function drawVassoio(x, y, w, h) {
  noStroke();

  // maniglie, rettangolo arrotondato con un buco del colore dello sfondo
  fill("#6E4630");
  rect(x - 30, y + h / 2 - 50, 50, 100, 20);
  rect(x + w - 20, y + h / 2 - 50, 50, 100, 20);
  fill("#EFE4D6");
  rect(x - 20, y + h / 2 - 30, 14, 60, 7);
  rect(x + w + 6, y + h / 2 - 30, 14, 60, 7);

  // bordo del vassoio
  fill("#6E4630");
  rect(x, y, w, h, 30);

  // piano del vassoio, un po' più dentro del bordo
  fill("#8A5A3B");
  rect(x + 22, y + 22, w - 44, h - 44, 18);
}