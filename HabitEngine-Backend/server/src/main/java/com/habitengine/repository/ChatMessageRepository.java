package com.habitengine.repository;

import com.habitengine.entity.ChatMessage;
import com.habitengine.entity.HabitGroup;
import com.habitengine.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByGroupOrderByTimestampAsc(HabitGroup group);
    List<ChatMessage> findBySenderAndReceiverOrReceiverAndSenderOrderByTimestampAsc(User sender1, User receiver1, User receiver2, User sender2);
}
