package com.habitengine.repository;

import com.habitengine.entity.GroupMember;
import com.habitengine.entity.HabitGroup;
import com.habitengine.entity.User;
import com.habitengine.enums.MemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroupAndStatus(HabitGroup group, MemberStatus status);
    List<GroupMember> findByUser(User user);
    Optional<GroupMember> findByGroupAndUser(HabitGroup group, User user);
    boolean existsByGroupAndUser(HabitGroup group, User user);
}
