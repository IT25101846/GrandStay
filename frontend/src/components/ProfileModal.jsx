import React, { useState, useEffect } from 'react';
import { User, Lock, Shield, Check, AlertCircle, Sparkles } from 'lucide-react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function ProfileModal({ open, onClose }) {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState('profile'); // 'profile' | 'password'
  const [name, setName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user && open) {
      setName(user.name || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTab('profile');
    }
  }, [user, open]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Full name cannot be blank.');
      return;
    }
    setProfileLoading(true);
    try {
      const res = await api.put('/auth/profile', { name: name.trim() });
      updateUser(res.data);
      toast.success('Your profile details have been updated.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Current password is required.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success('Password changed successfully. Please keep it secure.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to change password. Ensure current password is correct.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      badge="Account & Credentials"
      title="User Account Settings"
      subtitle="Manage your personal profile information and authentication credentials."
      maxWidth="max-w-md"
    >
      {/* Tab Switcher */}
      <div className="flex border-b border-stone-200 dark:border-dark-800 mb-6">
        <button
          type="button"
          onClick={() => setTab('profile')}
          className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider text-center transition-colors border-b-2 cursor-pointer ${
            tab === 'profile'
              ? 'border-gold-500 text-amber-800 dark:text-gold-400'
              : 'border-transparent text-stone-500 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          Profile Details
        </button>
        <button
          type="button"
          onClick={() => setTab('password')}
          className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider text-center transition-colors border-b-2 cursor-pointer ${
            tab === 'password'
              ? 'border-gold-500 text-amber-800 dark:text-gold-400'
              : 'border-transparent text-stone-500 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          Security & Password
        </button>
      </div>

      {tab === 'profile' ? (
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-600 dark:text-gray-400 font-semibold mb-1">
              Registered Email (Account ID)
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-stone-100 dark:bg-dark-900 border border-stone-200 dark:border-dark-800 text-stone-500 dark:text-gray-400 text-xs font-mono">
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span>{user?.email}</span>
            </div>
            <span className="text-[10px] text-stone-400 dark:text-gray-500 mt-1 block">
              Primary email identifier cannot be altered for security compliance.
            </span>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-600 dark:text-gray-400 font-semibold mb-1">
              Assigned System Role
            </label>
            <div className="pt-1">
              <StatusBadge status={user?.role || 'CUSTOMER'} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-700 dark:text-gray-300 font-semibold mb-1">
              Display Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field text-xs"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="submit"
              disabled={profileLoading}
              className="btn-primary flex-1 text-xs py-2.5 disabled:opacity-50 cursor-pointer"
            >
              {profileLoading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-outline text-xs px-4 py-2.5 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-700 dark:text-gray-300 font-semibold mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field text-xs"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-700 dark:text-gray-300 font-semibold mb-1">
              New Password * (min 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field text-xs"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-700 dark:text-gray-300 font-semibold mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field text-xs"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-primary flex-1 text-xs py-2.5 disabled:opacity-50 cursor-pointer"
            >
              {passwordLoading ? 'Updating Password...' : 'Update Password'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-outline text-xs px-4 py-2.5 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
