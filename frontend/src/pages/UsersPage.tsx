import { useCallback, useEffect, useState } from 'react';
import type { User, UserRole } from '../types';
import { listUsers, updateUserRole, deleteUser } from '../api/users';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RoleStamp } from '../components/RoleStamp';
import '../pages/DocumentsPage.css';
import './UsersPage.css';

const PAGE_SIZE = 10;
const ROLES: UserRole[] = ['ADMIN', 'MANAGER', 'EMPLOYEE'];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { users, meta } = await listUsers({
        page,
        limit: PAGE_SIZE,
        role: roleFilter || undefined,
      });
      setUsers(users);
      setTotal(meta.total);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleRoleChange(user: User, role: UserRole) {
    if (role === user.role) return;
    setUpdatingId(user.id);
    setError(null);
    setSuccess(null);
    try {
      await updateUserRole(user.id, role);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role } : u)));
      setSuccess(`${user.name}'s role updated to ${role}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(user: User) {
    if (!window.confirm(`Remove ${user.name} from the staff directory? This cannot be undone.`)) return;
    setUpdatingId(user.id);
    setError(null);
    setSuccess(null);
    try {
      await deleteUser(user.id);
      setSuccess(`${user.name} was removed.`);
      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchUsers();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header__eyebrow">Administration</div>
          <h1>Staff Directory</h1>
          <p>Manage access levels for everyone in the registry.</p>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value as UserRole | ''); setPage(1); }}
          className="role-filter"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      <div className="card registry-table-wrap">
        {loading ? (
          <div className="empty-state"><span className="spinner" /></div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">👤</div>
            <h3>No staff found</h3>
            <p>No users match this filter.</p>
          </div>
        ) : (
          <table className="registry-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="registry-table__title">{user.name}</td>
                  <td className="registry-table__mono">{user.email}</td>
                  <td>
                    <div className="role-cell">
                      <RoleStamp role={user.role} />
                      <select
                        value={user.role}
                        disabled={user.id === currentUser?.id || updatingId === user.id}
                        onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                        className="role-select"
                        aria-label={`Change role for ${user.name}`}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </td>
                  <td className="registry-table__mono">{formatDate(user.createdAt)}</td>
                  <td className="registry-table__actions">
                    {user.id !== currentUser?.id && (
                      <button
                        className="btn btn--danger-ghost btn--sm"
                        onClick={() => handleDelete(user)}
                        disabled={updatingId === user.id}
                      >
                        {updatingId === user.id ? <span className="spinner" /> : 'Remove'}
                      </button>
                    )}
                    {user.id === currentUser?.id && (
                      <span className="registry-table__muted" style={{ fontSize: '0.8rem' }}>You</span>
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
          <button className="btn btn--ghost btn--sm" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
            ← Previous
          </button>
          <span className="pagination__status">Page {page} of {totalPages} · {total} total</span>
          <button className="btn btn--ghost btn--sm" onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
