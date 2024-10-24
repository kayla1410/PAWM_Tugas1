// Ambil elemen dari HTML
const massInput = document.getElementById("mass");
const angleInput = document.getElementById("angle");
const frictionInput = document.getElementById("friction");
const baseLengthInput = document.getElementById("baseLength");

const weightResult = document.getElementById("weightResult");
const wxResult = document.getElementById("wxResult");
const wyResult = document.getElementById("wyResult");
const velocityResult = document.getElementById("velocityResult");
const timeResult = document.getElementById("timeResult");

const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");

const g = 9.8; // Percepatan gravitasi (m/s^2)
let animationFrame;
let isAnimating = false;

// Fungsi untuk menghitung gaya dan percepatan
function calculatePhysics(mass, angle, friction, length) {
    const theta = (angle * Math.PI) / 180; // Konversi derajat ke radian
    const weight = mass * g; // Berat (W = m * g)
    const wx = weight * Math.sin(theta); // Komponen sumbu-x (Wx)
    const wy = weight * Math.cos(theta); // Komponen sumbu-y (Wy)
    const frictionForce = friction * wy; // Gaya gesekan (F_f)

    // Hitung percepatan (a = (Wx - F_f) / m)
    let acceleration = (wx - frictionForce) / mass;
    if (acceleration < 0) acceleration = 0; // Jika tidak cukup gaya untuk bergerak

    // Hitung kecepatan di dasar (v = √(2 * a * s))
    const velocity = Math.sqrt(2 * acceleration * length);

    // Hitung waktu untuk mencapai dasar (t = v / a)
    const time = acceleration > 0 ? velocity / acceleration : 0;

    return { weight, wx, wy, acceleration, velocity, time };
}

// Fungsi untuk memulai animasi dan menampilkan hasil
function startSimulation() {
    const mass = parseFloat(massInput.value);
    const angle = parseFloat(angleInput.value);
    const friction = parseFloat(frictionInput.value);
    const length = parseFloat(baseLengthInput.value);

    const { weight, wx, wy, velocity, time } = calculatePhysics(
        mass, angle, friction, length
    );

    // Tampilkan hasil di UI
    weightResult.textContent = `${weight.toFixed(2)} N`;
    wxResult.textContent = `${wx.toFixed(2)} N`;
    wyResult.textContent = `${wy.toFixed(2)} N`;
    velocityResult.textContent = `${velocity.toFixed(2)} m/s`;
    timeResult.textContent = `${time.toFixed(2)} s`;

    if (!isAnimating) {
        isAnimating = true;
        animateBox(velocity, time, length);
    }
}

// Fungsi animasi kotak
function animateBox(velocity, time, length) {
    const box = { x: 50, y: 250, size: 20 }; // Posisi awal kotak
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsedTime = (currentTime - startTime) / 1000; // Waktu dalam detik

        // Hitung posisi kotak berdasarkan waktu
        const distance = Math.min((elapsedTime / time) * length, length);

        // Gambar ulang kanvas dan kotak
        drawScene(distance);

        if (distance < length && isAnimating) {
            animationFrame = requestAnimationFrame(animate);
        } else {
            isAnimating = false;
        }
    }

    animationFrame = requestAnimationFrame(animate);
}

// Fungsi untuk menggambar bidang dan kotak
function drawScene(distance) {
    const canvas = document.getElementById("simulationCanvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const angle = parseFloat(angleInput.value);
    const theta = (angle * Math.PI) / 180;
    const baseLength = parseFloat(baseLengthInput.value);
    const inclineHeight = Math.tan(theta) * baseLength;

    // Gambar bidang miring
    ctx.beginPath();
    ctx.moveTo(50, canvas.height - 50);
    ctx.lineTo(50 + baseLength, canvas.height - 50);
    ctx.lineTo(50 + baseLength, canvas.height - 50 - inclineHeight);
    ctx.closePath();
    ctx.stroke();

    // Gambar kotak
    const x = 50 + distance; // Posisi horizontal kotak
    const y = canvas.height - 50 - (distance * Math.tan(theta)); // Posisi vertikal kotak
    ctx.fillStyle = "#FF5733";
    ctx.fillRect(x, y - 20, 20, 20);
}

// Event listener untuk tombol Start dan Stop
startButton.addEventListener("click", startSimulation);
stopButton.addEventListener("click", () => {
    isAnimating = false;
    cancelAnimationFrame(animationFrame);
});
