"use client";

import { AIChatPage } from "@/components/ai-chat-page";
import { CallsPage } from "@/components/calls-page";
import { ChatInterface } from "@/components/chat-interface";
import { ContactInfoPanel } from "@/components/contact-info-panel";
import { ContextMenu } from "@/components/context-menu";
import { FilesPage } from "@/components/files-page";
import { HomePage } from "@/components/home-page";
import { MessageList } from "@/components/message-list";
import { Modals } from "@/components/modals";
import { ProfilePage } from "@/components/profile-page";
import { SettingsPage } from "@/components/settings-page";
import { Sidebar } from "@/components/sidebar";
import { TopNavbar } from "@/components/top-navbar";
import { useSocket } from "@/hooks/use-socket";
import { useAuth } from "@/lib/auth-context";
import { useAppStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { activePage, selectedSessionId } = useAppStore();

  // Initialize socket for real-time updates
  useSocket();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#1E9A80]" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect will happen via useEffect
  if (!isAuthenticated) {
    return null;
  }

  const renderContent = () => {
    switch (activePage) {
      case "calls":
        return <CallsPage />;
      case "files":
        return <FilesPage />;
      case "settings":
        return <SettingsPage />;
      case "profile":
        return <ProfilePage />;
      case "ai-chat":
        return <AIChatPage />;
      case "archive":
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#1C1C1C] rounded-2xl shadow-sm gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary">
                <rect width="20" height="5" x="2" y="3" rx="1" />
                <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                <path d="M10 12h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground dark:text-[#FFFFFF]">
              Archive
            </h2>
            <p className="text-muted-foreground dark:text-[#9CA3AF] text-center max-w-sm">
              Your archived conversations will appear here
            </p>
          </div>
        );
      case "notifications":
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#1C1C1C] rounded-2xl shadow-sm gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground dark:text-[#FFFFFF]">
              Notifications
            </h2>
            <p className="text-muted-foreground dark:text-[#9CA3AF] text-center max-w-sm">
              Your notifications will appear here
            </p>
          </div>
        );
      case "messages":
      case "home":
      default:
        // Home/Messages page shows message list + chat interface
        return (
          <>
            <MessageList />
            {selectedSessionId ? (
              <>
                <ChatInterface />
                <ContactInfoPanel />
              </>
            ) : (
              <HomePage />
            )}
          </>
        );
    }
  };

  return (
    <div className="h-screen flex bg-[#F3F3EE] dark:bg-[#111111] gap-3 p-3">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main content area with navbar on top */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <TopNavbar />
        <div className="flex-1 flex overflow-auto gap-3 min-h-0">
          {renderContent()}
        </div>
      </div>

      <Modals />
      <ContextMenu />
    </div>
  );
}
