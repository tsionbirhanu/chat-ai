"use client";

import { usersApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useAppStore, User } from "@/lib/store";
import {
  Archive,
  BellOff,
  Download,
  Info,
  Loader2,
  MailOpen,
  MoreVertical,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { TouchEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";

// Context menu state type
interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  sessionId: string | null;
}

// Swipe state type
interface SwipeState {
  sessionId: string | null;
  offsetX: number;
  startX: number;
  isSwiping: boolean;
}

export function MessageList() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const {
    sessions,
    selectedSessionId,
    selectSession,
    fetchSessions,
    isLoadingSessions,
    openModal,
    searchQuery,
    setSearchQuery,
    currentUser,
    setActivePage,
    createSession,
  } = useAppStore();
  const { theme, setTheme } = useTheme();

  const newMessageButtonRef = useRef<HTMLButtonElement>(null);
  const [searchMode, setSearchMode] = useState<"conversations" | "users">(
    "conversations",
  );
  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    sessionId: null,
  });

  // Swipe state
  const [swipeState, setSwipeState] = useState<SwipeState>({
    sessionId: null,
    offsetX: 0,
    startX: 0,
    isSwiping: false,
  });

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      sessionId,
    });
  };

  // Close context menu
  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, sessionId: null });
  };

  // Handle context menu actions
  const handleContextAction = (action: string) => {
    console.log(`Action: ${action} for session: ${contextMenu.sessionId}`);
    // These are UI placeholders - functionality can be added later
    closeContextMenu();
  };

  // Touch handlers for swipe
  const handleTouchStart = (
    e: TouchEvent<HTMLDivElement>,
    sessionId: string,
  ) => {
    setSwipeState({
      sessionId,
      startX: e.touches[0].clientX,
      offsetX: 0,
      isSwiping: true,
    });
  };

  const handleTouchMove = (
    e: TouchEvent<HTMLDivElement>,
    sessionId: string,
  ) => {
    if (!swipeState.isSwiping || swipeState.sessionId !== sessionId) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - swipeState.startX;

    // Limit swipe distance
    const maxSwipe = 80;
    const clampedOffset = Math.max(-maxSwipe, Math.min(maxSwipe, diff));

    setSwipeState((prev) => ({
      ...prev,
      offsetX: clampedOffset,
    }));
  };

  const handleTouchEnd = (sessionId: string) => {
    // If swiped enough, trigger action
    if (Math.abs(swipeState.offsetX) > 60) {
      if (swipeState.offsetX < 0) {
        console.log("Mark as unread:", sessionId);
      } else {
        console.log("Archive:", sessionId);
      }
    }

    // Reset swipe state
    setSwipeState({
      sessionId: null,
      offsetX: 0,
      startX: 0,
      isSwiping: false,
    });
  };

  // Mouse handlers for swipe (desktop support)
  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    sessionId: string,
  ) => {
    // Prevent if clicking on the more button
    if ((e.target as HTMLElement).closest("button")) return;

    setSwipeState({
      sessionId,
      startX: e.clientX,
      offsetX: 0,
      isSwiping: true,
    });
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    sessionId: string,
  ) => {
    if (!swipeState.isSwiping || swipeState.sessionId !== sessionId) return;

    const diff = e.clientX - swipeState.startX;

    // Limit swipe distance
    const maxSwipe = 80;
    const clampedOffset = Math.max(-maxSwipe, Math.min(maxSwipe, diff));

    setSwipeState((prev) => ({
      ...prev,
      offsetX: clampedOffset,
    }));
  };

  const handleMouseUp = (sessionId: string) => {
    if (!swipeState.isSwiping) return;

    // If swiped enough, trigger action
    if (Math.abs(swipeState.offsetX) > 60) {
      if (swipeState.offsetX < 0) {
        console.log("Mark as unread:", sessionId);
      } else {
        console.log("Archive:", sessionId);
      }
    }

    // Reset swipe state
    setSwipeState({
      sessionId: null,
      offsetX: 0,
      startX: 0,
      isSwiping: false,
    });
  };

  const handleMouseLeave = () => {
    if (swipeState.isSwiping) {
      setSwipeState({
        sessionId: null,
        offsetX: 0,
        startX: 0,
        isSwiping: false,
      });
    }
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    if (contextMenu.visible) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [contextMenu.visible]);

  // Keyboard support for swipe actions on selected session
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only work when a session is selected and no modal/context menu is open
      if (!selectedSessionId || contextMenu.visible) return;

      // Arrow Left = swipe left (Unread)
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSwipeState({
          sessionId: selectedSessionId,
          offsetX: -80,
          startX: 0,
          isSwiping: false,
        });

        // Auto-reset after animation
        setTimeout(() => {
          console.log("Mark as unread:", selectedSessionId);
          setSwipeState({
            sessionId: null,
            offsetX: 0,
            startX: 0,
            isSwiping: false,
          });
        }, 800);
      }

      // Arrow Right = swipe right (Archive)
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setSwipeState({
          sessionId: selectedSessionId,
          offsetX: 80,
          startX: 0,
          isSwiping: false,
        });

        // Auto-reset after animation
        setTimeout(() => {
          console.log("Archive:", selectedSessionId);
          setSwipeState({
            sessionId: null,
            offsetX: 0,
            startX: 0,
            isSwiping: false,
          });
        }, 800);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedSessionId, contextMenu.visible]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Fetch sessions when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated, fetchSessions]);

  // Search for users when in user search mode
  useEffect(() => {
    if (searchMode === "users" && searchQuery.trim().length > 0) {
      // Debounce the search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearchingUsers(true);
        try {
          console.log("Searching for users:", searchQuery);
          const results = await usersApi.search(searchQuery);
          console.log("Search results:", results);
          // Filter out current user from results - backend returns array directly
          const userList = Array.isArray(results)
            ? results
            : results.users || [];
          const filtered = userList.filter(
            (u: User) => u.id !== currentUser?.id,
          );
          console.log("Filtered results:", filtered);
          setUserSearchResults(filtered);
        } catch (error) {
          console.error("User search failed:", error);
          setUserSearchResults([]);
        } finally {
          setIsSearchingUsers(false);
        }
      }, 300);
    } else if (searchMode === "users") {
      setUserSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchMode, currentUser?.id]);

  // Handle starting a conversation with a user
  const handleStartConversation = async (userId: string) => {
    try {
      await createSession([userId]);
      setSearchQuery("");
      setSearchMode("conversations");
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  // Helper to get the other participant's info for 1:1 chats
  const getSessionDisplayInfo = (session: (typeof sessions)[0]) => {
    if (session.isGroup) {
      return {
        name: session.name || "Group Chat",
        avatar: null,
        status: null,
      };
    }

    // Backend returns 'users' not 'participants'
    const otherUser = session.users?.find((u) => u.userId !== currentUser?.id);

    return {
      name:
        otherUser?.user?.displayName || otherUser?.user?.username || "Unknown",
      avatar: otherUser?.user?.avatarUrl || null,
      status: otherUser?.user?.status || "offline",
    };
  };

  // Format timestamp for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const filteredSessions = sessions.filter((s) => {
    const info = getSessionDisplayInfo(s);
    const lastMsg = s.messages?.[0]; // Backend returns messages array with most recent first
    return (
      info.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMsg?.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div
      className="w-full lg:w-[352px] bg-[#FFFFFF] dark:bg-[#1C1C1C] flex flex-col overflow-hidden flex-shrink-0 rounded-3xl"
      style={{ padding: "24px", gap: "24px" }}>
      {/* User Info Section *

      {/* Header */}
      <div className="flex flex-col" style={{ gap: "24px" }}>
        {/* All Message + New Message Button - Fill 352px, Hug 32px, space-between */}
        <div className="flex items-center justify-between h-8">
          <h2
            className="text-[#111625] dark:text-[#FFFFFF]"
            style={{
              fontSize: "20px",
              lineHeight: "30px",
              fontWeight: 600,
              letterSpacing: "0%",
            }}>
            All Message
          </h2>
          <button
            ref={newMessageButtonRef}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const parent = e.currentTarget.closest(
                '[style*="width"]',
              ) as HTMLElement;
              const parentRect = parent?.getBoundingClientRect();
              openModal("newMessage", {
                top: rect.bottom + 8,
                left: parentRect?.left || rect.left,
              });
            }}
            className="bg-[#1E9A80] text-[#FFFFFF] rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
            style={{
              height: "32px",
              padding: "8px",
              gap: "6px",
              border: "1px solid #1E9A80",
              fontSize: "14px",
              lineHeight: "20px",
              fontWeight: 500,
              letterSpacing: "-0.006em",
            }}>
            <img
              src="/newmessage.svg"
              alt=""
              width={14}
              height={14}
              className="w-6 h-4"
            />
            <span>New Message</span>
          </button>
        </div>

        {/* Search Bar - Fill 352px, Hug 40px, gap 16px */}
        <div className="flex" style={{ gap: "16px", height: "40px" }}>
          <div className="flex-1 relative" style={{ maxWidth: "296px" }}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute"
              style={{ left: "10px", top: "14px" }}>
              <circle
                cx="5.5"
                cy="5.5"
                r="4.5"
                stroke="#262626"
                strokeWidth="1.2"
              />
              <path
                d="M8.5 8.5L10.5 10.5"
                stroke="#262626"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder={
                searchMode === "users" ? "Search users..." : "Search in Message"
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#2C2C2C] border border-[#E8E5DF] dark:border-[#3C3C3C] rounded-[10px] text-[#404040] dark:text-[#E5E5E5] placeholder-[#404040] dark:placeholder-[#8B8B8B] focus:outline-none focus:ring-2 focus:ring-[#1E9A80]"
              style={{
                height: "40px",
                paddingTop: "10px",
                paddingRight: "5px",
                paddingBottom: "10px",
                paddingLeft: "32px",
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: 400,
                letterSpacing: "-0.006em",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setUserSearchResults([]);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            className="border rounded-lg flex items-center justify-center bg-[#FFFFFF] dark:bg-[#2C2C2C] border-[#E8E5DF] dark:border-[#3C3C3C]"
            style={{
              height: "40px",
              width: "40px",
              border: "1px solid #E8E5DF",
            }}
            title={
              searchMode === "users" ? "Search conversations" : "Search users"
            }>
            <Image
              src="/filter.svg"
              width={18}
              height={18}
              alt="Filter"
              className="dark:invert dark:opacity-70"
            />
          </button>
        </div>
      </div>

      {/* User Search Results */}
      {searchMode === "users" && (
        <div className="flex-1 overflow-y-auto">
          {isSearchingUsers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin h-6 w-6 text-primary" />
            </div>
          ) : searchQuery.trim() === "" ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <UserPlus size={32} className="mb-2 opacity-50" />
              <p>Type to search for users</p>
            </div>
          ) : userSearchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <p>No users found</p>
            </div>
          ) : (
            userSearchResults.map((user) => (
              <div
                key={user.id}
                onClick={() => handleStartConversation(user.id)}
                className="px-4 py-3 border-b border-border cursor-pointer hover:bg-[#F3F3EE] dark:hover:bg-gray-700 transition-colors flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold overflow-hidden">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {(user.displayName || user.username || "U")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {user.displayName || user.username}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    @{user.username || user.email?.split("@")[0]}
                  </p>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${user.status === "ONLINE" ? "bg-green-500" : "bg-gray-300"}`}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Conversation List - Fill 352px, Hug 424px, gap 8px */}
      {searchMode === "conversations" && (
        <div
          className="flex-1 overflow-y-auto flex flex-col"
          style={{ gap: "8px" }}>
          {isLoadingSessions ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <p>No conversations yet</p>
              <button
                onClick={() => openModal("newMessage")}
                className="mt-2 text-primary hover:underline">
                Start a new chat
              </button>
            </div>
          ) : (
            filteredSessions.map((session, index) => {
              const displayInfo = getSessionDisplayInfo(session);
              const isSwipingThis = swipeState.sessionId === session.id;
              const swipeOffset = isSwipingThis ? swipeState.offsetX : 0;
              const isFirstItem = index === 0;

              return (
                <div key={session.id} className="relative overflow-hidden">
                  {/* For first item: Horizontal layout with archive button */}
                  {isFirstItem ? (
                    <div className="relative overflow-hidden">
                      {/* Swipe Action Buttons (background) */}
                      <div className="absolute inset-0 flex justify-between">
                        {/* Swipe RIGHT → Unread (appears on LEFT side) */}
                        <div
                          className={`flex items-center justify-start transition-all duration-200 ${
                            swipeOffset > 30
                              ? "w-20 opacity-100"
                              : "w-0 opacity-0"
                          }`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Mark as unread:", session.id);
                            }}
                            className="flex flex-col items-center justify-center bg-[#1E9A80] hover:bg-[#1a8a70] transition-colors"
                            style={{
                              width: "64px",
                              height: "64px",
                              borderRadius: "12px",
                              padding: "12px",
                              gap: "8px",
                            }}>
                            <Image
                              src="/unread.svg"
                              width={14}
                              height={12}
                              alt="Unread"
                              className="flex-shrink-0"
                            />
                            <span
                              className="text-[#FFFFFF]"
                              style={{
                                fontSize: "12px",
                                lineHeight: "16px",
                                fontWeight: 500,
                              }}>
                              Unread
                            </span>
                          </button>
                        </div>

                        {/* Swipe LEFT → Archive (appears on RIGHT side) */}
                        <div
                          className={`flex items-center justify-end transition-all duration-200 ${
                            swipeOffset < -30
                              ? "w-20 opacity-100"
                              : "w-0 opacity-0"
                          }`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Archive:", session.id);
                            }}
                            className="flex flex-col items-center justify-center bg-[#1E9A80] hover:bg-[#1a8a70] transition-colors"
                            style={{
                              width: "64px",
                              height: "64px",
                              borderRadius: "12px",
                              padding: "12px",
                              gap: "8px",
                            }}>
                            <Image
                              src="/arc.svg"
                              width={14}
                              height={12}
                              alt="Archive"
                              className="flex-shrink-0"
                            />
                            <span
                              className="text-[#FFFFFF]"
                              style={{
                                fontSize: "12px",
                                lineHeight: "16px",
                                fontWeight: 500,
                              }}>
                              Archive
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Session Item (foreground) */}
                      <div
                        onClick={() =>
                          !swipeState.isSwiping && selectSession(session.id)
                        }
                        onContextMenu={(e) => handleContextMenu(e, session.id)}
                        onTouchStart={(e) => handleTouchStart(e, session.id)}
                        onTouchMove={(e) => handleTouchMove(e, session.id)}
                        onTouchEnd={() => handleTouchEnd(session.id)}
                        onMouseDown={(e) => handleMouseDown(e, session.id)}
                        onMouseMove={(e) => handleMouseMove(e, session.id)}
                        onMouseUp={() => handleMouseUp(session.id)}
                        onMouseLeave={handleMouseLeave}
                        style={{
                          transform: `translateX(${swipeOffset}px)`,
                          transition: swipeState.isSwiping
                            ? "none"
                            : "transform 0.3s ease-out",
                          userSelect: "none",
                          padding: "12px",
                          borderRadius: "12px",
                          minHeight: "64px",
                          width: "100%",
                          maxWidth: "352px",
                          display: "flex",
                          gap: "12px",
                        }}
                        className={`cursor-pointer transition-colors hover:bg-[#F3F3EE] dark:hover:bg-[#363636] ${
                          selectedSessionId === session.id
                            ? "bg-[#F3F3EE] dark:bg-[#363636]"
                            : "bg-[#FFFFFF] dark:bg-[#2C2C2C]"
                        }`}>
                        <div
                          className="relative shrink-0 rounded-full bg-[#F7F9FB] dark:bg-[#3C3C3C] flex items-center justify-center overflow-hidden"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "1000px",
                          }}>
                          {displayInfo.avatar ? (
                            <img
                              src={displayInfo.avatar}
                              alt={displayInfo.name}
                              className="object-cover"
                              style={{
                                width: "40px",
                                height: "40px",
                              }}
                            />
                          ) : (
                            <span
                              className="text-[#1E9A80] dark:text-[#1E9A80] font-semibold"
                              style={{ fontSize: "14px" }}>
                              {displayInfo.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Name and Time - Fill 276px, Hug 20px, space-between */}
                          <div
                            className="flex items-center justify-between"
                            style={{ height: "20px", marginBottom: "2px" }}>
                            <h3
                              className="text-[#1C1C1C] dark:text-white truncate"
                              style={{
                                fontSize: "14px",
                                lineHeight: "20px",
                                fontWeight: 500,
                                letterSpacing: "-0.006em",
                              }}>
                              {displayInfo.name}
                            </h3>
                            <span
                              className="text-[#8B8B8B] dark:text-gray-400 flex-shrink-0 ml-2"
                              style={{
                                fontSize: "12px",
                                lineHeight: "16px",
                                fontWeight: 400,
                                letterSpacing: "0",
                              }}>
                              {session.messages?.[0]
                                ? formatTime(session.messages[0].createdAt)
                                : formatTime(session.createdAt)}
                            </span>
                          </div>
                          {/* Text and Seen Icon - Fill 276px, Hug 16px, gap 8px */}
                          <div
                            className="flex items-center justify-between"
                            style={{ gap: "8px" }}>
                            <p
                              className="text-[#8B8B8B] dark:text-gray-400 truncate flex-1"
                              style={{
                                fontSize: "12px",
                                lineHeight: "16px",
                                fontWeight: 400,
                                letterSpacing: "0",
                              }}>
                              {session.messages?.[0]?.content ||
                                "No messages yet"}
                            </p>
                            <Image
                              src="/seen.svg"
                              width={16}
                              height={16}
                              alt="Seen"
                              className="flex-shrink-0 dark:invert dark:opacity-70"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* For other items: Original swipe layout */}
                      {/* Swipe Action Buttons (background) */}
                      {/* Swipe Action Buttons (background) */}
                      <div className="absolute inset-0 flex justify-between">
                        {/* Swipe RIGHT → Archive (appears on LEFT side) */}
                        <div
                          className={`flex items-center justify-start transition-all duration-200 ${
                            swipeOffset > 30
                              ? "w-20 opacity-100"
                              : "w-0 opacity-0"
                          }`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Mark as unread:", session.id);
                            }}
                            className="flex flex-col items-center justify-center bg-[#1E9A80] hover:bg-[#1a8a70] transition-colors"
                            style={{
                              width: "64px",
                              height: "64px",
                              borderRadius: "12px",
                              padding: "12px",
                              gap: "8px",
                            }}>
                            <Image
                              src="/unread.svg"
                              width={14}
                              height={12}
                              alt="Unread"
                              className="flex-shrink-0"
                            />
                            <span
                              className="text-[#FFFFFF]"
                              style={{
                                fontSize: "12px",
                                lineHeight: "16px",
                                fontWeight: 500,
                              }}>
                              Unread
                            </span>
                          </button>
                        </div>

                        {/* Swipe LEFT → Unread (appears on RIGHT side) */}
                        <div
                          className={`flex items-center justify-end transition-all duration-200 ${
                            swipeOffset < -30
                              ? "w-20 opacity-100"
                              : "w-0 opacity-0"
                          }`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Archive:", session.id);
                            }}
                            className="flex flex-col items-center justify-center bg-[#1E9A80] hover:bg-[#1a8a70] transition-colors"
                            style={{
                              width: "64px",
                              height: "64px",
                              borderRadius: "12px",
                              padding: "12px",
                              gap: "8px",
                            }}>
                            <Image
                              src="/arc.svg"
                              width={14}
                              height={12}
                              alt="Archive"
                              className="flex-shrink-0"
                            />
                            <span
                              className="text-[#FFFFFF]"
                              style={{
                                fontSize: "12px",
                                lineHeight: "16px",
                                fontWeight: 500,
                              }}>
                              Archive
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Session Item (foreground) */}
                      <div
                        onClick={() =>
                          !swipeState.isSwiping && selectSession(session.id)
                        }
                        onContextMenu={(e) => handleContextMenu(e, session.id)}
                        onTouchStart={(e) => handleTouchStart(e, session.id)}
                        onTouchMove={(e) => handleTouchMove(e, session.id)}
                        onTouchEnd={() => handleTouchEnd(session.id)}
                        onMouseDown={(e) => handleMouseDown(e, session.id)}
                        onMouseMove={(e) => handleMouseMove(e, session.id)}
                        onMouseUp={() => handleMouseUp(session.id)}
                        onMouseLeave={handleMouseLeave}
                        style={{
                          transform: `translateX(${swipeOffset}px)`,
                          transition: swipeState.isSwiping
                            ? "none"
                            : "transform 0.3s ease-out",
                          userSelect: "none",
                          padding: "12px",
                          borderRadius: "12px",
                          minHeight: "64px",
                          width: "100%",
                          maxWidth: "352px",
                          display: "flex",
                          gap: "12px",
                        }}
                        className={`cursor-pointer transition-colors hover:bg-[#F3F3EE] dark:hover:bg-[#363636] ${
                          selectedSessionId === session.id
                            ? "bg-[#F3F3EE] dark:bg-[#363636]"
                            : "bg-[#FFFFFF] dark:bg-[#2C2C2C]"
                        }`}>
                        <div
                          className="relative shrink-0 rounded-full bg-[#F7F9FB] dark:bg-[#3C3C3C] flex items-center justify-center overflow-hidden"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "1000px",
                          }}>
                          {displayInfo.avatar ? (
                            <img
                              src={displayInfo.avatar}
                              alt={displayInfo.name}
                              className="object-cover"
                              style={{
                                width: "40px",
                                height: "40px",
                              }}
                            />
                          ) : (
                            <span
                              className="text-[#1E9A80] dark:text-[#1E9A80] font-semibold"
                              style={{ fontSize: "14px" }}>
                              {displayInfo.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Name and Time - Fill 276px, Hug 20px, space-between */}
                          <div
                            className="flex items-center justify-between"
                            style={{ height: "20px", marginBottom: "2px" }}>
                            <h3
                              className="text-[#1C1C1C] dark:text-white truncate"
                              style={{
                                fontSize: "14px",
                                lineHeight: "20px",
                                fontWeight: 500,
                                letterSpacing: "-0.006em",
                              }}>
                              {displayInfo.name}
                            </h3>
                            <span
                              className="text-[#8B8B8B] dark:text-gray-400 flex-shrink-0 ml-2"
                              style={{
                                fontSize: "12px",
                                lineHeight: "16px",
                                fontWeight: 400,
                                letterSpacing: "0",
                              }}>
                              {session.messages?.[0]
                                ? formatTime(session.messages[0].createdAt)
                                : formatTime(session.createdAt)}
                            </span>
                          </div>
                          {/* Text and Seen Icon - Fill 276px, Hug 16px, gap 8px */}
                          <div
                            className="flex items-center justify-between"
                            style={{ gap: "8px" }}>
                            <p
                              className="text-[#8B8B8B] dark:text-gray-400 truncate flex-1"
                              style={{
                                fontSize: "12px",
                                lineHeight: "16px",
                                fontWeight: 400,
                                letterSpacing: "0",
                              }}>
                              {session.messages?.[0]?.content ||
                                "No messages yet"}
                            </p>
                            <Image
                              src="/seen.svg"
                              width={16}
                              height={16}
                              alt="Seen"
                              className="flex-shrink-0 dark:invert dark:opacity-70"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu.visible && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeContextMenu} />
          <div
            className="fixed z-50 bg-white dark:bg-[#2C2C2C] shadow-lg"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              width: "200px",
              height: "264px",
              borderRadius: "16px",
              border: "1px solid #E8E5DF",
              padding: "8px",
            }}>
            <div
              style={{
                width: "184px",
                height: "248px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}>
              <button
                onClick={() => handleContextAction("unread")}
                className="w-full text-left transition-colors flex items-center hover:bg-[#F3F3EE]"
                style={{
                  height: "32px",
                  borderRadius: "8px",
                  paddingTop: "6px",
                  paddingRight: "8px",
                  paddingBottom: "6px",
                  paddingLeft: "8px",
                  gap: "10px",
                  display: "flex",
                }}>
                <Image
                  src="/message.svg"
                  alt="Mark as unread"
                  width={12}
                  height={11}
                  style={{ flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    lineHeight: "20px",
                    fontWeight: 500,
                    letterSpacing: "-0.006em",
                    color: "#111625",
                  }}>
                  Mark as unread
                </span>
              </button>
              <button
                onClick={() => handleContextAction("archive")}
                className="w-full text-left transition-colors flex items-center hover:bg-[#F3F3EE]"
                style={{
                  height: "32px",
                  borderRadius: "8px",
                  paddingTop: "6px",
                  paddingRight: "8px",
                  paddingBottom: "6px",
                  paddingLeft: "8px",
                  gap: "10px",
                  display: "flex",
                }}>
                <Image
                  src="/rchive.svg"
                  alt="Archive"
                  width={12}
                  height={11}
                  style={{ flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    lineHeight: "20px",
                    fontWeight: 500,
                    letterSpacing: "-0.006em",
                    color: "#111625",
                  }}>
                  Archive
                </span>
              </button>
              <button
                onClick={() => handleContextAction("mute")}
                className="w-full text-left transition-colors flex items-center hover:bg-[#F3F3EE]"
                style={{
                  height: "32px",
                  borderRadius: "8px",
                  paddingTop: "6px",
                  paddingRight: "8px",
                  paddingBottom: "6px",
                  paddingLeft: "8px",
                  gap: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}>
                  <Image
                    src="/mute.svg"
                    alt="Mute"
                    width={12}
                    height={11}
                    style={{ flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      lineHeight: "20px",
                      fontWeight: 500,
                      letterSpacing: "-0.006em",
                      color: "#111625",
                    }}>
                    Mute
                  </span>
                </div>
                <Image
                  src="/right.svg"
                  alt=""
                  width={6}
                  height={10}
                  style={{ flexShrink: 0 }}
                />
              </button>
              <button
                onClick={() => handleContextAction("contact-info")}
                className="w-full text-left transition-colors flex items-center hover:bg-[#F3F3EE]"
                style={{
                  height: "32px",
                  borderRadius: "8px",
                  paddingTop: "6px",
                  paddingRight: "8px",
                  paddingBottom: "6px",
                  paddingLeft: "8px",
                  gap: "10px",
                  display: "flex",
                }}>
                <Image
                  src="/contact.svg"
                  alt="Contact info"
                  width={12}
                  height={11}
                  style={{ flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    lineHeight: "20px",
                    fontWeight: 500,
                    letterSpacing: "-0.006em",
                    color: "#111625",
                  }}>
                  Contact info
                </span>
              </button>
              <button
                onClick={() => handleContextAction("export")}
                className="w-full text-left transition-colors flex items-center hover:bg-[#F3F3EE]"
                style={{
                  height: "32px",
                  borderRadius: "8px",
                  paddingTop: "6px",
                  paddingRight: "8px",
                  paddingBottom: "6px",
                  paddingLeft: "8px",
                  gap: "10px",
                  display: "flex",
                }}>
                <Image
                  src="/export.svg"
                  alt="Export chat"
                  width={12}
                  height={11}
                  style={{ flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    lineHeight: "20px",
                    fontWeight: 500,
                    letterSpacing: "-0.006em",
                    color: "#111625",
                  }}>
                  Export chat
                </span>
              </button>
              <button
                onClick={() => handleContextAction("clear")}
                className="w-full text-left transition-colors flex items-center hover:bg-[#F3F3EE]"
                style={{
                  height: "32px",
                  borderRadius: "8px",
                  paddingTop: "6px",
                  paddingRight: "8px",
                  paddingBottom: "6px",
                  paddingLeft: "8px",
                  gap: "10px",
                  display: "flex",
                }}>
                <Image
                  src="/close.svg"
                  alt="Clear chat"
                  width={12}
                  height={11}
                  style={{ flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    lineHeight: "20px",
                    fontWeight: 500,
                    letterSpacing: "-0.006em",
                    color: "#111625",
                  }}>
                  Clear chat
                </span>
              </button>
              <button
                onClick={() => handleContextAction("delete")}
                className="w-full text-left transition-colors flex items-center hover:bg-[#F3F3EE]"
                style={{
                  height: "32px",
                  borderRadius: "8px",
                  paddingTop: "6px",
                  paddingRight: "8px",
                  paddingBottom: "6px",
                  paddingLeft: "8px",
                  gap: "10px",
                  display: "flex",
                }}>
                <Image
                  src="/delete.svg"
                  alt="Delete chat"
                  width={12}
                  height={11}
                  style={{ flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    lineHeight: "20px",
                    fontWeight: 500,
                    letterSpacing: "-0.006em",
                    color: "#DF1C41",
                  }}>
                  Delete chat
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
