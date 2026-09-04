import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Check,
  Lock,
  Save,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchAllRoles, createCustomRole, updateRolePermissions } from '../services/api';
import type { RoleDefinition, ModuleName, PermissionAction } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

const ALL_MODULES: ModuleName[] = [
  'School Profile',
  'User Management',
  'Roles & Permissions',
  'Dashboard',
  'Audit System',
  'Backup & Restore',
  'System Health',
  'Academic Calendar',
  'Notifications',
];

const ALL_ACTIONS: PermissionAction[] = [
  'View',
  'Create',
  'Edit',
  'Delete',
  'Approve',
  'Export',
  'Manage Users',
  'Manage Settings',
  'Manage School',
  'View Reports',
];

export const RolesAndPermissions: React.FC = () => {
  const { user, roles: contextRoles, refreshUsersAndRoles } = useAuth();

  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const loadRolesData = async () => {
    const list = await fetchAllRoles();
    setRoles(list);
    if (list.length > 0 && !selectedRole) {
      setSelectedRole(list[0]);
    } else if (selectedRole) {
      const found = list.find((r) => r.id === selectedRole.id);
      if (found) setSelectedRole(found);
    }
  };

  useEffect(() => {
    loadRolesData();
  }, []);

  const hasPermissionAction = (module: ModuleName, action: PermissionAction): boolean => {
    if (!selectedRole) return false;
    const rule = selectedRole.permissions.find((p) => p.module === module);
    return Boolean(rule && rule.actions.includes(action));
  };

  const togglePermission = (module: ModuleName, action: PermissionAction) => {
    if (!selectedRole) return;

    let updatedPermissions = [...selectedRole.permissions];
    const existingRuleIndex = updatedPermissions.findIndex((p) => p.module === module);

    if (existingRuleIndex === -1) {
      updatedPermissions.push({ module, actions: [action] });
    } else {
      const existingRule = updatedPermissions[existingRuleIndex];
      const hasAct = existingRule.actions.includes(action);
      let newActions = hasAct
        ? existingRule.actions.filter((a) => a !== action)
        : [...existingRule.actions, action];

      if (newActions.length === 0) {
        updatedPermissions.splice(existingRuleIndex, 1);
      } else {
        updatedPermissions[existingRuleIndex] = { ...existingRule, actions: newActions };
      }
    }

    setSelectedRole({
      ...selectedRole,
      permissions: updatedPermissions,
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      await updateRolePermissions(selectedRole.id, selectedRole.permissions, selectedRole.description);
      await refreshUsersAndRoles();
      setSaveSuccess(`Permissions for "${selectedRole.name}" updated successfully.`);
      setTimeout(() => setSaveSuccess(''), 3000);
      loadRolesData();
    } catch (e: any) {
      alert('Save failed: ' + e.message);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;
    try {
      const created = await createCustomRole(newRoleName, newRoleDesc, [], user?.id, user?.username);
      setShowAddRoleModal(false);
      setNewRoleName('');
      setNewRoleDesc('');
      await refreshUsersAndRoles();
      await loadRolesData();
      setSelectedRole(created);
    } catch (err: any) {
      alert('Failed to create role: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Role & Permission Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Built-in role hierarchy & dynamic matrix editor. Configure granular module actions.
          </p>
        </div>

        <button
          id="add-custom-role-btn"
          onClick={() => setShowAddRoleModal(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Custom Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Col: Role List */}
        <div className="lg:col-span-1 space-y-2">
          <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            System Roles Roster
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {roles.map((r) => {
              const isSelected = selectedRole?.id === r.id;
              return (
                <button
                  key={r.id}
                  id={`role-item-${r.id}`}
                  onClick={() => setSelectedRole(r)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-100 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="overflow-hidden pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{r.name}</span>
                      {r.isBuiltIn && <Badge variant="neutral" size="sm">Built-in</Badge>}
                    </div>
                    <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {r.description}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 3 Cols: Permission Matrix */}
        <div className="lg:col-span-3 space-y-4">
          {selectedRole ? (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {selectedRole.name} Matrix
                    </h3>
                    {selectedRole.isBuiltIn ? (
                      <Badge variant="primary">Core Role</Badge>
                    ) : (
                      <Badge variant="success">Custom Role</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedRole.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {saveSuccess && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      {saveSuccess}
                    </span>
                  )}
                  <button
                    id="save-permissions-btn"
                    onClick={handleSavePermissions}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    Save Matrix
                  </button>
                </div>
              </div>

              {/* Permission Matrix Grid Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase">
                      <th className="p-3 pl-4">OS Module</th>
                      {ALL_ACTIONS.map((action) => (
                        <th key={action} className="p-3 text-center min-w-[70px]">
                          {action}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ALL_MODULES.map((module) => (
                      <tr key={module} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 pl-4 font-semibold text-slate-900 dark:text-slate-100">
                          {module}
                        </td>
                        {ALL_ACTIONS.map((action) => {
                          const isChecked = hasPermissionAction(module, action);
                          return (
                            <td key={action} className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => togglePermission(module, action)}
                                className={`p-1 rounded-md transition-colors ${
                                  isChecked
                                    ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50'
                                    : 'text-slate-300 dark:text-slate-700 hover:text-slate-500'
                                }`}
                              >
                                {isChecked ? <CheckSquare className="w-5 h-5 mx-auto" /> : <Square className="w-5 h-5 mx-auto" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">Select a role to configure permissions.</div>
          )}
        </div>
      </div>

      {/* CREATE CUSTOM ROLE MODAL */}
      <Modal isOpen={showAddRoleModal} onClose={() => setShowAddRoleModal(false)} title="Create New Custom System Role">
        <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Title *</label>
            <input
              type="text"
              placeholder="e.g. Examinations Officer"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Description</label>
            <textarea
              placeholder="Brief summary of duties and permissions..."
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddRoleModal(false)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500">
              Create Role
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
