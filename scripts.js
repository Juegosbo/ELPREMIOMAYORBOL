document.addEventListener('DOMContentLoaded', () => {
    const masterBoardContainer = document.getElementById('masterBoardContainer');
    const bingoBoardsContainer = document.getElementById('bingoBoardsContainer');
    const clearMarksBtn = document.getElementById('clearMarks');
    const nameCardsBtn = document.getElementById('nameCards');
    const searchBox = document.getElementById('searchBox');
    const searchButton = document.getElementById('searchButton');
    const winnerButton = document.getElementById('winnerButton');
    const winnerVideoContainer = document.getElementById('winnerVideoContainer');
    const winnerVideo = document.getElementById('winnerVideo');
    const closeVideoButton = document.getElementById('closeVideo');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    const selectFigure = document.getElementById('selectFigure');
    const figurePreviewContainer = document.getElementById('figurePreviewContainer');
    const figurePreview = document.getElementById('figurePreview');
    const printButton = document.getElementById('printButton');

    closeVideoButton.addEventListener('click', () => {
        winnerVideoContainer.style.display = 'none';
        winnerVideo.pause();
    });

    const boardsPerPage = 9;
    const totalBoards = 50000;

    let generatedNumbers = [];
    let playerNames = JSON.parse(localStorage.getItem('playerNames')) || {};
    let selectedFigure = localStorage.getItem('selectedFigure') || '';
    let currentPage = parseInt(localStorage.getItem('currentPage')) || 1;

    // Calcular páginas totales
    let totalPages = Math.ceil(totalBoards / boardsPerPage);
    totalPagesSpan.textContent = totalPages;

    loadState();  // Cargar el estado guardado

    createMasterBoard();
    createBingoBoards(currentPage);
    
    if (selectedFigure) {
        updateFigurePreview(selectedFigure);
        markFigureNumbers();
    }

    searchButton.addEventListener('click', filterBoards);
    clearMarksBtn.addEventListener('click', () => {
    clearMarks();
    document.getElementById('listagana').innerHTML = ''; // Limpiar la lista de ganadores
});
    nameCardsBtn.addEventListener('click', () => {
        window.location.href = 'naming.html';
    });
    winnerButton.addEventListener('click', () => {
        winnerVideoContainer.style.display = 'block';
        winnerVideo.play();
    });
    prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
    nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));
    selectFigure.addEventListener('change', (e) => {
        const figure = e.target.value;
        updateFigurePreview(figure);
    });

    printButton.addEventListener('click', async () => {
    const boards = document.querySelectorAll('.bingoBoard');

    // Función para descargar una imagen del cartón
    const downloadCanvasImage = async (board, boardNumber) => {
        const canvas = await html2canvas(board, { backgroundColor: null });
        const imgData = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = imgData;
        link.download = `bingo_carton_${boardNumber}.png`;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Evitar descargas duplicadas
    const uniqueBoards = new Set();

    for (let i = 0; i < boards.length; i++) {
        const board = boards[i];
        const boardNumberElement = board.querySelector('.bingoBoardNumber');

        if (boardNumberElement && !board.closest('#masterBoardContainer') && !board.closest('#figurePreviewContainer')) {
            const boardNumber = boardNumberElement.textContent.replace(/\D/g, ''); // Extraer el número del cartón
            if (!uniqueBoards.has(boardNumber)) {
                uniqueBoards.add(boardNumber);
                await downloadCanvasImage(board, boardNumber);
            }
        }
    }
});

    function createMasterBoard() {
        masterBoardContainer.innerHTML = '';
        const board = document.createElement('div');
        board.classList.add('bingoBoard');

        const header = document.createElement('div');
        header.classList.add('bingoHeader');
        ['B', 'I', 'N', 'G', 'O'].forEach(letter => {
            const cell = document.createElement('div');
            cell.textContent = letter;
            header.appendChild(cell);
        });
        board.appendChild(header);

        const columns = document.createElement('div');
        columns.classList.add('bingoColumns');
        columns.style.display = 'grid';
        columns.style.gridTemplateColumns = 'repeat(5, 1fr)';
        columns.style.gap = '5px';

        const bColumn = createFixedBingoColumn(1, 15);
        const iColumn = createFixedBingoColumn(16, 30);
        const nColumn = createFixedBingoColumn(31, 45);
        const gColumn = createFixedBingoColumn(46, 60);
        const oColumn = createFixedBingoColumn(61, 75);

        columns.appendChild(bColumn);
        columns.appendChild(iColumn);
        columns.appendChild(nColumn);
        columns.appendChild(gColumn);
        columns.appendChild(oColumn);

        board.appendChild(columns);
        masterBoardContainer.appendChild(board);

        // Marcar números previamente generados
        generatedNumbers.forEach(number => {
            const cell = board.querySelector(`[data-number="${number}"]`);
            if (cell) {
                cell.classList.add('master-marked');
            }
        });
    }

    function createFixedBingoColumn(min, max) {
        const column = document.createElement('div');
        column.classList.add('bingoColumn');
        for (let i = min; i <= max; i++) {
            const cell = document.createElement('div');
            cell.classList.add('bingoCell');
            cell.textContent = i;
            cell.dataset.number = i;
            cell.addEventListener('click', () => toggleMarkNumber(i));
            column.appendChild(cell);
        }
        return column;
    }

    function toggleMarkNumber(number) {
        const index = generatedNumbers.indexOf(number);
        if (index > -1) {
            generatedNumbers.splice(index, 1);
        } else {
            generatedNumbers.push(number);
        }
        saveState();

        document.querySelectorAll('#masterBoardContainer .bingoCell').forEach(cell => {
            if (parseInt(cell.dataset.number) === number) {
                cell.classList.toggle('master-marked');
            }
        });

        document.querySelectorAll('.bingoBoard:not(#masterBoardContainer) .bingoCell').forEach(cell => {
            if (parseInt(cell.dataset.number) === number) {
                cell.classList.toggle('marked');
            }
        });

        if (selectedFigure) {
            markFigureNumbers();
        }
        
     }

    function seedRandom(seed) {
        var x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
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

    function createBingoBoards(page) {
        bingoBoardsContainer.innerHTML = '';
        const startBoard = (page - 1) * boardsPerPage + 1;
        const endBoard = Math.min(startBoard + boardsPerPage - 1, totalBoards);

        for (let i = startBoard; i <= endBoard; i++) {
            const board = document.createElement('div');
            board.classList.add('bingoBoard');
            board.dataset.boardNumber = i;

            const boardNumberContainer = document.createElement('div');
            boardNumberContainer.classList.add('boardNumberContainer');
            
            const boardNumber = document.createElement('div');
            boardNumber.classList.add('bingoBoardNumber');
            boardNumber.textContent = `Cartón Nº ${i}`;

            const playerName = document.createElement('div');
            playerName.classList.add('playerName');
            playerName.textContent = playerNames[i] || 'Sin nombre';
            
            boardNumberContainer.appendChild(boardNumber);
            boardNumberContainer.appendChild(playerName);
            board.appendChild(boardNumberContainer);

            const header = document.createElement('div');
            header.classList.add('bingoHeader');
            ['B', 'I', 'N', 'G', 'O'].forEach(letter => {
                const cell = document.createElement('div');
                cell.textContent = letter;
                header.appendChild(cell);
            });
            board.appendChild(header);

            const columns = document.createElement('div');
            columns.classList.add('bingoColumns');
            columns.style.display = 'grid';
            columns.style.gridTemplateColumns = 'repeat(5, 1fr)';
            columns.style.gap = '0px';

            const bColumn = createBingoColumn(1, 15, i, 0);
            const iColumn = createBingoColumn(16, 30, i, 1);
            const nColumn = createBingoColumn(31, 45, i, 2, true);
            const gColumn = createBingoColumn(46, 60, i, 3);
            const oColumn = createBingoColumn(61, 75, i, 4);

            columns.appendChild(bColumn);
            columns.appendChild(iColumn);
            columns.appendChild(nColumn);
            columns.appendChild(gColumn);
            columns.appendChild(oColumn);

            board.appendChild(columns);
            bingoBoardsContainer.appendChild(board);
        }

        generatedNumbers.forEach(number => {
            document.querySelectorAll(`[data-number="${number}"]`).forEach(cell => {
                cell.classList.add('marked');
            });
        });

        if (selectedFigure) {
            markFigureNumbers();
        }

        currentPageSpan.textContent = currentPage; 
    }

    function createBingoColumn(min, max, boardNumber, column, hasFreeCell = false) {
        const columnDiv = document.createElement('div');
        columnDiv.classList.add('bingoColumn');
        const numbers = getSeededRandomNumbers(min, max, 5, boardNumber * 10 + column);

        numbers.forEach((num, index) => {
            const cell = document.createElement('div');
            cell.classList.add('bingoCell');
            const cellNumber = hasFreeCell && index === 2 ? '' : num;
            cell.textContent = cellNumber;
            cell.dataset.number = cellNumber;

            if (cellNumber === '') {
                cell.classList.add('free');
            }

            if (cellNumber === '' || generatedNumbers.includes(Number(cellNumber))) {
                cell.classList.add('marked');
            }
            columnDiv.appendChild(cell);
        });

        return columnDiv;
    }

 function clearMarks() {
        document.querySelectorAll('.bingoBoard:not(#masterBoardContainer) .bingoCell').forEach(cell => {
            cell.classList.remove('marked', 'figure-marked');
        });

        document.querySelectorAll('#masterBoardContainer .bingoCell').forEach(cell => {
            cell.classList.remove('master-marked');
        });

        generatedNumbers = [];
        saveState();
    }

    function saveState() {
    localStorage.setItem('generatedNumbers', JSON.stringify(generatedNumbers));
    localStorage.setItem('bingoBoardsState', JSON.stringify(bingoBoardsState));
    localStorage.setItem('playerNames', JSON.stringify(playerNames));
    localStorage.setItem('selectedFigure', selectedFigure);
    localStorage.setItem('currentPage', currentPage.toString());

    // Guardar las marcas en la tabla maestra
    const masterBoardMarks = Array.from(document.querySelectorAll('#masterBoardContainer .bingoCell.master-marked')).map(cell => parseInt(cell.dataset.number));
    localStorage.setItem('masterBoardMarks', JSON.stringify(masterBoardMarks));
}

    function loadState() {
    generatedNumbers = JSON.parse(localStorage.getItem('generatedNumbers')) || [];
    bingoBoardsState = JSON.parse(localStorage.getItem('bingoBoardsState')) || {};
    playerNames = JSON.parse(localStorage.getItem('playerNames')) || {};
    selectedFigure = localStorage.getItem('selectedFigure') || '';
    currentPage = parseInt(localStorage.getItem('currentPage')) || 1;

    // Cargar las marcas en la tabla maestra
    const masterBoardMarks = JSON.parse(localStorage.getItem('masterBoardMarks')) || [];
    masterBoardMarks.forEach(number => {
        const cell = document.querySelector(`#masterBoardContainer .bingoCell[data-number="${number}"]`);
        if (cell) {
            cell.classList.add('master-marked');
        }
    });

    // Actualizar el selector de figura
    if (selectedFigure) {
        selectFigure.value = selectedFigure;
    }
}

    function filterBoards() {
        const query = searchBox.value.trim().toLowerCase();
        let found = false;

        document.querySelectorAll('.bingoBoard').forEach(board => {
            board.classList.remove('blurry');
            board.classList.remove('highlighted-permanent');
        });

        for (let page = 1; page <= totalPages; page++) {
            const startBoard = (page - 1) * boardsPerPage + 1;
            const endBoard = Math.min(startBoard + boardsPerPage - 1, totalBoards);

            for (let i = startBoard; i <= endBoard; i++) {
                const playerName = playerNames[i] ? playerNames[i].toLowerCase() : '';
                if (i.toString().includes(query) || playerName.includes(query)) {
                    found = true;
                    changePage(page);
                    setTimeout(() => {
                        const board = document.querySelector(`.bingoBoard[data-board-number='${i}']`);
                        if (board) {
                            document.querySelectorAll('.bingoBoard').forEach(b => {
                                if (b !== board && !b.closest('#masterBoardContainer')) {
                                    b.classList.add('blurry');
                                }
                            });
                            document.getElementById('masterBoardContainer').classList.remove('blurry');

                            board.classList.remove('blurry');
                            board.scrollIntoView({ behavior: 'smooth' });
                            board.classList.add('highlighted-permanent');

                            const closeButton = document.createElement('button');
                            closeButton.textContent = 'X';
                            closeButton.classList.add('closeButton');
                            closeButton.addEventListener('click', () => {
                                board.classList.remove('highlighted-permanent');
                                board.querySelector('.closeButton').remove();
                                document.querySelectorAll('.bingoBoard').forEach(b => {
                                    b.classList.remove('blurry');
                                });
                            });

                            board.appendChild(closeButton);
                        }
                    }, 500);
                    break;
                }
            }

            if (found) {
                break;
            }
        }

        if (!found) {
            alert('No se encontró el cartón.');
        }
    }

    function changePage(newPage) {
        if (newPage < 1 || newPage > totalPages) return;
        currentPage = newPage;
        createBingoBoards(currentPage);
        saveState();
        currentPageSpan.textContent = currentPage;
    }

    function updateFigurePreview(figure) {
        figurePreview.innerHTML = '';
        let cells = Array(25).fill(false);
        let figureImageSrc = '';

        switch (figure) {
            case 'letraT':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'LetraT.png'; // Cambia a la ruta de tu imagen
            break;
            case 'letraL':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'LetraL.PNG'; // Cambia a la ruta de tu imagen
            break;

            case 'letraP':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'LetraP.png'; // Cambia a la ruta de tu imagen
            break;

            case 'letraI':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'LetraI.PNG'; // Cambia a la ruta de tu imagen
            break;

            case 'letraS':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'LetraS.PNG'; // Cambia a la ruta de tu imagen
            break;

            case 'letraZ':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'LetraZ.png'; // Cambia a la ruta de tu imagen
            break;
            
            case 'corazon':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'Corazon.PNG'; // Cambia a la ruta de tu imagen
            break;
        case 'cross':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'cross.PNG'; // Cambia a la ruta de tu imagen
            break;

            /* NUEVAS FIGURAS */

            case 'Explosion':
            cells = [
                true, false, false,  false, true,
                false, false, true,  false, false,
                false,  true,  true,  true,  false,
                false, false, true,  false, false,
                true, false, false,  false, true
            ];
            figureImageSrc = 'Explosion.PNG'; // Cambia a la ruta de tu imagen
            break;

            case 'Ahorcado':
            cells = [
                false, false, true,  false, true,
                true, true, true,  true, false,
                true,  false,  true,  false,  true,
                true, false, false,  false, false,
                true, true, true,  true, true
            ];
            figureImageSrc = 'Ahorcado.PNG'; // Cambia a la ruta de tu imagen
            break;

            case 'Paraguas':
            cells = [
                false, true, false,  true, false,
                true, true, false,  false, true,
                true,  true,  true,  true,  false,
                true, true, false,  false, false,
                false, true, false,  false, false
            ];
            figureImageSrc = 'paraguas.PNG'; // Cambia a la ruta de tu imagen
            break;

/*FIN DE NUEVAS FIGURAS */
            
        case 'bigO':
            cells = [
                true,  true,  true,  true,  true,
                true,  false, false, false, true,
                true,  false, false, false, true,
                true,  false, false, false, true,
                true,  true,  true,  true,  true
            ];
            figureImageSrc = 'bigO.png'; // Cambia a la ruta de tu imagen
            break;
        case 'diamond':
            cells = [
                false, false, true,  false, false,
                false, true,  false, true,  false,
                true,  false, false, false, true,
                false, true,  false, true,  false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'diamond.PNG'; // Cambia a la ruta de tu imagen
            break;
        case 'fourCorners':
            cells = [
                true,  false, false, false, true,
                false, false, false, false, false,
                false, false, false, false, false,
                false, false, false, false, false,
                true,  false, false, false, true
            ];
            figureImageSrc = 'fourCorners.PNG'; // Cambia a la ruta de tu imagen
            break;
        case 'letterH':
            cells = [
                true, true, true, true, true,
                false, false, true, false, false,
                false, false, true, false, false,
                false, false, true, false, false,
                true, true, true, true, true
            ];
            figureImageSrc = 'letterH.PNG'; // Cambia a la ruta de tu imagen
            break;
        case 'tree':
            cells = [
                false, false, true,  false, false,
                false, true,  true,  false,  false,
                true,  true, true,  true, true,
                false, true,  true,  false,  false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'tree.PNG'; // Cambia a la ruta de tu imagen
            break;
        case 'numberOne':
            cells = [
               false, false, true,  false, false,
               false, false, true,  false, false,
               false, false, true,  false, false,
               false, false, true,  false, false,
               false,  false,  true,  false,  false
            ];
            figureImageSrc = 'numberOne.PNG'; // Cambia a la ruta de tu imagen
            break;
        case 'chess':
            cells = [
                true,  false, true,  false, true,
                false, true,  false, true,  false,
                true,  false, true,  false, true,
                false, true,  false, true,  false,
                true,  false, true,  false, true
            ];
            figureImageSrc = 'chess.png'; // Cambia a la ruta de tu imagen
            break;
        case 'diagonals':
            cells = [
                true,  false, false, false, true,
                false, true,  false, true,  false,
                false, false, true,  false, false,
                false, true,  false, true,  false,
                true,  false, false, false, true
            ];
            figureImageSrc = 'diagonals.png'; // Cambia a la ruta de tu imagen
            break;

    /* NUEVAS FIGURAS */
                case 'Numero2':
            cells = [
                false,  false, false, false, false,
                true, false,  false, true,  true,
                true, false, false,  false, true,
                true, true,  false, false,  true,
                false,  false, false, false, false
            ];
            figureImageSrc = 'diagonals.png'; // Cambia a la ruta de tu imagen
            break;
         case 'Numero3':
            cells = [
                false,  false, false, false, false,
                true, false,  false, false,  true,
                true, false, false,  false, true,
                true, true,  false, true,  true,
                false,  false, false, false, false
            ];
            figureImageSrc = 'diagonals.png'; // Cambia a la ruta de tu imagen
            break;
         case 'Numero4':
            cells = [
                false,  false, false, false, false,
                true, true,  true, false,  false,
                false, false, false,  false, false,
                true, true,  true, true,  true,
                false,  false, false, false, false
            ];
            figureImageSrc = 'diagonals.png'; // Cambia a la ruta de tu imagen
            break;
         case 'letraA':
            cells = [
                true,  true, true, true, true,
                true, false,  true, false,  false,
                true, false, false,  false, false,
                true, false,  true, false,  false,
                true,  true, true, true, true
            ];
            figureImageSrc = 'diagonals.png'; // Cambia a la ruta de tu imagen
            break;
         case 'letraE':
            cells = [
                true,  true, true, true, true,
                true, false,  true, false,  true,
                true, false, false,  false, true,
                true, false,  true, false,  true,
                true,  false, true, false, true
            ];
            figureImageSrc = 'diagonals.png'; // Cambia a la ruta de tu imagen
            break;
         case 'letraU':
            cells = [
                true,  true, true, true, true,
                false, false,  false, false,  true,
                false, false, false,  false, true,
                false, false,  false, false,  true,
                true,  true, true, true, true
            ];
            figureImageSrc = 'diagonals.png'; // Cambia a la ruta de tu imagen
            break;
         case 'cartonllenos':
            cells = [
                true,  true, true, true, true,
                true, true,  true, true,  true,
                true, true, false,  true, true,
                true, true,  true, true,  true,
                true,  true, true, true, true
            ];
            figureImageSrc = 'diagonals.png'; // Cambia a la ruta de tu imagen
            break;
         case 'comodine':
            cells = [
                false,  false, false, false, false,
                false, true,  true, true,  false,
                false, true, false,  true, false,
                false, true,  true, true,  false,
                false,  false, false, false, false
            ];
            figureImageSrc = 'diagonals.png'; // Cambia a la ruta de tu imagen
            break;
            default:
                return;
        }

        const board = document.createElement('div');
        board.classList.add('bingoBoard', 'small', 'figure-board');

        const header = document.createElement('div');
        header.classList.add('bingoHeader');
        ['B', 'I', 'N', 'G', 'O'].forEach(letter => {
            const cell = document.createElement('div');
            cell.textContent = letter;
            header.appendChild(cell);
        });
        board.appendChild(header);

        const columns = document.createElement('div');
        columns.classList.add('bingoColumns');
        columns.style.display = 'grid';
        columns.style.gridTemplateColumns = 'repeat(5, 1fr)';
        columns.style.gap = '2px';

        cells.forEach((marked, index) => {
            const cell = document.createElement('div');
            cell.classList.add('bingoCell');
            if (index === 12) {
                cell.classList.add('free');
                cell.textContent = 'FREE';
            } else if (marked) {
                cell.classList.add('figure-marked');
            }
            columns.appendChild(cell);
        });

        board.appendChild(columns);
        figurePreview.appendChild(board);

        figurePreviewContainer.classList.remove('hidden');
        selectedFigure = figure;
        localStorage.setItem('selectedFigure', figure);
        markFigureNumbers();

        const figureImage = document.getElementById('figureImage');
        if (figureImageSrc) {
            figureImage.src = figureImageSrc;
            figureImage.style.display = 'block';
        } else {
            figureImage.style.display = 'none';
        }
    }

    function markFigureNumbers() {
        if (!selectedFigure) return;

        let cells = Array(25).fill(false);

        switch (selectedFigure) {
            case 'letraT':
            cells = [
                true, false, false,  false, false,
                true, false, false,  false, false,
                true,  true,  true,  true,  true,
                true, false, false,  false, false,
                true, false, false,  false, false
            ];
            break;
            case 'letraL':
            cells = [
                true, true, true,  true, true,
                false, false, false,  false, true,
                false,  false,  false,  false,  true,
                false, false, false,  false, true,
                false, false, false,  false, true
            ];
            break;

            case 'letraP':
            cells = [
                true, true, true,  true, true,
                true, false, true,  false, false,
                true,  false,  true,  false,  false,
                true, false, true,  false, false,
                true, true, true,  false, false
            ];
            break;

             case 'letraI':
            cells = [
                true, false, false,  false, true,
                true, false, false,  false, true,
                true,  true,  true,  true,  true,
                true, false, false,  false, true,
                true, false, false,  false, true
            ];
            break;

             case 'letraS':
            cells = [
                true, true, true,  false, true,
                true, false, true,  false, true,
                true,  false,  true,  false,  true,
                true, false, true,  false, true,
                true, false, true,  true, true
            ];
            break;

             case 'letraZ':
            cells = [
                true, false, false,  false, true,
                true, false, false,  true, true,
                true,  false,  true,  false,  true,
                true, true, false,  false, true,
                true, false, false,  false, true
            ];
            break;
            
            case 'corazon':
            cells = [
                false, true, true,  false, false,
                true, false, false,  true, false,
                false,  true,  false,  false,  true,
                true, false, false,  true, false,
                false, true, true,  false, false
            ];
            break;

            /*NUEVAS FIGURAS */
             case 'Explosion':
            cells = [
                true, false, false,  false, true,
                false, false, true,  false, false,
                false,  true,  true,  true,  false,
                false, false, true,  false, false,
                true, false, false,  false, true
            ];
           
            break;

            case 'Ahorcado':
            cells = [
                true, true, true,  true, true,
                true, false, false,  false, false,
                true,  false,  true,  false,  true,
                true, true, true,  true, false,
                false, false, true,  false, true
            ];
            break;

            case 'Paraguas':
            cells = [
                false, true, false,  true, false,
                true, true, false,  false, true,
                true,  true,  true,  true,  false,
                true, true, false,  false, false,
                false, true, false,  false, false
            ];
           
            break;

            /*HASTA AQUI NUEVAS FIGURAS */
            
        case 'cross':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            break;
        case 'bigO':
            cells = [
                true,  true,  true,  true,  true,
                true,  false, false, false, true,
                true,  false, false, false, true,
                true,  false, false, false, true,
                true,  true,  true,  true,  true
            ];
            break;
        case 'diamond':
            cells = [
                false, false, true,  false, false,
                false, true,  false, true,  false,
                true,  false, false, false, true,
                false, true,  false, true,  false,
                false, false, true,  false, false
            ];
            break;
        case 'fourCorners':
            cells = [
                true,  false, false, false, true,
                false, false, false, false, false,
                false, false, false, false, false,
                false, false, false, false, false,
                true,  false, false, false, true
            ];
            break;
        case 'letterH':
            cells = [
                true, true, true, true, true,
                false, false, true, false, false,
                false, false, true, false, false,
                false, false, true, false, false,
                true, true, true, true, true
            ];
            break;
        case 'tree':
            cells = [
                false, false, true,  false, false,
                false, true,  true,  false,  false,
                true,  true, true,  true, true,
                false, true,  true,  false,  false,
                false, false, true,  false, false
            ];
            break;
        case 'numberOne':
            cells = [
               false, false, false,  false, false,
               false, true, false,  false, true,
               true, true, true,  true, true,
               false, false, false,  false, true,
               false,  false,  false,  false,  false
            ];
            break;
        case 'chess':
            cells = [
                true,  false, true,  false, true,
                false, true,  false, true,  false,
                true,  false, true,  false, true,
                false, true,  false, true,  false,
                true,  false, true,  false, true
            ];
            break;
        case 'diagonals':
            cells = [
                true,  false, false, false, true,
                false, true,  false, true,  false,
                false, false, true,  false, false,
                false, true,  false, true,  false,
                true,  false, false, false, true
            ];
            break;
         case 'Numero2':
            cells = [
                false,  false, false, false, false,
                true, false,  false, true,  true,
                true, false, false,  false, true,
                true, true,  false, false,  true,
                false,  false, false, false, false
            ];
            break;
         case 'Numero3':
            cells = [
                false,  false, false, false, false,
                true, false,  false, false,  true,
                true, false, false,  false, true,
                true, true,  false, true,  true,
                false,  false, false, false, false
            ];
            break;
         case 'Numero4':
            cells = [
                false,  false, false, false, false,
                true, true,  true, false,  false,
                false, false, false,  false, false,
                true, true,  true, true,  true,
                false,  false, false, false, false
            ];
            break;
         case 'letraA':
            cells = [
                true,  true, true, true, true,
                true, false,  true, false,  false,
                true, false, false,  false, false,
                true, false,  true, false,  false,
                true,  true, true, true, true
            ];
            break;
         case 'letraE':
            cells = [
                true,  true, true, true, true,
                true, false,  true, false,  true,
                true, false, false,  false, true,
                true, false,  true, false,  true,
                true,  false, true, false, true
            ];
            break;
         case 'letraU':
            cells = [
                true,  true, true, true, true,
                false, false,  false, false,  true,
                false, false, false,  false, true,
                false, false,  false, false,  true,
                true,  true, true, true, true
            ];
            break;
         case 'cartonllenos':
            cells = [
                true,  true, true, true, true,
                true, true,  true, true,  true,
                true, true, false,  true, true,
                true, true,  true, true,  true,
                true,  true, true, true, true
            ];
            break;
         case 'comodine':
            cells = [
                false,  false, false, false, false,
                false, true,  true, true,  false,
                false, true, false,  true, false,
                false, true,  true, true,  false,
                false,  false, false, false, false
            ];
            break;
            default:
                return;
        }

        document.querySelectorAll('.bingoBoard').forEach(board => {
            const boardCells = board.querySelectorAll('.bingoCell');
            boardCells.forEach((cell, index) => {
                const cellNumber = parseInt(cell.dataset.number);
                if (cells[index] && generatedNumbers.includes(cellNumber)) {
                    cell.classList.add('figure-marked');
                } else {
                    cell.classList.remove('figure-marked');
                }
            });
        });

        document.querySelectorAll('#figurePreviewContainer .bingoCell').forEach((cell, index) => {
            if (cells[index]) {
                cell.classList.add('figure-marked');
            } else {
                cell.classList.remove('figure-marked');
            }
        });
    }

    createMasterBoard();
    createBingoBoards(currentPage);
});
