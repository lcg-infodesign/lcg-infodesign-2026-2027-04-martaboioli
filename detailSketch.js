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
// scontrino con legenda OK
// bottone per tornare alla pagina principale OK

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
  let alto = 320;
  let basso = yVassoio + altezzaVassoio - 50;

  let cellaX = (destra - sinistra) / colonne; // 20 celle in larghezza
  let cellaY = (basso - alto) / file; // 5 celle in altezza
  // la tazzina occupa il 60% del lato più corto della cella, così non esce mai dalla cella
  let w = min(cellaX, cellaY) * 0.6;

  // dove appoggia il piattino delle tazzine della fila più in alto
  let yFilaAlta = alto + cellaY * 0.75;

  /* disegno le 100 tazzine partendo in alto a sinistra
  prima tutte quelle di espresso, poi americano, cappuccino e caffellatte.
  n parte a contare quante tazzine ho già disegnato (da 0 a 99) 
  quindi è BEV iniziali = 0
  */
  let n = 0;
  for (let b = 0; b < bevande.length; b++) {
    let quanteTazzine = dati.getNum(rigaScelta, bevande[b]); // la percentuale = quante tazzine
    for (let k = 0; k < quanteTazzine; k++) {
      // definisco colonna e fila in cui si trova la tazza
      let colonna = n % colonne; // da 0 a 19
      let fila = floor(n / colonne); // da 0 (in alto) a 4 (in basso)

      // definisco coordinate x posizionare tazza
      let x = sinistra + colonna * cellaX + cellaX / 2;
      let y = yFilaAlta + fila * cellaY;

      // le file scendono, quindi aggiungo
      drawTazza(x, y, w, coloriBevande[b]);
      n++;
    }
  }

  drawLegenda();
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
  text(
    dati.getNum(rigaScelta, "kg_procapite") +
      " kg di caffè per persona all'anno",
    42,
    88,
  );
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

// tazzina (uguale alla pagina d'insieme)
// x = centro, yAppoggio = dove appoggia il piattino, w = larghezza, colore = bevanda
function drawTazza(x, yAppoggio, w, colore) {
  let h = w * 0.9; // altezza della tazza
  let yBase = yAppoggio - w * 0.15; // fondo della tazza (appoggiato sul piattino)
  let margine = w * 0.08; // spessore del bordo bianco della tazza

  push();

  // disegno piattino
  fill("#FFFFFF");
  noStroke();
  ellipse(x, yAppoggio - w * 0.15, w * 1.5, w * 0.15);

  /* disegno manico fatto due volte in modo che il bordo esca anche all'interno del buco
  quindi prima lo disegno un po' più spesso in beige , poi sopra in bianco */
  noFill();
  stroke("#C9B49C");
  strokeWeight(w * 0.1 + 2);
  ellipse(x + w * 0.5, yBase - h * 0.5, w * 0.4, h * 0.45);
  stroke("#FFFFFF");
  strokeWeight(w * 0.09);
  ellipse(x + w * 0.5, yBase - h * 0.5, w * 0.4, h * 0.45);

  // corpo della tazza
  fill("#FFFFFF");
  stroke("#C9B49C");
  strokeWeight(1);
  rect(x - w / 2, yBase - h, w, h, 0, 0, w * 0.18, w * 0.18);

  // bevanda dentro la tazza, QUI DI UN COLORE SOLO
  noStroke();
  fill(colore);
  rect(
    x - w / 2 + margine,
    yBase - h + margine,
    w - margine * 2,
    h - margine * 2,
    0,
    0,
    w * 0.1,
    w * 0.1,
  );

  pop();
}

/* legenda in alto a destra, scontrino uguale alla pagina d'insieme
ma con dentro le percentuali delle bevande */
function drawLegenda() {
  // dimensioni dello scontrino
  let larghezza = 280;
  let altezza = 230;

  push();
  /* sposto l'origine nell'angolo dello scontrino e lo giro di 2 gradi
  in modo che poi tutti gli elementi dentro si basino su questo */
  translate(width - 380, 45);
  rotate(2);

  // carta bianca dello scontrino
  noStroke();
  fill("#FBF7F0");
  rect(0, 0, larghezza, altezza);

  // bordo in basso seghettato
  for (let xz = 0; xz < larghezza; xz = xz + 10) {
    triangle(xz, altezza, xz + 10, altezza, xz + 5, altezza + 7);
  }

  // scritta LEGENDA in alto allineata al centro
  fill("#3B2116");
  textAlign(CENTER, TOP);
  textSize(18);
  text("LEGENDA", larghezza / 2, 20);

  drawTratteggio(50, larghezza);

  // legenda bevande nello stesso ordine delle tazzine con prima l'espresso e per ultimo il caffellatte
  textSize(14);
  let yRiga = 64;
  for (let i = 0; i < bevande.length; i++) {
    fill(coloriBevande[i]);
    stroke("#C9B49C");
    strokeWeight(1);
    rect(20, yRiga, 16, 13, 3);
    noStroke();
    fill("#3B2116");
    textAlign(LEFT, TOP);
    text(nomiBevande[i], 46, yRiga - 1);
    // percentuale allineata a destra, come il prezzo su uno scontrino
    textAlign(RIGHT, TOP);
    text(dati.getNum(rigaScelta, bevande[i]) + "%", larghezza - 20, yRiga - 1);
    yRiga = yRiga + 24;
  }

  drawTratteggio(166, larghezza);

  drawLinkIndietro();

  pop();
}

// link sotto le percentuali che rimanda alla pagina d'insieme
function drawLinkIndietro() {
  noStroke();
  fill("#7A4E33");
  textAlign(LEFT, TOP);
  textSize(13);
  text("← Torna all'overview", 132, 190);

  // se il mouse è sopra la scritta il cursore diventa la manina
  if (sopraLink()) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

/* controlla se il mouse è sopra la scritta
RICORDATI CHE mouseX e mouseY sono SEMPRE!!!! coordinate della FINESTRA, non dello scontrino,
quindi devo ricalcolare dove si trova la scritta nella finestra ufff*/
function sopraLink() {
  textSize(13);
  // definisco la parte cliccabile
  let larghezzaLink = textWidth("← Torna all'overview");
  let xLink = width - 380 + 132 - 7;
  let yLink = 45 + 190 + 5;

  // operatore logico AND quindi tutte devono essere VERE
  return (
    mouseX > xLink &&
    mouseX < xLink + larghezzaLink &&
    mouseY > yLink &&
    mouseY < yLink + 16
  );
}

/* cliccando sulla scritta torno alla pagina d'insieme
mousePressed deve stare FUORI da tutte le altre funzioni, altrimenti p5 non la trova
perché dev'essere utilizzabile ovunque QUINDI va in fondo!! */
function mousePressed() {
  // se il paese non esiste, qualsiasi clic riporta all'overview
  if (sopraLink()) {
    window.location.href = "index.html";
  }
}

// linea tratteggiata orizzontale tipo righe scontrino x separare le sezioni
function drawTratteggio(y, larghezza) {
  stroke("#C9B49C");
  strokeWeight(1);
  for (let x = 20; x < larghezza - 20; x = x + 8) {
    line(x, y, x + 4, y); // trattino di 4 px, poi 4 px vuoti
  }
  noStroke();
}
