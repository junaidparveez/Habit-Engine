package com.habitengine.dto;

import com.habitengine.enums.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyResourceDTO {
    private Long id;
    private Long userId;
    private Long goalId;
    private Long milestoneId;
    private String title;
    private ResourceType resourceType;
    private String urlOrContent;
}
