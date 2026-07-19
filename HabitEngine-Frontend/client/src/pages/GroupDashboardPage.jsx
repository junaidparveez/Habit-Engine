import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  IconButton,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import socialApi from "../api/socialApi";
import useWebSocket from "../hooks/useWebSocket";
import { useAuth } from "../contexts/AuthContext";

export default function GroupDashboardPage() {
  const { id } = useParams();
  const { user } = useAuth(); // Assuming auth context provides current logged in user
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState(null); // Wait, we might need basic group info, but leaderboard gives members
  const [leaderboard, setLeaderboard] = useState([]);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef(null);

  const navigate = useNavigate();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteUserId, setInviteUserId] = useState("");

  // Use the WebSocket hook
  const { connected, sendMessage } = useWebSocket(
    `/topic/group.${id}`,
    (message) => {
      // Append incoming message and deduplicate by message ID just in case
      setMessages((prev) => {
        if (message.id && prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    },
  );

  useEffect(() => {
    fetchLeaderboard();
    fetchChatHistory();
  }, [id]);

  useEffect(() => {
    // Auto scroll chat
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await socialApi.getGroupLeaderboard(id);
      setLeaderboard(res || []);
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await socialApi.getChatHistory(id, null);
      setMessages(res || []);
    } catch (err) {
      console.error("Failed to fetch chat history", err);
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    // Send via STOMP
    const chatMsg = {
      content: chatInput,
      senderId: user?.userId,
      senderName: user?.displayName || user?.username || "Me",
      groupId: id,
      timestamp: new Date().toISOString(),
    };
    sendMessage(`/app/chat.group.${id}`, chatMsg);
    setChatInput("");
  };

  const handleRemoveUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this user from the group?",
      )
    ) {
      try {
        await socialApi.removeGroupMember(id, userId);
        fetchLeaderboard();
      } catch (err) {
        console.error("Failed to remove user", err);
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this group? This cannot be undone.",
      )
    ) {
      try {
        await socialApi.deleteGroup(id);
        navigate("/dashboard"); // or to groups list if it exists
      } catch (err) {
        console.error("Failed to delete group", err);
      }
    }
  };

  const handleInvite = async () => {
    if (!inviteUserId.trim()) return;
    try {
      await socialApi.inviteToGroup(id, inviteUserId);
      setInviteOpen(false);
      setInviteUserId("");
      alert("Invite sent successfully!");
    } catch (err) {
      console.error("Failed to invite user", err);
      alert("Failed to send invite. Check user ID.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Find if current user is owner
  const currentUserMember = leaderboard.find(
    (m) => String(m.userId) === String(user?.userId || user?.id),
  );
  const isOwner = currentUserMember?.role === "OWNER";

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Group Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {isOwner && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteGroup}
            >
              Delete Group
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setInviteOpen(true)}
          >
            Invite Member
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ flex: 1, overflow: "hidden" }}>
        {/* Left: Leaderboard */}
        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Paper
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
              <Typography variant="h6">Leaderboard</Typography>
            </Box>
            <List sx={{ flex: 1, overflowY: "auto" }}>
              {leaderboard.map((member, index) => (
                <ListItem
                  key={member.userId || member.id}
                  divider
                  secondaryAction={
                    isOwner &&
                    String(member.userId) !==
                      String(user?.userId || user?.id) ? (
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() =>
                          handleRemoveUser(member.userId || member.id)
                        }
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    ) : null
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor:
                          index === 0
                            ? "gold"
                            : index === 1
                              ? "silver"
                              : index === 2
                                ? "#cd7f32"
                                : "gray",
                      }}
                    >
                      {index + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.displayName || member.username || "User"}
                    secondary={`XP: ${member.xp || 0} | Streak: ${member.streak || 0}`}
                  />
                </ListItem>
              ))}
              {leaderboard.length === 0 && (
                <Box p={2}>
                  <Typography variant="body2" color="text.secondary">
                    No members found.
                  </Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Right: Group Chat */}
        <Grid
          size={{ xs: 12, md: 8 }}
          sx={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <Paper
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Group Chat</Typography>
              <Typography
                variant="caption"
                color={connected ? "success.main" : "error.main"}
              >
                {connected ? "Connected" : "Disconnected"}
              </Typography>
            </Box>

            {/* Chat Messages */}
            <Box
              sx={{
                flex: 1,
                p: 2,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                bgcolor: "#f9fafb",
                ...(true ? { bgcolor: "background.default" } : {}),
              }}
            >
              {messages.map((msg, i) => {
                const isMe = String(msg.senderId) === String(user?.userId);
                return (
                  <Box
                    key={i}
                    sx={{
                      alignSelf: isMe ? "flex-end" : "flex-start",
                      maxWidth: "70%",
                      bgcolor: isMe ? "primary.main" : "background.paper",
                      color: isMe ? "primary.contrastText" : "text.primary",
                      p: 1.5,
                      borderRadius: 2,
                      borderTopRightRadius: isMe ? 0 : 8,
                      borderTopLeftRadius: !isMe ? 0 : 8,
                      boxShadow: 1,
                    }}
                  >
                    {!isMe && (
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: "bold", mb: 0.5, display: "block" }}
                      >
                        {msg.senderName}
                      </Typography>
                    )}
                    <Typography variant="body2">{msg.content}</Typography>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>

            {/* Chat Input */}
            <Box
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: "divider",
                display: "flex",
                gap: 1,
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSendChat();
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSendChat}
                disabled={!connected || !chatInput.trim()}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Invite Member Dialog */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)}>
        <DialogTitle>Invite Member</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the User ID of the person you want to invite to this group.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="User ID"
            variant="outlined"
            value={inviteUserId}
            onChange={(e) => setInviteUserId(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleInvite}
            disabled={!inviteUserId.trim()}
          >
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
