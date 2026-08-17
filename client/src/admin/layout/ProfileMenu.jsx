import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiUser,
  FiChevronDown,
  FiCheck,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { clearAdminToken, updateAdminProfile } from "../../api/adminApi";
import { useAdminSession } from "../SessionContext";
import { useToast } from "../components/Toast";
import { Avatar, Button, Field, Input, Modal } from "../components/ui";
import { initials } from "../format";

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();
  const { user, setUser } = useAdminSession();
  const toast = useToast();

  useEffect(() => {
    if (editOpen && user) {
      setForm({ name: user.name || "", email: user.email || "" });
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setErrors({});
    }
  }, [editOpen, user]);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  const handleLogout = () => {
    clearAdminToken();
    navigate("/admin/login");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const payload = {};
    if (form.name !== (user?.name || "")) payload.name = form.name.trim();
    if (form.email !== user?.email) payload.email = form.email.trim();
    if (passwordForm.newPassword) {
      payload.currentPassword = passwordForm.currentPassword;
      payload.newPassword = passwordForm.newPassword;
    }

    try {
      const updated = await updateAdminProfile(payload);
      setUser(updated);
      setEditOpen(false);
      toast.success("Profile updated");
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="a-icon-menu-wrap" ref={wrapRef}>
      <button
        className="a-icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        style={{ width: "auto", padding: "0 6px 0 4px", gap: 6 }}
      >
        <Avatar
          name={initials(user?.name || user?.username)}
          size={30}
          title={user?.name || user?.username}
        />
        <FiChevronDown size={14} style={{ color: "var(--a-faint)" }} />
      </button>

      {open && (
        <div className="a-popover a-profile-menu" style={{ minWidth: 250 }}>
          <div className="a-profile">
            <Avatar
              name={initials(user?.name || user?.username)}
              title={user?.name || user?.username}
            />
            <div className="a-profile-head">
              <div style={{ minWidth: 0 }}>
                <strong
                  style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {user?.name || user?.username || "Admin"}
                </strong>
                <span>{user?.email}</span>
              </div>
            </div>
          </div>
          <button
            className="a-menu-item"
            onClick={() => {
              setOpen(false);
              setEditOpen(true);
            }}
          >
            <FiUser /> Edit profile
          </button>
          <div className="a-menu-sep" />
          <button className="a-menu-item danger" onClick={handleLogout}>
            <FiLogOut /> Sign out
          </button>
        </div>
      )}

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        sub="Update your name, email, or password"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEditOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" form="admin-profile-form" loading={saving}>
              <FiCheck /> Save changes
            </Button>
          </>
        }
      >
        <form id="admin-profile-form" onSubmit={handleSave} noValidate>
          {errors.form && (
            <div
              className="a-badge a-badge-red"
              style={{ marginBottom: 12, padding: "8px 12px", borderRadius: 8 }}
            >
              {errors.form}
            </div>
          )}
          <Field label="Display name">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
            />
          </Field>
          <Field label="Email" required>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@example.com"
            />
          </Field>
          <Field
            label="Current password"
            hint="Required only when changing your password"
          >
            <Input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
              autoComplete="current-password"
            />
          </Field>
          <Field
            label="New password"
            hint="Leave blank to keep your current password"
          >
            <div style={{ position: "relative" }}>
              <Input
                type={showPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                autoComplete="new-password"
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: 6,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--a-faint)",
                  cursor: "pointer",
                  display: "flex",
                  padding: 6,
                }}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </Field>
        </form>
      </Modal>
    </div>
  );
};

export default ProfileMenu;
