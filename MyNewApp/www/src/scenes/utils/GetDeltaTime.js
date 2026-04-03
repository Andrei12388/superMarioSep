export function getDelta(time) {
    const dt = Math.min(time.secondsPassed, 0.06);
    return {
        dt,
        scale: dt * 60
    };
}