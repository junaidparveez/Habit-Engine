package com.habitengine.entity;

import com.habitengine.enums.EmailFrequency;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalTime;

/**
 * Notification preference entity.
 * Stores per-user settings for reminders and email notifications.
 */
@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    @Column(name = "reminder_enabled", nullable = false)
    private Boolean reminderEnabled = false;

    @Builder.Default
    @Column(name = "reminder_time")
    private LocalTime reminderTime = LocalTime.of(8, 0);

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "email_frequency", nullable = false)
    private EmailFrequency emailFrequency = EmailFrequency.NEVER;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
