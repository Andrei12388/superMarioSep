import { Intro } from './scenes/Intro.js';
import { JSGame } from './game.js';
import { FighterState } from './constants/fighter.js';
import { heldKeys, showNotice } from './inputHandler.js'; 
import { state as controlHold } from './inputHandler.js';
import { gameState } from './state/gameState.js';
import { initOnscreenControlsSliders, updateOnscreenControls } from './onscreenControlsSlider.js';
import { unlockAudio } from './inputHandler.js';
import { connect, sendInput } from './socket.js';

const peerIpInput = document.getElementById('peerIp');
const connectPeerBtn = document.getElementById('connectPeerBtn');
const peerStatus = document.getElementById('peerStatus');

connectPeerBtn.addEventListener('click', () => {
  const ip = peerIpInput.value.trim();
  if (!ip) return alert('Enter a valid WebSocket IP (e.g., ws://192.168.1.5:8080)');
  
  peerStatus.textContent = 'Connecting...';
  showNotice('Connecting...')
  
  try {
    connect(ip);
    peerStatus.textContent = 'Connected ✅';
    showNotice('Connected ✅')
  } catch (err) {
    console.error(err);
    showNotice('Connection failed ❌')
    peerStatus.textContent = 'Connection failed ❌';
  }
});


function populateMoveDropdown(){
    const dropdown = document.getElementById('state-dropdown');

    Object.entries(FighterState).forEach(([, value]) => {
        const option = document.createElement('option');
        option.setAttribute('value', value);
        option.innerText = value;
        dropdown.appendChild(option);
    });
}


window.addEventListener('load', function () {
    initOnscreenControlsSliders();
    updateOnscreenControls();

    function startOnce(e) {
        unlockAudio(); // 🔓 audio is now legal

        console.log('🎮 User interaction detected — Starting Game');

        populateMoveDropdown();
        new JSGame().start();

        window.removeEventListener('keydown', startOnce);
        window.removeEventListener('mousedown', startOnce);
        window.removeEventListener('touchstart', startOnce);
    }

    // Valid user gestures
    window.addEventListener('keydown', startOnce, { once: true });
    window.addEventListener('mousedown', startOnce, { once: true });
    window.addEventListener('touchstart', startOnce, { once: true });
});




// Onscreen Joystick

const joystick = document.getElementById('joystick');
const knob = document.getElementById('knob');
const maxDistance = 70;

export const state = {
    tapped: false
};
let holdTimer = 0;
let dragging = false;
let activePointerId = null; // track the pointer/touch id


function startDrag(e) {
    e.preventDefault();
    holdTimer = 0;
    dragging = true;

    const touch = e.touches ? e.touches[0] : e;
    activePointerId = touch.identifier !== undefined ? touch.identifier : "mouse";

    state.tapped = true;

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', onDrag);
    document.addEventListener('touchend', endDrag);
}

function onDrag(e) {
    if (!dragging) return;

    let touch;
    if (e.touches) {
        // Only track the active touch
        touch = [...e.touches].find(t => t.identifier === activePointerId);
        if (!touch) return;
    } else {
        if (activePointerId !== "mouse") return;
        touch = e;
    }

    holdTimer += 1;
    if (holdTimer === 4) {
        state.tapped = true;
    }
    if (holdTimer >= 10) {
        state.tapped = true;
        holdTimer = 0;
    }

    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;

    const distance = Math.min(Math.sqrt(dx*dx + dy*dy), maxDistance);
    const angle = Math.atan2(dy, dx);

    // move knob visually
   const x = distance * Math.cos(angle);
const y = distance * Math.sin(angle);
knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

   // clear previous active states
['jump','mFor','mBack','crouchDown'].forEach(id => {
    const btnEl = document.getElementById(id);
    btnEl.classList.remove('active');

    if (heldKeys.has(id)) {
        heldKeys.delete(id);
        sendInput(id, 'up'); // 🔹 send release event
    }
});

// determine which directions are active
if (distance > 10) {
    if (angle > -Math.PI/8 && angle <= Math.PI/8) {
        // Right
        document.getElementById('mFor').classList.add('active');
        if (!heldKeys.has('mFor')) {
            heldKeys.add('mFor');
            sendInput('mFor', 'down'); // 🔹 send press event
        }
        gameState.buttonHold = true;
    } else if (angle > Math.PI/8 && angle <= 3*Math.PI/8) {
        // Down-Right
        ['mFor','crouchDown'].forEach(key => {
            document.getElementById(key).classList.add('active');
            if (!heldKeys.has(key)) {
                heldKeys.add(key);
                sendInput(key, 'down');
            }
        });
    } else if (angle > 3*Math.PI/8 && angle <= 5*Math.PI/8) {
        // Down
        document.getElementById('crouchDown').classList.add('active');
        if (!heldKeys.has('crouchDown')) {
            heldKeys.add('crouchDown');
            sendInput('crouchDown', 'down');
        }
        gameState.buttonHold = true;
    } else if (angle > 5*Math.PI/8 && angle <= 7*Math.PI/8) {
        // Down-Left
        ['mBack','crouchDown'].forEach(key => {
            document.getElementById(key).classList.add('active');
            if (!heldKeys.has(key)) {
                heldKeys.add(key);
                sendInput(key, 'down');
            }
        });
    } else if (angle > 7*Math.PI/8 || angle <= -7*Math.PI/8) {
        // Left
        document.getElementById('mBack').classList.add('active');
        if (!heldKeys.has('mBack')) {
            heldKeys.add('mBack');
            sendInput('mBack', 'down');
        }
        gameState.buttonHold = true;
    } else if (angle > -7*Math.PI/8 && angle <= -5*Math.PI/8) {
        // Up-Left
        ['mBack','jump'].forEach(key => {
            document.getElementById(key).classList.add('active');
            if (!heldKeys.has(key)) {
                heldKeys.add(key);
                sendInput(key, 'down');
            }
        });
    } else if (angle > -5*Math.PI/8 && angle <= -3*Math.PI/8) {
        // Up
        document.getElementById('jump').classList.add('active');
        if (!heldKeys.has('jump')) {
            heldKeys.add('jump');
            sendInput('jump', 'down');
        }
        gameState.buttonHold = true;
    } else if (angle > -3*Math.PI/8 && angle <= -Math.PI/8) {
        // Up-Right
        ['mFor','jump'].forEach(key => {
            document.getElementById(key).classList.add('active');
            if (!heldKeys.has(key)) {
                heldKeys.add(key);
                sendInput(key, 'down');
            }
        });
    }
}
}


// ------------------- Layout Edit -------------------
let layoutEditMode = false;
let draggables = [];
let saveLayoutBtn = null;
let restoreLayoutBtn = null;


function makeElementDraggable(el, id) {
    if (!el) return;
    let offsetX = 0, offsetY = 0, isDragging = false;

    function onPointerDown(e) {
        e.preventDefault();
        isDragging = true;
        const rect = el.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;
        activePointerId = touch.identifier ?? "mouse";
        el.setPointerCapture?.(e.pointerId);
        el.classList.add('dragging');
    }

    function onPointerMove(e) {
        if (!isDragging) return;
        let touch;
        if (e.touches) {
            touch = [...e.touches].find(t => t.identifier === activePointerId);
            if (!touch) return;
        } else if (activePointerId !== "mouse") return;
        else touch = e;

        const scale = el.getBoundingClientRect().width / el.offsetWidth;
        el.style.left = `${(touch.clientX - offsetX)/scale}px`;
        el.style.top = `${(touch.clientY - offsetY)/scale}px`;
    }

    function onPointerUp(e) {
        if (!isDragging) return;
        isDragging = false;
        el.releasePointerCapture?.(e.pointerId);
        el.classList.remove('dragging');
        saveControlPosition(id ?? el.id);
    }

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('touchstart', onPointerDown, { passive: false });
    el.addEventListener('touchmove', onPointerMove, { passive: false });
    el.addEventListener('touchend', onPointerUp);

    draggables.push({ el, onPointerDown, onPointerMove, onPointerUp });
}

function createSaveLayoutBtn() {
    if (saveLayoutBtn) return saveLayoutBtn;
    saveLayoutBtn = document.createElement('button');
    saveLayoutBtn.innerText = '💾 Save Layout';
    Object.assign(saveLayoutBtn.style, {
        position: 'fixed',
        top: '15px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 4000,
        padding: '10px 20px',
        fontSize: '12px',
        backgroundColor: '#40ff00',
        color: 'black',
        border: '2px solid #40ff00',
        borderRadius: '6px',
        cursor: 'pointer',
        boxShadow: '0 0 10px #40ff00',
        display: 'none'
    });
    document.body.appendChild(saveLayoutBtn);
    return saveLayoutBtn;
}

function createRestoreLayoutBtn() {
    if (restoreLayoutBtn) return restoreLayoutBtn;

    restoreLayoutBtn = document.createElement('button');
    restoreLayoutBtn.id = 'restoreLayoutBtn'; // ✅ assign an ID
    restoreLayoutBtn.innerText = '♻️ Restore Default Layout';
    Object.assign(restoreLayoutBtn.style, {
        position: 'fixed',
        top: '15px',
        left: '80%',
        transform: 'translateX(-50%)',
        zIndex: 4000,
        padding: '8px 18px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: '#f0f0f0',
        color: '#333',
        border: '2px solid #b0b0b0',
        borderRadius: '6px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        transition: 'all 0.2s ease-in-out',
        display: 'none'
    });

    document.body.appendChild(restoreLayoutBtn);

    // ✅ Attach click listener immediately
    restoreLayoutBtn.addEventListener('click', () => {
        restoreDefaultLayout();
    });

    return restoreLayoutBtn;
}

export function enableLayoutEdit() {
    if (layoutEditMode) return;
    layoutEditMode = true;

    restoreControlPositions();

    // Show draggable controls
    const joystick = document.getElementById('joystick');
    joystick.style.display = 'block';
    makeElementDraggable(joystick, 'joystick');

    
    p1Controls.style.display = 'flex';

    // select ALL buttons inside
    const buttons = p1Controls.querySelectorAll('.move1');

    buttons.forEach(btn => {
        btn.style.position = 'fixed';
        makeElementDraggable(btn, btn.id);
    });
    
    p1Controls.style.display = 'flex';
    
    // Hide menu & control panel
    document.getElementById('menuBtn').style.display = 'none';
    document.getElementById('emulatorMenu').style.display = 'none';
    document.querySelector('.onscreen-controls-panel').style.display = 'none';

    // Show save button
    createSaveLayoutBtn().style.display = 'block';
    createRestoreLayoutBtn().style.display = 'block';
}

export function disableLayoutEdit() {
    layoutEditMode = false;
    showNotice("Layout Saved! ✔️")

    // Remove draggable listeners
    draggables.forEach(d => {
        d.el.removeEventListener('pointerdown', d.onPointerDown);
        d.el.removeEventListener('pointermove', d.onPointerMove);
        d.el.removeEventListener('pointerup', d.onPointerUp);
        d.el.removeEventListener('touchstart', d.onPointerDown);
        d.el.removeEventListener('touchmove', d.onPointerMove);
        d.el.removeEventListener('touchend', d.onPointerUp);
    });
    draggables = [];

    // Hide save button
    createSaveLayoutBtn().style.display = 'none';
    createRestoreLayoutBtn().style.display = 'none';
    const controlPanel = document.querySelector('.onscreen-controls-panel');
    controlPanel.style.display = 'flex';

    // Restore menu & panel
    document.getElementById('menuBtn').style.display = 'block';
    document.getElementById('emulatorMenu').style.display = 'block';
    document.querySelector('.onscreen-controls-panel').style.display = 'block';

   
}

function saveControlPosition(id) {
    const el = document.getElementById(id) || document.querySelector(`.${id}`);
    if (!el) return;
    gameState.controlPositions[id] = { x: el.style.left, y: el.style.top };
}

export function restoreControlPositions() {
    Object.entries(gameState.controlPositions).forEach(([id, pos]) => {
        const el = document.getElementById(id) || document.querySelector(`.${id}`);
        if (!el) return;
        el.style.position = 'fixed';
        el.style.left = pos.x;
        el.style.top = pos.y;
    });
}

const defaultControlPositions = {
    joystick: { x: '15vw', y: '60vh' },

    // container (optional)
    buttonsP1: { x: '2.5vw', y: '65%' },

    BP1: { x: '65vw', y: '48vh' },  // Top
    DP1: { x: '72vw', y: '63vh' },  // Right
    AP1: { x: '58vw', y: '63vh' },  // Left
    CP1: { x: '65vw', y: '78vh' },  // Bottom

    start1: { x: '90vw', y: '50vh' },
    select1: { x: '90vw', y: '70vh' },

    buttonsP2: { x: '95vw', y: '65%' },  // container
    BP2: { x: '65vw', y: '48vh' },  // Top
    DP2: { x: '72vw', y: '63vh' },  // Right
    AP2: { x: '58vw', y: '63vh' },  // Left
    CP2: { x: '65vw', y: '78vh' },  // Bottom

    start2: { x: '90vw', y: '50vh' },
    select2: { x: '90vw', y: '70vh' },
};

const controlElementsMap = {
    joystick: document.getElementById('joystick'),
    buttonsP1: document.querySelector('.moveLists'),

    // Individual P1 buttons
    AP1: document.getElementById('AP1'),
    BP1: document.getElementById('BP1'),
    CP1: document.getElementById('CP1'),
    DP1: document.getElementById('DP1'),
    start1: document.getElementById('start1'),
    select1: document.getElementById('select1'),

      // Player 2 buttons
    buttonsP2: document.querySelector('.moveListsP2'),
    AP2: document.getElementById('AP2'),
    BP2: document.getElementById('BP2'),
    CP2: document.getElementById('CP2'),
    DP2: document.getElementById('DP2'),
    start2: document.getElementById('start2'),
    select2: document.getElementById('select2'),
};

export function restoreDefaultLayout() {
     showNotice("Restored Default! ♻️")
    Object.entries(defaultControlPositions).forEach(([key, pos]) => {
        const el = controlElementsMap[key];
        if (!el) return;
        el.style.position = 'fixed';
        el.style.left = pos.x;
        el.style.top = pos.y;
    });

    gameState.controlPositions = { ...defaultControlPositions };
}

// ------------------- Edit Layout Button Hook -------------------
document.getElementById('editLayoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if (!layoutEditMode) enableLayoutEdit();
    else alert('Layout edit active. Use 💾 Save Layout to finish.');
});

const toggleExplicitBtn = document.getElementById('toggleExplicitBtn');

window.addEventListener('load', () => {
    toggleExplicitBtn.textContent = `⚠️Explicit: ${gameState.explicitMode ? 'On' : 'Off'}`;
});

toggleExplicitBtn.addEventListener('click', () => {
    // Toggle the value
    gameState.explicitMode = !gameState.explicitMode;

    // Update button text
    toggleExplicitBtn.textContent = `⚠️Explicit: ${gameState.explicitMode ? 'On' : 'Off'}`;

    // Optional: show notice
    showNotice(`⚠️Explicit mode ${gameState.explicitMode ? 'enabled ✅' : 'disabled ❌'}`);
});

// Attach Save Layout button
createSaveLayoutBtn().addEventListener('click', () => {
    disableLayoutEdit();

    // Restore menu & onscreen panel
    const menuBtn = document.getElementById('menuBtn');
    const emulatorMenu = document.getElementById('emulatorMenu');
    const controlPanel = document.querySelector('.onscreen-controls-panel');

    menuBtn.style.display = 'block';
    emulatorMenu.style.display = 'block';
    controlPanel.style.display = 'block';
});

window.addEventListener('load', restoreControlPositions);

//reset Game Button
 document.getElementById("reloadBtn").addEventListener("click", () => {
         showNotice("Restarting Game...")
  location.reload();
});

function resetKnob() {
    holdTimer = 0;
    state.tapped = false;
    knob.style.transform = 'translate(-50%, -50%)';
}

function endDrag(e) {
    let touch;
    if (e && e.changedTouches) {
        touch = [...e.changedTouches].find(t => t.identifier === activePointerId);
        if (!touch) return; // ignore unrelated touchend
    } else {
        if (activePointerId !== "mouse") return;
    }

    holdTimer = 0;
    state.tapped = false;
    dragging = false;
    activePointerId = null;

    resetKnob();  
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', endDrag);

    // release all joystick keys
    ['jump','mFor','mBack','crouchDown'].forEach(id => {
        document.getElementById(id).classList.remove('active');

        if (heldKeys.has(id)) {
            heldKeys.delete(id);
            sendInput(id, 'up'); // 🔹 send release event
        }
    });
}

knob.addEventListener('mousedown', startDrag);
knob.addEventListener('touchstart', startDrag, { passive: false });


// Toggle inputs

const scrbuttons1 = document.querySelector('.scrninput');
const radios = document.querySelectorAll('input[name="joystickToggle"]');
const display1 = document.querySelector('.screenJoystickController');
const display2 = document.querySelector('.screenJoystickP2');

radios.forEach(radio => {
    radio.addEventListener("change", () => {
        if (radio.value === "on") {
            joystick.style.display = "block";
            scrbuttons1.style.display = "block";
            display1.style.display = "block";
            display2.style.display = "block";
            restoreControlPositions();
        } else {
            joystick.style.display = "none";
            scrbuttons1.style.display = "none";
            display1.style.display = "none";
            display2.style.display = "none";
        }
    });
});

const scrbuttons2 = document.querySelector('.moveListsP2');
const radios2 = document.querySelectorAll('input[name="joystick2Toggle"]');

radios2.forEach(radio => {
    radio.addEventListener("change", () => {
        if (radio.value === "on") {
            scrbuttons2.style.display = "block";
        } else {
            scrbuttons2.style.display = "none";
        }
    });
});

const onscreenSettings = document.querySelector('.onscreen-controls-panel');
const radios3 = document.querySelectorAll('input[name="controlPanelToggle"]');

radios3.forEach(radio => {
    radio.addEventListener("change", () => {
        if (radio.value === "on") {
            onscreenSettings.style.display = "block";
        } else {
            onscreenSettings.style.display = "none";
        }
    });
});




