import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckIcon from "@mui/icons-material/Check";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import socialApi from "../api/socialApi";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`social-tabpanel-${index}`}
      aria-labelledby={`social-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SocialPage() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);

  // Friend Request Dialog
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [friendIdToADD, setFriendIdToADD] = useState("");

  // Create Group Dialog
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");

  useEffect(() => {
    fetchData();
  }, [tabValue]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tabValue === 0) {
        const res = await socialApi.getFriends();
        setFriends(res || []);
      } else {
        const res = await socialApi.getGroups();
        setGroups(res || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSendFriendRequest = async () => {
    try {
      await socialApi.sendFriendRequest(friendIdToADD);
      setAddFriendOpen(false);
      setFriendIdToADD("");
      fetchData();
    } catch (err) {
      console.error("Failed to send friend request", err);
    }
  };

  const handleAcceptFriendRequest = async (id) => {
    try {
      await socialApi.acceptFriendRequest(id);
      fetchData();
    } catch (err) {
      console.error("Failed to accept friend request", err);
    }
  };

  const handleCreateGroup = async () => {
    try {
      await socialApi.createGroup({ name: groupName, description: groupDesc });
      setCreateGroupOpen(false);
      setGroupName("");
      setGroupDesc("");
      fetchData();
    } catch (err) {
      console.error("Failed to create group", err);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", width: "100%" }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Community
      </Typography>

      <Paper sx={{ width: "100%", bgcolor: "background.paper" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Connections" />
          <Tab label="My Groups" />
        </Tabs>

        {loading ? (
          <Box display="flex" justifyContent="center" p={5}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* CONNECTIONS TAB */}
            <TabPanel value={tabValue} index={0}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Friends</Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setAddFriendOpen(true)}
                >
                  Add Friend
                </Button>
              </Box>

              <List>
                {friends.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No friends found.
                  </Typography>
                ) : (
                  friends.map((friend) => (
                    <ListItem
                      key={friend.id}
                      divider
                      secondaryAction={
                        friend.status === "PENDING" ? (
                          <IconButton
                            onClick={() => handleAcceptFriendRequest(friend.id)}
                            color="primary"
                          >
                            <CheckIcon />
                          </IconButton>
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/messages/${friend.id}`)}
                          >
                            Message
                          </Button>
                        )
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "secondary.main" }}>
                          {friend.displayName ? friend.displayName[0] : "F"}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={friend.displayName || "Unknown User"}
                        secondary={
                          friend.status === "PENDING"
                            ? "Pending Request"
                            : "Friend"
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </TabPanel>

            {/* GROUPS TAB */}
            <TabPanel value={tabValue} index={1}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Groups</Typography>
                <Button
                  variant="contained"
                  startIcon={<GroupAddIcon />}
                  onClick={() => setCreateGroupOpen(true)}
                >
                  Create Group
                </Button>
              </Box>

              <List>
                {groups.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    You are not in any groups.
                  </Typography>
                ) : (
                  groups.map((group) => (
                    <ListItem
                      key={group.id}
                      divider
                      secondaryAction={
                        <IconButton
                          onClick={() => navigate(`/groups/${group.id}`)}
                        >
                          <ArrowForwardIosIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          {group.name ? group.name[0] : "G"}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={group.name}
                        secondary={`${group.membersCount || 0} members`}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </TabPanel>
          </>
        )}
      </Paper>

      {/* Add Friend Dialog */}
      <Dialog open={addFriendOpen} onClose={() => setAddFriendOpen(false)}>
        <DialogTitle>Send Friend Request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="User ID"
            fullWidth
            variant="outlined"
            value={friendIdToADD}
            onChange={(e) => setFriendIdToADD(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFriendOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSendFriendRequest}
            variant="contained"
            disabled={!friendIdToADD}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog open={createGroupOpen} onClose={() => setCreateGroupOpen(false)}>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            variant="outlined"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={groupDesc}
            onChange={(e) => setGroupDesc(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateGroupOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateGroup}
            variant="contained"
            disabled={!groupName}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
