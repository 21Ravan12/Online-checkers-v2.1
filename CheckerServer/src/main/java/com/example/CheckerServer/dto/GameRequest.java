package com.example.CheckerServer.dto;
import java.util.Date;

public class GameRequest {
    private Long id;
    private Long owner;  
    private Long whitePlayer; 
    private Long blackPlayer;  
    private Long winner;
    private String gameData; 
    private Date date;   

    public Long getId() {
        return id;  
    }

    public Long getOwner() {
        return owner;  
    }

    public void setOwner(Long owner) {
        this.owner = owner;  
    }

    public Long getWhitePlayer() {
        return whitePlayer;  
    }

    public void setWhitePlayer(Long whitePlayer) {
        this.whitePlayer = whitePlayer;  
    }

    public Long getBlackPlayer() {
        return blackPlayer;  
    }

    public void setBlackPlayer(Long blackPlayer) {
        this.blackPlayer = blackPlayer;  
    }

    public Long getWinner() {
        return winner;  
    }

    public void setWinner(Long winner) {
        this.winner = winner;  
    }

    public String getGameData() {
        return gameData;  
    }

    public void setGameData(String gameData) {
        this.gameData = gameData;  
    }

    public Date getDate() {
        return date;  
    }

    public void setDate(Date date) {
        this.date = date;  
    }

}
