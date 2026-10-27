package com.levelupai.dto.response;

import com.levelupai.enums.EmailFrequency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceResponse {
    private Long id;
    private Boolean reminderEnabled;
    private LocalTime reminderTime;
    private EmailFrequency emailFrequency;
}
