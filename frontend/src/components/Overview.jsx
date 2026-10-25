import TicketTable from "./TicketTable";

export default function Overview({
  user,
  isAdmin,
  books,
  tickets,
  onViewTickets,
  onOpenTicket,
}) {
  const stats = isAdmin
    ? [
        ["Total tickets", tickets.length],
        ["Open tickets", tickets.filter((t) => t.status === "Open").length],
        [
          "High priority",
          tickets.filter((t) => ["High", "Critical"].includes(t.priority))
            .length,
        ],
      ]
    : [
        ["My books", books.length],
        ["My tickets", tickets.length],
        [
          "Awaiting response",
          tickets.filter((t) => t.status === "Waiting for Author").length,
        ],
      ];

  return (
    <>
      <div className="welcome-panel">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h2>Hello, {user.name?.split(" ")[0]}.</h2>
          <p className="muted">
            {isAdmin
              ? "Review support requests and help authors move forward."
              : "Keep track of your books, royalties, and support requests."}
          </p>
        </div>
        <div className="welcome-icon">B</div>
      </div>
      <div className="stats-grid">
        {stats.map(([label, value]) => (
          <article className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>Current records</small>
          </article>
        ))}
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>
              {isAdmin ? "Recent support tickets" : "Your recent tickets"}
            </h2>
            <p className="muted">Latest requests and their current status.</p>
          </div>
          <button className="text-button" onClick={onViewTickets}>
            View all →
          </button>
        </div>
        <TicketTable
          tickets={tickets.slice(0, 5)}
          onSelect={onOpenTicket}
          showAuthor={isAdmin}
        />
      </section>
    </>
  );
}
