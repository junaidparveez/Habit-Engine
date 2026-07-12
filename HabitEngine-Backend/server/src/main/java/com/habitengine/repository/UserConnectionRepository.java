package com.habitengine.repository;

import com.habitengine.entity.User;
import com.habitengine.entity.UserConnection;
import com.habitengine.enums.ConnectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserConnectionRepository extends JpaRepository<UserConnection, Long> {
    List<UserConnection> findByReceiverAndStatus(User receiver, ConnectionStatus status);
    List<UserConnection> findByRequesterAndStatus(User requester, ConnectionStatus status);
    Optional<UserConnection> findByRequesterAndReceiver(User requester, User receiver);
    
    // Find all accepted connections for a user
    List<UserConnection> findByRequesterAndStatusOrReceiverAndStatus(User requester, ConnectionStatus status1, User receiver, ConnectionStatus status2);
}
