
'use client';

// This function can only be called on the client side.
export const playNotificationSound = (type: 'beep' | 'error' = 'beep') => {
    // Ensure this only runs in the browser
    if (typeof window === 'undefined') return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'error') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3 note
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    } else { // beep
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    oscillator.start();
};
