import { useCallback, useEffect, useState } from 'react';
import type { Document } from '../types';
import { listDocuments, deleteDocument } from '../api/documents';
import type { ListDocumentsParams } from '../api/documents';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { UploadModal } from '../components/UploadModal';
import './DocumentsPage.css';

const PAGE_SIZE = 10;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState<ListDocumentsParams['sortBy']>('createdAt');
  const [sortOrder, setSortOrder] = useState<ListDocumentsParams['sortOrder']>('DESC');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { documents, meta } = await listDocuments({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        sortBy,
        sortOrder,
      });
      setDocuments(documents);
      setTotal(meta.total);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function toggleSort(column: ListDocumentsParams['sortBy']) {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
    setPage(1);
  }

  async function handleDelete(doc: Document) {
    if (!window.confirm(`Remove "${doc.title}" from the registry? This cannot be undone.`)) return;
    setDeletingId(doc.id);
    try {
      await deleteDocument(doc.id);
      // If we deleted the last item on this page, step back a page
      if (documents.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchDocuments();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  function canDelete(doc: Document): boolean {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return doc.uploadedBy === user.id;
  }

  const sortIndicator = (column: ListDocumentsParams['sortBy']) =>
    sortBy === column ? (sortOrder === 'ASC' ? '▲' : '▼') : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header__eyebrow">
            {user?.role === 'EMPLOYEE' ? 'Your filings' : 'All filings'}
          </div>
          <h1>Document Registry</h1>
          <p>
            {user?.role === 'EMPLOYEE'
              ? 'Documents you have filed are listed below.'
              : 'Every document filed across the organization.'}
          </p>
        </div>
        <button className="btn btn--stamp" onClick={() => setShowUpload(true)}>
          + File a document
        </button>
      </div>

      <form className="registry-search" onSubmit={handleSearchSubmit}>
        <input
          type="search"
          placeholder="Search by title…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="btn btn--ghost">Search</button>
        {search && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
          >
            Clear
          </button>
        )}
      </form>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="card registry-table-wrap">
        {loading ? (
          <div className="empty-state">
            <span className="spinner" />
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📄</div>
            <h3>No documents on file</h3>
            <p>{search ? 'No titles match your search.' : 'File your first document to get started.'}</p>
          </div>
        ) : (
          <table className="registry-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('title')} className="sortable">
                  Title <span className="sort-arrow">{sortIndicator('title')}</span>
                </th>
                {user?.role !== 'EMPLOYEE' && <th>Filed by</th>}
                <th onClick={() => toggleSort('fileSize')} className="sortable">
                  Size <span className="sort-arrow">{sortIndicator('fileSize')}</span>
                </th>
                <th onClick={() => toggleSort('createdAt')} className="sortable">
                  Date filed <span className="sort-arrow">{sortIndicator('createdAt')}</span>
                </th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div className="registry-table__title">{doc.title}</div>
                    <div className="registry-table__filename">{doc.fileName}</div>
                  </td>
                  {user?.role !== 'EMPLOYEE' && (
                    <td className="registry-table__muted">{doc.uploader?.name ?? '—'}</td>
                  )}
                  <td className="registry-table__mono">{formatBytes(doc.fileSize)}</td>
                  <td className="registry-table__mono">{formatDate(doc.createdAt)}</td>
                  <td className="registry-table__actions">
                    <a
                      className="btn btn--ghost btn--sm"
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                    {canDelete(doc) && (
                      <button
                        className="btn btn--danger-ghost btn--sm"
                        onClick={() => handleDelete(doc)}
                        disabled={deletingId === doc.id}
                      >
                        {deletingId === doc.id ? <span className="spinner" /> : 'Delete'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            ← Previous
          </button>
          <span className="pagination__status">
            Page {page} of {totalPages} · {total} total
          </span>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            setShowUpload(false);
            setPage(1);
            fetchDocuments();
          }}
        />
      )}
    </div>
  );
}
