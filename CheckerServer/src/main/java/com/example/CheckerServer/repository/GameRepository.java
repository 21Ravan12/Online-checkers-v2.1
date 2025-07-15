package com.example.CheckerServer.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.CheckerServer.model.Game;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {

    Optional<Game> findByOwner(Long owner);

    Optional<Game> findByWhitePlayer(Long whitePlayer);

    Optional<Game> findByBlackPlayer(Long blackPlayer);

    Optional<Game> findByWinner(Long winner);

    List<Game> findAllByOwner(Long owner);

    List<Game> findAllByWhitePlayer(Long whitePlayer);

    List<Game> findAllByBlackPlayer(Long blackPlayer);

    List<Game> findAllByWinner(Long winner);
    
}
