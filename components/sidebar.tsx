"use client";

import { useAuth } from "@/lib/auth-context";
import { useAppStore, type PageType } from "@/lib/store";
import { LogOut, Moon, Settings, Star, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function Sidebar() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { activePage, setActivePage, setCurrentUser } = useAppStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  // Sync user from auth to store
  useEffect(() => {
    if (user) {
      setCurrentUser({
        id: user.id,
        email: user.email,
        username: user.username || user.email.split("@")[0],
        displayName: user.displayName || user.email,
        avatarUrl: user.avatarUrl || undefined,
        status: user.status,
        createdAt: new Date().toISOString(),
      });
    } else {
      setCurrentUser(null);
    }
  }, [user, setCurrentUser]);

  const handleNavigation = (page: PageType) => {
    setActivePage(page);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems: { page: PageType; icon: string; label: string }[] = [
    { page: "home", icon: "/home.svg", label: "Home" },
    { page: "messages", icon: "/chat.svg", label: "Messages" },
    { page: "calls", icon: "/icon1.svg", label: "Calls" },
    { page: "files", icon: "/file.svg", label: "Files" },
    { page: "archive", icon: "/arcive.svg", label: "Archive" },
  ];

  return (
    <div className="w-[72px] bg-[#F3F3EE] dark:bg-[#1C1C1C] flex flex-col items-center py-6 gap-6 h-screen">
      {/* Logo with Modal */}
      <div className="relative" ref={logoRef}>
        <div
          onClick={() => setShowLogoModal(!showLogoModal)}
          className="w-[44px] h-[44px] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={44}
            height={44}
            className="w-full h-full"
          />
        </div>

        {/* Logo Click Modal */}
        {showLogoModal && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowLogoModal(false)}
            />

            {/* Modal */}
            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-[#3C3C3C] rounded-2xl shadow-lg w-[307px] z-50 p-2.5 flex flex-col gap-1">
              {/* Go back to dashboard */}
              <button
                onClick={() => setShowLogoModal(false)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#363636] transition-colors flex items-center gap-2.5 rounded-lg">
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-[#F3F3EE] dark:bg-gray-600 p-1.5">
                  <Image
                    src="/leftarrow.svg"
                    alt="Back"
                    width={16}
                    height={16}
                    className="w-4 h-4 dark:invert"
                  />
                </div>
                <span className="text-sm font-medium text-[#09090B] dark:text-gray-300 tracking-[-0.01em]">
                  Go back to dashboard
                </span>
              </button>

              {/* Rename file */}
              <button
                onClick={() => {
                  setShowLogoModal(false);
                  setActivePage("profile");
                }}
                className="w-full h-10 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 bg-[#F8F8F5] dark:bg-gray-700 px-3 py-2">
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-white dark:bg-gray-600 p-1.5">
                  <Image
                    src="/edit2.svg"
                    alt="Edit"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                    // style={{ filter: 'brightness(0) saturate(100%) invert(16%) sepia(11%) saturate(1019%) hue-rotate(187deg) brightness(94%) contrast(92%)' }}
                  />
                </div>
                <span className="text-sm font-medium text-[#09090B] dark:text-gray-300 tracking-[-0.01em]">
                  Rename file
                </span>
              </button>

              {/* Separator line */}
              <div className="w-full h-px bg-[#E8E5DF] dark:bg-gray-700 my-1"></div>

              {/* User Info Section */}
              <div className="w-full px-2 py-2 flex flex-col gap-1">
                <h3 className="text-sm font-semibold text-[#1C1C1C] dark:text-white leading-5 tracking-[-0.01em]">
                  {user?.displayName || user?.email?.split("@")[0] || "User"}
                </h3>
                <p className="text-xs font-normal text-[#8B8B8B] dark:text-gray-400 leading-[150%] tracking-[-0.01em]">
                  {user?.email}
                </p>
              </div>

              {/* Credits Section */}
              <div className="w-full rounded-lg bg-[#F8F8F5] dark:bg-gray-700 p-3 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-normal text-[#8B8B8B] dark:text-gray-400 leading-[18px] block mb-1">
                      Credits
                    </span>
                    <span className="text-sm font-medium text-[#09090B] dark:text-white leading-5">
                      20 left
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-normal text-[#8B8B8B] dark:text-gray-400 leading-[18px] block mb-1">
                      Renews in
                    </span>
                    <span className="text-sm font-medium text-[#09090B] dark:text-white leading-5">
                      6h 24m
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#E8E5DF] dark:bg-gray-600 rounded">
                  <div className="w-[62%] h-2 bg-[#1E9A80] rounded"></div>
                </div>
                <div className="w-full h-5 flex items-center justify-between">
                  <span className="text-xs font-normal text-[#5F5F5D] dark:text-gray-400 leading-5 tracking-[-0.01em]">
                    5 of 25 used today
                  </span>
                  <span className="text-xs font-normal text-[#1E9A80] leading-[18px]">
                    +25 tomorrow
                  </span>
                </div>
              </div>

              {/* Separator line */}
              <div className="w-full h-px bg-[#E8E5DF] dark:bg-gray-700 my-1"></div>

              {/* Win free credits and Theme Style */}
              <div className="w-[307px] h-[92px] px-1 py-2 flex flex-col gap-2">
                {/* Win free credits */}
                <button className="w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center bg-[#F3F3EE] dark:bg-gray-600 p-1.5">
                    <Image
                      src="/gift.svg"
                      alt="Gift"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                  </div>
                  <span className="text-sm font-medium text-[#1C1C1C] dark:text-gray-300 leading-5 tracking-[-0.01em]">
                    Win free credits
                  </span>
                </button>

                {/* Theme Style */}
                <button
                  onClick={() => {
                    setTheme(theme === "dark" ? "light" : "dark");
                  }}
                  className="w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center bg-[#F3F3EE] dark:bg-gray-600 p-1.5">
                    <Image
                      src="/theme.svg"
                      alt="Theme"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                  </div>
                  <span className="text-sm font-medium text-[#1C1C1C] dark:text-gray-300 leading-5 tracking-[-0.01em]">
                    Theme Style
                  </span>
                </button>
              </div>
              <div className="w-[287px] h-px bg-[#E8E5DF] dark:bg-gray-700 my-1"></div>
              {/* Log out */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-1 py-2.5 transition-colors flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-[#F3F3EE] dark:bg-gray-600 p-1.5">
                  <Image
                    src="/logout.svg"
                    alt="Logout"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                    style={{
                      filter:
                        "brightness(0) saturate(100%) invert(16%) sepia(11%) saturate(1019%) hue-rotate(187deg) brightness(94%) contrast(92%)",
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-[#1C1C1C] dark:text-gray-300 leading-5 tracking-[-0.01em]">
                  Log out
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Navigation - Gap 12px (gap-3) */}
      <nav className="flex flex-col gap-3">
        {navItems.map(({ page, icon, label }) => (
          <button
            key={page}
            onClick={() => handleNavigation(page)}
            className={`w-[44px] h-[44px] rounded-2xl flex items-center justify-center transition-all duration-200 border-2 ${
              activePage === page
                ? "bg-[#E8F5F1] dark:bg-gray-700 shadow-sm border-[#1E9A80]"
                : "border-transparent hover:border-[#1E9A80] hover:bg-[#E8F5F1] dark:hover:bg-gray-700/50"
            }`}
            title={label}>
            <Image
              src={icon}
              alt={label}
              width={20}
              height={20}
              className="w-5 h-5 object-contain dark:invert"
            />
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      {/* AI Chat Button (Star) */}
      <button
        onClick={() => handleNavigation("ai-chat")}
        className="w-[44px] h-[44px] flex items-center justify-center transition-all duration-200 hover:scale-110"
        title="AI Chat">
        <Image
          src="/spark.svg"
          alt="AI Chat"
          width={20}
          height={20}
          className="w-5 h-5 object-contain dark:invert"
        />
      </button>

      {/* User Profile */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-[44px] h-[44px] rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-white hover:opacity-90 transition-opacity cursor-pointer overflow-hidden ring-2 ring-transparent">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="User"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{getInitials(user?.displayName || user?.email || "U")}</span>
          )}
        </button>

        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />

            {/* Dropdown Menu */}
            <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 w-56 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {user?.displayName || "User"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleNavigation("profile");
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <User size={18} />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleNavigation("settings");
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Settings size={18} />
                  Settings
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 flex items-center gap-3">
                  <LogOut size={18} />
                  Log out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
