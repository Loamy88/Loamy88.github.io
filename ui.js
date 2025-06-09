// UI overlay and speedometer
export function createOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'overlay';
  overlay.innerHTML = `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,0 Q50,80 100,0" fill="black" opacity="0.4" transform="translate(0,0) scale(${window.innerWidth / 100}, 1)"/>
    </svg>`;
  document.body.appendChild(overlay);
}

export function createSpeedometer() {
  const speedometer = document.createElement('div');
  speedometer.id = 'speedometer';
  document.body.appendChild(speedometer);
  return speedometer;
}
