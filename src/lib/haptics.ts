/**
 * A light "nope" on phones (touch screens only; desktops get nothing).
 * Android: a short double buzz through the Vibration API. iPhone: Safari has
 * no Vibration API, but since iOS 18 toggling a switch control gives a light
 * system tap, so a hidden one is clicked. Must run inside the user's gesture
 * (the submit), which is where it's called from.
 */
export function wrongGuessHaptic() {
  if (typeof window === 'undefined' || !window.matchMedia('(pointer: coarse)').matches) return;

  if (typeof navigator.vibrate === 'function') {
    navigator.vibrate([10, 50, 10]);
    return;
  }

  try {
    const label = document.createElement('label');
    label.ariaHidden = 'true';
    label.style.display = 'none';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    label.appendChild(input);
    document.head.appendChild(label);
    label.click();
    label.remove();
  } catch {
    // No haptics here; the shake still says it.
  }
}
