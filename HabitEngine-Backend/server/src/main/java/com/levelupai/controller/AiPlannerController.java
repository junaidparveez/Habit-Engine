package com.levelupai.controller;

import com.levelupai.constants.AppConstants;
import com.levelupai.dto.ai.AiPlanResponse;
import com.levelupai.dto.request.AiPlanRequest;
import com.levelupai.dto.response.ApiResponse;
import com.levelupai.dto.response.GoalResponse;
import com.levelupai.entity.User;
import com.levelupai.service.AiPlannerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * AI Planner REST Controller.
 * <p>
 * Exposes two endpoints:
 * <ul>
 *   <li>POST /api/v1/ai/generate — Generate a structured plan from a free-text description (preview only, not saved).</li>
 *   <li>POST /api/v1/ai/save    — Persist a previously generated (and optionally edited) plan to the database.</li>
 * </ul>
 */
@Slf4j
@RestController
@RequestMapping(AppConstants.API_PREFIX + "/ai")
@RequiredArgsConstructor
public class AiPlannerController {

    private final AiPlannerService aiPlannerService;

    /**
     * Generates an AI plan from a free-text description.
     * This is a preview-only call — nothing is saved to the database yet.
     *
     * @param user    The authenticated user (injected from JWT)
     * @param request The user's plan description
     * @return A structured {@link AiPlanResponse} with goal, milestones, study sources, and routine blocks
     */
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<AiPlanResponse>> generatePlan(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AiPlanRequest request) {

        log.info("AI plan generation requested by user {}", user.getId());
        AiPlanResponse plan = aiPlannerService.generatePlan(request);
        return ResponseEntity.ok(ApiResponse.success("Plan generated successfully", plan));
    }

    /**
     * Saves the AI-generated (and optionally user-edited) plan to the database.
     * Creates a Goal, its Milestones, Study Sources, and Routine Blocks in one transaction.
     *
     * @param user The authenticated user (injected from JWT)
     * @param plan The reviewed/edited plan to persist
     * @return The saved {@link GoalResponse} with its full hierarchy
     */
    @PostMapping("/save")
    public ResponseEntity<ApiResponse<GoalResponse>> savePlan(
            @AuthenticationPrincipal User user,
            @RequestBody AiPlanResponse plan) {

        log.info("AI plan save requested by user {} for goal: '{}'", user.getId(), plan.goal().name());
        GoalResponse savedGoal = aiPlannerService.savePlan(plan, user);
        return ResponseEntity.ok(ApiResponse.success("Plan saved successfully! Your goal, milestones, and routine have been created.", savedGoal));
    }
}
