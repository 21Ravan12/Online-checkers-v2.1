package com.example.CheckerServer.model;
import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "games") 
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;  

    @Column(nullable = false) 
    private Long owner;  

    @Column(nullable = false) 
    private Long whitePlayer;  

    @Column(nullable = false) 
    private Long blackPlayer;  

    @Column(nullable = false) 
    private Long winner;   

    @Column(nullable = false, length = 10000)
    private String gameData;

    @Column(nullable = true, length = 10000)
    private Date date;

    public Long getId() {
        return id;  
    }
    public void setId(Long id) {
        this.id = id;  
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
