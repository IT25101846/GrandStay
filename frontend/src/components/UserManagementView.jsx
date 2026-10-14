import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  Filter, 
  Calendar, 
  Mail, 
  UserCheck, 
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from './ConfirmModal';

const ROLES = [
  { value: 'CUSTOMER', label: 'Customer', badgeClass: 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700' },
  { value: 'RESERVATION_OFFICER', label: 'Reservation Officer', badgeClass: 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' },
  { value: 'FINANCE_OFFICER', label: 'Finance Officer', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  { value: 'HOTEL_MANAGER', label: 'Hotel Manager', badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' },
  { value: 'HOTEL_ADMIN', label: 'Hotel Administrator', badgeClass: 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-gold-300 dark:border-amber-700/60' },
];

export default function UserManagementView() {
  const { user: currentAdmin } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [roleModal, setRoleModal] = useState({ open: false, targetUser: null, nextRole: '' });
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAll();
      setUsers(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChangeRequest = (targetUser, newRole) => {
    if (targetUser.role === newRole) return;
    if (targetUser.email === currentAdmin?.email && newRole !== 'HOTEL_ADMIN') {
      toast.error('You cannot demote your own administrator account. Another admin must perform this action.');
      return;
    }
    setRoleModal({
      open: true,
      targetUser,
      nextRole: newRole
    });
  };

  const confirmRoleChange = async () => {
    if (!roleModal.targetUser || !roleModal.nextRole) return;
    setUpdating(true);
    try {
      await userApi.updateRole(roleModal.targetUser.id, roleModal.nextRole);
      toast.success(`Role for ${roleModal.targetUser.name} updated to ${roleModal.nextRole.replace('_', ' ')}.`);
      setRoleModal({ open: false, targetUser: null, nextRole: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update user role.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      String(u.id).includes(search);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const counts = {
    total: users.length,
    customer: users.filter(u => u.role === 'CUSTOMER').length,
    staff: users.filter(u => ['RESERVATION_OFFICER', 'FINANCE_OFFICER', 'HOTEL_MANAGER'].includes(u.role)).length,
    admin: users.filter(u => u.role === 'HOTEL_ADMIN').length,
  };

  return (
    <div className="space-y-6">
      {/* Header and KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border border-stone-200 dark:border-dark-800 bg-white dark:bg-dark-900/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 dark:text-gray-400 uppercase tracking-wider">Total Registered</p>
            <p className="font-serif text-3xl font-bold text-stone-900 dark:text-white mt-1">{counts.total}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-600/20 text-amber-700 dark:text-gold-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="card p-5 border border-stone-200 dark:border-dark-800 bg-white dark:bg-dark-900/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 dark:text-gray-400 uppercase tracking-wider">Customers</p>
            <p className="font-serif text-3xl font-bold text-stone-900 dark:text-white mt-1">{counts.customer}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-600/20 text-sky-700 dark:text-sky-400 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="card p-5 border border-stone-200 dark:border-dark-800 bg-white dark:bg-dark-900/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 dark:text-gray-400 uppercase tracking-wider">Officers & Staff</p>
            <p className="font-serif text-3xl font-bold text-stone-900 dark:text-white mt-1">{counts.staff}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-600/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="card p-5 border border-stone-200 dark:border-dark-800 bg-white dark:bg-dark-900/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 dark:text-gray-400 uppercase tracking-wider">Administrators</p>
            <p className="font-serif text-3xl font-bold text-stone-900 dark:text-white mt-1">{counts.admin}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-600/20 text-purple-700 dark:text-purple-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 border border-stone-200 dark:border-dark-800 bg-white dark:bg-dark-900/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="input-field pl-10 text-xs py-2 w-full"
            placeholder="Search by user name, email, or user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              roleFilter === 'ALL'
                ? 'bg-amber-600 text-white dark:bg-gold-500 dark:text-dark-950 font-semibold shadow-sm'
                : 'bg-stone-100 dark:bg-dark-800 text-stone-600 dark:text-gray-400 hover:bg-stone-200'
            }`}
          >
            All Roles ({counts.total})
          </button>
          {ROLES.map((r) => {
            const count = users.filter(u => u.role === r.value).length;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRoleFilter(r.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  roleFilter === r.value
                    ? 'bg-amber-600 text-white dark:bg-gold-500 dark:text-dark-950 font-semibold shadow-sm'
                    : 'bg-stone-100 dark:bg-dark-800 text-stone-600 dark:text-gray-400 hover:bg-stone-200'
                }`}
              >
                {r.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          className="btn-outline px-3 py-1.5 text-xs flex items-center justify-center gap-1.5 self-end md:self-auto"
          title="Refresh User List"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden border border-stone-200 dark:border-dark-800 p-0 shadow-lg">
        {loading ? (
          <div className="py-16 text-center text-stone-500 dark:text-gray-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600 dark:text-gold-400" />
            Loading system accounts...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-stone-500 dark:text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="font-serif text-lg text-stone-800 dark:text-gray-200">No users match your criteria</p>
            <p className="text-xs text-stone-400 mt-1">Try clearing your search query or role filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100/80 dark:bg-dark-900 border-b border-stone-200 dark:border-dark-800 text-stone-500 dark:text-gray-400 font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">User Account</th>
                  <th className="px-5 py-3.5">Email Contact</th>
                  <th className="px-5 py-3.5">Registered</th>
                  <th className="px-5 py-3.5">Current Role</th>
                  <th className="px-5 py-3.5 text-right">Role Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-dark-800 bg-white dark:bg-dark-900/40">
                {filteredUsers.map((u) => {
                  const roleConfig = ROLES.find(r => r.value === u.role) || ROLES[0];
                  const isCurrentSelf = u.email === currentAdmin?.email;

                  return (
                    <tr key={u.id} className="hover:bg-amber-50/30 dark:hover:bg-dark-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-stone-100 dark:bg-dark-800 border border-stone-300 dark:border-gold-500/30 text-amber-800 dark:text-gold-300 flex items-center justify-center font-serif font-bold text-xs shrink-0 shadow-sm">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrentSelf && (
                                <span className="text-[10px] bg-amber-500/15 text-amber-800 dark:text-gold-300 border border-amber-600/30 px-1.5 py-0.2 rounded font-mono font-medium">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-stone-400 dark:text-gray-500 font-mono">
                              User ID #{u.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-stone-700 dark:text-gray-300 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-stone-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${roleConfig.badgeClass}`}>
                          {roleConfig.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <select
                            value={u.role}
                            disabled={isCurrentSelf}
                            onChange={(e) => handleRoleChangeRequest(u, e.target.value)}
                            className="bg-stone-50 dark:bg-dark-800 border border-stone-300 dark:border-dark-700 rounded-lg text-xs py-1.5 px-2.5 text-stone-800 dark:text-gray-200 focus:outline-none focus:border-amber-600 dark:focus:border-gold-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            title={isCurrentSelf ? 'Self-demotion protection enabled' : 'Select new role'}
                          >
                            {ROLES.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Change Confirmation Modal */}
      <ConfirmModal
        open={roleModal.open}
        onClose={() => setRoleModal({ open: false, targetUser: null, nextRole: '' })}
        onConfirm={confirmRoleChange}
        title="Confirm Role Change"
        message={`Are you sure you want to change the role of "${roleModal.targetUser?.name}" (${roleModal.targetUser?.email}) to ${roleModal.nextRole?.replace('_', ' ')}? This will immediately modify their system access and permissions.`}
        confirmLabel="Confirm Role Update"
        cancelLabel="Cancel"
        variant="warning"
        loading={updating}
      />
    </div>
  );
}
