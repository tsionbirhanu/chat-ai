"use client";

import { usersApi } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface User {
  id: string;
  displayName: string | null;
  username: string | null;
  email: string;
  avatarUrl: string | null;
  status: string;
}

interface ModalPosition {
  top?: number;
  left?: number;
  right?: number;
}

export function Modals() {
  const {
    activeModal,
    closeModal,
    createSession,
    selectSession,
    fetchSessions,
    modalPosition,
  } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeModal === "newMessage") {
      loadUsers();
    }
  }, [activeModal]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const name = user.displayName || user.username || user.email;
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSelectUser = async (user: User) => {
    setIsCreating(true);
    try {
      // Create a new chat session with this user
      const session = await createSession([user.id]);
      if (session) {
        // Refresh sessions list and select the new session
        await fetchSessions();
        await selectSession(session.id);
      }
      closeModal();
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to create chat:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "bg-emerald-500";
      case "AWAY":
        return "bg-yellow-500";
      case "BUSY":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  if (activeModal !== "newMessage") return null;

  // Determine positioning style
  const getModalStyle = (): React.CSSProperties => {
    if (modalPosition) {
      return {
        position: "fixed",
        top: modalPosition.top,
        left: modalPosition.left,
        right: modalPosition.right,
        bottom: modalPosition.bottom,
      };
    }
    return {};
  };

  const isPositioned = !!modalPosition;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50" onClick={() => closeModal()} />

      {/* Modal */}
      <div
        ref={modalRef}
        style={{
          ...getModalStyle(),
          width: "273px",
          maxHeight: "440px",
          borderRadius: "16px",
          border: "1px solid #E8E5DF",
          padding: "12px",
        }}
        className={`bg-white dark:bg-gray-800 overflow-hidden z-50 ${
          isPositioned
            ? "fixed"
            : "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        }`}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex flex-col" style={{ gap: "10px" }}>
          <div
            className="flex items-center"
            style={{ width: "249px", height: "24px", gap: "10px" }}>
            <h2
              className="text-[#111625] dark:text-white"
              style={{
                fontSize: "16px",
                lineHeight: "24px",
                fontWeight: 500,
                letterSpacing: "-0.011em",
                width: "107px",
                height: "24px",
              }}>
              New Message
            </h2>
          </div>

          {/* Search Input */}
          <div className="relative" style={{ width: "249px", height: "32px" }}>
            <div
              className="absolute"
              style={{
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
              }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <circle
                  cx="6.125"
                  cy="6.125"
                  r="5.25"
                  stroke="#404040"
                  strokeWidth="1.05"
                />
                <path
                  d="M10.5 10.5L12.25 12.25"
                  stroke="#404040"
                  strokeWidth="1.05"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full focus:outline-none focus:border-[#1E9A80]"
              style={{
                height: "32px",
                borderRadius: "10px",
                border: "1px solid #F3F3EE",
                paddingTop: "10px",
                paddingRight: "4px",
                paddingBottom: "10px",
                paddingLeft: "32px",
                fontSize: "12px",
                lineHeight: "16px",
                fontWeight: 400,
                letterSpacing: "0px",
                color: "#8B8B8B",
              }}
              autoFocus
            />
          </div>
        </div>

        {/* User List */}
        <div
          className="overflow-y-auto"
          style={{
            width: "249px",
            gap: "12px",
            display: "flex",
            flexDirection: "column",
            marginTop: "12px",
          }}>
          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              {users.length === 0 ? "No users available" : "No users found"}
            </div>
          ) : (
            filteredUsers.map((user) => {
              const displayName =
                user.displayName || user.username || user.email;
              return (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  disabled={isCreating}
                  className="flex items-center transition-colors disabled:opacity-50 cursor-pointer hover:bg-[#F3F3EE]"
                  style={{
                    width: "249px",
                    height: "44px",
                    borderRadius: "8px",
                    paddingTop: "6px",
                    paddingRight: "8px",
                    paddingBottom: "6px",
                    paddingLeft: "8px",
                    gap: "10px",
                  }}>
                  {/* Avatar */}
                  <div
                    className="relative flex items-center justify-center overflow-hidden"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "1000px",
                      border: "2px solid #FFFFFF",
                      backgroundColor: "#F7F9FB",
                    }}>
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={displayName}
                        className="object-cover"
                        style={{ width: "32px", height: "32px" }}
                      />
                    ) : (
                      <span
                        className="text-emerald-600 dark:text-emerald-400 font-medium"
                        style={{ fontSize: "12px" }}>
                        {getInitials(displayName)}
                      </span>
                    )}
                  </div>

                  {/* User info */}
                  <div className="text-left flex-1">
                    <p
                      className="text-[#111625] dark:text-white"
                      style={{
                        fontSize: "12px",
                        lineHeight: "16px",
                        fontWeight: 500,
                        letterSpacing: "0px",
                      }}>
                      {displayName}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
