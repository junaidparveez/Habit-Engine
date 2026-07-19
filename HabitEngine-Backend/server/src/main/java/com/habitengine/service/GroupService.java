package com.habitengine.service;

import com.habitengine.entity.GroupMember;
import com.habitengine.entity.HabitGroup;
import com.habitengine.entity.User;
import com.habitengine.entity.HabitStreak;
import com.habitengine.enums.GroupRole;
import com.habitengine.enums.MemberStatus;
import com.habitengine.repository.GroupMemberRepository;
import com.habitengine.repository.HabitGroupRepository;
import com.habitengine.repository.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final HabitGroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;
    private final com.habitengine.repository.ChatMessageRepository chatMessageRepository;

    @Transactional
    public HabitGroup createGroup(User owner, String name, String description) {
        HabitGroup group = HabitGroup.builder()
                .name(name)
                .description(description)
                .owner(owner)
                .build();
        group = groupRepository.save(group);

        GroupMember member = GroupMember.builder()
                .group(group)
                .user(owner)
                .role(GroupRole.OWNER)
                .status(MemberStatus.APPROVED)
                .build();
        memberRepository.save(member);

        return group;
    }

    public List<Map<String, Object>> listGroups(User user) {
        return memberRepository.findByUser(user).stream()
                .map(m -> {
                    HabitGroup g = m.getGroup();
                    long membersCount = memberRepository.findByGroupAndStatus(g, MemberStatus.APPROVED).size();
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", g.getId());
                    map.put("name", g.getName());
                    map.put("status", m.getStatus().name());
                    map.put("role", m.getRole().name());
                    map.put("membersCount", membersCount);
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void inviteUser(User inviter, Long groupId, Long userId) {
        HabitGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        User invitee = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        GroupMember inviterMember = memberRepository.findByGroupAndUser(group, inviter)
                .orElseThrow(() -> new IllegalStateException("You are not a member of this group"));
        if (inviterMember.getRole() != GroupRole.OWNER) {
            // we could allow members to invite, but let's assume so
        }

        if (memberRepository.existsByGroupAndUser(group, invitee)) {
            throw new IllegalStateException("User is already in the group or invited");
        }

        GroupMember member = GroupMember.builder()
                .group(group)
                .user(invitee)
                .role(GroupRole.MEMBER)
                .status(MemberStatus.PENDING)
                .build();
        memberRepository.save(member);
    }

    @Transactional
    public void respondToInvite(User user, Long groupId, boolean accept) {
        HabitGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        GroupMember member = memberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new IllegalStateException("Invite not found"));

        if (member.getStatus() != MemberStatus.PENDING) {
            throw new IllegalStateException("Not a pending invite");
        }

        if (accept) {
            member.setStatus(MemberStatus.APPROVED);
            memberRepository.save(member);
        } else {
            memberRepository.delete(member);
        }
    }

    @Transactional
    public void leaveGroup(User user, Long groupId) {
        HabitGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        GroupMember member = memberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new IllegalStateException("Not a member"));

        if (member.getRole() == GroupRole.OWNER) {
            throw new IllegalStateException("Owner cannot leave the group directly");
        }

        memberRepository.delete(member);
    }

    @Transactional
    public void removeMember(User owner, Long groupId, Long memberId) {
        HabitGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        GroupMember ownerMember = memberRepository.findByGroupAndUser(group, owner)
                .orElseThrow(() -> new IllegalStateException("Not a member"));

        if (ownerMember.getRole() != GroupRole.OWNER) {
            throw new IllegalStateException("Only owner can remove members");
        }

        User memberUser = userRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        GroupMember targetMember = memberRepository.findByGroupAndUser(group, memberUser)
                .orElseThrow(() -> new IllegalStateException("Target not a member"));

        memberRepository.delete(targetMember);
    }

    public List<Map<String, Object>> getGroupLeaderboard(Long groupId) {
        HabitGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        List<GroupMember> members = memberRepository.findByGroupAndStatus(group, MemberStatus.APPROVED);

        return members.stream().map(m -> {
            User u = m.getUser();
            Long totalStreak = (Long) entityManager.createQuery(
                    "SELECT COALESCE(SUM(s.currentStreak), 0) FROM HabitStreak s WHERE s.habit.userId = :userId")
                    .setParameter("userId", u.getId())
                    .getSingleResult();

            Map<String, Object> map = new HashMap<>();
            map.put("userId", u.getId());
            map.put("username", u.getUsername());
            map.put("xp", u.getCurrentXp());
            map.put("totalStreak", totalStreak);
            map.put("role", m.getRole().name());
            return map;
        }).sorted((a, b) -> {
            int xpComparison = Integer.compare((int) b.get("xp"), (int) a.get("xp"));
            if (xpComparison != 0) return xpComparison;
            return Long.compare((long) b.get("totalStreak"), (long) a.get("totalStreak"));
        }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteGroup(User owner, Long groupId) {
        HabitGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        if (!group.getOwner().getId().equals(owner.getId())) {
            throw new IllegalStateException("Only the owner can delete the group");
        }
        chatMessageRepository.deleteByGroup(group);
        memberRepository.deleteByGroup(group);
        groupRepository.delete(group);
    }
}
