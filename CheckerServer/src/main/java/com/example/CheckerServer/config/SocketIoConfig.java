package com.example.CheckerServer.config;

import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.context.annotation.Bean;

@org.springframework.context.annotation.Configuration
public class SocketIoConfig {
    @Bean(destroyMethod = "stop")
    public SocketIOServer socketIOServer(GameWebSocketHandler handler) throws InterruptedException {
        Configuration configuration = new Configuration();
        configuration.setHostname("0.0.0.0");
        configuration.setPort(3002);
        configuration.setOrigin("*");

        SocketIOServer server = new SocketIOServer(configuration);
        handler.setServer(server);
        server.addListeners(handler);
        server.start();
        return server;
    }
}
