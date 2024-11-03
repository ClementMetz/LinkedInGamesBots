// Fonction pour extraire les nombres des classes de couleur des cellules
function extractCellColorNumbers() {

    const cells = document.querySelectorAll('div[class*="cell-color-"]');
    console.log(cells)
    let cellColorNumbers = [];

    cells.forEach(cell => {
        cell.classList.forEach(className => {
            console.log(className)
            if (className.startsWith("cell-color-")) {
                // Extraire le nombre après "cell-color-" et le convertir en entier
                const colorNumber = parseInt(className.replace("cell-color-", ""), 10);
                console.log(colorNumber)
                if (!isNaN(colorNumber)) {
                    cellColorNumbers.push(colorNumber);
                }
            }
        });
    });
    console.log(cellColorNumbers)

    return reshapeToSquareMatrix(cellColorNumbers);
}

class QueensSolver {
    constructor(matrix) {
        this.m = matrix;
        this.side = matrix.length;
        this.nb_colors = this.side;
        this.crossed = Array(this.side).fill().map(() => Array(this.side).fill(false));
        this.crowns = Array(this.side).fill().map(() => Array(this.side).fill(false));
        this.found_crowns = 0;
        this.buildColorLists();
    }

    // Construit les listes de couleurs (coordonnées pour chaque couleur)
    buildColorLists() {
        this.color_lists = Array(this.nb_colors).fill().map(() => []);

        for (let i = 0; i < this.side; i++) {
            for (let j = 0; j < this.side; j++) {
                this.color_lists[this.m[i][j]].push([i, j]);
            }
        }
    }

    // Retire les coordonnées de la liste des couleurs pour une couleur donnée
    removeFromColorLists(i, j, color) {
        this.color_lists[color] = this.color_lists[color].filter(coords => !(coords[0] === i && coords[1] === j));
    }

    // Retourne la couleur la moins peuplée
    getLessPopulatedColor() {
        let minColor = -1;
        let minValue = this.side ** 2;

        for (let color = 0; color < this.nb_colors; color++) {
            let l = this.color_lists[color].length;
            if (l > 0 && l < minValue) {
                minColor = color;
                minValue = l;
            }
        }

        return minColor;
    }

    // Marque les cases diagonales, colonnes, rangs, et même couleur comme croisées
    crossOut(i, j) {
        const removeCoords = (x, y) => {
            if (x >= 0 && x < this.side && y >= 0 && y < this.side) {
                this.crossed[x][y] = true;
                this.removeFromColorLists(x, y, this.m[x][y]);
            }
        };

        // Diagonales
        removeCoords(i - 1, j - 1);
        removeCoords(i - 1, j + 1);
        removeCoords(i + 1, j - 1);
        removeCoords(i + 1, j + 1);

        // Lignes et colonnes
        for (let k = 0; k < this.side; k++) {
            this.crossed[i][k] = true;
            this.crossed[k][j] = true;
            this.removeFromColorLists(i, k, this.m[i][k]);
            this.removeFromColorLists(k, j, this.m[k][j]);
        }

        // Cases de même couleur
        const color = this.m[i][j];
        this.color_lists[color].forEach(([x, y]) => {
            this.crossed[x][y] = true;
        });
        this.color_lists[color] = [];
    }

    // Fonction pour résoudre le problème des reines
    solve() {
        let color = this.getLessPopulatedColor();
        if (color === -1) return true;  // Base case: toutes les couleurs sont traitées

        const colorsLists = JSON.parse(JSON.stringify(this.color_lists)); // Profonde copie
        const crossed = JSON.parse(JSON.stringify(this.crossed));

        for (let k = 0; k < this.color_lists[color].length; k++) {
            let [i, j] = this.color_lists[color][k];
            let q = this.queen(i, j);
            if (q && this.solve()) {
                this.crowns[i][j] = true;
                this.found_crowns++;
                return true;
            } else {
                // Réinitialiser les listes et croisés
                this.color_lists = JSON.parse(JSON.stringify(colorsLists));
                this.crossed = JSON.parse(JSON.stringify(crossed));
            }
        }
        return false; // Impossible de placer une reine pour cette couleur
    }

    // Place une reine sur la case (i, j)
    queen(i, j) {
        let e = this.countEmptyColors();
        this.crossOut(i, j);
        return this.countEmptyColors() <= e + 1;
    }

    // Compte le nombre de couleurs qui n'ont plus de cases disponibles
    countEmptyColors() {
        return this.color_lists.filter(list => list.length === 0).length;
    }
}

// Intégration avec processColorNumbers
function processColorNumbers(matrix) {

    // Créer une instance de QueensSolver
    const solver = new QueensSolver(matrix);

    // Résoudre et obtenir la matrice de booléens
    solver.solve();

    return solver.crowns;
}

// Fonction de reshape (de la réponse précédente)
function reshapeToSquareMatrix(array) {
    const n = Math.sqrt(array.length);
    if (!Number.isInteger(n)) {
        throw new Error("La taille du tableau n'est pas un carré parfait.");
    }

    const matrix = [];
    for (let i = 0; i < n; i++) {
        matrix.push(array.slice(i * n, (i + 1) * n));
    }

    return matrix;
}

function emulateDoubleClick(element) {
    const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
    const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
    const mouseDownEvent2 = new MouseEvent('mousedown', { bubbles: true });
    const mouseUpEvent2 = new MouseEvent('mouseup', { bubbles: true });
    //const doubleClickEvent = new MouseEvent('dblclick', { bubbles: true });

    element.dispatchEvent(mouseDownEvent);
    element.dispatchEvent(mouseUpEvent);
    element.dispatchEvent(mouseDownEvent2);
    element.dispatchEvent(mouseUpEvent2);
    //element.dispatchEvent(doubleClickEvent);
}



// Exécuter les fonctions
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message reçu :", request);
    console.log(window.location.href);
    if (request.action === "solveQueens") {
        console.log("Extraction des nombres de couleurs...");
        const cellColorNumbers = extractCellColorNumbers();  // Extraire les couleurs des cellules
        console.log(cellColorNumbers)
        console.log("Résolution du problème...");
        const processedMatrix = processColorNumbers(cellColorNumbers);  // Résoudre le problème
        console.log(processedMatrix)
        
        for (let i = 0; i < processedMatrix.length; i++) {
            for (let j = 0; j < processedMatrix[i].length; j++) {
                if (processedMatrix[i][j]) {
                    // Calculer l'index basé sur i et j
                    const cellIndex = i * processedMatrix.length + j;
                    
                    // Rechercher l'élément correspondant à la case (i, j)
                    const element = document.querySelector(`.queens-cell[data-cell-idx="${cellIndex}"]`);
                    if (element) {
                        emulateDoubleClick(element);
                        console.log(`Successfully clicked on ${cellIndex}`);

                    } else {
                        console.log(`Cellule non trouvée pour l'index ${cellIndex}`);
                    }
                }
            }
        }
        
        sendResponse({ matrix: processedMatrix });  // Envoyer la matrice des solutions
    }
});