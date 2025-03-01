function togglePlayPause(checkbox: HTMLInputElement) {
const playSlider = document.getElementById('playSlider');
if(playSlider) {
if (checkbox.checked) {
   playSlider.innerHTML = '<i class="bi bi-pause-fill" style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);"></i>';
} else {
    playSlider.innerHTML = '<i class="bi bi-play-fill" style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);"></i>';
}
}
}