import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import socialApi from "../api/socialApi";
import useWebSocket from "../hooks/useWebSocket";
import { useAuth } from "../contexts/AuthContext";

export default function DirectMessagePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const messagesEndRef = useRef(null);

  // Subscribe to private queue
  const { connected, sendMessage } = useWebSocket(
    `/user/queue/private`,
    (message) => {
      // Filter out messages that belong to a different chat window
      const isForThisChat =
        String(message.senderId) === String(userId) ||
        (message.receiverId != null
          ? String(message.receiverId) === String(userId)
          : String(message.senderId) === String(user?.userId));
      if (!isForThisChat) return;

      // Deduplicate by message ID just in case
      setMessages((prev) => {
        if (message.id && prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    },
  );

  useEffect(() => {
    fetchChatHistory();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const res = await socialApi.getChatHistory(null, userId);
      setMessages(res || []);
    } catch (err) {
      console.error("Failed to fetch direct chat history", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    const chatMsg = {
      content: chatInput,
      receiverId: userId,
      senderId: user?.userId,
      timestamp: new Date().toISOString(),
    };

    sendMessage(`/app/chat.private.${userId}`, chatMsg);
    setChatInput("");
  };

  const handleClearChat = async () => {
    try {
      setClearing(true);
      await socialApi.clearPrivateChat(userId);
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear chat", err);
    } finally {
      setClearing(false);
      setClearDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 800,
        mx: "auto",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          Direct Message
        </Typography>
        <Typography
          variant="caption"
          color={connected ? "success.main" : "error.main"}
          sx={{ mx: 1 }}
        >
          {connected ? "● Connected" : "○ Disconnected"}
        </Typography>

        {/* Clear Chat button — pushed to the right */}
        <Box sx={{ ml: "auto" }}>
          <Tooltip title="Clear Chat" arrow>
            <span>
              <IconButton
                color="error"
                onClick={() => setClearDialogOpen(true)}
                disabled={messages.length === 0}
                size="small"
                sx={{
                  border: "1px solid",
                  borderColor: messages.length > 0 ? "error.main" : "divider",
                  borderRadius: 1.5,
                  px: 1.5,
                  gap: 0.5,
                  "&:hover": { bgcolor: "error.dark", color: "white" },
                }}
              >
                <DeleteSweepIcon fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Clear Chat
                </Typography>
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Paper
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Chat Messages */}
        <Box
          sx={{
            flex: 1,
            p: 2,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            bgcolor: "background.default",
          }}
        >
          {messages.length === 0 && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.4,
              }}
            >
              <Typography variant="body2">
                No messages yet. Say hello! 👋
              </Typography>
            </Box>
          )}
          {messages.map((msg, i) => {
            const isMe =
              String(msg.senderId) === String(user?.userId) || msg.isOptimistic;
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
                <Typography variant="body2">{msg.content}</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    fontSize: "0.6rem",
                    display: "block",
                    mt: 0.5,
                    textAlign: "right",
                  }}
                >
                  {msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString()
                    : ""}
                </Typography>
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

      {/* Clear Chat Confirmation Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>🗑️ Clear Chat?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete all messages in this conversation for{" "}
            <strong>both users</strong>. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setClearDialogOpen(false)}
            variant="outlined"
            disabled={clearing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleClearChat}
            variant="contained"
            color="error"
            disabled={clearing}
          >
            {clearing ? "Clearing..." : "Yes, Clear Chat"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
