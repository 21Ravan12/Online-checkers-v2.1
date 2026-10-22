package com.example.CheckerServer.config;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class GameWebSocketHandler {
    private final Map<String, Room> rooms = new HashMap<>();
    private final Map<UUID, String> currentRooms = new HashMap<>();
    private SocketIOServer server;

    public void setServer(SocketIOServer server) {
        this.server = server;
    }

    @OnEvent("joinRoom")
    public synchronized void joinRoom(SocketIOClient client, JoinRoomRequest request) {
        if (request == null || !("white".equals(request.color) || "black".equals(request.color))) {
            client.sendEvent("error", "Invalid color selection.");
            return;
        }
        if (request.roomId == null || request.roomId.isBlank()) {
            client.sendEvent("error", "Invalid room ID");
            return;
        }

        String socketId = client.getSessionId().toString();
        System.out.printf("%s (%s) selected color: %s%n", request.userId, socketId, request.color);

        leaveCurrentRoom(client, false);

        Room room = rooms.computeIfAbsent(request.roomId, ignored -> new Room());
        if (room.players.stream().anyMatch(player -> player.color.equals(request.color))) {
            if (room.players.isEmpty()) {
                rooms.remove(request.roomId);
            }
            client.sendEvent("error", "A player with color " + request.color + " already exists in this room.");
            return;
        }

        client.joinRoom(request.roomId);
        room.players.add(new Player(client.getSessionId(), request.userId, request.color));
        currentRooms.put(client.getSessionId(), request.roomId);
        System.out.printf("%s (%s) joined room %s as %s%n", request.userId, socketId, request.roomId, request.color);
        System.out.printf("Current players in room (%s): %s%n", request.roomId, room.players);
        client.getNamespace().getRoomOperations(request.roomId).sendEvent("playerCount", room.players.size());

        if (room.players.size() == 2) {
            Player player1 = room.players.get(0);
            Player player2 = room.players.get(1);

            Map<String, Object> player1Message = new HashMap<>();
            player1Message.put("opponentId", player2.userId);
            Map<String, Object> player2Message = new HashMap<>();
            player2Message.put("opponentId", player1.userId);
            sendToPlayer(player1, "playerJoined", player1Message);
            sendToPlayer(player2, "playerJoined", player2Message);

            System.out.printf("Game starting! Room: %s%n", request.roomId);
            client.getNamespace().getRoomOperations(request.roomId).sendEvent("gameStart");
        }
    }

    @OnEvent("move")
    public synchronized void move(SocketIOClient client, MoveRequest request) {
        if (request != null && request.roomId != null && rooms.containsKey(request.roomId)) {
            Map<String, Object> move = new HashMap<>();
            move.put("from", request.from);
            move.put("to", request.to);
            client.getNamespace().getRoomOperations(request.roomId).sendEvent("move", move);
        }
    }

    @OnEvent("getRooms")
    public synchronized void getRooms(SocketIOClient client) {
        List<Map<String, String>> roomInfo = new ArrayList<>();
        rooms.forEach((roomId, room) -> {
            if (room.players.size() == 1) {
                String nextColor = "white".equals(room.players.get(0).color) ? "black" : "white";
                roomInfo.add(Map.of("roomId", roomId, "nextColor", nextColor));
            }
        });
        client.sendEvent("roomsList", roomInfo);
    }

    @OnEvent("getColor")
    public synchronized void getColor(SocketIOClient client, String roomId) {
        Room room = roomId == null ? null : rooms.get(roomId);
        if (room == null) {
            client.sendEvent("error", "Invalid room ID");
            return;
        }
        if (room.players.isEmpty()) {
            client.sendEvent("error", "No players found in the room");
            return;
        }

        String firstColor = room.players.get(0).color;
        if (!"white".equals(firstColor) && !"black".equals(firstColor)) {
            client.sendEvent("error", "Invalid player color");
            return;
        }
        client.sendEvent("yourColor", "white".equals(firstColor) ? "black" : "white");
    }

    @OnEvent("leaveRoom")
    public synchronized void leaveRoom(SocketIOClient client) {
        if (!currentRooms.containsKey(client.getSessionId())) {
            client.sendEvent("error", "You are not currently in a room.");
            return;
        }
        leaveCurrentRoom(client, true);
        client.sendEvent("leftRoom", Map.of("message", "You have left the room."));
    }

    @OnDisconnect
    public synchronized void disconnect(SocketIOClient client) {
        leaveCurrentRoom(client, false);
        System.out.printf("User disconnected: %s%n", client.getSessionId());
    }

    private void leaveCurrentRoom(SocketIOClient client, boolean notifyOpponent) {
        UUID sessionId = client.getSessionId();
        String roomId = currentRooms.remove(sessionId);
        if (roomId == null) {
            return;
        }

        client.leaveRoom(roomId);
        System.out.printf("%s left room %s%n", sessionId, roomId);

        Room room = rooms.get(roomId);
        if (room == null) {
            return;
        }
        room.players.removeIf(player -> player.id.equals(sessionId));
        var roomOperations = client.getNamespace().getRoomOperations(roomId);
        roomOperations.sendEvent("playerCount", room.players.size());
        if (notifyOpponent) {
            roomOperations.sendEvent("opponentLeftRoom", room.players.size());
        }
        if (room.players.isEmpty()) {
            rooms.remove(roomId);
        }
    }

    private void sendToPlayer(Player player, String event, Object data) {
        SocketIOClient recipient = server.getClient(player.id);
        if (recipient != null) {
            recipient.sendEvent(event, data);
        }
    }

    public static class JoinRoomRequest {
        public String roomId;
        public String color;
        public String userId;
    }

    public static class MoveRequest {
        public String roomId;
        public Object from;
        public Object to;
    }

    private static class Room {
        private final List<Player> players = new ArrayList<>();
    }

    private static class Player {
        private final UUID id;
        private final String userId;
        private final String color;

        private Player(UUID id, String userId, String color) {
            this.id = id;
            this.userId = userId;
            this.color = color;
        }

        @Override
        public String toString() {
            return "{id=%s, userId=%s, color=%s}".formatted(id, userId, color);
        }
    }
}
