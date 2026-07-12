package com.habitengine.config;

import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Quartz scheduler configuration for HabitEngine.
 * Registers the DailyReminderJob with a configurable cron schedule.
 */
@Slf4j
@Configuration
public class QuartzConfig {

    @Value("${notifications.reminder-cron:0 0 8 * * ?}")
    private String reminderCron;

    @Bean
    public JobDetail dailyReminderJobDetail() {
        return JobBuilder.newJob(DailyReminderJob.class)
                .withIdentity("dailyReminderJob", "habitengine")
                .withDescription("Sends daily habit reminder emails to users who have enabled reminders")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger dailyReminderTrigger(JobDetail dailyReminderJobDetail) {
        log.info("Scheduling DailyReminderJob with cron: {}", reminderCron);
        return TriggerBuilder.newTrigger()
                .forJob(dailyReminderJobDetail)
                .withIdentity("dailyReminderTrigger", "habitengine")
                .withDescription("Fires daily at configured time to send habit reminders")
                .withSchedule(CronScheduleBuilder.cronSchedule(reminderCron))
                .build();
    }
}
