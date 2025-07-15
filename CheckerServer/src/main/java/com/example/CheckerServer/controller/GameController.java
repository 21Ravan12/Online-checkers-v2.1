package com.example.CheckerServer.controller;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.CheckerServer.dto.GameRequest;
import com.example.CheckerServer.model.Game;
import com.example.CheckerServer.service.GameService;

@RestController
@RequestMapping("/api/games")
public class GameController {
    
    @Autowired
    private GameService gameService;

    @PostMapping("/save")
    public ResponseEntity<?> saveGame(@RequestBody GameRequest gameRequest) {
        try {
            String message = gameService.saveGame(
                gameRequest.getOwner(),
                gameRequest.getWhitePlayer(),
                gameRequest.getBlackPlayer(),
                gameRequest.getWinner(),
                gameRequest.getGameData()
            );
            return ResponseEntity.ok(message);
        } catch (Exception  e) {
            JSONObject response = new JSONObject();
            response.put("error", e.getMessage());
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(response.toString()); 
        }
    } 

    @GetMapping("/search")
    public ResponseEntity<?> searchGame(
        @RequestParam(required = false) Long owner,
        @RequestParam(required = false) Long whitePlayer,
        @RequestParam(required = false) Long blackPlayer,
        @RequestParam(required = false) Long winner
    ) {
        try {
            String gameInfo = gameService.searchGame(
                owner,
                whitePlayer,
                blackPlayer,
                winner
            );
                
            return ResponseEntity.ok(gameInfo);
        } catch (Exception e) {
            JSONObject response = new JSONObject();
            response.put("error", e.getMessage());
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(response.toString()); 
        }
    }

    @GetMapping("/get")
    public ResponseEntity<?> getGame(        
        @RequestParam(required = false) Long id
    ) {
        try {
            Game gameInfo = gameService.getGame(
                id
            );
                
            System.out.println(gameInfo);
            return ResponseEntity.ok(gameInfo);
        } catch (Exception e) {
            JSONObject response = new JSONObject();
            response.put("error", e.getMessage());
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(response.toString()); 
        }
    }
    

}
