package com.habitengine.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for AI plan generation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiPlanRequest {

    @NotBlank(message = "Plan description is required")
    @Size(min = 10, max = 2000, message = "Plan description must be between 10 and 2000 characters")
    private String planDescription;
}
