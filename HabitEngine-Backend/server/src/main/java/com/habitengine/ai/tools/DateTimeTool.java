package com.habitengine.ai.tools;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Spring AI Tool — provides the AI with accurate current date and time.
 * <p>
 * Without this, LLMs have a training-data cutoff and cannot know the real date,
 * leading to incorrect targetDates in generated plans.
 */
@Component
public class DateTimeTool {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' HH:mm:ss z");

    /**
     * Returns the current date and time in UTC and IST.
     * The AI calls this to set accurate future targetDates for goals and milestones.
     *
     * @return A human-readable string with current date, time, day of week, and timezone info.
     */
    @Tool(description = "Returns the current date and time. Use this to calculate realistic target dates for goals and milestones based on the user's plan duration.")
    public String getCurrentDateTime() {
        ZonedDateTime utcNow = ZonedDateTime.now(ZoneId.of("UTC"));
        ZonedDateTime istNow = utcNow.withZoneSameInstant(ZoneId.of("Asia/Kolkata"));

        return String.format(
                "Current date and time: %s (UTC) / %s (IST). " +
                "Today's ISO date is: %s. Use this as the baseline to calculate all future target dates.",
                utcNow.format(FORMATTER),
                istNow.format(FORMATTER),
                utcNow.toLocalDate().toString()
        );
    }
}
