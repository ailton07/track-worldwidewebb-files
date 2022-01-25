// Original code: https://github.com/IgnasKavaliauskas/SocketIO-GMS2-Extension
// Updated for Socket.io 4

// Small wrapper of Socket.io for GM:S 2
class SocketIO {
  constructor() {
    this.socket;
  }

  connect(url) {
    this.socket = io(url, { upgrade: false, transports: ["websocket"] });
    this.socket.on("connect", () => {
      console.log(this.socket.id);
      gml_Script_gmcallback_sio_on_connect(-1, -1, this.socket.id);
    });

    this.socket.on("disconnect", () => {
      gml_Script_gmcallback_sio_on_disconnect();
    });
  }

  disconnect() {
    this.socket.close();
  }

  reconnect() {
    this.socket.open();
  }

  addEvent(name) {
    this.socket.on(name, (data) => {
      if (typeof data === "object") data = JSON.stringify(data);

      try {
        window[`gml_Script_gmcallback_sio_on_${name}`](-1, -1, data);
      } catch (error) {
        console.error(error);
      }
    });
  }

  emit(name, data) {
    this.socket.emit(name, data);
  }

  getConnectionStatus() {
    return this.socket.connected;
  }
}

// API for GM:S 2
const socketio = new SocketIO();

function sio_connect(url) {
  socketio.connect(url);
}

function sio_disconnect() {
  socketio.disconnect();
}

function sio_reconnect() {
  socketio.reconnect();
}

function sio_addEvent(name) {
  socketio.addEvent(name);
}

function sio_emit(name, data) {
  socketio.emit(name, data);
}

function sio_getConnectionStatus() {
  return socketio.getConnectionStatus();
}
