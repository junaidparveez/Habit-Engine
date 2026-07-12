package com.habitengine.dto.request;

import com.habitengine.enums.EmailFrequency;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateNotificationPreferenceRequest {
    private Boolean reminderEnabled;
    private LocalTime reminderTime;
    private EmailFrequency emailFrequency;
}
