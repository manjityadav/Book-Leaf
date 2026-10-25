import { useCallback, useEffect, useState } from "react";
import api from "./api";
import LoginPage from "./components/LoginPage";
import Sidebar from "./components/Slidebar";
import Overview from "./components/Overview";
import BooksTable from "./components/BooksTable";
import TicketTable from "./components/TicketTable";
import TicketDetail from "./components/TicketDetail";
import "./App.css";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("bookleaf_user")) || null;
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(getStoredUser);
  const [activeTab, setActiveTab] = useState("Overview");
  const [books, setBooks] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState("All");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const isAdmin = user?.role === "admin";

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      if (user.role === "admin") {
        const { data } = await api.get("/admin/tickets");
        setTickets(data.tickets || []);
      } else {
        const [bookResponse, ticketResponse] = await Promise.all([
          api.get("/books"),
          api.get("/tickets"),
        ]);
        setBooks(bookResponse.data.books || []);
        setTickets(ticketResponse.data.tickets || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadDashboard();
  }, [user, loadDashboard]);

  async function handleRegister(event, name, email, password) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // Some register handlers return a token and user; others only confirm creation.
      if (data.token && data.user) {
        localStorage.setItem("bookleaf_token", data.token);
        localStorage.setItem("bookleaf_user", JSON.stringify(data.user));
        setUser(data.user);
        setActiveTab("Overview");
      } else {
        setNotice("Account created successfully. Please sign in.");
      }
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please check your details.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event, email, password) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });
      localStorage.setItem("bookleaf_token", data.token);
      localStorage.setItem("bookleaf_user", JSON.stringify(data.user));
      setUser(data.user);
      setActiveTab("Overview");
      setNotice("");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("bookleaf_token");
    localStorage.removeItem("bookleaf_user");
    setUser(null);
    setBooks([]);
    setTickets([]);
    setSelectedTicket(null);
    setActiveTab("Overview");
    setError("");
    setNotice("");
  }

  async function createTicket(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      await api.post("/tickets", { subject, description });
      setSubject("");
      setDescription("");
      setNotice("Your support ticket was created.");
      setActiveTab("My Tickets");
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create the ticket.");
    }
  }

  async function updateTicket(ticketId, changes) {
    setError("");
    setNotice("");
    try {
      await api.patch(`/admin/tickets/${ticketId}`, changes);
      setNotice("Ticket updated successfully.");
      setSelectedTicket((current) =>
        current?._id === ticketId ? { ...current, ...changes } : current
      );
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update the ticket.");
    }
  }

  const filteredTickets = filter === "All"
    ? tickets
    : tickets.filter((ticket) => ticket.status === filter);

  if (!user) {
    return (
      <LoginPage
        onSubmit={handleLogin}
        onRegister={handleRegister}
        loading={loading}
        error={error}
        notice={notice}
        clearError={() => setError("")}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar user={user} activeTab={activeTab} onNavigate={(tab) => {
        setActiveTab(tab);
        setSelectedTicket(null);
      }} onLogout={logout} />

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">{isAdmin ? "SUPPORT WORKSPACE" : "AUTHOR WORKSPACE"}</p>
            <h1>{activeTab}</h1>
          </div>
          <button className="button secondary" onClick={loadDashboard} disabled={loading}>
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
        </header>

        <section className="content-area">
          {error && <div className="alert error">{error}<button onClick={() => setError("")}>Dismiss</button></div>}
          {notice && <div className="alert success">{notice}<button onClick={() => setNotice("")}>Dismiss</button></div>}

          {activeTab === "Overview" && (
            <Overview
              user={user}
              isAdmin={isAdmin}
              books={books}
              tickets={tickets}
              onViewTickets={() => setActiveTab(isAdmin ? "All Tickets" : "My Tickets")}
              onOpenTicket={(ticket) => {
                setActiveTab(isAdmin ? "All Tickets" : "My Tickets");
                setSelectedTicket(ticket);
              }}
            />
          )}

          {!isAdmin && activeTab === "My Books" && <BooksTable books={books} loading={loading} />}

          {!isAdmin && activeTab === "New Ticket" && (
            <section className="panel form-panel">
              <h2>Create a support ticket</h2>
              <p className="muted">Describe the issue. Our support team will review your request.</p>
              <form className="form-stack" onSubmit={createTicket}>
                <label>Subject
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={160} required placeholder="e.g. Royalty payment query" />
                </label>
                <label>Description
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} minLength={10} maxLength={5000} required rows={6} placeholder="Include relevant details so we can help you." />
                </label>
                <button className="button primary" disabled={loading}>Submit ticket</button>
              </form>
            </section>
          )}

          {((!isAdmin && activeTab === "My Tickets") || (isAdmin && activeTab === "All Tickets")) && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>{isAdmin ? "Support queue" : "Support history"}</h2>
                  <p className="muted">{isAdmin ? "Review and manage incoming author requests." : "Track the progress of your requests."}</p>
                </div>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter tickets by status">
                  <option>All</option>
                  {["Open", "In Progress", "Waiting for Author", "Resolved", "Closed"].map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
              <TicketTable
                tickets={filteredTickets}
                admin={isAdmin}
                onSelect={(ticket) => setSelectedTicket(ticket)}
                onStatusChange={(ticket, status) => updateTicket(ticket._id, { status })}
              />
              {selectedTicket && (
                <TicketDetail
                  key={selectedTicket._id}
                  ticket={selectedTicket}
                  user={user}
                  isAdmin={isAdmin}
                  onClose={() => setSelectedTicket(null)}
                  onStatusChange={(status) => updateTicket(selectedTicket._id, { status })}
                  onError={setError}
                  onNotice={setNotice}
                  onRefresh={loadDashboard}
                />
              )}
            </section>
          )}
        </section>
      </main>
    </div>
  );
}
