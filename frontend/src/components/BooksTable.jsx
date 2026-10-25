import { StatusPill } from "./TicketTable";

export default function BooksTable({ books, loading }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Book catalogue</h2>
          <p className="muted">
            Publication details, sales, and royalty information.
          </p>
        </div>
      </div>
      {loading ? (
        <p className="muted">Loading books…</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>ISBN</th>
                <th>Publication date</th>
                <th>Status</th>
                <th>Copies sold</th>
                <th>Earned</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id}>
                  <td>
                    <strong>{book.title}</strong>
                    <small>{book.genre || "—"}</small>
                  </td>
                  <td>{book.isbn || "—"}</td>
                  <td>
                    {book.publicationDate
                      ? new Date(book.publicationDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <StatusPill value={book.status} />
                  </td>
                  <td>{book.copiesSold ?? 0}</td>
                  <td>
                    ₹{Number(book.royalties || 0).toLocaleString("en-IN")}
                  </td>
                  <td>
                    ₹{Number(book.royaltyPending || 0).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!books.length && (
            <p className="empty-state">No books found for this account.</p>
          )}
        </div>
      )}
    </section>
  );
}
