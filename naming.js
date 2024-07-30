document.addEventListener('DOMContentLoaded', () => {
    const namingTableBody = document.querySelector('#namingTable tbody');
    const processNamesBtn = document.getElementById('processNames');
    const namesBlock = document.getElementById('namesBlock');
    const backToGameBtn = document.getElementById('backToGame');

    // Cargar nombres de localStorage
    let playerNames = JSON.parse(localStorage.getItem('playerNames')) || {};

    // Crear filas para cada cartón
    function createTable() {
        namingTableBody.innerHTML = ''; // Limpiar el cuerpo de la tabla
        for (let i = 1; i <= 50000; i++) {
            const row = document.createElement('tr');
            const cellNumber = document.createElement('td');
            cellNumber.textContent = `Cartón Nº ${i}`;
            const cellName = document.createElement('td');
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = playerNames[i] || '';
            nameInput.dataset.boardNumber = i;
            nameInput.addEventListener('input', () => {
                playerNames[i] = nameInput.value;
                localStorage.setItem('playerNames', JSON.stringify(playerNames));
            });
            cellName.appendChild(nameInput);
            row.appendChild(cellNumber);
            row.appendChild(cellName);
            namingTableBody.appendChild(row);
        }
    }

    // Procesar nombres pegados en el textarea
    processNamesBtn.addEventListener('click', () => {
        const names = namesBlock.value.split('\n').map(name => name.trim()).filter(name => name);
        names.forEach((name, index) => {
            if (index < 50000) {
                playerNames[index + 1] = name;
            }
        });
        localStorage.setItem('playerNames', JSON.stringify(playerNames));
        createTable(); // Refrescar la tabla con los nuevos nombres
    });

    // Regresar al juego
    backToGameBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Crear la tabla al cargar la página
    createTable();
});
