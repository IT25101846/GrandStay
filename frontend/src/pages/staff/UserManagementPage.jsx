import React from 'react';
import { Sparkles } from 'lucide-react';
import Navbar from '../../components/Navbar';
import UserManagementView from '../../components/UserManagementView';

export default function UserManagementPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFB] dark:bg-dark text-stone-900 dark:text-slate-100 pb-20 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-gold inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-gold-600 dark:text-gold-400" />
              Access Control & Governance
            </span>
            <span className="text-xs text-stone-500 dark:text-gray-400">
              · System Administration
            </span>
          </div>
          <h1 className="font-serif text-4xl text-stone-900 dark:text-white font-normal">
            User Accounts & Role Management
          </h1>
          <p className="text-xs text-stone-600 dark:text-gray-400 mt-1">
            Audit registered customer profiles, manage security privileges, and promote staff members across hotel roles.
          </p>
        </div>

        {/* Embedded User Management View */}
        <UserManagementView />
      </main>
    </div>
  );
}
