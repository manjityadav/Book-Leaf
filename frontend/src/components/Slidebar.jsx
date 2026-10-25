export default function Sidebar({ user, activeTab, onNavigate, onLogout }) {
  const isAdmin = user?.role === "admin";
  const tabs = [
    "Overview",
    ...(isAdmin ? ["All Tickets"] : ["My Books", "My Tickets", "New Ticket"]),
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark small">B</div>
        <div>
          <strong>BookLeaf</strong>
          <span>Publishing portal</span>
        </div>
      </div>
      <p className="nav-label">WORKSPACE</p>
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`nav-item ${activeTab === tab ? "active" : ""}`}
          onClick={() => onNavigate(tab)}
        >
          <span className="nav-dot" />
          {tab}
        </button>
      ))}
      <div className="sidebar-bottom">
        <div className="user-card">
          <div className="avatar">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="user-info">
            <strong>{user.name}</strong>
            <span>{isAdmin ? "Administrator" : "Author"}</span>
          </div>
        </div>
        <button className="nav-item logout" onClick={onLogout}>
          ↪ Sign out
        </button>
      </div>
    </aside>
  );
}
