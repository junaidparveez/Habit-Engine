package com.habitengine.service;

import com.habitengine.dto.GoalMilestoneDTO;
import com.habitengine.dto.StudyResourceDTO;
import com.habitengine.dto.ai.AiPlanResponse;
import com.habitengine.dto.request.AiPlanRequest;
import com.habitengine.dto.request.CreateGoalRequest;
import com.habitengine.dto.request.RoutineBlockRequest;
import com.habitengine.dto.response.GoalResponse;
import com.habitengine.entity.User;
import com.habitengine.enums.ResourceType;
import com.habitengine.enums.RoutineCategory;
import com.habitengine.ai.tools.DateTimeTool;
import com.habitengine.ai.tools.WebSearchTool;
import com.habitengine.service.GoalService;
import com.habitengine.service.RoutineBlockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * AI Planner Service.
 * <p>
 * Uses Spring AI's ChatClient with Structured Output (BeanOutputConverter)
 * to generate a complete personalised plan from a user's free-text description,
 * then saves each component using the existing service layer.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiPlannerService {

    private final ChatClient chatClient;
    private final GoalService goalService;
    private final RoutineBlockService routineBlockService;
    private final DateTimeTool dateTimeTool;
    private final WebSearchTool webSearchTool;

    private static final String SYSTEM_PROMPT = """
            You are an expert life coach and productivity planner integrated into LevelUp, a gamified habit-tracking app.
            
            IMPORTANT — Before generating the plan, you MUST:
            1. Call getCurrentDateTime() to get today's exact date and calculate realistic future targetDates.
            2. Call searchWeb() to find real, working URLs for study resources relevant to the user's topic.
            
            When a user describes a goal or plan they want to achieve, generate a complete, actionable, structured plan:
            
            1. GOAL: A single clear goal with a realistic target date (calculated from today's date).
            2. MILESTONES: 4-8 weekly milestones that progressively build toward the goal. Each needs targetWeek (1, 2, 3...) and sortOrder.
            3. STUDY SOURCES: 3-6 resources using REAL URLs found via web search. Use YOUTUBE for YouTube links, URL for websites/docs, NOTE for text tips.
            4. ROUTINE BLOCKS: 3-5 daily time blocks. Be specific about times (e.g., 06:00-07:00 for MORNING). Use categories: MORNING, STUDY, WORK, HEALTH, EVENING.
               - daysOfWeek: comma-separated integers where 1=Monday, 7=Sunday (e.g., "1,2,3,4,5" for weekdays).
               - Times must be in HH:mm 24-hour format.
            
            Always be specific, realistic, and actionable. Tailor everything to the user's stated plan.
            """;

    /**
     * Generates a structured AI plan from a free-text description using Spring AI's Structured Output.
     * The AI is given DateTimeTool and WebSearchTool so it can fetch real dates and real resource URLs.
     */
    public AiPlanResponse generatePlan(AiPlanRequest request) {
        log.info("Generating AI plan for description: {}...", request.getPlanDescription().substring(0, Math.min(60, request.getPlanDescription().length())));

        AiPlanResponse response = chatClient
                .prompt()
                .system(SYSTEM_PROMPT)
                .user(request.getPlanDescription())
                .tools(dateTimeTool, webSearchTool)
                .call()
                .entity(AiPlanResponse.class);

        log.info("AI plan generated successfully: goal='{}', milestones={}, resources={}, routines={}",
                response.goal().name(),
                response.milestones().size(),
                response.studySources().size(),
                response.routineBlocks().size());

        return response;
    }

    /**
     * Saves the AI-generated plan into the database.
     * Creates: Goal → Milestones (linked to Goal) → Study Sources (linked to Goal) → Routine Blocks (linked to Goal)
     */
    @Transactional
    public GoalResponse savePlan(AiPlanResponse plan, User user) {
        log.info("Saving AI plan for user {} — goal: '{}'", user.getId(), plan.goal().name());

        // 1. Create the Goal
        CreateGoalRequest goalRequest = new CreateGoalRequest(
                plan.goal().name(),
                plan.goal().description(),
                plan.goal().targetDate() != null ? plan.goal().targetDate() : LocalDate.now().plusMonths(3)
        );
        GoalResponse savedGoal = goalService.createGoal(goalRequest, user.getId());
        Long goalId = savedGoal.getId();

        // 2. Save Milestones
        List<GoalMilestoneDTO> savedMilestones = new ArrayList<>();
        for (AiPlanResponse.AiMilestone m : plan.milestones()) {
            GoalMilestoneDTO milestoneDTO = new GoalMilestoneDTO();
            milestoneDTO.setTitle(m.title());
            milestoneDTO.setDescription(m.description());
            milestoneDTO.setTargetWeek(m.targetWeek());
            milestoneDTO.setSortOrder(m.sortOrder());
            GoalMilestoneDTO savedMilestone = goalService.addMilestone(goalId, milestoneDTO, user.getId());
            savedMilestones.add(savedMilestone);
        }

        // 3. Save Study Sources (linked to the Goal)
        for (AiPlanResponse.AiStudySource s : plan.studySources()) {
            try {
                ResourceType resourceType = ResourceType.valueOf(s.resourceType().toUpperCase());
                StudyResourceDTO resourceDTO = new StudyResourceDTO();
                resourceDTO.setGoalId(goalId);
                resourceDTO.setTitle(s.title());
                resourceDTO.setResourceType(resourceType);
                resourceDTO.setUrlOrContent(s.urlOrContent());
                goalService.addResource(user.getId(), resourceDTO);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid resource type '{}' from AI, defaulting to NOTE", s.resourceType());
                StudyResourceDTO resourceDTO = new StudyResourceDTO();
                resourceDTO.setGoalId(goalId);
                resourceDTO.setTitle(s.title());
                resourceDTO.setResourceType(ResourceType.NOTE);
                resourceDTO.setUrlOrContent(s.urlOrContent());
                goalService.addResource(user.getId(), resourceDTO);
            }
        }

        // 4. Save Routine Blocks (linked to the Goal)
        for (AiPlanResponse.AiRoutineBlock rb : plan.routineBlocks()) {
            try {
                RoutineCategory category = RoutineCategory.valueOf(rb.category().toUpperCase());
                RoutineBlockRequest routineRequest = new RoutineBlockRequest(
                        rb.title(),
                        rb.description(),
                        rb.startTime(),
                        rb.endTime(),
                        category,
                        rb.daysOfWeek(),
                        null,
                        goalId,
                        null
                );
                routineBlockService.createRoutineBlock(user, routineRequest);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid routine category '{}' from AI, defaulting to STUDY", rb.category());
                RoutineBlockRequest routineRequest = new RoutineBlockRequest(
                        rb.title(),
                        rb.description(),
                        rb.startTime(),
                        rb.endTime(),
                        RoutineCategory.STUDY,
                        rb.daysOfWeek(),
                        null,
                        goalId,
                        null
                );
                routineBlockService.createRoutineBlock(user, routineRequest);
            }
        }

        // Return the fully hydrated goal response
        return goalService.getGoalById(goalId, user.getId(), false);
    }
}
