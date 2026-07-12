package com.habitengine.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TodayHabitResponse {
    private HabitResponse habit;
    private boolean completedToday;
    private HabitCompletionResponse completionDetails;
}
