let dati;

// riga del paese scelto nella pagina d'insieme (-1 = non trovato)
let rigaScelta = -1;

// l'ordine è dal basso verso l'alto, dal più scuro al più chiaro (come gli strati di una tazza)
// nomi delle bevande nel dataset
let bevande = ["espresso", "americano", "cappuccino", "latte"];
// nomi delle bevande nel grafico
let nomiBevande = ["Espresso", "Americano/filtro", "Cappuccino", "Caffellatte"];
let coloriBevande = ["#3B2116", "#7A4E33", "#B98A5E", "#E6CFAF"];

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

}