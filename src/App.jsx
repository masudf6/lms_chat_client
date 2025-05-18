// eslint-disable-next-line react-hooks/exhaustive-deps

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"

import FileSidebar from "./FileSidebar"

const API_BASE_URL = "https://lms-chat-api-h3cwb0buddhebfbc.australiasoutheast-01.azurewebsites.net"

function App() {
  const userId = "masud"

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [sessions, setSessions] = useState([])
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renameValue, setRenameValue] = useState("")
  const [useRAG, setUseRAG] = useState(true)
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState("")

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/files`)
        setFiles(res.data)
        if (res.data.length > 0) setSelectedFile(res.data[0].name)
      } catch (err) {
        console.error("Failed to fetch files:", err)
      }
    }
    fetchFiles()
  }, [])

  const fetchSessions = async () => {
    const res = await axios.get(`${API_BASE_URL}/sessions/${userId}`)
    const sessionList = res.data
    setSessions(sessionList)

    if (sessionList.length > 0) {
      setSessionId(sessionList[0].id)
      fetchHistory(sessionList[0].id)
    } else {
      createNewSession()
    }
  }

  const fetchHistory = async (sid) => {
    const res = await axios.get(`${API_BASE_URL}/chat/${sid}`)
    setMessages(res.data)
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { sender: "user", text: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    const endpoint = useRAG ? "rag" : "chat"
    const chat_payload = { message: input }
    if (useRAG && selectedFile) chat_payload.filename = selectedFile

    const res = await axios.post(`${API_BASE_URL}/${endpoint}/${sessionId}`, chat_payload)

    const botMessage = { sender: "bot", text: res.data.response }
    setMessages((prev) => [...prev, botMessage])
  }

  const createNewSession = async () => {
    const res = await axios.post(`${API_BASE_URL}/new_session/${userId}`)
    const data = res.data
    setSessionId(data.session_id)
    setSessions((prev) => [
      { id: data.session_id, name: data.session_id.replace("user123-", "") },
      ...prev
    ])
    setMessages([])
  }

  const deleteSession = async (id) => {
    await axios.delete(`${API_BASE_URL}/session/${id}`)
    if (id === sessionId) setMessages([])
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  const renameSession = async () => {
    await axios.post(`${API_BASE_URL}/rename_session/${sessionId}`, {
      name: renameValue
    })
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, name: renameValue } : s))
    )
    setRenameDialogOpen(false)
    setRenameValue("")
  }

  return (
  <Box display="flex" height="100vh" sx={{ background: "#f6f8fa" }}>
    {/* Left Sidebar */}
    {useRAG && (
      <FileSidebar
        files={files}
        selectedFile={selectedFile}
        onSelectFile={setSelectedFile}
      />
    )}

    {/* Main content */}
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      flexGrow={1}
      p={0}
      sx={{ overflow: "hidden" }}
    >
      {/* Top bar */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={4}
        py={3}
        sx={{
          borderBottom: "1px solid #e0e0e0",
          background: "#fff",
          boxShadow: "0 2px 8px 0 rgba(31, 45, 61, 0.04)",
          zIndex: 1
        }}
      >
        <Typography variant="h4" sx={{ fontFamily: "Montserrat, Roboto, Arial", fontWeight: 600, color: "primary.dark", letterSpacing: 1 }}>
          FYP Chat
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            select
            size="small"
            label="Session"
            value={sessionId}
            onChange={(e) => {
              setSessionId(e.target.value)
              fetchHistory(e.target.value)
            }}
            sx={{ minWidth: 160, bgcolor: "#fafbfc", borderRadius: 2 }}
          >
            {sessions.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
          <IconButton color="primary" onClick={() => setRenameDialogOpen(true)}><EditIcon /></IconButton>
          <IconButton color="error" onClick={() => deleteSession(sessionId)}><DeleteIcon /></IconButton>
          <Button variant="contained" onClick={createNewSession} sx={{ fontWeight: 500 }}>
            New Chat
          </Button>
          <FormControlLabel
            control={<Switch checked={useRAG} onChange={(e) => setUseRAG(e.target.checked)} />}
            label={useRAG ? "Ask My Files" : "Standard Chat"}
            sx={{ ml: 1 }}
          />
          {useRAG && (
            <Box
              sx={{
                px: 2,
                py: 1,
                ml: 1,
                bgcolor: "#e3f2fd",
                borderRadius: 2,
                fontWeight: 500,
                fontSize: 15,
                color: "#1565c0",
                minWidth: 120
              }}
            >
              <strong>Current file:</strong>{" "}
              {selectedFile
                ? files.find(f => f.name === selectedFile)?.name || selectedFile
                : "All Files (Corpus)"}
            </Box>
          )}
        </Box>
      </Box>

      {/* Chat area */}
      <Box
        flexGrow={1}
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
        sx={{
          background: "linear-gradient(135deg, #fafcff 60%, #e3f2fd 100%)",
          px: 0,
          py: 0,
          overflow: "hidden"
        }}
      >
        <Paper
          elevation={4}
          sx={{
            flexGrow: 1,
            m: 3,
            mb: 2,
            px: 4,
            py: 3,
            borderRadius: 4,
            overflowY: "auto",
            background: "rgba(255,255,255,0.96)",
            boxShadow: "0 6px 24px 0 rgba(31, 45, 61, 0.10)",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {messages.length === 0 && (
            <Box
              flexGrow={1}
              display="flex"
              justifyContent="center"
              alignItems="center"
              color="grey.400"
              fontSize={20}
            >
              Start the conversation...
            </Box>
          )}
          {messages.map((msg, idx) => (
            <Box
              key={idx}
              display="flex"
              justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"}
              alignItems="center"
              mb={1.8}
              sx={{
                transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
                transform: "translateY(0px)",
                opacity: 1,
              }}
            >
              <Box
                bgcolor={msg.sender === "user" ? "primary.main" : "grey.200"}
                color={msg.sender === "user" ? "white" : "black"}
                px={2.5}
                py={1.3}
                borderRadius={3}
                fontSize={17}
                sx={{
                  boxShadow: msg.sender === "user"
                    ? "0 2px 8px 0 rgba(25, 118, 210, 0.12)"
                    : "0 2px 8px 0 rgba(33, 150, 243, 0.05)",
                  maxWidth: "70%",
                  wordBreak: "break-word"
                }}
              >
                {msg.text}
              </Box>
            </Box>
          ))}
        </Paper>

        {/* Chat input */}
        <Box
          display="flex"
          alignItems="center"
          px={4}
          pb={3}
          pt={1.5}
          sx={{
            background: "#fff",
            borderTop: "1px solid #e3e8ee",
            boxShadow: "0 -2px 6px 0 rgba(31, 45, 61, 0.03)"
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            sx={{
              borderRadius: 3,
              background: "#f7faff",
              ".MuiOutlinedInput-notchedOutline": { border: 0 }
            }}
          />
          <Button
            variant="contained"
            size="large"
            onClick={sendMessage}
            sx={{
              ml: 2,
              px: 4,
              py: 1.4,
              borderRadius: 3,
              fontWeight: 600,
              fontSize: 16,
              boxShadow: "0 4px 18px 0 rgba(33, 150, 243, 0.13)"
            }}
          >
            Send
          </Button>
        </Box>
      </Box>

      {/* Rename dialog */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
        <DialogTitle>Rename Session</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="New name"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button onClick={renameSession} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  </Box>
)

}

export default App
