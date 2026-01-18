"use client";

import { useAuth } from "@/lib/auth-context";
import { useAppStore } from "@/lib/store";
import { Moon, Sun, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import Image from "next/image";

export function TopNavbar() {
  const { user } = useAuth();
  const { currentUser, openModal, activePage, setActivePage } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  const getInitials = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return currentUser?.username?.charAt(0).toUpperCase() || "U";
  };

  const getPageTitle = () => {
    switch (activePage) {
      case "home":
        return "Message";
      case "calls":
        return "Calls";
      case "files":
        return "Files";
      case "settings":
        return "Settings";
      case "profile":
        return "Profile";
      case "ai-chat":
        return "AI Chat";
      default:
        return "Message";
    }
  };

  return (
    <div className="w-full bg-[#FFFFFF] dark:bg-[#1C1C1C] rounded-[16px] mt-5">
      {/* Outer container: full width, radius 16px, padding 12/24 */}
      <div className="w-full px-6 py-3" style={{ padding: "12px 24px" }}>
        {/* Inner container: 1292px fill, height hug 32px, justify space-between, gap 24px */}
        <div
          className="flex items-center justify-between h-8 gap-6"
          style={{ gap: "24px" }}>
          {/* Left: Message Flow (icon + text) - Width hug 89px, gap 8px */}
          <div className="flex items-center gap-2">
            <Image
              src="/message-icon.svg"
              width={15}
              height={13}
              alt="Message"
              className="flex-shrink-0 dark:invert"
            />
            <h1
              className="text-sm font-medium text-[#111625] dark:text-[#FFFFFF]"
              style={{
                letterSpacing: "-0.006em",
                fontSize: "14px",
                lineHeight: "20px",
              }}>
              {getPageTitle()}
            </h1>
          </div>

          {/* Right: Search + Controls - Width hug 476px, gap 16px */}
          <div className="flex items-center gap-4">
            {/* Search container - Width hug 476px, gap 16px */}
            <div className="flex items-center gap-4">
              {/* Search box - Fixed 300x32, radius 10px, border 1px #E8E5DF, padding 10/4/10/10, gap 8px */}
              <div
                className="flex items-center w-[300px] h-8 rounded-[10px] border border-[#E8E5DF] dark:border-[#3C3C3C] bg-white dark:bg-[#2C2C2C]"
                style={{
                  paddingTop: "10px",
                  paddingRight: "4px",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  gap: "8px",
                }}>
                <Image
                  src="/search.svg"
                  width={11}
                  height={11}
                  alt="Search"
                  className="flex-shrink-0 dark:invert dark:opacity-70"
                  style={{ width: "10.5px", height: "10.5px" }}
                />
                <input
                  type="text"
                  placeholder="Search"
                  className="flex-1 bg-transparent border-0 outline-none text-[#8796AF] placeholder-[#8796AF] dark:text-[#9CA3AF] dark:placeholder-[#6B7280] font-normal"
                  style={{
                    fontSize: "12px",
                    lineHeight: "16px",
                    letterSpacing: "0px",
                  }}
                />

                {/* Ctrl+K pill - Width 40px, height 24px, radius 6px, padding 5/6, gap 4px, bg #F3F3EE */}
                <div
                  className="flex items-center justify-center h-6 rounded-[6px] bg-[#F3F3EE] dark:bg-gray-700"
                  style={{
                    width: "40px",
                    paddingTop: "5px",
                    paddingRight: "6px",
                    paddingBottom: "5px",
                    paddingLeft: "6px",
                    gap: "4px",
                  }}>
                  <Image
                    src="/ctrl.svg"
                    width={24}
                    height={12}
                    alt="Cmd+K"
                    className="dark:invert dark:opacity-70"
                  />
                </div>
              </div>

              {/* Bell button - Fixed 32x32, radius 8px, border 1px #E8E5DF, bg #FFFFFF */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-8 h-8 rounded-lg border border-[#E8E5DF] bg-[#FFFFFF] dark:bg-gray-800 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative"
                  title="Notifications">
                  <Image
                    src="/bell.svg"
                    width={16}
                    height={16}
                    alt="Notifications"
                    className="dark:invert dark:opacity-70"
                  />
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"></div>
                </button>

                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-96 overflow-hidden">
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Notifications
                        </h3>
                      </div>
                      <div className="overflow-y-auto max-h-80">
                        <div className="p-8 text-center text-gray-400">
                          No new notifications
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Settings button - Fixed 32x32, radius 8px, border 1px #E8E5DF, bg #FFFFFF */}
              <button
                onClick={() => setActivePage("settings")}
                className="w-8 h-8 rounded-lg border border-[#E8E5DF] bg-[#FFFFFF] dark:bg-gray-800 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Settings">
                <Image
                  src="/setting.svg"
                  width={16}
                  height={16}
                  alt="Settings"
                  className="dark:invert dark:opacity-70"
                />
              </button>

              {/* Vertical divider - Height 20px, border 1px, color #E8E5DF */}
              <div className="h-5 w-px bg-[#E8E5DF] dark:bg-gray-700"></div>

              {/* Profile group - Width hug 56px, height hug 32px, gap 8px */}
              <button
                onClick={() => setActivePage("profile")}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                title="Profile">
                {/* Avatar - 32x32, radius 999px */}
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden cursor-pointer">
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getInitials()}</span>
                  )}
                </div>

                {/* Chevron - Width 8px, height 4px, border 1.5px, color #262626 */}
                <ChevronDown
                  size={12}
                  className="text-[#262626] dark:text-white"
                  strokeWidth={1.5}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
