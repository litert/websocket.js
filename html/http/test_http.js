const socket = new WebSocket('ws://192.168.137.2:42096/ws/');

let count = 0;
// handle the WebSocket connection being opened
socket.addEventListener('open', (event) => {
  document.write(`<p>[${new Date().toISOString()}] WebSocket connection opened.</p>`);
  
  // send a message to the server
  socket.send('Hello, server!');
});

// handle incoming WebSocket messages from the server
socket.addEventListener('message', (event) => {
  console.log(event);
  if (event.data instanceof Blob) {
    blobToString(event.data).then((s) => {
      document.write(`<p>[${new Date().toISOString()}] Received "${s}" (binary) from server.</p>`);
    });
  }
  else {
    document.write(`<p>[${new Date().toISOString()}] Received "${event.data}"(text) from server.</p>`);
  }
});

function blobToString(b) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', (e) => {
      resolve(e.target.result);
    });
    reader.readAsText(b);
  });
}

function stringToArrayBuffer(s) {

  return new Uint8Array(s.split('').map((c) => c.charCodeAt(0)))
}

const timer = setInterval(() => {
  if (socket.readyState === WebSocket.CLOSED) {
    clearInterval(timer);
    return;
  }
  if (Math.random() < 0.5) {
    socket.send(`Count ${count++}`);
  }
  else {
    socket.send(stringToArrayBuffer(`Count ${count++}`));
  }
}, 999);

// handle the WebSocket connection being closed
socket.addEventListener('close', (event) => {
  document.write(`<p>[${new Date().toISOString()}] WebSocket connection closed with code ${event.code} and message "${event.reason}".</p>`);
  console.log(event);
});
