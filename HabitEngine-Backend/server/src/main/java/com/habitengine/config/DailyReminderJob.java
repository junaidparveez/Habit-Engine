package com.habitengine.config;

import com.habitengine.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;

/**
 * Quartz job that sends daily habit reminder emails.
 * Scheduled to run every morning (default 8 AM) via QuartzConfig.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DailyReminderJob implements Job {

    private final NotificationService notificationService;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        log.info("DailyReminderJob triggered — sending reminder emails");
        try {
            notificationService.sendDailyReminders();
        } catch (Exception e) {
            log.error("DailyReminderJob failed: {}", e.getMessage(), e);
            throw new JobExecutionException(e);
        }
    }
}
