import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Briefcase,
  Building2,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { User, Project, RoleItem } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const MemberManagement: React.FC = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Assign Role Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [membersRes, projRes, rolesRes] = await Promise.all([
        api.getMembers(),
        api.getProjects(),
        api.getRoles()
      ]);

      if (membersRes.success) setMembers(membersRes.members);
      if (projRes.success) {
        setProjects(projRes.projects);
        if (projRes.projects.length > 0) setSelectedProjectId(projRes.projects[0].id);
      }
      if (rolesRes.success) {
        setRoles(rolesRes.roles);
        if (rolesRes.roles.length > 0) setSelectedRoleId(rolesRes.roles[0].id);
      }
    } catch (e) {
      console.error('Failed to fetch roster data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateMemberStatus(id, status);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update member status');
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this member from team roster?')) {
      await api.deleteMember(id);
      fetchData();
    }
  };

  const handleOpenAssignModal = (member: User) => {
    setSelectedMember(member);
    setIsAssignModalOpen(true);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !selectedProjectId || !selectedRoleId) return;

    try {
      const res = await api.createAssignment({
        projectId: selectedProjectId,
        roleId: selectedRoleId,
        memberId: selectedMember.id
      });

      alert(res.message || 'Role assignment created successfully!');
      setIsAssignModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to assign role');
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    (m.department && m.department.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Member Management & Role Allocation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Approve pending member signups, manage team roster, and allocate project roles
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search team members by name, email, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Member Info</th>
                <th className="px-6 py-4">Role / Department</th>
                <th className="px-6 py-4">Institution / College</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading team roster...</td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No members match search query.</td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                          alt={member.name}
                          className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/20"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{member.name}</p>
                          <p className="text-[11px] text-slate-400">{member.email}</p>
                          <span className="text-[10px] text-brand-600 dark:text-brand-400 font-mono font-bold">
                            ID: {member.memberId || 'DEV-100'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-900 dark:text-white">{member.role === 'admin' ? 'System Administrator' : 'Team Member'}</p>
                        <p className="text-[11px] text-slate-400">{member.department || 'Engineering'}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span>{member.college || 'Institute of Technology'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={member.status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {member.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(member.id, 'active')}
                            className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors shadow-sm"
                          >
                            Approve
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenAssignModal(member)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-brand-600 text-white font-bold text-[11px] hover:bg-brand-700 transition-colors shadow-sm"
                        >
                          <Briefcase className="w-3.5 h-3.5" /> Assign Role
                        </button>

                        {member.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Role Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Project Role to ${selectedMember?.name}`}
        subtitle="Select target project and catalog role to trigger digital acknowledgement notification."
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Target Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Role Definition</label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} — {r.department}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-200">Assignment Notification Workflow:</p>
            <p>Once submitted, {selectedMember?.name} will receive a notification to log in, review the role responsibilities, accept or decline, and attach an electronic signature.</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
            >
              Confirm Assignment & Notify Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
