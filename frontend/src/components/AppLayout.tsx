import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleStamp } from './RoleStamp';
import './AppLayout.css';

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__mark">DV</span>
          <div>
            <div className="app-header__title">DocVault</div>
            <div className="app-header__tagline">Document Registry</div>
          </div>
        </div>

        <nav className="app-header__nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
            Registry
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
              Staff Directory
            </NavLink>
          )}
        </nav>

        <div className="app-header__account">
          {user && (
            <>
              <div className="app-header__user">
                <span className="app-header__name">{user.name}</span>
                <RoleStamp role={user.role} />
              </div>
              <button className="btn btn--ghost" onClick={handleLogout}>
                Sign out
              </button>
            </>
          )}
        </div>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}
