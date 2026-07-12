package com.habitengine.controller;

import com.habitengine.entity.User;
import com.habitengine.service.ConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/connections")
@RequiredArgsConstructor
public class ConnectionController {

    private final ConnectionService connectionService;

    @PostMapping("/request/{receiverId}")
    public ResponseEntity<?> sendRequest(@AuthenticationPrincipal User user, @PathVariable Long receiverId) {
        connectionService.sendRequest(user, receiverId);
        return ResponseEntity.ok(Map.of("message", "Friend request sent successfully"));
    }

    @PostMapping("/respond/{connectionId}")
    public ResponseEntity<?> respondToRequest(@AuthenticationPrincipal User user,
                                              @PathVariable Long connectionId,
                                              @RequestParam boolean accept) {
        connectionService.respondToRequest(user, connectionId, accept);
        return ResponseEntity.ok(Map.of("message", accept ? "Request accepted" : "Request rejected"));
    }

    @GetMapping("/friends")
    public ResponseEntity<List<Map<String, Object>>> listFriends(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(connectionService.listFriends(user));
    }
}
