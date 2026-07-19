package com.habitengine.controller;

import com.habitengine.entity.ChatMessage;
import com.habitengine.entity.HabitGroup;
import com.habitengine.entity.User;
import com.habitengine.repository.ChatMessageRepository;
import com.habitengine.repository.HabitGroupRepository;
import com.habitengine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.stream.Collectors;
import java.util.List;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final HabitGroupRepository groupRepository;

    @MessageMapping("/chat.group.{groupId}")
    public void sendGroupMessage(@DestinationVariable Long groupId,
                                 @Payload Map<String, String> payload,
                                 Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            log.warn("Unauthenticated group chat attempt");
            return;
        }
        User sender = (User) authentication.getPrincipal();
        String content = payload.get("content");

        HabitGroup group = groupRepository.findById(groupId).orElse(null);
        if (group != null) {
            ChatMessage message = ChatMessage.builder()
                    .sender(sender)
                    .group(group)
                    .content(content)
                    .build();
            chatMessageRepository.save(message);

            messagingTemplate.convertAndSend("/topic/group." + groupId, (Object) Map.of(
                    "id", message.getId(),
                    "senderId", sender.getId(),
                    "senderName", sender.getUsername(),
                    "content", message.getContent(),
                    "timestamp", message.getTimestamp().toString()
            ));
        }
    }

    @MessageMapping("/chat.private.{receiverId}")
    public void sendPrivateMessage(@DestinationVariable Long receiverId,
                                   @Payload Map<String, String> payload,
                                   Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            log.warn("Unauthenticated private chat attempt");
            return;
        }
        User sender = (User) authentication.getPrincipal();
        String content = payload.get("content");

        User receiver = userRepository.findById(receiverId).orElse(null);
        if (receiver != null) {
            ChatMessage message = ChatMessage.builder()
                    .sender(sender)
                    .receiver(receiver)
                    .content(content)
                    .build();
            chatMessageRepository.save(message);

            // Send to the receiver's queue
            messagingTemplate.convertAndSendToUser(
                    receiver.getUsername(), "/queue/private",
                    (Object) Map.of(
                            "id", message.getId(),
                            "senderId", sender.getId(),
                            "senderName", sender.getUsername(),
                            "receiverId", receiver.getId(),
                            "content", message.getContent(),
                            "timestamp", message.getTimestamp().toString()
                    )
            );
            // Also send back to sender's queue for their UI to update
            messagingTemplate.convertAndSendToUser(
                    sender.getUsername(), "/queue/private",
                    (Object) Map.of(
                            "id", message.getId(),
                            "senderId", sender.getId(),
                            "senderName", sender.getUsername(),
                            "receiverId", receiver.getId(),
                            "content", message.getContent(),
                            "timestamp", message.getTimestamp().toString()
                    )
            );
        }
    }

    @GetMapping("/group/{groupId}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getGroupHistory(@PathVariable Long groupId) {
        HabitGroup group = groupRepository.findById(groupId).orElse(null);
        if (group == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(chatMessageRepository.findByGroupOrderByTimestampAsc(group).stream()
                .map(m -> Map.of(
                        "id", m.getId(),
                        "senderId", m.getSender().getId(),
                        "senderName", m.getSender().getUsername(),
                        "content", m.getContent(),
                        "timestamp", m.getTimestamp().toString()
                )).collect(Collectors.toList()));
    }

    @GetMapping("/private/{receiverId}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getPrivateHistory(@AuthenticationPrincipal User user, @PathVariable Long receiverId) {
        User receiver = userRepository.findById(receiverId).orElse(null);
        if (receiver == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(chatMessageRepository.findPrivateConversation(user, receiver).stream()
                .map(m -> Map.of(
                        "id", m.getId(),
                        "senderId", m.getSender().getId(),
                        "senderName", m.getSender().getUsername(),
                        "receiverId", m.getReceiver().getId(),
                        "content", m.getContent(),
                        "timestamp", m.getTimestamp().toString()
                )).collect(Collectors.toList()));
    }

    @DeleteMapping("/private/{receiverId}")
    @Transactional
    public ResponseEntity<?> clearPrivateChat(@AuthenticationPrincipal User user,
                                              @PathVariable Long receiverId) {
        User receiver = userRepository.findById(receiverId).orElse(null);
        if (receiver == null) return ResponseEntity.notFound().build();

        List<ChatMessage> messages = chatMessageRepository.findPrivateConversation(user, receiver);
        chatMessageRepository.deleteAll(messages);
        log.info("User {} cleared chat with user {}", user.getId(), receiverId);
        return ResponseEntity.ok(Map.of("message", "Chat cleared successfully"));
    }
}

