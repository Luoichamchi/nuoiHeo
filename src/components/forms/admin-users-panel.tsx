"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
type RoleType = "ADMIN" | "MEMBER";

type UserItem = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: RoleType;
  isActive: boolean;
};

type DraftMap = Record<string, { fullName: string; role: RoleType; isActive: boolean; pin: string }>;

export function AdminUsersPanel() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [message, setMessage] = useState<string | null>(null);

  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [pin, setPin] = useState("000000");
  const [role, setRole] = useState<RoleType>("MEMBER");

  async function loadUsers() {
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Khong tai duoc users");
      return;
    }

    const list = data.users as UserItem[];
    setUsers(list);

    const nextDrafts: DraftMap = {};
    list.forEach((item) => {
      nextDrafts[item.id] = {
        fullName: item.fullName,
        role: item.role,
        isActive: item.isActive,
        pin: ""
      };
    });
    setDrafts(nextDrafts);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const ordered = useMemo(() => [...users].sort((a, b) => a.fullName.localeCompare(b.fullName)), [users]);

  async function createUser(event: FormEvent) {
    event.preventDefault();
    setMessage(null);

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, fullName, pin, role, isActive: true })
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Tao user that bai");
      return;
    }

    setUserId("");
    setFullName("");
    setPin("000000");
    setRole("MEMBER");
    setMessage("Da tao user");
    await loadUsers();
  }

  async function saveUser(userId: string) {
    const draft = drafts[userId];
    if (!draft) return;

    const payload: { fullName: string; role: RoleType; isActive: boolean; pin?: string } = {
      fullName: draft.fullName,
      role: draft.role,
      isActive: draft.isActive
    };

    if (draft.pin.trim()) {
      payload.pin = draft.pin.trim();
    }

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Cap nhat user that bai");
      return;
    }

    setMessage("Da cap nhat user");
    await loadUsers();
  }

  async function removeUser(userId: string) {
    const confirmed = window.confirm(`Ban co chac muon xoa user '${userId}'?`);
    if (!confirmed) return;

    setMessage(null);
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE"
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Xoa user that bai");
      return;
    }

    setMessage(`Da xoa user ${userId}`);
    await loadUsers();
  }

  return (
    <section className="space-y-4">
      <div className="card p-4 sm:p-5">
        <h2 className="text-xl font-bold text-slate-900">Tao user moi</h2>
        <form onSubmit={createUser} className="mt-3 grid gap-3 md:grid-cols-5">
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="User ID (khong trung)"
            className="rounded-xl border border-slate-200 px-3 py-2"
            required
          />
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Ho ten"
            className="rounded-xl border border-slate-200 px-3 py-2"
            required
          />
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            placeholder="PIN"
            className="rounded-xl border border-slate-200 px-3 py-2"
            required
          />
          <select value={role} onChange={(event) => setRole(event.target.value as RoleType)} className="rounded-xl border border-slate-200 px-3 py-2">
            <option value="MEMBER">MEMBER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <button className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white">Tao</button>
        </form>
      </div>

      <div className="card p-4 sm:p-5">
        <h2 className="text-xl font-bold text-slate-900">Danh sach user</h2>
        {message && <p className="mt-2 text-sm text-brand-700">{message}</p>}

        <div className="mt-4 space-y-3">
          {ordered.map((user) => {
            const draft = drafts[user.id];
            if (!draft) return null;

            return (
              <div key={user.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="grid gap-2 md:grid-cols-[1.4fr_120px_120px_1fr_100px_100px] md:items-center">
                  <input
                    value={draft.fullName}
                    onChange={(event) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [user.id]: {
                          ...prev[user.id],
                          fullName: event.target.value
                        }
                      }))
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2"
                  />
                  <select
                    value={draft.role}
                    onChange={(event) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [user.id]: {
                          ...prev[user.id],
                          role: event.target.value as RoleType
                        }
                      }))
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>

                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={draft.isActive}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [user.id]: {
                            ...prev[user.id],
                            isActive: event.target.checked
                          }
                        }))
                      }
                    />
                    Active
                  </label>

                  <input
                    placeholder="PIN moi (optional)"
                    value={draft.pin}
                    onChange={(event) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [user.id]: {
                          ...prev[user.id],
                          pin: event.target.value
                        }
                      }))
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2"
                  />

                  <button onClick={() => saveUser(user.id)} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                    Luu
                  </button>
                  <button
                    onClick={() => removeUser(user.id)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Xoa
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">ID: {user.id}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
