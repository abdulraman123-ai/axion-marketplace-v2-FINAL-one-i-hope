"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Role {
  id: string;
  name: string;
  description: string | null;
}

interface UserRoleManagerProps {
  userId: string;
  currentRoles: string[];
  allRoles: Role[];
}

export function UserRoleManager({ userId, currentRoles, allRoles }: UserRoleManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState(currentRoles);

  async function assignRole(roleId: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/user-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roleId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to assign role.");
      }

      setRoles([...roles, allRoles.find((r) => r.id === roleId)?.name ?? roleId]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function removeRole(roleId: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/user-roles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roleId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to remove role.");
      }

      const roleName = allRoles.find((r) => r.id === roleId)?.name;
      setRoles(roles.filter((r) => r !== roleName));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const availableRoles = allRoles.filter((r) => !currentRoles.includes(r.name));

  return (
    <div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="mt-1 flex flex-wrap gap-1">
        {roles.map((roleName) => {
          const role = allRoles.find((r) => r.name === roleName);
          return (
            <span
              key={roleName}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-text-secondary"
            >
              {roleName}
              {role && role.name !== "admin" && (
                <button
                  type="button"
                  onClick={() => removeRole(role.id)}
                  disabled={loading}
                  className="text-text-secondary hover:text-danger"
                  title={`Remove ${roleName} role`}
                >
                  ×
                </button>
              )}
            </span>
          );
        })}
        {availableRoles.length > 0 && (
          <select
            onChange={(e) => {
              if (e.target.value) {
                assignRole(e.target.value);
                e.target.value = "";
              }
            }}
            disabled={loading}
            className="h-7 rounded-full border border-border bg-background px-2 py-0.5 text-xs text-text-secondary"
            defaultValue=""
          >
            <option value="" disabled>
              Add role
            </option>
            {availableRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
