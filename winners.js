document.addEventListener('DOMContentLoaded', () => {
    const totalBoardsInput = document.getElementById('totalBoardsInput');
    const winnersList = document.getElementById('winnersList');
    const figureOptionsForm = document.getElementById('figureOptionsForm');
    let totalBoards = parseInt(totalBoardsInput.value, 10);
    let generatedNumbers = JSON.parse(localStorage.getItem('generatedNumbers')) || [];

    // Actualiza totalBoards cuando el input cambie
    totalBoardsInput.addEventListener('input', () => {
        totalBoards = parseInt(totalBoardsInput.value, 10);
        checkForWinners(); // Vuelve a verificar los ganadores con el nuevo número de cartones
    });
                
    // Verificar si los elementos son seleccionados correctamente
    if (!winnersList) {
        console.error('No se encontró el elemento con id winnersList');
    }

    if (!figureOptionsForm) {
        console.error('No se encontró el elemento con id figureOptionsForm');
    }



    // Definimos las figuras posibles
    const figures = {
        'letraB': [
            true,  true, true, true, true,
            true, false,  true, false,  true,
            true, false, false,  false, true,
            true, false,  true, false,  true,
            true,  true, false, true, true
        ],
        'letraN': [
            true,  true, true, true, true,
            false, true,  false, false,  false,
            false, false, false,  false, false,
            false, false,  false, true,  false,
            true,  true, true, true, true
        ],
        'letraG': [
            true,  true, true, true, true,
            true, false,  false, false,  true,
            true, false, false,  false, true,
            true, false,  true, false,  true,
            true,  false, true, true, true
        ],
        'letraT': [
            true,  false, false, false, false,
            true, false,  false, false,  false,
            true, true, false,  true, true,
            true, false,  false, false,  false,
            true,  false, false, false, false
        ],
        'L': [
            true, true, true,  true, true,
            false, false, false,  false, true,
            false,  false,  false,  false,  true,
            false, false, false,  false, true,
            false, false, false,  false, true
        ],
         'letraP': [
            true,  true, true, true, true,
            true, false,  true, false,  false,
            true, false, false,  false, false,
            true, false,  true, false,  false,
            true,  true, true, false, false
        ],
         'letrai': [
            true,  false, false, false, true,
            true, false,  false, false,  true,
            true, true, false,  true, true,
            true, false,  false, false,  true,
            true,  false, false, false, true
        ],
        'letraS': [
            true,  true, true, false, true,
            true, false,  true, false,  true,
            true, false, false,  false, true,
            true, false,  true, false,  true,
            true,  false, true, true, true
        ],
        'letraZ': [
           true,  false, false, false, true,
            true, false,  false, true,  true,
            true, false, false,  false, true,
            true, true,  false, false,  true,
            true,  false, false, false, true
        ],
        'AJEDREZ': [
        true,  false, true,  false, true,
        false, true,  false, true,  false,
        true,  false, false,  false, true,
        false, true,  false, true,  false,
        true,  false, true,  false, true
    ],
        'letraX': [
            true,  false, false, false, true,
            false, true,  false, true,  false,
            false, false, false,  false, false,
            false, true,  false, true,  false,
            true,  false, false, false, true
        ],
        '2linea': [
            true, true, false, false, false,
            true, true, false, false, false,
            true, true, false, false, false,
            true, true, false, false, false,
            true, true, false, false, false
        ],
        'LINEA': [
            true, false, false, false, false,
            true, false, false, false, false,
            true, false, false, false, false,
            true, false, false, false, false,
            true, false, false, false, false
        ],
        '4ESQUINAS': [
            true, false, false, false, true,
            false, false, false, false, false,
            false, false, false, false, false,
            false, false, false, false, false,
            true, false, false, false, true
        ],
         'COMODIN': [
            false, false, false, false, false,
            false, true, true, true, false,
            false, true, false, true, false,
            false, true, true, true, false,
            false, false, false, false, false
        ],
        'numeral': [
            false, true, false, true, false,
            true, true, true, true, true,
            false, true, false, true, false,
            true, true, true, true, true,
            false, true, false, true, false
        ],
        'letraU': [
            true, true, true, true, true,
            false, false, false, false, true,
            false, false, false, false, true,
            false, false, false, false, true,
            true, true, true, true, true
        ],
         'J': [
            false, false, false,  false, false,
            false, false, false,  true, true,
            true,  false,  false,  false,  true,
            true, true, true,  true, true,
            true, false, false,  false, false
        ],
        'cartonlleno': [
            true, true, true,  true, true,
            true, true, true,  true, true,
            true,  true,  false,  true,  true,
            true, true, true,  true, true,
            true, true, true,  true, true
        ],
        'Numerouno': [
            false, false, false,  false, false,
            false, true, false,  false, true,
            true,  true,  false,  true,  true,
            false, false, false,  false, true,
            false, false, false,  false, false
        ],
        'Numerodos': [
           false,  false, false, false, false,
            true, false,  false, true,  true,
            true, false, false,  false, true,
            true, true,  false, false,  true,
            false,  false, false, false, false
        ],
        'Numerotres': [
           false,  false, false, false, false,
            true, false,  false, false,  true,
            true, false, false,  false, true,
            true, true,  true, true,  true,
            false,  false, false, false, false
        ],
        'Numerocuatro': [
           false,  false, false, false, false,
            true, true,  true, false,  false,
            false, false, false,  false, false,
            true, true,  true, true,  true,
            false,  false, false, false, false
        ],
        'Numero5': [
           false,  false, false, false, false,
            true, true,  true, false,  true,
            true, false, false,  false, true,
            true, false,  true, true,  true,
            false,  false, false, false, false
        ],

        'Numero6': [
           false,  false, false, false, false,
            true, true,  true, true,  true,
            true, false, false,  false, true,
            true, false,  true, true,  true,
            false,  false, false, false, false
        ],
        
        'letraA': [
           true,  true, true, true, true,
            true, false,  true, false,  false,
            true, false, false,  false, false,
            true, false,  true, false,  false,
            true,  true, true, true, true
        ],
        'letraE': [
            true,  true, true, true, true,
            true, false,  true, false,  true,
            true, false, false,  false, true,
            true, false,  true, false,  true,
            true,  false, true, false, true
        ],

        'letraO': [
            true, true, true, true, true,
            true, false, false, false, true,
            true, false, false, false, true,
            true, false, false, false, true,
            true, true, true, true, true
        ],

        'diamante': [
            false,  false, true, false, false,
            false, true,  false, true,  false,
            true, false, false,  false, true,
            false, true,  false, true,  false,
            false,  false, true, false, false
        ],

        'barco': [
            false,  false, false, true, false,
            false, false,  false, true,  true,
            true, true, false,  true, true,
            false, true,  false, true,  true,
            false,  false, false, true, false
        ],

        'avion': [
            false,  true, true, true, false,
            false, false,  true, false,  false,
            false, false, false,  false, false,
            true, true,  true, true,  true,
            false,  false, true, false, false
        ],

        'mediatabla': [
            true,  true, true, true, true,
            true, true,  true, true,  false,
            true, true, false,  false, false,
            true, true,  false, false,  false,
            true,  false, false, false, false
        ],
        
        'cruzevastica': [
            true, true, true, false, true,
            false, false, true, false, true,
            true, true, false, true, true,
            true, false, true, false, false,
            true, false, true, true, true
        ]

        



        //NUEVAS FIGURAS
        

        // Añadir otras figuras aquí
        
    };

   let playerNames = JSON.parse(localStorage.getItem('playerNames')) || {};

    function getSelectedFigures() {
        const checkboxes = document.querySelectorAll('#figureOptionsForm input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(checkbox => checkbox.value);
    }

    function checkForWinners() {
        winnersList.innerHTML = '';
        const selectedFigures = getSelectedFigures();
        for (let i = 1; i <= totalBoards; i++) {
            const boardNumbers = generateBoardNumbers(i);
            for (const figureName of selectedFigures) {
                if (isWinningBoard(boardNumbers, figures[figureName])) {
                    addWinnerToList(i, figureName);
                }
            }
        }
    }

    function generateBoardNumbers(boardNumber) {
        const boardNumbers = [];
        for (let col = 0; col < 5; col++) {
            const start = col * 15 + 1;
            const end = start + 14;
            const colNumbers = getSeededRandomNumbers(start, end, 5, boardNumber * 10 + col);
            boardNumbers.push(...colNumbers);
        }
        return boardNumbers;
    }

    function isWinningBoard(boardNumbers, figurePattern) {
        return figurePattern.every((marked, index) => !marked || generatedNumbers.includes(boardNumbers[index]));
    }

    function addWinnerToList(boardNumber, figureName) {
        const playerName = playerNames[boardNumber] || 'Sin nombre';
        const listItem = document.createElement('li');
        listItem.textContent = `Cartón Nº ${boardNumber} (${playerName}) - Figura: ${figureName}`;
        winnersList.appendChild(listItem);
    }

    function getSeededRandomNumbers(min, max, count, seed) {
        const numbers = [];
        while (numbers.length < count) {
            const num = Math.floor(seedRandom(seed++) * (max - min + 1)) + min;
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        return numbers;
    }

    function seedRandom(seed) {
        var x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    function toggleMarkNumber(number) {
        const index = generatedNumbers.indexOf(number);
        if (index > -1) {
            generatedNumbers.splice(index, 1);
        } else {
            generatedNumbers.push(number);
        }
        saveState();
        updateMasterBoard();
        checkForWinners();
    }

    function updateMasterBoard() {
        document.querySelectorAll('#masterBoardContainer .bingoCell').forEach(cell => {
            const number = parseInt(cell.dataset.number);
            if (generatedNumbers.includes(number)) {
                cell.classList.add('master-marked');
            } else {
                cell.classList.remove('master-marked');
            }
        });
    }

    function saveState() {
        localStorage.setItem('generatedNumbers', JSON.stringify(generatedNumbers));
    }

    document.querySelectorAll('#masterBoardContainer .bingoCell').forEach(cell => {
        cell.addEventListener('click', () => {
            const number = parseInt(cell.dataset.number);
            toggleMarkNumber(number);
        });
    });

    updateMasterBoard();
    checkForWinners();
});
