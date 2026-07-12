package com.habitengine.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class HabitCompletionResponse {
    private Long id;
    private Long habitId;
    private LocalDate completionDate;
    private String note;
    private LocalDateTime completedAt;
}
