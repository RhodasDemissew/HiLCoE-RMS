import { useState, useEffect } from "react";
import { api } from "../../api/client.js";
import { useTheme } from "../contexts/ThemeContext.jsx";

function SettingsWorkspace({ user, role = "Researcher", onUserUpdate }) {
  const { theme, changeTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("Profile");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [messageTimeout, setMessageTimeout] = useState(null);
  
  // Form states
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    department: user?.department || "",
    bio: user?.bio || "",
  });
  
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: true,
    weekly_digest: true,
    deadline_reminders: true,
    review_notifications: true,
    theme: theme,
    default_review_period: 7,
    auto_approve_after: 14,
    default_review_deadline: 5,
    auto_remind_before: 2,
    max_students: 10,
    research_area: "",
    preferred_meeting_times: "afternoon",
    submission_reminders: true,
    review_updates: true,
  });

  // Sync preferences with theme context
  useEffect(() => {
    setPreferences(prev => ({
      ...prev,
      theme: theme
    }));
  }, [theme]);
  
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
        bio: user.bio || "",
      });
    }
    loadPreferences();
  }, [user]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
    };
  }, [messageTimeout]);

  const showMessage = (type, text, duration = 3000) => {
    // Clear any existing timeout
    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }
    
    setMessage({ type, text });
    
    // Auto-dismiss the message
    const timeout = setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, duration);
    
    setMessageTimeout(timeout);
  };

  const handleThemeChange = (newTheme) => {
    setPreferences(prev => ({ ...prev, theme: newTheme }));
    changeTheme(newTheme);
  };


  const loadPreferences = async () => {
    setLoading(true);
    try {
      const response = await api('/users/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    
    try {
      const response = await api('/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile)
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        showMessage("success", "Profile updated successfully!");
        
        // Update user context in parent component
        if (onUserUpdate) {
          onUserUpdate(updatedUser);
        }
        
        // Also update the local user state
        setProfile(prev => ({
          ...prev,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          department: updatedUser.department,
          bio: updatedUser.bio,
        }));
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update profile' }));
        showMessage("error", errorData.error || "Failed to update profile");
      }
    } catch (error) {
      showMessage("error", "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    
    try {
      const response = await api('/users/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences)
      });
      
      if (response.ok) {
        const updatedPreferences = await response.json();
        setPreferences(prev => ({ ...prev, ...updatedPreferences }));
        showMessage("success", "Preferences updated successfully!");
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update preferences' }));
        showMessage("error", errorData.error || "Failed to update preferences");
      }
    } catch (error) {
      showMessage("error", "Error updating preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      showMessage("error", "New passwords don't match");
      return;
    }
    
    if (security.newPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters long");
      return;
    }
    
    setSaving(true);
    setMessage({ type: "", text: "" });
    
    try {
      const response = await api('/users/change-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: security.currentPassword,
          newPassword: security.newPassword
        })
      });
      
      if (response.ok) {
        showMessage("success", "Password changed successfully!");
        setSecurity(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to change password' }));
        showMessage("error", errorData.error || "Failed to change password");
      }
    } catch (error) {
      showMessage("error", "Error changing password");
    } finally {
      setSaving(false);
    }
  };

  const getRoleSpecificTabs = () => {
    const baseTabs = [
      { id: "Profile", label: "Profile", icon: "👤" },
      { id: "Preferences", label: "Preferences", icon: "⚙️" },
      { id: "Security", label: "Security", icon: "🔒" },
    ];

    if (role === "Coordinator") {
      return [
        ...baseTabs,
        { id: "System", label: "System Settings", icon: "🖥️" },
      ];
    } else if (role === "Supervisor") {
      return [
        ...baseTabs,
        { id: "Review", label: "Review Settings", icon: "📝" },
        { id: "Students", label: "Student Management", icon: "👥" },
      ];
    } else {
      return [
        ...baseTabs,
        { id: "Research", label: "Research Settings", icon: "🔬" },
        { id: "Notifications", label: "Notifications", icon: "🔔" },
      ];
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <input
              type="text"
              value={profile.department}
              onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Email Notifications</label>
              <p className="text-xs text-gray-500">Receive notifications via email</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.email_notifications}
              onChange={(e) => setPreferences(prev => ({ ...prev, email_notifications: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Push Notifications</label>
              <p className="text-xs text-gray-500">Receive browser notifications</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.push_notifications}
              onChange={(e) => setPreferences(prev => ({ ...prev, push_notifications: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Weekly Digest</label>
              <p className="text-xs text-gray-500">Receive weekly summary emails</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.weekly_digest}
              onChange={(e) => setPreferences(prev => ({ ...prev, weekly_digest: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Deadline Reminders</label>
              <p className="text-xs text-gray-500">Get reminded about upcoming deadlines</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.deadline_reminders}
              onChange={(e) => setPreferences(prev => ({ ...prev, deadline_reminders: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <select
              value={preferences.theme}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 theme-input"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleSavePreferences}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              value={security.currentPassword}
              onChange={(e) => setSecurity(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={security.newPassword}
              onChange={(e) => setSecurity(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={security.confirmPassword}
              onChange={(e) => setSecurity(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleChangePassword}
          disabled={saving || !security.currentPassword || !security.newPassword}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Changing..." : "Change Password"}
        </button>
      </div>
    </div>
  );

  const renderRoleSpecificTab = () => {
    switch (activeTab) {
      case "System":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Review Period (days)</label>
                <input
                  type="number"
                  value={preferences.default_review_period}
                  onChange={(e) => setPreferences(prev => ({ ...prev, default_review_period: parseInt(e.target.value) || 7 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auto-approve after (days)</label>
                <input
                  type="number"
                  value={preferences.auto_approve_after}
                  onChange={(e) => setPreferences(prev => ({ ...prev, auto_approve_after: parseInt(e.target.value) || 14 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        );
      
      case "Review":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Review Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Review Deadline (days)</label>
                <input
                  type="number"
                  value={preferences.default_review_deadline}
                  onChange={(e) => setPreferences(prev => ({ ...prev, default_review_deadline: parseInt(e.target.value) || 5 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auto-remind before deadline (days)</label>
                <input
                  type="number"
                  value={preferences.auto_remind_before}
                  onChange={(e) => setPreferences(prev => ({ ...prev, auto_remind_before: parseInt(e.target.value) || 2 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        );
      
      case "Students":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Student Management</h3>
            <p className="text-gray-600">Manage your student assignments and preferences.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Students per Supervisor</label>
                <input
                  type="number"
                  value={preferences.max_students}
                  onChange={(e) => setPreferences(prev => ({ ...prev, max_students: parseInt(e.target.value) || 10 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        );
      
      case "Research":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Research Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Research Area</label>
                <input
                  type="text"
                  value={preferences.research_area}
                  onChange={(e) => setPreferences(prev => ({ ...prev, research_area: e.target.value }))}
                  placeholder="e.g., Computer Science, Engineering"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Meeting Times</label>
                <select 
                  value={preferences.preferred_meeting_times}
                  onChange={(e) => setPreferences(prev => ({ ...prev, preferred_meeting_times: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="morning">Morning (9AM-12PM)</option>
                  <option value="afternoon">Afternoon (1PM-5PM)</option>
                  <option value="evening">Evening (6PM-8PM)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        );
      
      case "Notifications":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Submission Reminders</label>
                  <p className="text-xs text-gray-500">Get reminded about upcoming submissions</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.submission_reminders}
                  onChange={(e) => setPreferences(prev => ({ ...prev, submission_reminders: e.target.checked }))}
                  className="h-4 w-4 text-blue-600" 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Review Updates</label>
                  <p className="text-xs text-gray-500">Get notified when reviews are completed</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.review_updates}
                  onChange={(e) => setPreferences(prev => ({ ...prev, review_updates: e.target.checked }))}
                  className="h-4 w-4 text-blue-600" 
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        );
      
      default:
        return <div>Content not available</div>;
    }
  };

  const tabs = getRoleSpecificTabs();

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12">
        <section className="card rounded-card border border-muted bg-white px-8 py-12 shadow-soft">
          <div className="mb-8">
            <h1 className="h2 text-[color:var(--neutral-900)] mb-2">Settings</h1>
            <p className="text-[color:var(--neutral-600)]">Manage your account settings and preferences</p>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-md ${
              message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              <div className="flex items-center">
                <span className="mr-2">{message.type === "success" ? "✅" : "❌"}</span>
                {message.text}
              </div>
            </div>
          )}

          {loading && (
            <div className="mb-6 p-4 bg-blue-50 text-blue-800 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Loading preferences...
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-64">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {activeTab === "Profile" && renderProfileTab()}
              {activeTab === "Preferences" && renderPreferencesTab()}
              {activeTab === "Security" && renderSecurityTab()}
              {!["Profile", "Preferences", "Security"].includes(activeTab) && renderRoleSpecificTab()}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SettingsWorkspace;
