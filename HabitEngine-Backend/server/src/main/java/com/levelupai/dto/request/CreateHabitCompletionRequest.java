package com.levelupai.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateHabitCompletionRequest {

    @NotNull(message = "Completion date is required")
    private LocalDate completionDate;
    
    private String note;
}
