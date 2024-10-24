const seesaw = document.getElementById('seesaw');
const leftZone = document.getElementById('left-zone');
const rightZone = document.getElementById('right-zone');
const resetButton = document.getElementById('reset');
const weights = document.querySelectorAll('.weight');

weights.forEach(weight => {
  weight.addEventListener('dragstart', dragStart);
});

[leftZone, rightZone].forEach(zone => {
  zone.addEventListener('dragover', dragOver);
  zone.addEventListener('drop', dropWeight);
});

function dragStart(e) {
  e.dataTransfer.setData('weight', e.target.getAttribute('data-weight'));
}

function dragOver(e) {
  e.preventDefault();
}

function dropWeight(e) {
  const weightValue = parseInt(e.dataTransfer.getData('weight'));

  const newWeight = document.createElement('div');
  newWeight.className = 'weight';
  newWeight.textContent = `${weightValue} kg`;
  newWeight.setAttribute('data-weight', weightValue);

  e.target.appendChild(newWeight);
  updateSeesaw();
}

function updateSeesaw() {
  const leftWeight = calculateTotalWeight(leftZone);
  const rightWeight = calculateTotalWeight(rightZone);

  const angle = (rightWeight - leftWeight) * 5;
  seesaw.style.transform = `rotate(${angle}deg)`;
}

function calculateTotalWeight(zone) {
  let totalWeight = 0;
  zone.querySelectorAll('.weight').forEach(weight => {
    totalWeight += parseInt(weight.getAttribute('data-weight'));
  });
  return totalWeight;
}

resetButton.addEventListener('click', () => {
  leftZone.innerHTML = '';
  rightZone.innerHTML = '';
  seesaw.style.transform = 'rotate(0deg)';
});
