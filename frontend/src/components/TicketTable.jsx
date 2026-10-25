export function StatusPill({ value }) {
  const css = value?.toLowerCase().replaceAll(" ", "-") || "unknown";
  return <span className={`pill status-${css}`}>{value || "Unknown"}</span>;
}

export function PriorityPill({ value }) {
  return (
    <span className={`pill priority-${value?.toLowerCase() || "medium"}`}>
      {value || "Medium"}
    </span>
  );
}

export default function TicketTable({
  tickets = [],
  admin = false,
  onSelect,
  onStatusChange,
  showAuthor = admin,
}) {
  if (!tickets.length)
    return <p className="empty-state">No tickets to display.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ticket</th>
            {showAuthor && <th>Author</th>}
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            {onSelect && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket._id}>
              <td>
                <strong>{ticket.subject}</strong>
                <small>#{ticket._id?.slice(-6)}</small>
              </td>
              {showAuthor && <td>{ticket.author?.name || "Unknown"}</td>}
              <td>{ticket.category || "Unclassified"}</td>
              <td>
                <PriorityPill value={ticket.priority} />
              </td>
              <td>
                <StatusPill value={ticket.status} />
              </td>
              {onSelect && (
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => onSelect(ticket)}
                    >
                      Open
                    </button>
                    {admin && (
                      <select
                        aria-label={`Update status for ${ticket.subject}`}
                        value={ticket.status}
                        onChange={(e) =>
                          onStatusChange?.(ticket, e.target.value)
                        }
                      >
                        {[
                          "Open",
                          "In Progress",
                          "Waiting for Author",
                          "Resolved",
                          "Closed",
                        ].map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
