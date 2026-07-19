package com.habitengine.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalMilestoneDTO {
    private Long id;
    private Long goalId;
    private String title;
    private String description;
    private Integer targetWeek;

    @Builder.Default
    @JsonProperty("isCompleted")
    private Boolean isCompleted = false;

    private Integer sortOrder;

    public boolean isCompleted() {
        return isCompleted != null && isCompleted;
    }
}
