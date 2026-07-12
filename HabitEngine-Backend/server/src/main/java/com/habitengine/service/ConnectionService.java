package com.habitengine.service;

import com.habitengine.entity.User;
import com.habitengine.entity.UserConnection;
import com.habitengine.enums.ConnectionStatus;
import com.habitengine.repository.UserConnectionRepository;
import com.habitengine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ConnectionService {

    private final UserConnectionRepository connectionRepository;
    private final UserRepository userRepository;

    @Transactional
    public UserConnection sendRequest(User requester, Long receiverId) {
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));

        if (requester.getId().equals(receiverId)) {
            throw new IllegalArgumentException("Cannot send a request to yourself");
        }

        Optional<UserConnection> existing = connectionRepository.findByRequesterAndReceiver(requester, receiver);
        if (existing.isPresent()) {
            throw new IllegalStateException("Request already exists");
        }
        
        Optional<UserConnection> existingReverse = connectionRepository.findByRequesterAndReceiver(receiver, requester);
        if (existingReverse.isPresent()) {
            throw new IllegalStateException("Reverse request already exists");
        }

        UserConnection connection = UserConnection.builder()
                .requester(requester)
                .receiver(receiver)
                .status(ConnectionStatus.PENDING)
                .build();
        return connectionRepository.save(connection);
    }

    @Transactional
    public void respondToRequest(User user, Long connectionId, boolean accept) {
        UserConnection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new IllegalArgumentException("Connection not found"));

        if (!connection.getReceiver().getId().equals(user.getId())) {
            throw new IllegalStateException("Not authorized to respond to this request");
        }

        if (connection.getStatus() != ConnectionStatus.PENDING) {
            throw new IllegalStateException("Connection is not pending");
        }

        connection.setStatus(accept ? ConnectionStatus.ACCEPTED : ConnectionStatus.REJECTED);
        connectionRepository.save(connection);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listFriends(User user) {
        List<UserConnection> accepted = connectionRepository.findByRequesterAndStatusOrReceiverAndStatus(
                user, ConnectionStatus.ACCEPTED, user, ConnectionStatus.ACCEPTED);
                
        List<UserConnection> pending = connectionRepository.findByReceiverAndStatus(
                user, ConnectionStatus.PENDING);

        List<Map<String, Object>> result = new ArrayList<>();
        
        for (UserConnection conn : accepted) {
            User friend = conn.getRequester().getId().equals(user.getId()) ? conn.getReceiver() : conn.getRequester();
            result.add(Map.<String, Object>of(
                    "id", friend.getId(),
                    "connectionId", conn.getId(),
                    "userId", friend.getId(),
                    "username", friend.getUsername(),
                    "displayName", friend.getDisplayName() != null ? friend.getDisplayName() : friend.getUsername(),
                    "status", "ACCEPTED"
            ));
        }
        
        for (UserConnection conn : pending) {
            User friend = conn.getRequester();
            result.add(Map.<String, Object>of(
                    "id", conn.getId(),
                    "connectionId", conn.getId(),
                    "userId", friend.getId(),
                    "username", friend.getUsername(),
                    "displayName", friend.getDisplayName() != null ? friend.getDisplayName() : friend.getUsername(),
                    "status", "PENDING"
            ));
        }

        return result;
    }
}
