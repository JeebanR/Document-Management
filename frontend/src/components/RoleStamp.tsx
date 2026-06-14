import type { UserRole } from '../types';
import './RoleStamp.css';

const LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Staff',
};

export function RoleStamp({ role }: { role: UserRole }) {
  return (
    <span className={`role-stamp role-stamp--${role.toLowerCase()}`}>
      {LABELS[role]}
    </span>
  );
}
