package com.habitengine.entity;

import com.habitengine.enums.RoutineCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "routine_blocks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutineBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoutineCategory category; // MORNING, STUDY, WORK, HEALTH, EVENING

    @Column(name = "days_of_week")
    private String daysOfWeek; // e.g. "1,2,3,4,5,6,7" for daily, or JSON array

    @Column(name = "last_completed_date")
    private LocalDate lastCompletedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_habit_id")
    private Habit linkedHabit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_goal_id")
    private Goal linkedGoal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_milestone_id")
    private GoalMilestone linkedMilestone;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
