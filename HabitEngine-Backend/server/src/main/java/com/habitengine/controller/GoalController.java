package com.habitengine.controller;

import com.habitengine.constants.AppConstants;
import com.habitengine.dto.GoalMilestoneDTO;
import com.habitengine.dto.StudyResourceDTO;
import com.habitengine.dto.request.CreateGoalRequest;
import com.habitengine.dto.request.UpdateGoalRequest;
import com.habitengine.dto.response.ApiResponse;
import com.habitengine.dto.response.GoalResponse;
import com.habitengine.entity.User;
import com.habitengine.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping(AppConstants.API_PREFIX + "/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        throw new RuntimeException("Unauthorized");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getAllGoals() {
        log.debug("REST request to get all goals");
        User user = getCurrentUser();
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        List<GoalResponse> response = goalService.getAllGoals(user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_SUCCESS, response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalResponse>> getGoalById(@PathVariable Long id) {
        log.debug("REST request to get goal with id: {}", id);
        User user = getCurrentUser();
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        GoalResponse response = goalService.getGoalById(id, user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_SUCCESS, response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(@Valid @RequestBody CreateGoalRequest request) {
        log.debug("REST request to create goal: {}", request.getName());
        User user = getCurrentUser();
        GoalResponse response = goalService.createGoal(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Goal created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalResponse>> updateGoal(@PathVariable Long id, @Valid @RequestBody UpdateGoalRequest request) {
        log.debug("REST request to update goal with id: {}", id);
        User user = getCurrentUser();
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        GoalResponse response = goalService.updateGoal(id, request, user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Goal updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(@PathVariable Long id) {
        log.debug("REST request to delete goal with id: {}", id);
        User user = getCurrentUser();
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        goalService.deleteGoal(id, user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Goal deleted successfully", null));
    }

    // --- Milestones ---

    @PostMapping("/{id}/milestones")
    public ResponseEntity<ApiResponse<GoalMilestoneDTO>> addMilestone(
            @PathVariable Long id,
            @RequestBody GoalMilestoneDTO dto) {
        User user = getCurrentUser();
        GoalMilestoneDTO response = goalService.addMilestone(id, dto, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Milestone added successfully", response));
    }

    @PostMapping("/milestones/{milestoneId}/toggle")
    public ResponseEntity<ApiResponse<GoalMilestoneDTO>> toggleMilestone(@PathVariable Long milestoneId) {
        User user = getCurrentUser();
        GoalMilestoneDTO response = goalService.toggleMilestone(milestoneId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Milestone updated", response));
    }

    @DeleteMapping("/milestones/{milestoneId}")
    public ResponseEntity<ApiResponse<Void>> deleteMilestone(@PathVariable Long milestoneId) {
        User user = getCurrentUser();
        goalService.deleteMilestone(milestoneId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Milestone deleted", null));
    }

    // --- Study Resources ---

    @PostMapping("/resources")
    public ResponseEntity<ApiResponse<StudyResourceDTO>> addResource(@RequestBody StudyResourceDTO dto) {
        User user = getCurrentUser();
        StudyResourceDTO response = goalService.addResource(user.getId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Study resource added", response));
    }

    @GetMapping("/resources")
    public ResponseEntity<ApiResponse<List<StudyResourceDTO>>> getUserResources() {
        User user = getCurrentUser();
        List<StudyResourceDTO> response = goalService.getUserResources(user.getId());
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_SUCCESS, response));
    }

    @DeleteMapping("/resources/{resourceId}")
    public ResponseEntity<ApiResponse<Void>> deleteResource(@PathVariable Long resourceId) {
        User user = getCurrentUser();
        goalService.deleteResource(resourceId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Resource deleted", null));
    }
}
