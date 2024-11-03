function extractCellData(){
    // Sélectionner toutes les cellules de la grille
    const cells = document.querySelectorAll('.lotka-cell');

    const svgHashes = {};  // Associe les hashes à un type ('Soleil' ou 'Lune')
    let currentType = 'Soleil'; // Premier type rencontré

    // Fonction de hash basique (ex : DJB2)
    function hashContent(content) {
        let hash = 5381;
        for (let i = 0; i < content.length; i++) {
            hash = (hash * 33) ^ content.charCodeAt(i);
        }
        return hash >>> 0; // Conversion en entier non signé
    }

    // Parcourir chaque cellule pour extraire les informations
    const cellData = Array.from(cells).map(cell => {
        // Récupérer le contenu de la cellule
        const contentSvg = cell.querySelector('.lotka-cell-content-img');
        let content = 'Vide';  // Valeur par défaut
        if (contentSvg && contentSvg.getAttribute('aria-label')) {
            content = contentSvg.getAttribute('aria-label');
        }
        else if (contentSvg) {
            const svgContent = contentSvg.outerHTML; // Contenu complet du SVG
            const hash = hashContent(svgContent);

            if (svgHashes[hash] === undefined) {
                svgHashes[hash] = currentType;
                currentType = currentType === 'Soleil' ? 'Lune' : 'Soleil';
            }
            content = svgHashes[hash];
        }

        // Récupérer la contrainte à droite
        const rightEdge = cell.querySelector('.lotka-cell-edge--right svg');
        let rightConstraint = 'Vide';  // Valeur par défaut
        if (rightEdge && rightEdge.getAttribute('aria-label')) {
            rightConstraint = rightEdge.getAttribute('aria-label');
        }

        // Récupérer la contrainte en bas
        const downEdge = cell.querySelector('.lotka-cell-edge--down svg');
        let downConstraint = 'Vide';  // Valeur par défaut
        if (downEdge && downEdge.getAttribute('aria-label')) {
            downConstraint = downEdge.getAttribute('aria-label');
        }

        return {
            content: content,
            rightConstraint: rightConstraint,
            downConstraint: downConstraint
        };
    });

    return cellData;
}

extractCellData();


function transformCellData(cellData) {
    // Calculer la taille n de la matrice
    const n = Math.sqrt(cellData.length);
    if (!Number.isInteger(n)) {
        console.error("Le nombre de cellules dans cellData n'est pas un carré parfait.");
        return;
    }

    // Initialiser les matrices
    const content = Array.from({ length: n }, () => Array(n).fill(0));
    const H = Array.from({ length: n }, () => Array.from({ length: n }, () => [0, 0]));
    const V = Array.from({ length: n }, () => Array.from({ length: n }, () => [0, 0]));

    // Remplir les matrices
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const cellIndex = i * n + j;
            const cell = cellData[cellIndex];

            // Remplir la matrice content
            if (cell.content == "Vide"){
                content[i][j] = 0;
            }
            else if (cell.content == "Soleil"){
                content[i][j] = 1;
            }
            else {
                content[i][j] = -1;
            }
            ; // Ajuster en fonction de la structure de cellData

            

            // Remplir la matrice H
            if (j > 0) {
                const leftCell = cellData[cellIndex - 1];
                if (leftCell.rightConstraint === 'Égal') {
                    H[i][j][0] = 1;
                } else if (leftCell.rightConstraint === 'Cross') {
                    H[i][j][0] = -1;
                }
            }
            if (cell.rightConstraint === 'Égal') {
                H[i][j][1] = 1;
            } else if (cell.rightConstraint === 'Cross') {
                H[i][j][1] = -1;
            }

            // Remplir la matrice V
            if (i > 0) {
                const topCell = cellData[cellIndex - n];
                if (topCell.downConstraint === 'Égal') {
                    V[i][j][0] = 1;
                } else if (topCell.downConstraint === 'Cross') {
                    V[i][j][0] = -1;
                }
            }
            if (cell.downConstraint === 'Égal') {
                V[i][j][1] = 1;
            } else if (cell.downConstraint === 'Cross') {
                V[i][j][1] = -1;
            }
        }
    }

    return { content, H, V };
}


class TangoSolver {
    constructor(matrix, vertical, horizontal) {
        this.m = matrix;
        this.v = vertical;
        this.h = horizontal;
        this.side = matrix[0].length; // Supposons que la matrice est carrée
    }

    isRankOk(i) {
        let m = 0;
        let s = 0;
        let minRow = 0;
        let sinRow = 0;

        for (let j = 0; j < this.side; j++) {
            if (this.m[i][j] === -1) {
                m++;
                minRow++;
                sinRow = 0;
            } else if (this.m[i][j] === 1) {
                s++;
                sinRow++;
                minRow = 0;
            } else if (this.m[i][j] === 0) {
                sinRow = 0;
                minRow = 0;
            }
            if (minRow >= 3 || sinRow >= 3) {
                return false;
            }
        }
        return m <= 3 && s <= 3;
    }

    isFileOk(j) {
        let m = 0;
        let s = 0;
        let minRow = 0;
        let sinRow = 0;

        for (let i = 0; i < this.side; i++) {
            if (this.m[i][j] === -1) {
                m++;
                minRow++;
                sinRow = 0;
            } else if (this.m[i][j] === 1) {
                s++;
                sinRow++;
                minRow = 0;
            } else if (this.m[i][j] === 0) {
                sinRow = 0;
                minRow = 0;
            }
            if (minRow >= 3 || sinRow >= 3) {
                return false;
            }
        }
        return m <= 3 && s <= 3;
    }

    tango(i, j, symbol) {
        if (this.m[i][j] === 0) {
            this.m[i][j] = symbol;

            if (!this.isFileOk(j) || !this.isRankOk(i)) {
                return false;
            }

            const [cg, cd] = this.h[i][j];
            const [ch, cb] = this.v[i][j];

            let bg = true, bd = true, bb = true, bh = true;

            if (cg === -1) { // not
                bg = this.tango(i, j - 1, -symbol);
            } else if (cg === 1) { // equals
                bg = this.tango(i, j - 1, symbol);
            }
            if (cd === -1) {
                bd = this.tango(i, j + 1, -symbol);
            } else if (cd === 1) {
                bd = this.tango(i, j + 1, symbol);
            }
            if (cb === -1) { // not
                bb = this.tango(i + 1, j, -symbol);
            } else if (cb === 1) { // equals
                bb = this.tango(i + 1, j, symbol);
            }
            if (ch === -1) {
                bh = this.tango(i - 1, j, -symbol);
            } else if (ch === 1) {
                bh = this.tango(i - 1, j, symbol);
            }

            return bg && bd && bb && bh;
        } else if (this.m[i][j] === symbol) {
            return true;
        } else {
            return false;
        }
    }

    full() {
        return this.m.flat().filter(val => val !== 0).length === this.side ** 2;
    }

    getNonZeroPosition() {
        for (let i = 0; i < this.side; i++) {
            for (let j = 0; j < this.side; j++) {
                if (this.m[i][j] === 0) {
                    return [i, j];
                }
            }
        }
        return null; // Si aucune position n'est trouvée
    }

    solve() {
        if (this.full()) {
            return true;
        } else {
            const matrix = JSON.parse(JSON.stringify(this.m)); // Créer une copie profonde
            const [i, j] = this.getNonZeroPosition();
            if (this.tango(i, j, 1) && this.solve()) {
                return true;
            } else {
                this.m = JSON.parse(JSON.stringify(matrix)); // Restaurer l'ancienne matrice
            }
            if (this.tango(i, j, -1) && this.solve()) {
                return true;
            } else {
                this.m = JSON.parse(JSON.stringify(matrix)); // Restaurer l'ancienne matrice
            }

            return false;
        }
    }
}

function processTango(matrix,v,h) {

    // Créer une instance de QueensSolver
    const solver = new TangoSolver(matrix,v,h);

    // Résoudre et obtenir la matrice de booléens
    solver.solve();

    return solver.m;
}

function emulateSimpleClick(element) {
    const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
    const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
    //const doubleClickEvent = new MouseEvent('dblclick', { bubbles: true });

    element.dispatchEvent(mouseDownEvent);
    element.dispatchEvent(mouseUpEvent);
    //element.dispatchEvent(doubleClickEvent);
}

function emulateDoubleClick(element){
    emulateSimpleClick(element);
    emulateSimpleClick(element);
}



// Exécuter les fonctions
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message reçu :", request);
    console.log(window.location.href);
    if (request.action === "solveTango") {
        console.log("Extraction des cellules...");
        const cellData = extractCellData();  // Extraire les couleurs des cellules
        const o = transformCellData(cellData);
        console.log(cellData);
        const matrix = o.content;
        const h = o.H;
        const v = o.V;

        console.log("Résolution du problème...");
        const processedMatrix = processTango(matrix,v,h);  // Résoudre le problème
        console.log(processedMatrix)
        
        for (let i = 0; i < processedMatrix.length; i++) {
            for (let j = 0; j < processedMatrix[i].length; j++) {
                // Calculer l'index basé sur i et j
                const cellIndex = i * processedMatrix.length + j;
                
                // Rechercher l'élément correspondant à la case (i, j)
                const element = document.querySelector(`.lotka-cell[data-cell-idx="${cellIndex}"]`);
                if (element) {
                    if (processedMatrix[i][j] == -1){
                        emulateDoubleClick(element);
                        console.log(`Successfully clicked on ${cellIndex}`);
                    }
                    else if (processedMatrix[i][j] == 1){
                        emulateSimpleClick(element);
                        console.log(`Successfully clicked on ${cellIndex}`);
                    }
                    
                } else {
                    console.log(`Cellule non trouvée pour l'index ${cellIndex}`);
                }
            }
        }
        
        sendResponse({ matrix: processedMatrix });  // Envoyer la matrice des solutions
    }
});