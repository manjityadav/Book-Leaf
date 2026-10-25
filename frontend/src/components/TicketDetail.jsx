import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../api";
import { PriorityPill, StatusPill } from "./TicketTable";

const STATUSES = [
  "Open",
  "In Progress",
  "Waiting for Author",
  "Resolved",
  "Closed",
];

export default function TicketDetail({
  ticket,
  user,
  isAdmin,
  onClose,
  onStatusChange,
  onError,
  onNotice,
  onRefresh,
}) {
  const [replies, setReplies] = useState([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [draft, setDraft] = useState("");
  const [draftLoading, setDraftLoading] = useState(false);
  const [note, setNote] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const ticketId = ticket._id;

    async function loadReplies() {
      try {
        const { data } = await api.get(`/tickets/${ticketId}/replies`);
        if (active) setReplies(data.replies || []);
      } catch (err) {
        if (active)
          onError(
            err.response?.data?.message || "Could not load conversation.",
          );
      }
    }
    loadReplies();

    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        auth: { token: localStorage.getItem("bookleaf_token") },
      },
    );
    socket.on("connect", () => {
      if (active) setSocketStatus("connected");
      socket.emit("ticket:join", ticketId, (result) => {
        if (active && result && result.success === false)
          onError(result.message || "Could not join live updates.");
      });
    });
    socket.on("disconnect", () => {
      if (active) setSocketStatus("disconnected");
    });
    socket.on("ticket:replied", (event) => {
      if (!active || event.ticketId !== ticketId || !event.reply) return;
      setReplies((current) =>
        current.some((item) => item._id === event.reply._id)
          ? current
          : [...current, event.reply],
      );
    });
    return () => {
      active = false;
      socket.disconnect();
    };
  }, [ticket._id, onError]);

  async function sendReply(event) {
    event.preventDefault();
    const message = replyMessage.trim();
    if (!message || replyLoading) return;
    setReplyLoading(true);
    try {
      const { data } = await api.post(`/tickets/${ticket._id}/replies`, {
        message,
      });
      const newReply = data.reply;
      if (newReply)
        setReplies((current) =>
          current.some((item) => item._id === newReply._id)
            ? current
            : [...current, newReply],
        );
      else {
        const { data: refreshed } = await api.get(
          `/tickets/${ticket._id}/replies`,
        );
        setReplies(refreshed.replies || []);
      }
      setReplyMessage("");
    } catch (err) {
      onError(err.response?.data?.message || "Could not send your reply.");
    } finally {
      setReplyLoading(false);
    }
  }

  async function generateDraft() {
    setDraftLoading(true);
    try {
      const { data } = await api.post(`/admin/tickets/${ticket._id}/draft`);
      setDraft(data.draft || "");
    } catch (err) {
      onError(err.response?.data?.message || "Couldn't generate an AI draft.");
    } finally {
      setDraftLoading(false);
    }
  }

  async function saveNote() {
    if (!note.trim()) return;
    setNoteLoading(true);
    try {
      await api.post(`/admin/tickets/${ticket._id}/notes`, {
        content: note.trim(),
      });
      setNote("");
      onNotice("Private note added.");
      await onRefresh();
    } catch (err) {
      onError(err.response?.data?.message || "Couldn't save the private note.");
    } finally {
      setNoteLoading(false);
    }
  }

  function senderName(reply) {
    if (reply.sender?.name) return reply.sender.name;
    const senderId = reply.sender?._id || reply.sender;
    if (senderId && String(senderId) === String(user.id || user._id))
      return "You";
    return isAdmin ? "Author" : "BookLeaf Support";
  }

  return (
    <section className="ticket-detail">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">TICKET DETAILS</p>
          <h2>{ticket.subject}</h2>
          <p className="muted">
            {ticket.author?.name && `${ticket.author.name} · `}
            {ticket.author?.email || "Your support request"}
          </p>
        </div>
        <button className="button secondary" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="ticket-description">{ticket.description}</p>
      <div className="detail-meta">
        <span>
          Category: <strong>{ticket.category || "Unclassified"}</strong>
        </span>
        <span>
          Priority: <PriorityPill value={ticket.priority} />
        </span>
        <span>
          Status: <StatusPill value={ticket.status} />
        </span>
      </div>

      {isAdmin && (
        <div className="admin-tools">
          <label className="inline-label">
            Update status
            <select
              value={ticket.status || "Open"}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              {STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <div className="draft-box">
            <div className="panel-heading">
              <h3>AI-suggested response</h3>
              <button
                className="button primary"
                onClick={generateDraft}
                disabled={draftLoading}
              >
                {draftLoading ? "Generating…" : "Generate AI draft"}
              </button>
            </div>
            {draft ? (
              <>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={6}
                />
                <p className="muted">
                  Review and edit this draft, then use it in the reply box
                  below.
                </p>
                <button
                  className="button secondary"
                  onClick={() => setReplyMessage(draft)}
                >
                  Use draft as reply
                </button>
              </>
            ) : (
              <p className="muted">
                Generate a policy-based response for this ticket.
              </p>
            )}
          </div>
          <div className="draft-box">
            <h3>Internal private note</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Only support admins can see this note."
            />
            <button
              className="button secondary"
              onClick={saveNote}
              disabled={noteLoading || !note.trim()}
            >
              {noteLoading ? "Saving…" : "Save private note"}
            </button>
          </div>
        </div>
      )}

      <div className="conversation-panel">
        <div className="conversation-header">
          <div>
            <h3>Conversation</h3>
            <p className="muted">
              Public replies between the author and support team.
            </p>
          </div>
          <span className={`connection-status ${socketStatus}`}>
            {socketStatus === "connected" ? "● Live updates" : "○ Connecting…"}
          </span>
        </div>
        <div className="conversation-messages">
          {!replies.length ? (
            <p className="empty-message">
              No replies yet. Start the conversation below.
            </p>
          ) : (
            replies.map((reply, index) => (
              <article
                className="conversation-message"
                key={reply._id || `${reply.createdAt}-${index}`}
              >
                <div className="message-meta">
                  <strong>{senderName(reply)}</strong>
                  <span>
                    {reply.createdAt
                      ? new Date(reply.createdAt).toLocaleString()
                      : ""}
                  </span>
                </div>
                <p>{reply.message}</p>
              </article>
            ))
          )}
        </div>
        <form onSubmit={sendReply} className="reply-form">
          <textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Write a reply…"
            rows={3}
            maxLength={5000}
            required
          />
          <button
            className="button primary"
            type="submit"
            disabled={replyLoading || !replyMessage.trim()}
          >
            {replyLoading ? "Sending…" : "Send reply"}
          </button>
        </form>
      </div>
    </section>
  );
}
