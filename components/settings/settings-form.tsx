"use client";

import { useState } from "react";
import { NavTab } from "./nav-tab";
import { ProfileSection } from "./profile-section";
import { EmailSection } from "./email-section";
import { PasswordSection } from "./password-section";

type Section = "profile" | "email" | "password";

interface SettingsFormProps {
  userName: string;
  userEmail: string;
  userInitial: string;
  userRole: string;
}

export function SettingsForm({
  userName,
  userEmail,
  userInitial,
  userRole,
}: SettingsFormProps) {
  const [activeSection, setActiveSection] = useState<Section>("profile");

  return (
    <div className="flex gap-6">
      {/* Left nav */}
      <aside className="shrink-0 w-48 flex flex-col gap-1">
        <p className="px-3 mb-2 text-xs font-semibold tracking-widest" style={{ color: "#444" }}>
          ACCOUNT
        </p>
        <NavTab
          label="Profile"
          active={activeSection === "profile"}
          onClick={() => setActiveSection("profile")}
        />
        <NavTab
          label="Email"
          active={activeSection === "email"}
          onClick={() => setActiveSection("email")}
        />
        <NavTab
          label="Password"
          active={activeSection === "password"}
          onClick={() => setActiveSection("password")}
        />
      </aside>

      {/* Right content */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        {/* User identity card */}
        <div
          className="flex items-center gap-4 rounded-2xl px-5 py-4"
          style={{ background: "#272727", border: "1px solid #2e2e2e" }}
        >
          <div
            className="flex shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ width: 48, height: 48, background: "#1d4ed8" }}
          >
            {userInitial}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-white truncate">{userName}</div>
            <div className="text-sm truncate" style={{ color: "#666" }}>{userEmail}</div>
          </div>
          <span
            className="ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: "rgba(29,78,216,0.2)",
              color: "#93c5fd",
              border: "1px solid rgba(29,78,216,0.4)",
            }}
          >
            {userRole}
          </span>
        </div>

        {/* Active section */}
        {activeSection === "profile" && (
          <ProfileSection currentName={userName} />
        )}
        {activeSection === "email" && (
          <EmailSection currentEmail={userEmail} />
        )}
        {activeSection === "password" && <PasswordSection />}

        {/* Danger zone always visible */}
        {/* <DangerZone /> */}
      </div>
    </div>
  );
}
