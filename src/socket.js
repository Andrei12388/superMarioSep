import { heldKeys, pressedKeys } from './inputHandler.js';

export let socket = null;

export function connect(ip) {
  if (!ip.startsWith('ws://') && !ip.startsWith('wss://')) {
    ip = `ws://${ip}`; // auto prepend ws:// if missing
  }

  socket = new WebSocket(ip);

  socket.addEventListener('open', () => {
    console.log('✅ Connected to peer:', ip);
  });

  socket.addEventListener('message', (event) => {
    try {
      const { key, action } = JSON.parse(event.data);
      if (action === 'down') {
        heldKeys.add(key);
       // pressedKeys.add(key);
      }
      else {
        heldKeys.delete(key);
        pressedKeys.delete(key);
      }
    } catch (err) {
      console.error('Invalid message', event.data);
    }
  });

  socket.addEventListener('close', () => console.log('❌ Connection closed'));
  socket.addEventListener('error', (err) => console.error('Socket error', err));
}

// ✅ Single sendInput function handles both down/up
export function sendInput(key, action) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ key, action }));
  console.log(`[NET] ${key} ${action}`);
 
}