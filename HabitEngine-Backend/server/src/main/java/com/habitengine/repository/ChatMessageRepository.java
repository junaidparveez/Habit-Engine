package com.habitengine.repository;

import com.habitengine.entity.ChatMessage;
import com.habitengine.entity.HabitGroup;
import com.habitengine.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m JOIN FETCH m.sender LEFT JOIN FETCH m.group WHERE m.group = :group ORDER BY m.timestamp ASC")
    List<ChatMessage> findByGroupOrderByTimestampAsc(@Param("group") HabitGroup group);

    @Query("SELECT m FROM ChatMessage m JOIN FETCH m.sender JOIN FETCH m.receiver " +
           "WHERE (m.sender = :sender AND m.receiver = :receiver) " +
           "   OR (m.sender = :receiver AND m.receiver = :sender) " +
           "ORDER BY m.timestamp ASC")
    List<ChatMessage> findPrivateConversation(@Param("sender") User sender, @Param("receiver") User receiver);

    void deleteByGroup(HabitGroup group);
}

