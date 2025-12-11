'use client';
import { User, Bell, Briefcase, Save } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const [profile, setProfile] = useState({
    name: 'Federico Martucci',
    email: 'f.martucci@company.com',
    role: 'Project Manager',
  });

  const [notifications, setNotifications] = useState({
    weeklyReports: true,
    blockedAlerts: true,
    velocityAlerts: false,
    performanceInsights: true,
  });

  const [workspace, setWorkspace] = useState({
    defaultProject: 'Project Alpha',
    defaultTimeRange: 'Last 4 weeks',
  });

  return (
    <div className="max-w-4xl space-y-8">
      {/* Profile Settings */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <User size={20} className="text-[var(--color-primary)]" />
          <h3 className="text-[var(--color-text-primary)]">Profile Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-[var(--color-text-secondary)]">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[var(--color-text-secondary)]">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[var(--color-text-secondary)]">Role</label>
            <select
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              className="w-full bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] px-4 py-3 rounded-lg border border-[var(--color-border)] cursor-pointer"
            >
              <option>Project Manager</option>
              <option>Engineering Manager</option>
              <option>Tech Lead</option>
              <option>Developer</option>
            </select>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg transition-colors">
            <Save size={16} />
            Save Profile
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell size={20} className="text-[var(--color-primary)]" />
          <h3 className="text-[var(--color-text-primary)]">Notification Preferences</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-background-secondary)] border border-[var(--color-border)]">
            <div>
              <p className="text-[var(--color-text-primary)] mb-1">Weekly Reports Email</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Receive weekly summary reports every Monday
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.weeklyReports}
                onChange={(e) =>
                  setNotifications({ ...notifications, weeklyReports: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-background-secondary)] border border-[var(--color-border)]">
            <div>
              <p className="text-[var(--color-text-primary)] mb-1">Blocked Work Alerts</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Get notified when tasks are blocked for more than 24 hours
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.blockedAlerts}
                onChange={(e) =>
                  setNotifications({ ...notifications, blockedAlerts: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-background-secondary)] border border-[var(--color-border)]">
            <div>
              <p className="text-[var(--color-text-primary)] mb-1">Velocity Alerts</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Alert when velocity changes by more than 20%
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.velocityAlerts}
                onChange={(e) =>
                  setNotifications({ ...notifications, velocityAlerts: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-background-secondary)] border border-[var(--color-border)]">
            <div>
              <p className="text-[var(--color-text-primary)] mb-1">Performance Insights</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Receive AI-generated insights and recommendations
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.performanceInsights}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    performanceInsights: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
            </label>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg transition-colors">
            <Save size={16} />
            Save Preferences
          </button>
        </div>
      </div>

      {/* Workspace Settings */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Briefcase size={20} className="text-[var(--color-primary)]" />
          <h3 className="text-[var(--color-text-primary)]">Workspace Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-[var(--color-text-secondary)]">
              Default Project
            </label>
            <select
              value={workspace.defaultProject}
              onChange={(e) =>
                setWorkspace({ ...workspace, defaultProject: e.target.value })
              }
              className="w-full bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] px-4 py-3 rounded-lg border border-[var(--color-border)] cursor-pointer"
            >
              <option>Project Alpha</option>
              <option>Project Beta</option>
              <option>Project Gamma</option>
              <option>Project Delta</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[var(--color-text-secondary)]">
              Default Time Range
            </label>
            <select
              value={workspace.defaultTimeRange}
              onChange={(e) =>
                setWorkspace({ ...workspace, defaultTimeRange: e.target.value })
              }
              className="w-full bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] px-4 py-3 rounded-lg border border-[var(--color-border)] cursor-pointer"
            >
              <option>Last 4 weeks</option>
              <option>Last 8 weeks</option>
              <option>Last quarter</option>
              <option>This sprint</option>
            </select>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg transition-colors">
            <Save size={16} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}