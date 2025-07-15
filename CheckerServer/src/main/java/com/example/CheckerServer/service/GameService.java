package com.example.CheckerServer.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.example.CheckerServer.model.Game;
import com.example.CheckerServer.repository.GameRepository;

@Service
public class GameService {

    private final GameRepository gameRepository;

    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    public String saveGame(Long owner, Long whitePlayer, Long blackPlayer, Long winner, String gameData) {
        try {
        System.out.println("Saving game with owner: " + owner + ", whitePlayer: " + whitePlayer + ", blackPlayer: " + blackPlayer + ", winner: " + winner + ", gameData: " + gameData);
        Game game = new Game();
        game.setOwner(owner);
        game.setWhitePlayer(whitePlayer);
        game.setBlackPlayer(blackPlayer);
        game.setWinner(winner);
        game.setDate(new Date());
        game.setGameData(gameData); 
        gameRepository.save(game);
        return "Game saved successfully";
        } catch (Exception e) {
            throw new IllegalArgumentException("Error saving game: " + e.getMessage());  
        }
    }

    public Game getGame(Long id) {
        return gameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Game not found with id: " + id));
    }

    public String searchGame(Long owner, Long whitePlayer, Long blackPlayer, Long winner) {
    try {
        JSONArray responseArray = new JSONArray();
        List<Game> games = new ArrayList<>();

        if (owner != null) {
            games = gameRepository.findAllByOwner(owner);
        } else if (whitePlayer != null) {
            games = gameRepository.findAllByWhitePlayer(whitePlayer);
        } else if (blackPlayer != null) {
            games = gameRepository.findAllByBlackPlayer(blackPlayer);
        } else if (winner != null) {
            games = gameRepository.findAllByWinner(winner);
        } else {
            throw new IllegalArgumentException("At least one search criteria must be provided.");
        }

        if (games.isEmpty()) {
            System.out.println("No games found matching the criteria.");
            throw new IllegalArgumentException("No games found matching the criteria.");
        }

        for (Game g : games) {
            JSONObject obj = new JSONObject();
            obj.put("id", g.getId());
            obj.put("owner", g.getOwner());
            obj.put("whitePlayer", g.getWhitePlayer());
            obj.put("blackPlayer", g.getBlackPlayer());
            obj.put("winner", g.getWinner());
            obj.put("gameData", g.getGameData());
            obj.put("date", g.getDate() != null ? g.getDate().toString() : JSONObject.NULL);

            responseArray.put(obj);
        }

        return responseArray.toString();

    } catch (IllegalArgumentException | JSONException e) {
        throw new IllegalStateException(e);
    }
}


}
