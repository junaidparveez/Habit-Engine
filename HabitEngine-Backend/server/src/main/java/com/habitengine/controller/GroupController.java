package com.habitengine.controller;

import com.habitengine.entity.HabitGroup;
import com.habitengine.entity.User;
import com.habitengine.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<?> createGroup(@AuthenticationPrincipal User user,
                                         @RequestBody Map<String, String> request) {
        HabitGroup group = groupService.createGroup(user, request.get("name"), request.get("description"));
        return ResponseEntity.ok(Map.of("id", group.getId(), "name", group.getName()));
    }

    @GetMapping
    public ResponseEntity<?> listGroups(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(groupService.listGroups(user));
    }

    @PostMapping("/{groupId}/invite/{userId}")
    public ResponseEntity<?> inviteUser(@AuthenticationPrincipal User user,
                                        @PathVariable Long groupId,
                                        @PathVariable Long userId) {
        groupService.inviteUser(user, groupId, userId);
        return ResponseEntity.ok(Map.of("message", "User invited"));
    }

    @PostMapping("/{groupId}/respond")
    public ResponseEntity<?> respondToInvite(@AuthenticationPrincipal User user,
                                             @PathVariable Long groupId,
                                             @RequestParam boolean accept) {
        groupService.respondToInvite(user, groupId, accept);
        return ResponseEntity.ok(Map.of("message", accept ? "Invite accepted" : "Invite rejected"));
    }

    @PostMapping("/{groupId}/leave")
    public ResponseEntity<?> leaveGroup(@AuthenticationPrincipal User user, @PathVariable Long groupId) {
        groupService.leaveGroup(user, groupId);
        return ResponseEntity.ok(Map.of("message", "Left group"));
    }

    @DeleteMapping("/{groupId}/members/{memberId}")
    public ResponseEntity<?> removeMember(@AuthenticationPrincipal User user,
                                          @PathVariable Long groupId,
                                          @PathVariable Long memberId) {
        groupService.removeMember(user, groupId, memberId);
        return ResponseEntity.ok(Map.of("message", "Member removed"));
    }

    @GetMapping("/{groupId}/leaderboard")
    public ResponseEntity<?> getLeaderboard(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroupLeaderboard(groupId));
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<?> deleteGroup(@AuthenticationPrincipal User user, @PathVariable Long groupId) {
        groupService.deleteGroup(user, groupId);
        return ResponseEntity.ok(Map.of("message", "Group deleted successfully"));
    }
}
