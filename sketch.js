let dati;
let maxKg = 0; // il paese che beve più caffè (serve per proporzionare la grandezza delle tazze)

// l'ordine è dal basso verso l'alto della tazza, dal più scuro al più chiaro
// nomi delle bevande nel dataset
let bevande = ["espresso", "americano", "cappuccino", "latte"];
// nomi delle bevande nel grafico
let nomiBevande = ["Espresso", "Americano/filtro", "Cappuccino", "Caffellatte"];
let coloriBevande = ["#3B2116", "#7A4E33", "#B98A5E", "#E6CFAF"];

// assi del grafico disegnato sul vassoio
let asseXmin = 1; // asse x: kg di caffè a persona, valore minimo 1kg
let asseXmax = 10; // valore max 10kg (nessun paese beve meno di 1 kg, quindi non parto da 0)
let asseYmin = 10; // asse y: % di bevande con il latte, da 10%
let asseYmax = 70; // al valore massimo 70%

// bordi dell'area del grafico e tazza più grande
let sinistra, destra, alto, basso;
let larghezzaMax;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES); // imposto angoli in gradi
  // se sul computer non c'è futura usa un altro font senza grazie
  textFont("Futura, sans-serif");

  dati = await loadTable("assets/caffe.csv", ",", "header"); // carico il dataset

  // cerco il valore più alto di kg a persona
  for (let riga = 0; riga < dati.getRowCount(); riga++) {
    let kg = dati.getNum(riga, "kg_procapite");
    if (kg > maxKg) {
      maxKg = kg;
    }
  }
}

function draw() {
  background("#EFE4D6");
  drawTitolo();

  // il vassoio occupa tutta la larghezza della finestra con 50 px di margine ai lati per le maniglie
  let xVassoio = 50;
  let yVassoio = 150;
  let larghezzaVassoio = width - 100;
  let altezzaVassoio = height - yVassoio - 50; // 50 px liberi in basso per il bordo
  drawVassoio(xVassoio, yVassoio, larghezzaVassoio, altezzaVassoio);

  // area del grafico dentro il vassoio con spazio sopra per le tazze e ai lati per le scritte
  sinistra = xVassoio + 80;
  destra = xVassoio + larghezzaVassoio - 60;
  alto = yVassoio + 110;
  basso = yVassoio + altezzaVassoio - 70;
  /* la tazza più grande è larga al massimo 75 px, ma nelle finestre basse si rimpicciolisce
 così le tazze non finiscono sotto lo scontrino */
  larghezzaMax = min(75, (basso - alto) * 0.12);
  drawAssi(xVassoio, yVassoio, altezzaVassoio);

  /* primo ciclo, cerco la tazza su cui c'è il mouse.
  Se due tazze si sovrappongono prende quella messa "davanti" */
  let paeseHover = -1; // -1 = nessuno (le righe iniziano da 0)
  for (let riga = 0; riga < dati.getRowCount(); riga++) {
    let x = posizioneX(riga);
    let y = posizioneY(riga);
    let w = larghezzaTazza(dati.getNum(riga, "kg_procapite"));
    // rettangolo intorno a tazza e piattino
    if (mouseX > x - w * 0.75 && mouseX < x + w * 0.75 && mouseY > y - w * 1.1 && mouseY < y) {
      paeseHover = riga;
    }
  }

  /* secondo ciclo, disegno le tazze.
  nel dataset i paesi sono ordinati da quello con bevande con più latte al meno, così prima disegno
  le tazze in alto (in fondo al vassoio) e poi quelle in basso, che stanno davanti */
  for (let riga = 0; riga < dati.getRowCount(); riga++) {
    let x = posizioneX(riga);
    let y = posizioneY(riga);
    let w = larghezzaTazza(dati.getNum(riga, "kg_procapite"));

    // leggo le 4 percentuali di questo paese e le metto in un array
    let percentuali = [];
    for (let i = 0; i < bevande.length; i++) {
      percentuali.push(dati.getNum(riga, bevande[i]));
    }

    drawTazza(x, y, w, percentuali, riga == paeseHover);

    // nome del paese sotto il piattino
    noStroke();
    textAlign(CENTER, TOP);
    fill("#F1DCC0");
    textSize(12);
    text(dati.getString(riga, "paese"), x, y + 5);
  }

  drawLegenda();

  /* riquadro hover disegnato per ultimo, così sta sopra a tutto.
  RICORDATI CHE != STA PER "DIVERSO DA" quindi se il valore di paeseHover
  è diverso da -1 sto passando con il mouse sopra ad un paese */
  if (paeseHover != -1) {
    drawRiquadro(paeseHover);
  }
}

// x della tazza = kg di caffè a persona
function posizioneX(riga) {
  let kg = dati.getNum(riga, "kg_procapite");
  return map(kg, asseXmin, asseXmax, sinistra, destra);
}

// y della tazza = % di bevande con il latte (cappuccino + caffellatte)
// è il punto dove appoggia il piattino
function posizioneY(riga) {
  let conLatte = dati.getNum(riga, "cappuccino") + dati.getNum(riga, "latte");
  // basso e alto sono invertiti perché sullo schermo la y cresce verso il basso
  return map(conLatte, asseYmin, asseYmax, basso, alto);
}

// grandezza: uso la radice quadrata così l'AREA della tazza è proporzionale ai kg
function larghezzaTazza(kg) {
  return map(sqrt(kg), 0, sqrt(maxKg), 0, larghezzaMax);
}

function drawTitolo() {
  noStroke();
  textAlign(LEFT, TOP);
  fill("#3B2116");
  textSize(38);
  text("A world fueled by caffeine", 40, 35);

  fill("#7A4E33");
  textSize(18);
  text("Dove si beve più caffè nel mondo? E quali sono le bevande più popolari?", 42, 88);
}

// vassoio di legno con le maniglie ai lati
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

// griglia e numeri degli assi, incisi sul vassoio
function drawAssi(xVassoio, yVassoio, altezzaVassoio) {
  textSize(12);
  fill("#F1DCC0");

  // asse x: una linea verticale per ogni kg, numeri sul bordo davanti del vassoio
  for (let kg = asseXmin; kg <= asseXmax; kg++) {
    let x = map(kg, asseXmin, asseXmax, sinistra, destra);
    stroke("#9A6845");
    strokeWeight(1);
    line(x, alto - 40, x, basso);
    noStroke();
    textAlign(CENTER, CENTER);
    text(kg, x, yVassoio + altezzaVassoio - 11); // al centro del bordo (alto 22 px)
  }

  // asse y: una linea orizzontale ogni 10% di latte, numeri a sinistra
  for (let p = asseYmin; p <= asseYmax; p = p + 10) {
    let y = map(p, asseYmin, asseYmax, basso, alto);
    stroke("#9A6845");
    strokeWeight(1);
    line(sinistra, y, destra, y);
    noStroke();
    textAlign(RIGHT, CENTER);
    text(p + "%", sinistra - 12, y);
  }

  // titoli degli assi
  textSize(13);
  textAlign(LEFT, TOP);
  text("Percentuale di latte", sinistra - 40, yVassoio + 40);
  // titolo dell'asse x, sotto il vassoio allineato a dx
  fill("#7A4E33");
  textAlign(RIGHT, TOP);
  text("Kg di caffè per persona all'anno", destra, yVassoio + altezzaVassoio + 12);
}

// x = centro della tazza, yAppoggio = dove appoggia il piattino
// w = larghezza della tazza, percentuali = le 4 bevande, evidenziata = mouse sopra
function drawTazza(x, yAppoggio, w, percentuali, evidenziata) {
  let h = w * 0.9; // altezza della tazza
  let yBase = yAppoggio - w * 0.12; // fondo della tazza (appoggiato sul piattino)
  let margine = w * 0.08; // spessore del bordo bianco della tazza

  push();

  // disegno piattino
  fill("#D9C9B6");
  noStroke();
  ellipse(x, yAppoggio - w * 0.08, w * 1.5, w * 0.16);
  fill("#FFFFFF");
  stroke("#C9B49C");
  strokeWeight(1);
  ellipse(x, yAppoggio - w * 0.11, w * 1.4, w * 0.14);

  /* disegno manico fatto due volte in modo che il bordo esca anche all'interno del buco
  quindi prima lo disegno un po' più spesso in beige , poi sopra in bianco */
  noFill();
  stroke("#C9B49C");
  strokeWeight(w * 0.09 + 2);
  ellipse(x + w * 0.5, yBase - h * 0.55, w * 0.42, h * 0.45);
  stroke("#FFFFFF");
  strokeWeight(w * 0.09);
  ellipse(x + w * 0.5, yBase - h * 0.55, w * 0.42, h * 0.45);

  // corpo della tazza (angoli in basso arrotondati)
  fill("#FFFFFF");
  // se mouse sopra, il bordo è più spesso e marrone scuro
  if (evidenziata) {
    stroke("#3B2116");
    strokeWeight(2);
  } else {
    stroke("#C9B49C");
    strokeWeight(1);
  }
  rect(x - w / 2, yBase - h, w, h, 0, 0, w * 0.18, w * 0.18);

  // interno della tazza con lo stesso margine su tutti e 4 i lati
  let xInterno = x - w / 2 + margine;
  let larghezzaInterna = w - margine * 2;
  let altezzaInterna = h - margine * 2; // spazio da riempire (100%)
  let yInterno = yBase - h + margine; // bordo alto dell'interno

  // maschera per il rettangolo interno alla tazzina che ha gli angoli in basso arrotondati
  push();
  beginClip();
  rect(xInterno, yInterno, larghezzaInterna, altezzaInterna, 0, 0, w * 0.1, w * 0.1);
  endClip();

  // strati di caffè, parto dal fondo e salgo
  noStroke();
  let y = yBase - margine; //parto dal fondo
  for (let i = 0; i < percentuali.length; i++) {
    let altezzaStrato = (altezzaInterna * percentuali[i]) / 100;
    fill(coloriBevande[i]);
    rect(xInterno, y - altezzaStrato, larghezzaInterna, altezzaStrato);
    y = y - altezzaStrato; // lo strato dopo parte sopra a questo
  }
  pop(); // qui finisce la maschera

  // se c'è il mouse sopra, la tazza "fuma"
  if (evidenziata) {
    drawVapore(x, yBase - h);
  }

  pop();
}

function drawVapore(x, yTop) {
  noFill();
  stroke("#F1DCC0"); // chiaro, perché ora sotto c'è il legno del vassoio
  strokeWeight(2);
  /* 3 linee a forma di S: ognuna è fatta da due mezzi archi
  che stanno uno sotto all'altro*/
  for (let i = -1; i <= 1; i++) {
    let xVapore = x + i * 12;
    /* funzione arc i primi due valori sono per il centro dell'arco
    terzo e quarto sono per la larghezza e l'altezza
    quinto e sesto gli angoli tra cui l'arco è compreso (quindi in tot 180 gradi) */
    arc(xVapore, yTop - 8, 8, 8, -90, 90);
    arc(xVapore, yTop - 16, 8, 8, 90, 270);
  }
}

// legenda a forma di scontrino, appoggiata nell'angolo in alto a destra del vassoio
function drawLegenda() {
  let larghezza = 300;
  let altezza = 470;

  push();
  // sposto l'origine nell'angolo dello scontrino e lo giro di 2 gradi
  // da qui in poi tutte le coordinate partono da (0, 0) = angolo in alto a sinistra dello scontrino
  translate(width - 400, 55);
  rotate(2); 

  // carta dello scontrino
  noStroke();
  fill("#FBF7F0");
  rect(0, 0, larghezza, altezza);

  // bordo in basso seghettato quindi è una fila di triangolini come uno scontrino strappato
  for (let xz = 0; xz < larghezza; xz = xz + 10) {
    triangle(xz, altezza, xz + 10, altezza, xz + 5, altezza + 7);
  }

  // intestazione
  fill("#3B2116");
  textAlign(CENTER, TOP);
  textSize(18);
  text("LEGENDA", larghezza / 2, 20);
  drawTratteggio(50, larghezza);

  // grandezza e posizione orizzontale
  textAlign(LEFT, TOP);
  textSize(13);
  text("Ogni tazza rappresenta un paese.", 20, 62);
  text("Più è grande e a destra, più caffè si beve.", 20, 82, 260);
  /* qui il quarto parametro 260 è per indicare la larghezza massima delle righe
  e far andare a capo il testo anziché farlo uscire dallo scontrino */

  // tazze di esempio per far capire le proporzioni basate su AREA
  let w2 = larghezzaTazza(2); // tazzina per 2 kg a persona
  let w6 = larghezzaTazza(6); // tazzina per 6 kg a persona
  let esempio = [20, 40, 20, 20];
  drawTazza(90, 185, w2, esempio, false);
  drawTazza(200, 185, w6, esempio, false);
  // false serve perché altrimenti se passassi sopra il mouse cambierebbe il bordo
  noStroke();
  fill("#8C735E");
  textSize(11);
  textAlign(CENTER, TOP);
  text("2 kg", 90, 192);
  text("6 kg", 200, 192);

  // posizione verticale
  fill("#3B2116");
  textSize(13);
  textAlign(LEFT, TOP);
  text("Più è in alto, più latte si beve con il caffè (cappuccino e caffellatte).", 20, 222, 260);
  drawTratteggio(268, larghezza);

  // strati in due colonne, nello stesso ordine della tazza (in alto le bevande chiare)
  text("Ogni strato è una bevanda:", 20, 280);
  for (let i = 0; i < bevande.length; i++) {
    // i = 3 e 2 (caffellatte, cappuccino) nella prima riga, i = 1 e 0 nella seconda
    let colonna = (bevande.length - 1 - i) % 2; // 0 = sinistra, 1 = destra
    let rigaStrato = floor((bevande.length - 1 - i) / 2); // 0 = sopra, 1 = sotto
    let xStrato = 20 + colonna * 130;
    let yStrato = 304 + rigaStrato * 22;
    fill(coloriBevande[i]);
    stroke("#C9B49C");
    strokeWeight(1);
    rect(xStrato, yStrato, 16, 13, 3);
    noStroke();
    fill("#3B2116");
    text(nomiBevande[i], xStrato + 24, yStrato - 1);
  }
  drawTratteggio(354, larghezza);

  // interazione e fonte dei dati
  fill("#7A4E33");
  text(
    "Passa il mouse su una tazza per vedere quali, fra le bevande a base di caffè, sono più diffuse in ogni paese.",
    20, 366, 260
  );
  fill("#A8927E");
  textSize(9);
  text("Kg di caffè a persona: Euromonitor 2013.", 20, 428, 260);

  pop();
}

// linea tratteggiata orizzontale tipo righe scontrino
function drawTratteggio(y, larghezza) {
  stroke("#C9B49C");
  strokeWeight(1);
  for (let x = 20; x < larghezza - 20; x = x + 8) {
    line(x, y, x + 4, y); // trattino di 4 px, poi 4 px vuoti
  }
  noStroke();
}

// disegno il riquadro con i dettagli del paese su cui c'è il mouse
function drawRiquadro(riga) {
  let larghezzaBox = 230;
  let altezzaBox = 160;

  // riquadro sta in basso a destra del mouse
  let boxX = mouseX + 15;
  let boxY = mouseY + 15;
  // se il riquadro esce dalla finestra lo sposto
  if (boxX + larghezzaBox > width) {
    boxX = mouseX - larghezzaBox - 15;
  }
  if (boxY + altezzaBox > height) {
    boxY = mouseY - altezzaBox - 15;
  }

  noStroke();
  fill("#2B1A12");
  rect(boxX, boxY, larghezzaBox, altezzaBox, 8);

  textAlign(LEFT, TOP);
  fill("#FBF7F0");
  textSize(20);
  text(dati.getString(riga, "paese"), boxX + 14, boxY + 12);

  fill("#D9C2A5");
  textSize(13);
  text(dati.getNum(riga, "kg_procapite") + " kg per persona all'anno", boxX + 14, boxY + 40);

  // legenda bevande nell'ordine dall'alto verso il basso come nella tazza
  let yRiga = boxY + 68;
  for (let i = bevande.length - 1; i >= 0; i--) {
    fill(coloriBevande[i]);
    stroke("#FBF7F0"); // bordo chiaro intorno ai quadratini delle bevande
    rect(boxX + 14, yRiga, 12, 12, 2);
    noStroke();
    fill("#FBF7F0");
    text(nomiBevande[i] + ": " + dati.getNum(riga, bevande[i]) + "%", boxX + 34, yRiga - 1);
    yRiga = yRiga + 21;
  }
}

/* ridimensionare tutto in base alle dimensioni della finestra
però se troppo stretta si vanno a sovrapporre le scritte tra loro */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
