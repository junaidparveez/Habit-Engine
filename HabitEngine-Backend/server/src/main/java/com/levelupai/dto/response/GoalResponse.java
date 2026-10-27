package com.levelupai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDate targetDate;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
    
    // Derived progress metric (0 to 100)
    private int progress;
    private int totalHabits;

    private List<com.levelupai.dto.GoalMilestoneDTO> milestones;
    private List<com.levelupai.dto.StudyResourceDTO> resources;
}
