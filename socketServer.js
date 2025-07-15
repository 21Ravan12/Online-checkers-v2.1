const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors()); 

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
  },
});

let rooms = {}; 

io.on("connection", (socket) => {
  console.log(`New user connected: ${socket.id}`);

  socket.currentRoom = null; 

  socket.on("joinRoom", ({ roomId, color, userId }) => {
    if (!["white", "black"].includes(color)) {
        socket.emit("error", "Invalid color selection.");
        return;
    }

    console.log(`${userId} (${socket.id}) selected color: ${color}`);

    if (socket.currentRoom) {
        socket.leave(socket.currentRoom);
        console.log(`${userId} (${socket.id}) left room ${socket.currentRoom}`);

        if (rooms[socket.currentRoom]) {
            rooms[socket.currentRoom].players = rooms[socket.currentRoom].players.filter(p => p.id !== socket.id);
            io.to(socket.currentRoom).emit("playerCount", rooms[socket.currentRoom].players.length);

            if (rooms[socket.currentRoom].players.length === 0) {
                delete rooms[socket.currentRoom];
            }
        }
    }

    if (!rooms[roomId]) {
        rooms[roomId] = { players: [] };
    }

    if (rooms[roomId].players.some(p => p.color === color)) {
        socket.emit("error", `A player with color ${color} already exists in this room.`);
        return;
    }

    socket.join(roomId);
    console.log(`${userId} (${socket.id}) joined room ${roomId} as ${color}`);

    rooms[roomId].players.push({ id: socket.id, userId: userId, color });
    socket.currentRoom = roomId;

    console.log(`Current players in room (${roomId}):`, rooms[roomId].players);

    io.to(roomId).emit("playerCount", rooms[roomId].players.length);

    if (rooms[roomId].players.length === 2) {
      const [player1, player2] = rooms[roomId].players;
  
      player1.opponentId = player2.userId;
      player2.opponentId = player1.userId;
  
      io.to(player1.id).emit("playerJoined", { opponentId: player1.opponentId });
      io.to(player2.id).emit("playerJoined", { opponentId: player2.opponentId });
  
      console.log(`Game starting! Room: ${roomId}`);
      io.to(roomId).emit("gameStart");
  }  
});


  socket.on("move", ({ roomId, from, to }) => {
    if (rooms[roomId]) {
      io.to(roomId).emit("move", { from, to });
    }
  });

  socket.on("getRooms", () => {
    const roomInfo = Object.keys(rooms)
        .filter(room => rooms[room].players.length === 1) 
        .map(room => {
            let nextColor = rooms[room].players[0].color === "white" ? "black" : "white";
            return { roomId: room, nextColor: nextColor }; 
        });

    socket.emit("roomsList", roomInfo);
});

  socket.on("getColor", (roomId) => {
    if (!roomId || !rooms[roomId]) {
        socket.emit("error", "Invalid room ID");
        return;
    }

    if (!rooms[roomId].players || rooms[roomId].players.length === 0) {
        socket.emit("error", "No players found in the room");
        return;
    }

    let firstPlayer = rooms[roomId].players[0];
    if (!firstPlayer.color || (firstPlayer.color !== "white" && firstPlayer.color !== "black")) {
        socket.emit("error", "Invalid player color");
        return;
    }

    let color = firstPlayer.color === "white" ? "black" : "white";
    socket.emit("yourColor", color);
  });

  socket.on("leaveRoom", () => {
    if (socket.currentRoom) {
      socket.leave(socket.currentRoom);
      console.log(`${socket.id} left room ${socket.currentRoom}`);
  
      if (rooms[socket.currentRoom]) {
        rooms[socket.currentRoom].players = rooms[socket.currentRoom].players.filter(p => p.id !== socket.id);
        io.to(socket.currentRoom).emit("playerCount", rooms[socket.currentRoom].players.length);
        io.to(socket.currentRoom).emit("opponentLeftRoom", rooms[socket.currentRoom].players.length);
  
        if (rooms[socket.currentRoom].players.length === 0) {
          delete rooms[socket.currentRoom];
        }
      }
  
      socket.currentRoom = null;
      socket.emit("leftRoom", { message: "You have left the room." });
    } else {
      socket.emit("error", "You are not currently in a room.");
    }
  });  

  socket.on("disconnect", () => {
    if (socket.currentRoom && rooms[socket.currentRoom]) {
      rooms[socket.currentRoom].players = rooms[socket.currentRoom].players.filter(p => p.id !== socket.id);
      io.to(socket.currentRoom).emit("playerCount", rooms[socket.currentRoom].players.length);

      if (rooms[socket.currentRoom].players.length === 0) {
        delete rooms[socket.currentRoom];
      }
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3002, "0.0.0.0", () => {
  console.log("Socket.IO server is running on port 3002");
});
