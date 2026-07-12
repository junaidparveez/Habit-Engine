package com.habitengine.repository;

import com.habitengine.entity.NotificationPreference;
import com.habitengine.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    Optional<NotificationPreference> findByUser(User user);
    List<NotificationPreference> findAllByReminderEnabledTrue();
}
