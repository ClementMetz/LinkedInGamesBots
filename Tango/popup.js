document.addEventListener('DOMContentLoaded', function() {
    const solveButton = document.getElementById('solveTangoBtn');
    
    // Vérifie que le bouton existe avant d'ajouter un gestionnaire d'événement
    if (solveButton) {
        solveButton.addEventListener('click', () => {
            // Envoyer un message au content script pour lancer le solveur
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { action: "solveTango" }, (response) => {
                    if (response && response.matrix) {
                        displayMatrix(response.matrix);
                    } else {
                        console.error('Aucune matrice renvoyée.');
                    }
                });
            });
        });
    } else {
        console.error('Le bouton Solve Tango est introuvable.');
    }
});

// Fonction pour afficher la matrice de résultats dans la popup
function displayMatrix(matrix) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';  // Clear previous result

    const table = document.createElement('table');
    table.style.border = '1px solid black';
    table.style.borderCollapse = 'collapse';

    matrix.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.style.border = '1px solid black';
            td.style.padding = '10px';
            if (cell == -1){
                td.innerText = 'M'
            }
            else if (cell == 1){
                td.innerText = 'S'
            }
            else {
                td.innerText = ''
            }
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    resultDiv.appendChild(table);  // Ajouter le tableau à la popup
}
