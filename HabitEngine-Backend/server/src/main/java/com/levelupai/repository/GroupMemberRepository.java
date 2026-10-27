package com.levelupai.repository;

import com.levelupai.entity.GroupMember;
import com.levelupai.entity.HabitGroup;
import com.levelupai.entity.User;
import com.levelupai.enums.MemberStatus;
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
    void deleteByGroup(HabitGroup group);
}
