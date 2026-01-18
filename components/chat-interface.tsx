"use client";

import { useAuth } from "@/lib/auth-context";
import { useAppStore } from "@/lib/store";
import {
  ChevronDown,
  ChevronUp,
  Info,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Square,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Dynamic import for emoji picker (client-side only)
let Picker: any = null;
if (typeof window !== "undefined") {
  import("emoji-picker-element").then((module) => {
    Picker = module.default || module;
  });
}

export function ChatInterface() {
  const { user } = useAuth();
  const {
    sessions,
    selectedSessionId,
    messages,
    isLoadingMessages,
    sendMessage: sendMessageAction,
    toggleInfoPanel,
    currentUser,
  } = useAppStore();

  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiPickerInstanceRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Get current session
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  // Get display info for the chat header
  const getHeaderInfo = () => {
    if (!selectedSession) return { name: "", avatar: null, status: "" };

    if (selectedSession.isGroup) {
      return {
        name: selectedSession.name || "Group Chat",
        avatar: null,
        status: `${selectedSession.users.length} members`,
      };
    }

    const otherUser = selectedSession.users.find(
      (u: { userId: string; user: any }) => u.userId !== currentUser?.id,
    );

    return {
      name:
        otherUser?.user?.displayName || otherUser?.user?.username || "Unknown",
      avatar: otherUser?.user?.avatarUrl || null,
      status: otherUser?.user?.status === "ONLINE" ? "Online" : "Offline",
    };
  };

  const headerInfo = getHeaderInfo();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize emoji picker
  useEffect(() => {
    if (
      showEmojiPicker &&
      emojiPickerRef.current &&
      typeof window !== "undefined" &&
      !emojiPickerInstanceRef.current
    ) {
      import("emoji-picker-element").then((module) => {
        const PickerConstructor = module.Picker;
        const picker = new PickerConstructor();

        // Style the picker
        picker.classList.add("emoji-picker-custom");

        // Handle emoji selection
        picker.addEventListener("emoji-click", (event: any) => {
          setMessageInput((prev) => prev + event.detail.unicode);
          setShowEmojiPicker(false);
        });

        emojiPickerRef.current?.appendChild(picker);
        emojiPickerInstanceRef.current = picker;
      });
    }

    // Cleanup
    return () => {
      if (emojiPickerInstanceRef.current && emojiPickerRef.current) {
        emojiPickerRef.current.innerHTML = "";
        emojiPickerInstanceRef.current = null;
      }
    };
  }, [showEmojiPicker]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        const target = event.target as HTMLElement;
        // Don't close if clicking the emoji button itself
        if (!target.closest("[data-emoji-button]")) {
          setShowEmojiPicker(false);
        }
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showEmojiPicker]);

  // Filter messages based on search query
  const filteredMessages = messageSearchQuery.trim()
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(messageSearchQuery.toLowerCase()),
      )
    : [];

  // Scroll to search result
  useEffect(() => {
    if (
      filteredMessages.length > 0 &&
      currentSearchIndex < filteredMessages.length
    ) {
      const messageId = filteredMessages[currentSearchIndex].id;
      const element = messageRefs.current.get(messageId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentSearchIndex, filteredMessages]);

  // Focus search input when opened
  useEffect(() => {
    if (showMessageSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showMessageSearch]);

  // Navigate to next/previous search result
  const goToNextResult = () => {
    if (filteredMessages.length > 0) {
      setCurrentSearchIndex((prev) => (prev + 1) % filteredMessages.length);
    }
  };

  const goToPrevResult = () => {
    if (filteredMessages.length > 0) {
      setCurrentSearchIndex(
        (prev) =>
          (prev - 1 + filteredMessages.length) % filteredMessages.length,
      );
    }
  };

  // Check if a message matches the search
  const isMessageHighlighted = (messageId: string) => {
    if (!messageSearchQuery.trim()) return false;
    return filteredMessages.some((m) => m.id === messageId);
  };

  // Check if this is the current search result
  const isCurrentSearchResult = (messageId: string) => {
    if (filteredMessages.length === 0) return false;
    return filteredMessages[currentSearchIndex]?.id === messageId;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create preview URL for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setFilePreviewUrl(base64Data);
          // Set the message input to the image data for sending
          setMessageInput(base64Data);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreviewUrl(null);
        // For non-image files, just show the filename
        setMessageInput(`📎 ${file.name}`);
      }

      console.log("File selected:", file.name);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        console.log("Recording stopped, blob size:", audioBlob.size);
        // Here you would upload the audio blob
        setMessageInput(`🎤 Voice message (${recordingTime}s)`);
        setRecordingTime(0);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  if (!selectedSession) {
    return (
      <div className="flex-1 bg-white dark:bg-[#1C1C1C] rounded-2xl flex items-center justify-center shadow-sm">
        <p className="text-muted-foreground">
          Select a conversation to start messaging
        </p>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (messageInput.trim() && !isSending) {
      setIsSending(true);
      try {
        await sendMessageAction(messageInput);
        setMessageInput("");
        // Clear file preview after sending
        setSelectedFile(null);
        setFilePreviewUrl(null);
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setIsSending(false);
      }
    }
  };

  // Format message time
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Check if content is an image URL or base64
  const isImageContent = (content: string, type?: string) => {
    if (type === "IMAGE") return true;
    // Check for image URLs
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i;
    const isDataUrl = content.startsWith("data:image/");
    const isImageUrl =
      imageExtensions.test(content) ||
      content.includes("/images/") ||
      content.includes("cloudinary") ||
      content.includes("imgur");
    return isDataUrl || (isImageUrl && content.startsWith("http"));
  };

  // Render message content based on type
  const renderMessageContent = (message: {
    content: string;
    type?: string;
  }) => {
    if (isImageContent(message.content, message.type)) {
      return (
        <img
          src={message.content}
          alt="Shared image"
          className="max-w-full max-h-64 rounded-lg object-contain cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(message.content, "_blank")}
        />
      );
    }

    // Check for file attachments (📎 prefix)
    if (message.content.startsWith("📎 ")) {
      const fileName = message.content.substring(3);
      return (
        <div className="flex items-center gap-2">
          <Paperclip size={16} className="text-current opacity-70" />
          <span className="text-sm">{fileName}</span>
        </div>
      );
    }

    return (
      <p className="text-sm break-words whitespace-pre-wrap">
        {message.content}
      </p>
    );
  };

  // Check if message is from current user
  const isOwnMessage = (senderId: string) => {
    return senderId === currentUser?.id || senderId === user?.id;
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#1C1C1C] rounded-3xl flex flex-col shadow-sm overflow-hidden p-3">
      {/* Header */}
      <div className="w-full h-15 pt-1 pr-3 pb-4 pl-3 flex items-center justify-between gap-3">
        <button
          onClick={toggleInfoPanel}
          className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#2C2C2C] rounded-lg p-1 transition-colors">
          {headerInfo.avatar ? (
            <img
              src={headerInfo.avatar}
              alt={headerInfo.name}
              className="w-10 h-10 rounded-full object-cover bg-[#F7F9FB]"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#F7F9FB] dark:bg-[#3C3C3C] flex items-center justify-center text-primary font-semibold">
              {headerInfo.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-medium text-[#111625] dark:text-[#FFFFFF] leading-5 tracking-[-0.006em] text-left">
              {headerInfo.name}
            </h2>
            <p
              className={`text-xs font-medium leading-4 tracking-[0px] text-left ${
                headerInfo.status === "Online"
                  ? "text-[#10B981]" // green for online
                  : "text-gray-400 dark:text-gray-500" // gray for offline
              }`}>
              {headerInfo.status}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-3 w-[164px] h-8">
          <button
            onClick={() => {
              setShowMessageSearch(!showMessageSearch);
              if (showMessageSearch) {
                setMessageSearchQuery("");
                setCurrentSearchIndex(0);
              }
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg border border-[#E8E5DF] bg-white dark:bg-[#2C2C2C] dark:border-[#3C3C3C] transition-colors ${
              showMessageSearch
                ? "bg-primary border-primary text-primary-foreground"
                : "hover:bg-gray-50"
            }`}>
            <Search size={20} className="text-[#262626] dark:text-[#E5E5E5]" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E8E5DF] bg-white dark:bg-[#2C2C2C] dark:border-[#3C3C3C] hover:bg-gray-50 dark:hover:bg-[#363636] transition-colors">
            <Phone size={20} className="text-[#262626] dark:text-[#E5E5E5]" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E8E5DF] bg-white dark:bg-[#2C2C2C] dark:border-[#3C3C3C] hover:bg-gray-50 dark:hover:bg-[#363636] transition-colors">
            <Video size={20} className="text-[#262626] dark:text-[#E5E5E5]" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E8E5DF] bg-white dark:bg-[#2C2C2C] dark:border-[#3C3C3C] hover:bg-gray-50 dark:hover:bg-[#363636] transition-colors">
            <Image
              src="/menu.svg"
              width={16}
              height={16}
              alt="Menu"
              className="dark:invert dark:opacity-70"
            />
          </button>
        </div>
      </div>

      {/* Message Search Bar */}
      {showMessageSearch && (
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#2C2C2C] rounded-lg px-3 py-2 mb-3">
          <Search size={16} className="text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search in messages..."
            value={messageSearchQuery}
            onChange={(e) => {
              setMessageSearchQuery(e.target.value);
              setCurrentSearchIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (e.shiftKey) {
                  goToPrevResult();
                } else {
                  goToNextResult();
                }
              }
              if (e.key === "Escape") {
                setShowMessageSearch(false);
                setMessageSearchQuery("");
              }
            }}
            className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none"
          />
          {messageSearchQuery && (
            <>
              <span className="text-xs text-muted-foreground">
                {filteredMessages.length > 0
                  ? `${currentSearchIndex + 1}/${filteredMessages.length}`
                  : "0 results"}
              </span>
              <button
                onClick={goToPrevResult}
                disabled={filteredMessages.length === 0}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50">
                <ChevronUp size={16} />
              </button>
              <button
                onClick={goToNextResult}
                disabled={filteredMessages.length === 0}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50">
                <ChevronDown size={16} />
              </button>
            </>
          )}
          <button
            onClick={() => {
              setShowMessageSearch(false);
              setMessageSearchQuery("");
              setCurrentSearchIndex(0);
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-[#363636] rounded">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Messages Area - Inner box with light green background */}
      <div className="flex-1 overflow-hidden mb-2">
        <div
          className="h-full overflow-y-auto dark:bg-[#111111]"
          style={{
            borderRadius: "16px",
            padding: "12px",
            backgroundColor: "#F3F3EE",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}>
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {/* Today divider */}
              <div className="flex items-center justify-center pt-70">
                <div className="w-[65px] h-7 rounded-[60px] bg-white dark:bg-[#2C2C2C] flex items-center justify-center px-3 py-1">
                  <span className="text-sm font-medium text-[#596881] dark:text-[#9CA3AF] leading-5 tracking-[-0.006em]">
                    Today
                  </span>
                </div>
              </div>
              {messages.map((message) => (
                <div
                  key={message.id}
                  ref={(el) => {
                    if (el) messageRefs.current.set(message.id, el);
                  }}
                  className={`flex ${isOwnMessage(message.senderId) ? "justify-end" : "justify-start"} ${
                    isCurrentSearchResult(message.id) ? "animate-pulse" : ""
                  }`}>
                  <div className="flex flex-col max-w-[70%]">
                    {!isOwnMessage(message.senderId) && (
                      <div className="flex flex-col gap-2">
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "horizontal",
                            width: "fit-content",
                            maxWidth: "349px",
                            height: "fit-content",
                            minHeight: "40px",
                            borderTopLeftRadius: "12px",
                            borderTopRightRadius: "12px",
                            borderBottomRightRadius: "12px",
                            borderBottomLeftRadius: "4px",
                            padding: "12px",
                            gap: "10px",
                            backgroundColor: "#FFFFFF",
                          }}
                          className={`dark:!bg-[#2C2C2C] ${
                            isImageContent(message.content, message.type)
                              ? "p-2"
                              : ""
                          } ${
                            isCurrentSearchResult(message.id)
                              ? "bg-yellow-200 dark:bg-yellow-700 ring-2 ring-yellow-400"
                              : isMessageHighlighted(message.id)
                                ? "bg-yellow-100 dark:bg-yellow-800"
                                : ""
                          }`}>
                          {!isOwnMessage(message.senderId) &&
                            selectedSession.isGroup && (
                              <p className="text-xs font-semibold mb-1 opacity-70">
                                {message.sender?.displayName || "Unknown"}
                              </p>
                            )}
                          <div
                            className="dark:!text-[#FFFFFF]"
                            style={{
                              fontFamily: "Inter",
                              fontWeight: 400,
                              fontSize: "12px",
                              lineHeight: "16px",
                              letterSpacing: "0px",
                              color: "#1C1C1C",
                            }}>
                            {renderMessageContent(message)}
                          </div>
                        </div>
                        <div className="flex items-center pt-1 pl-1">
                          <span className="text-xs font-normal text-[#8B8B8B] dark:text-gray-400 leading-4 tracking-[0px]">
                            {formatMessageTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    )}
                    {isOwnMessage(message.senderId) && (
                      <div className="flex flex-col items-end gap-2">
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isImageContent(message.content, message.type)
                              ? "p-2"
                              : ""
                          } ${
                            isCurrentSearchResult(message.id)
                              ? "bg-yellow-200 dark:bg-yellow-700 ring-2 ring-yellow-400"
                              : isMessageHighlighted(message.id)
                                ? "bg-yellow-100 dark:bg-yellow-800"
                                : "bg-[#F0FDF4] text-gray-800 dark:!bg-[#1E9A80] dark:!text-white"
                          }`}>
                          {renderMessageContent(message)}
                        </div>
                        <div className="flex items-center gap-1.5 pt-1 pr-1">
                          <Image
                            src="/seen.svg"
                            alt="Seen"
                            width={12}
                            height={12}
                            className="w-3 h-3 dark:invert dark:opacity-70"
                            style={{
                              filter:
                                "brightness(0) saturate(100%) invert(45%) sepia(32%) saturate(646%) hue-rotate(120deg) brightness(92%) contrast(90%)",
                            }}
                          />
                          <span className="text-xs font-normal text-[#8B8B8B] dark:text-[#9CA3AF] leading-4 tracking-[0px]">
                            {formatMessageTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div>
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mb-2">
            <div ref={emojiPickerRef} className="emoji-picker-custom" />
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="mb-2 flex items-center justify-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
              Recording... {recordingTime}s
            </span>
          </div>
        )}

        {/* File Preview */}
        {selectedFile && (
          <div className="mb-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Paperclip size={16} className="text-emerald-600" />
                <span className="text-sm text-emerald-700 dark:text-emerald-400">
                  {selectedFile.name}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setFilePreviewUrl(null);
                }}
                className="text-emerald-600 hover:text-emerald-700">
                <X size={16} />
              </button>
            </div>
            {/* Image Preview */}
            {filePreviewUrl && (
              <div className="mt-2">
                <img
                  src={filePreviewUrl}
                  alt="Preview"
                  className="max-w-full max-h-48 rounded-lg object-contain"
                />
              </div>
            )}
          </div>
        )}

        <div className="h-10 rounded-[100px] border border-[#E8E5DF] dark:border-[#3C3C3C] pt-3 pr-1 pb-3 pl-4 flex items-center gap-1">
          <input
            type="text"
            placeholder={
              filePreviewUrl
                ? "Press enter to send image..."
                : "Type any message..."
            }
            value={filePreviewUrl ? "" : messageInput}
            onChange={(e) => {
              if (!filePreviewUrl) {
                setMessageInput(e.target.value);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isSending || isRecording || !!filePreviewUrl}
            className="flex-1 bg-transparent text-[#8796AF] dark:text-[#9CA3AF] placeholder-[#8796AF] dark:placeholder-[#6B7280] focus:outline-none disabled:opacity-50 text-xs leading-4 tracking-[0px]"
          />

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          />

          {/* Voice Recording Button */}
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`p-1.5 transition-colors ${
              isRecording
                ? "text-red-500"
                : "text-[#262626] dark:text-white hover:text-[#1E9A80]"
            }`}>
            {isRecording ? (
              <Square size={11} strokeWidth={1.8} />
            ) : (
              <Mic size={11} strokeWidth={1.8} />
            )}
          </button>

          {/* Emoji Picker Button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 text-[#262626] dark:text-white hover:text-[#1E9A80] transition-colors">
            <Smile size={11} strokeWidth={1.8} />
          </button>

          {/* File Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-[#262626] dark:text-white hover:text-[#1E9A80] transition-colors">
            <Paperclip size={11} strokeWidth={1.8} />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isSending}
            className="w-8 h-8 bg-[#1E9A80] rounded-full hover:bg-[#17876e] transition-colors  flex items-center justify-center p-2">
            <Send
              size={14}
              strokeWidth={2}
              className="text-white"
              style={{ marginLeft: "1px" }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
