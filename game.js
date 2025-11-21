/* ======== 1. ตัวแปรสถานะเกม (State Variables) ======== */

// ดึง Element ที่จำเป็น
const statusDisplay = document.querySelector('#game-status');
const restartButton = document.querySelector('#restart-button');
const cells = document.querySelectorAll('.cell');

// สถานะของเกม
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];

// กำหนดผู้เล่น
const humanPlayer = "X";
const aiPlayer = "O";
let currentPlayer = humanPlayer; // เริ่มที่คนเล่นก่อนเสมอ

// เงื่อนไขการชนะ
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // แนวนอน
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // แนวตั้ง
    [0, 4, 8], [2, 4, 6]             // แนวทแยง
];

/* ======== 2. ฟังก์ชันหลักของเกม ======== */

/**
 * ฟังก์ชันนี้ถูกเรียกเมื่อมีการ "เดิน" (ทั้งคนและ AI)
 * @param {number} cellIndex - Index ของช่องที่ถูกเลือก (0-8)
 * @param {string} player - ผู้เล่นที่เดิน ("X" หรือ "O")
 */
function makeMove(cellIndex, player) {
    // 1. อัปเดตสถานะภายใน
    gameState[cellIndex] = player;
    
    // 2. อัปเดตหน้าเว็บ (UI)
    const cell = document.querySelector(`.cell[data-cell-index="${cellIndex}"]`);
    cell.innerHTML = player;
    cell.classList.add(player === humanPlayer ? 'player-x' : 'player-o');

    // 3. ตรวจสอบผลลัพธ์ (ชนะ/เสมอ)
    handleResultValidation();
}

/**
 * ตรวจสอบว่าเกมจบหรือยัง (ชนะ หรือ เสมอ)
 */
function handleResultValidation() {
    let roundWon = false;
    
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = `ผู้เล่น ${currentPlayer} ชนะ!`;
        gameActive = false;
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = "เกมเสมอ!";
        gameActive = false;
        return;
    }

    // ถ้าเกมยังไม่จบ ให้เปลี่ยนตา
    handlePlayerChange();
}

/**
 * สลับตาผู้เล่น และเรียก AI ถ้าถึงตา AI
 */
function handlePlayerChange() {
    currentPlayer = (currentPlayer === humanPlayer) ? aiPlayer : humanPlayer;
    statusDisplay.innerHTML = `ตาของ ${currentPlayer}`;

    // ถ้าเปลี่ยนเป็นตา AI และเกมยังเล่นอยู่
    if (currentPlayer === aiPlayer && gameActive) {
        // ให้ AI เดินหลังจากหน่วงเวลาเล็กน้อย (เพื่อให้ดูเหมือนคิด)
        setTimeout(aiMakeMove, 750); // 0.75 วินาที
    }
}

/**
 * เริ่มเกมใหม่
 */
function handleRestartGame() {
    gameActive = true;
    currentPlayer = humanPlayer; // กลับมาเริ่มที่คน
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = `ตาของ ${currentPlayer}`;
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('player-x', 'player-o');
    });
}

/* ======== 3. ฟังก์ชัน AI (สมอง) ======== */

/**
 * AI ตัดสินใจและเดิน
 */
function aiMakeMove() {
    // 1. หาช่องที่ดีที่สุดที่จะเดิน
    const bestMoveIndex = findBestMove();
    
    // 2. เดินในช่องนั้น
    makeMove(bestMoveIndex, aiPlayer);
}

/**
 * Logic การหาช่องที่ดีที่สุด (ตามลำดับความสำคัญ)
 * @returns {number} - Index ของช่องที่ AI เลือก (0-8)
 */
function findBestMove() {
    
    // ตรวจสอบทุกเงื่อนไขการชนะ
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];

        // กฎข้อ 1: AI ชนะ (ถ้า AI มี 2 ช่อง และอีกช่องว่าง)
        if (gameState[a] === aiPlayer && gameState[b] === aiPlayer && gameState[c] === "") return c;
        if (gameState[a] === aiPlayer && gameState[c] === aiPlayer && gameState[b] === "") return b;
        if (gameState[b] === aiPlayer && gameState[c] === aiPlayer && gameState[a] === "") return a;
        
        // กฎข้อ 2: AI ป้องกัน (ถ้า Human มี 2 ช่อง และอีกช่องว่าง)
        if (gameState[a] === humanPlayer && gameState[b] === humanPlayer && gameState[c] === "") return c;
        if (gameState[a] === humanPlayer && gameState[c] === humanPlayer && gameState[b] === "") return b;
        if (gameState[b] === humanPlayer && gameState[c] === humanPlayer && gameState[a] === "") return a;
    }

    // กฎข้อ 3: ยึดช่องกลาง
    if (gameState[4] === "") {
        return 4;
    }

    // กฎข้อ 4: ยึดมุมที่ว่าง
    const corners = [0, 2, 6, 8];
    for (const index of corners) {
        if (gameState[index] === "") {
            return index;
        }
    }

    // กฎข้อ 5: ยึดด้านข้างที่ว่าง
    const sides = [1, 3, 5, 7];
    for (const index of sides) {
        if (gameState[index] === "") {
            return index;
        }
    }

    // (สำรอง) ถ้าทุกกฎไม่เข้าเลย ให้หาช่องว่างช่องแรก (ซึ่งไม่ควรเกิด)
    return gameState.findIndex(cell => cell === "");
}


/* ======== 4. Event Listeners (ตัวดักจับการคลิก) ======== */

/**
 * ฟังก์ชันที่ทำงานเมื่อ "คน" คลิก
 */
function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    // ตรวจสอบเงื่อนไข
    // 1. ช่องนั้นต้องว่าง
    // 2. เกมต้องยังเล่นอยู่
    // 3. ต้องเป็นตาของ "คน" (ป้องกันการคลิกรัวๆ ตอน AI คิด)
    if (gameState[clickedCellIndex] !== "" || !gameActive || currentPlayer !== humanPlayer) {
        return;
    }

    // ถ้าผ่านหมด: ให้ "คน" เดิน
    makeMove(clickedCellIndex, humanPlayer);
}

// เพิ่ม Event Listeners ให้กับทุกช่อง และปุ่ม Restart
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', handleRestartGame);

// เริ่มเกมครั้งแรก (ตั้งค่าข้อความเริ่มต้น)
statusDisplay.innerHTML = `ตาของ ${currentPlayer}`;