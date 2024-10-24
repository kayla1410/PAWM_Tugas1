function showTab(tabId) {
    // Hapus class 'active' dari semua tab dan konten
    const tabItems = document.querySelectorAll('.tab-item');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabItems.forEach(item => item.classList.remove('active'));
    tabPanes.forEach(pane => pane.classList.remove('active'));

    // Tambahkan class 'active' pada tab dan konten yang dipilih
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function showCourses(type) {
    const activeCourses = document.getElementById('active-courses');
    const allCourses = document.getElementById('all-courses');
    const buttons = document.querySelectorAll('.tab-button');

    if (type === 'active') {
        activeCourses.style.display = 'flex';
        allCourses.style.display = 'none';
    } else {
        activeCourses.style.display = 'none';
        allCourses.style.display = 'flex';
    }

    buttons.forEach(button => button.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

const g = 9.78; // m/s^2

const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

const massInput = document.getElementById('mass');
const angleInput = document.getElementById('angle');
const frictionInput = document.getElementById('friction');
const baseLengthInput = document.getElementById('baseLength');
const angleValue = document.getElementById('angleValue');
const frictionValue = document.getElementById('frictionValue');

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

const weightResult = document.getElementById('weightResult');
const wxResult = document.getElementById('wxResult');
const wyResult = document.getElementById('wyResult');
const velocityResult = document.getElementById('velocityResult');
const timeResult = document.getElementById('timeResult');

let isAnimating = false;
let animationId;
let startTime;

let results = {
    w: 0,
    wx: 0,
    wy: 0,
    velocity: 0,
    time: 0
};

function updateResults() {
    const mass = parseFloat(massInput.value);
    const angle = parseFloat(angleInput.value);
    const friction = parseFloat(frictionInput.value);
    const baseLength = parseFloat(baseLengthInput.value);

    const w = mass * g;
    const wx = w * Math.sin(angle * Math.PI / 180);
    const wy = w * Math.cos(angle * Math.PI / 180);
    const fn = wy;
    const ff = friction * fn;
    const fa = wx - ff;

    const a = fa / mass;
    const s = Math.sqrt((baseLength / 10 * (canvas.width - 100)) ** 2 + (Math.tan(angle * Math.PI / 180) * (baseLength / 10 * (canvas.width - 100))) ** 2);
    const t = Math.sqrt(2 * s / a);
    const v = a * t;

    results = { w, wx, wy, velocity: v, time: t };

    weightResult.textContent = w.toFixed(2);
    wxResult.textContent = wx.toFixed(2);
    wyResult.textContent = wy.toFixed(2);
    velocityResult.textContent = v.toFixed(2);
    timeResult.textContent = t.toFixed(2);

    drawScene(0);
}

function drawScene(blockPosition) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const startX = 50;
    const startY = canvas.height - 50;
    const endX = startX + (parseFloat(baseLengthInput.value) / 10) * (canvas.width - 100);
    const endY = startY - Math.tan(parseFloat(angleInput.value) * Math.PI / 180) * (endX - startX);

    // Draw inclined plane
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineTo(endX, startY);
    ctx.closePath();
    ctx.stroke();

    // Draw block
    const blockSize = 30;
    const blockX = endX - blockPosition * (endX - startX);
    const blockY = endY + blockPosition * (startY - endY) - blockSize;

    ctx.fillStyle = 'blue';
    ctx.fillRect(blockX, blockY, blockSize, blockSize);

    // Draw force vectors
    const centerX = blockX + blockSize / 2;
    const centerY = blockY + blockSize / 2;
    const angle = parseFloat(angleInput.value);
    const vectorScale = 50;
    const scale = vectorScale / results.w;

    // W vector (down)
    drawVector(centerX, centerY, 0, results.w * scale, 'green', 'W');

    // Wx vector (parallel to incline)
    drawVector(centerX, centerY, -results.wx * scale * Math.cos(angle * Math.PI / 180), results.wx * scale * Math.sin(angle * Math.PI / 180), 'purple', 'Wx');

    // Wy vector (perpendicular to incline)
    drawVector(centerX, centerY, results.wy * scale * Math.sin(angle * Math.PI / 180), results.wy * scale * Math.cos(angle * Math.PI / 180), 'blue', 'Wy');

    // N vector (opposite to Wy)
    drawVector(centerX, centerY, -results.wy * scale * Math.sin(angle * Math.PI / 180), -results.wy * scale * Math.cos(angle * Math.PI / 180), 'red', 'N');

    // Fk vector (opposite to motion)
    const fkMagnitude = parseFloat(frictionInput.value) * results.wy;
    drawVector(centerX, centerY, fkMagnitude * scale * Math.cos(angle * Math.PI / 180), -fkMagnitude * scale * Math.sin(angle * Math.PI / 180), 'orange', 'Fk');
}

function drawVector(startX, startY, dx, dy, color, label) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + dx, startY + dy);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fillText(label, startX + dx / 2, startY + dy / 2);
}

function animate(timestamp) {
    if (startTime === undefined) {
        startTime = timestamp;
    }

    const elapsed = timestamp - startTime;
    const duration = results.time * 1000; // Convert seconds to milliseconds

    if (elapsed < duration) {
        const progress = elapsed / duration;
        drawScene(progress);
        animationId = requestAnimationFrame(animate);
    } else {
        drawScene(1); // Ensure the block is at the final position
        isAnimating = false;
        startButton.disabled = false;
        stopButton.disabled = true;
    }
}

function startAnimation() {
    if (isAnimating) return;

    isAnimating = true;
    startTime = undefined;
    startButton.disabled = true;
    stopButton.disabled = false;
    animationId = requestAnimationFrame(animate);
}

function stopAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    isAnimating = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    drawScene(0); // Reset block to initial position
}

massInput.addEventListener('input', updateResults);
angleInput.addEventListener('input', () => {
    angleValue.textContent = angleInput.value;
    updateResults();
});
frictionInput.addEventListener('input', () => {
    frictionValue.textContent = parseFloat(frictionInput.value).toFixed(2);
    updateResults();
});
baseLengthInput.addEventListener('input', updateResults);

startButton.addEventListener('click', startAnimation);
stopButton.addEventListener('click', stopAnimation);

// Initial update
updateResults();