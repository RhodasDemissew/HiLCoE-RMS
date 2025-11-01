import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../api/client.js";

const POLL_INTERVAL = 10000;
const MESSAGE_POLL_INTERVAL = 5000;

function toId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value._id) return String(value._id);
  if (value.id) return String(value.id);
  return String(value);
}

function formatFullTime(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString();
  } catch (err) {
    return "";
  }
}

function formatShortTime(value) {
  if (!value) return "";
  try {
    const date = new Date(value);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (err) {
    return "";
  }
}

function initials(value = "") {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => (word[0] || "").toUpperCase())
    .join("") || "--";
}

function conversationTitle(conversation, currentUserId) {
  if (!conversation) return "Conversation";
  const trimmed = (conversation.subject || "").trim();
  if (trimmed) return trimmed;
  if (conversation.project?.title) return conversation.project.title;
  
  // Get unique participants (excluding current user)
  const others = (conversation.participants || [])
    .filter((p) => toId(p?.user?.id || p?.user) !== currentUserId)
    .reduce((acc, p) => {
      const id = toId(p?.user?.id || p?.user);
      if (id && !acc.some(existing => toId(existing?.user?.id || existing?.user) === id)) {
        acc.push(p);
      }
      return acc;
    }, []);
    
  if (others.length) {
    const names = others
      .map((p) => p?.user?.name || p?.user?.email || p?.role || "Member")
      .filter(Boolean)
      .filter((name, index, arr) => arr.indexOf(name) === index); // Remove duplicates
    
    return names.join(", ");
  }
  return "Conversation";
}


function dedupeParticipants(list, currentUserId) {
  const seen = new Set();
  const result = [];
  (list || []).forEach((part) => {
    if (!part) return;
    const rawUser = part.user && typeof part.user === 'object' ? part.user : { _id: part.user };
    const id = toId(rawUser?._id || rawUser?.id || part?.user);
    if (!id) return;
    if (currentUserId && String(id) === String(currentUserId)) return;
    if (seen.has(String(id))) return;
    seen.add(String(id));
    result.push({ ...(part || {}), user: { ...(rawUser || {}) } });
  });
  return result;
}



export default function MessagingWorkspace({ currentUser = null, emptyStateTitle = "Start a conversation", roleLabel = "Member" }) {
  const currentUserId = toId(currentUser?.id || currentUser?._id);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messagesCursor, setMessagesCursor] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isInitialMessagesLoad, setIsInitialMessagesLoad] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [error, setError] = useState(null);
  const [researchers, setResearchers] = useState([]);
  const [isLoadingResearchers, setIsLoadingResearchers] = useState(true);
  const [selectedResearcherId, setSelectedResearcherId] = useState("");
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  const computedConversations = useMemo(() => {
    const id = String(activeConversationId || "");
    return conversations.map((conversation) => {
      const conversationId = String(conversation.id || conversation._id);
      const title = conversationTitle(conversation, currentUserId);
      const lastTimestamp = conversation.last_message?.created_at || conversation.last_message_at;
      return {
        ...conversation,
        id: conversationId,
        title,
        isActive: conversationId === id,
        lastTimestamp,
      };
    });
  }, [conversations, activeConversationId, currentUserId]);

  const activeConversation = useMemo(
    () => computedConversations.find((item) => item.id === activeConversationId) || null,
    [computedConversations, activeConversationId]
  );

  useEffect(() => {
    if (!activeConversation && computedConversations.length > 0) {
      const fallbackId = computedConversations[0]?.id;
      if (fallbackId && fallbackId !== activeConversationId) setActiveConversationId(fallbackId);
    }
  }, [activeConversation, computedConversations, activeConversationId]);

  const conversationByUserId = useMemo(() => {
    const map = new Map();
    computedConversations.forEach((conversation) => {
      (conversation.participants || []).forEach((p) => {
        const id = toId(p?.user?.id || p?.user);
        if (!id || id === currentUserId) return;
        
        // Map all participants for direct conversations
        if (!map.has(id) || conversation.type === "direct") {
          map.set(id, conversation);
        }
      });
    });
    return map;
  }, [computedConversations, currentUserId]);

  // When search term is empty, show all researchers; when searching, API returns filtered results
  // Sort by last message timestamp (most recent first)
  const filteredResearchers = useMemo(() => {
    return [...researchers].sort((a, b) => {
      const convA = conversationByUserId.get(a.id);
      const convB = conversationByUserId.get(b.id);
      
      const timestampA = convA?.lastTimestamp || 
                         convA?.last_message?.created_at || 
                         convA?.last_message_at || 
                         null;
      const timestampB = convB?.lastTimestamp || 
                         convB?.last_message?.created_at || 
                         convB?.last_message_at || 
                         null;
      
      // Both have conversations - sort by timestamp (newest first)
      if (timestampA && timestampB) {
        return new Date(timestampB) - new Date(timestampA);
      }
      // Only A has a conversation - A comes first
      if (timestampA && !timestampB) {
        return -1;
      }
      // Only B has a conversation - B comes first
      if (!timestampA && timestampB) {
        return 1;
      }
      // Neither has a conversation - maintain original order
      return 0;
    });
  }, [researchers, conversationByUserId]);
  const uniqueActiveParticipants = useMemo(
    () => dedupeParticipants(activeConversation?.participants || [], currentUserId),
    [activeConversation, currentUserId]
  );

  const spotlightParticipants = useMemo(() => {
    if (uniqueActiveParticipants.length > 0) {
      return uniqueActiveParticipants.slice(0, 4);
    }
    const firstFew = [];
    const seenIds = new Set();
    
    computedConversations.forEach((conversation) => {
      dedupeParticipants(conversation.participants || [], currentUserId).forEach((p) => {
        const id = toId(p?.user?.id || p?.user);
        if (!id || id === currentUserId || seenIds.has(id)) return;
        seenIds.add(id);
        firstFew.push(p);
      });
    });
    return firstFew.slice(0, 4);
  }, [uniqueActiveParticipants, computedConversations, currentUserId]);

  useEffect(() => {
    const researcher = uniqueActiveParticipants.find((participant) => {
      const roleName = (participant?.user?.role || participant?.role || "").toLowerCase();
      return roleName.includes("researcher");
    });
    if (!researcher) {
      if (selectedResearcherId) setSelectedResearcherId("");
      return;
    }
    const id = toId(researcher?.user?.id || researcher?.user);
    if (id && id !== selectedResearcherId) {
      setSelectedResearcherId(id);
    }
  }, [uniqueActiveParticipants, selectedResearcherId]);

  useEffect(() => {
    let ignore = false;
    async function fetchConversations() {
      try {
        const res = await api("/conversations", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load conversations");
        const data = await res.json().catch(() => ({ items: [] }));
        if (ignore) return;
        const items = Array.isArray(data?.items) ? data.items : [];
        setConversations(items);
        if (!activeConversationId && items.length > 0) {
          setActiveConversationId(String(items[0].id || items[0]._id));
        }
      } catch (err) {
        if (!ignore) setError(err.message || "Unable to load conversations");
      }
    }
    fetchConversations();
    const interval = setInterval(() => fetchConversations(), POLL_INTERVAL);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [activeConversationId]);


  // Load filtered users when search term changes (debounced)
  useEffect(() => {
    if (!currentUserId) return undefined;
    let ignore = false;
    async function loadSearchResults() {
      try {
        setIsLoadingResearchers(true);
        const searchQuery = searchTerm.trim();
        const res = await api(`/conversations/researchers?q=${encodeURIComponent(searchQuery)}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load users");
        const data = await res.json().catch(() => ({ items: [] }));
        if (ignore) return;
        const items = Array.isArray(data?.items) ? data.items : [];
        const normalized = items
          .map((item) => ({
            id: toId(item?.id || item?._id || item),
            name: item?.name || "",
            email: item?.email || "",
            role: item?.role || "",
            studentId: item?.studentId || item?.student_id || "",
          }))
          .filter((item) => item.id);
        setResearchers(normalized);
      } catch (err) {
        console.error("User load failed", err);
      } finally {
        if (!ignore) setIsLoadingResearchers(false);
      }
    }
    // Debounce search - wait 300ms after user stops typing
    const timeoutId = setTimeout(() => loadSearchResults(), 300);
    return () => {
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [searchTerm, currentUserId]);

  useEffect(() => {
    const conversationId = activeConversation?.id;
    if (!conversationId) {
      setMessages([]);
      setMessagesCursor(null);
      setError(null);
      setIsInitialMessagesLoad(false);
      return undefined;
    }
    let ignore = false;
    setMessages([]);
    setMessagesCursor(null);
    setError(null);
    setIsInitialMessagesLoad(true);

    async function loadLatest(initial = false) {
      try {
        if (initial) setIsLoadingMessages(true);
        const res = await api(`/conversations/${conversationId}/messages`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load messages");
        const data = await res.json().catch(() => ({ items: [] }));
        if (ignore) return;
        const items = Array.isArray(data?.items) ? data.items : [];
        setMessages(items);
        setMessagesCursor(data?.next_cursor || null);
        if (items.length > 0) {
          const last = items[items.length - 1];
          try {
            await api(`/conversations/${conversationId}/read`, {
              method: "POST",
              body: JSON.stringify({ messageId: last.id || last._id }),
            });
          } catch (err) {
            console.error("markRead failed", err);
          }
        }
      } catch (err) {
        if (!ignore && initial) setError(err.message || "Unable to load messages");
        else if (!ignore) console.warn("message poll failed", err);
      } finally {
        if (!ignore && initial) {
          setIsLoadingMessages(false);
          setIsInitialMessagesLoad(false);
        }
      }
    }

    loadLatest(true);
    const interval = setInterval(() => loadLatest(false), MESSAGE_POLL_INTERVAL);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [activeConversation?.id]);

  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {}
  }, [messages]);

  async function handleLoadOlder() {
    if (!activeConversation?.id || !messagesCursor) return;
    try {
      setLoadingMore(true);
      const url = new URL(`/conversations/${activeConversation.id}/messages`, window.location.origin);
      if (messagesCursor) url.searchParams.set("before", messagesCursor);
      const res = await api(`${url.pathname}${url.search}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load more messages");
      const data = await res.json().catch(() => ({ items: [] }));
      const items = Array.isArray(data?.items) ? data.items : [];
      setMessages((prev) => [...items, ...prev]);
      setMessagesCursor(data?.next_cursor || null);
    } catch (err) {
      setError(err.message || "Unable to load earlier messages");
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleSelectResearcher(researcherId) {
    if (!researcherId) return;
    const id = String(researcherId);
    setError(null);
    setSelectedResearcherId(id);
    const existing = conversationByUserId.get(id);
    if (existing) {
      setActiveConversationId(existing.id);
      return;
    }
    try {
      setCreatingConversation(true);
      const res = await api(`/conversations/users/${id}/ensure`, {
        method: "POST",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unable to open conversation" }));
        throw new Error(errorData.error || "Unable to open conversation");
      }
      const conversation = await res.json().catch(() => null);
      if (conversation) {
        const conversationId = String(conversation.id || conversation._id);
        setConversations((prev) => {
          const exists = prev.some((item) => String(item.id || item._id) === conversationId);
          if (exists) {
            const others = prev.filter((item) => String(item.id || item._id) !== conversationId);
            return [conversation, ...others];
          }
          return [conversation, ...prev];
        });
        setActiveConversationId(conversationId);
        setError(null); // Clear any previous errors on success
      }
    } catch (err) {
      setError(err.message || "Unable to start conversation");
      setSelectedResearcherId(""); // Clear selection on error
    } finally {
      setCreatingConversation(false);
    }
  }

  async function handleSendMessage(event) {
    event?.preventDefault();
    if (!activeConversation?.id || !messageBody.trim()) return;
    const payload = { body: messageBody.trim() };
    setMessageBody("");
    try {
      const res = await api(`/conversations/${activeConversation.id}/messages`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const message = await res.json().catch(() => null);
      if (message) {
        setMessages((prev) => [...prev, message]);
        setMessagesCursor(null);
      }
    } catch (err) {
      setError(err.message || "Unable to send message");
    }
  }

  async function handleDeleteAllMessages() {
    if (!confirm("Are you sure you want to delete ALL messages and conversations? This action cannot be undone.")) {
      return;
    }
    
    try {
      const res = await api("/conversations/all", {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete all messages");
      // Reload conversations after deletion
      window.location.reload();
    } catch (err) {
      setError(err.message || "Unable to delete all messages");
    }
  }

  useEffect(() => {
    if (!activeConversationId && activeConversation?.id) {
      setActiveConversationId(activeConversation.id);
    }
  }, [activeConversation, activeConversationId]);

  const participantNames = uniqueActiveParticipants
    .map((p) => p?.user?.name || p?.user?.email || p?.role || roleLabel)
    .filter((name, index, arr) => arr.indexOf(name) === index); // Remove duplicates

  const lastSeen = useMemo(() => {
    if (!activeConversation?.last_message_at) return "";
    return formatFullTime(activeConversation.last_message_at);
  }, [activeConversation]);

  const headerSubtitle = useMemo(() => {
    if (participantNames.length === 0) return "";
    const names = participantNames.join(", ");
    const suffix = lastSeen ? ` - Last seen ${lastSeen}` : "";
    return `${names}${suffix}`;
  }, [participantNames, lastSeen]);

  return (
    <div className="flex h-[calc(100vh-200px)] max-h-[calc(100vh-200px)] min-h-[600px] w-full overflow-hidden rounded-[32px] bg-[#f4f6fb]">
      <aside className="hidden w-[320px] h-full max-h-full flex flex-col border-r border-[#e0e7ff] bg-white/90 md:flex overflow-hidden">
         <div className="px-6 pb-4 pt-6 flex-shrink-0">
           <div className="relative">
             <input
               type="search"
               value={searchTerm}
               onChange={(event) => setSearchTerm(event.target.value)}
               placeholder="Search by name, email, or ID..."
               className="w-full rounded-[18px] border border-[#e3e8f6] bg-[#f7f9ff] px-4 py-2 text-sm text-[#0a1f44] placeholder:text-[#9aa3ba] focus:border-[#2f5eff] focus:outline-none focus:ring-2 focus:ring-[#dbe4ff]"
             />
             <span className="pointer-events-none absolute right-4 top-1/2 block -translate-y-1/2 text-xs text-[#9aa3ba]">?</span>
           </div>
         </div>

        {spotlightParticipants.length > 0 && (
          <div className="flex items-center gap-4 px-6 pb-4 flex-shrink-0">
            {spotlightParticipants.map((participant, index) => {
              const name = participant?.user?.name || participant?.user?.email || participant?.role || "Contact";
              return (
                <div key={index} className="flex flex-col items-center text-center text-xs text-[#4c5a73]">
                  <span className="grid h-14 w-14 place-items-center rounded-full border border-[#e0e7ff] bg-[#eef2ff] text-sm font-semibold text-[#2f5eff]">
                    {initials(name)}
                  </span>
                  <span className="mt-2 max-w-[64px] truncate text-[11px] font-medium text-[#111827]">{name}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-6 min-h-0 max-h-full">
          <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-[#9aa3ba] sticky top-0 bg-white/90 backdrop-blur-sm z-10">
            {searchTerm.trim() ? "Search Results" : "All Users"}
          </p>
          <div className="space-y-1">
            {isLoadingResearchers ? (
              <div className="mx-4 rounded-[18px] border border-dashed border-[#d7def3] bg-[#f7f9ff] p-4 text-sm text-[#687193]">
                {searchTerm.trim() ? "Searching..." : "Loading users..."}
              </div>
            ) : filteredResearchers.length === 0 ? (
              <div className="mx-4 rounded-[18px] border border-dashed border-[#d7def3] bg-[#f7f9ff] p-4 text-sm text-[#687193]">
                {searchTerm.trim() ? "No matches found" : "No users available"}
              </div>
            ) : (
              filteredResearchers.map((researcher) => {
                     const conversation = conversationByUserId.get(researcher.id);
                    const isActive = selectedResearcherId === researcher.id;
                    const lastTimestamp =
                      conversation?.lastTimestamp ||
                      conversation?.last_message?.created_at ||
                      conversation?.last_message_at ||
                      null;
                    const preview = conversation?.last_message?.preview || conversation?.last_message?.body || "Start chatting";
                    const isPending = creatingConversation && selectedResearcherId === researcher.id;
                    const label = researcher.name || researcher.email || researcher.studentId || "Contact";
                    return (
                      <button
                        key={researcher.id}
                        type="button"
                        onClick={() => handleSelectResearcher(researcher.id)}
                        disabled={isPending}
                        className={`flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left transition ${
                          isActive ? "bg-[#2f5eff] text-white shadow" : "bg-white text-[#1f2a44] hover:bg-[#eef2ff]"
                        }`}
                      >
                        <span
                          className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-full border ${
                            isActive ? "border-white bg-[#3f6aff]" : "border-[#e0e7ff] bg-[#eef2ff]"
                          } text-sm font-semibold`}
                        >
                          {initials(label)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`truncate text-sm font-semibold ${isActive ? "text-white" : "text-[#0a1f44]"}`}>
                              {label}
                            </p>
                            {lastTimestamp && (
                              <span className={`text-[10px] uppercase ${isActive ? "text-white/70" : "text-[#9aa3ba]"}`}>
                                {formatShortTime(lastTimestamp)}
                              </span>
                            )}
                          </div>
                          <p className={`mt-1 line-clamp-2 text-xs ${isActive ? "text-white/80" : "text-[#6b7795]"}`}>
                            {isPending ? "Opening conversation..." : preview}
                          </p>
                        </div>
                      </button>
                    );
                  })
            )}
          </div>
        </div>
        
        <div className="border-t border-[#e0e7ff] px-6 pt-4 pb-4 flex-shrink-0">
          <button
            onClick={handleDeleteAllMessages}
            className="w-full rounded-[12px] border border-[#fee2e2] bg-white px-3 py-2 text-xs font-medium text-[#dc2626] hover:bg-[#fef2f2] transition"
          >
            Clear All Conversations
          </button>
        </div>
      </aside>

      <section className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[#d7def3] bg-white/95 px-6 py-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-[#0a1f44]">{activeConversation?.title || "Conversation"}</h2>
            {headerSubtitle ? (
              <p className="text-sm text-[#6b7795]">{headerSubtitle}</p>
            ) : (
              <p className="text-sm text-[#9aa3ba]">Select a participant to begin</p>
            )}
          </div>
          {activeConversation?.project?.title && (
            <span className="inline-flex items-center rounded-full bg-[#eef2ff] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[#2f5eff]">
              {activeConversation.project.title}
            </span>
          )}
        </header>

        <div className="flex-1 overflow-y-auto bg-[#f4f6fb] px-6 py-6">
          {error && (
            <div className="mb-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}


          {activeConversation?.id && (
            <div className="mb-6 text-center">
              <button
                type="button"
                onClick={handleLoadOlder}
                disabled={!messagesCursor || loadingMore}
                className="inline-flex items-center justify-center rounded-full border border-[#d7def3] bg-white px-5 py-1 text-xs font-semibold uppercase tracking-wide text-[#6b7795] transition hover:border-[#b5c2ff] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingMore ? "Loading�" : messagesCursor ? "View previous messages" : "Beginning of chat"}
              </button>
            </div>
          )}

          {isInitialMessagesLoad ? (
            <div className="rounded-[18px] border border-dashed border-[#d7def3] bg-white px-6 py-8 text-center text-sm text-[#6b7795]">
              Loading messages...�
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-[#d7def3] bg-white px-6 py-12 text-center text-sm text-[#6b7795]">
              {activeConversation?.id ? "No messages yet. Say hello!" : "Search for a contact to start messaging."}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const senderId = toId(message?.sender?.id || message?.sender);
                const isMine = currentUserId && senderId === currentUserId;
                const senderName = message?.sender?.name || (isMine ? "You" : roleLabel);
                return (
                  <div key={message.id || message._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className="flex max-w-[70%] flex-col gap-1">
                      <div
                        className={`inline-flex max-w-full rounded-[18px] px-5 py-3 text-sm leading-relaxed shadow-sm ${
                          isMine ? "bg-[#2f5eff] text-white" : "bg-white text-[#0a1f44]"
                        }`}
                      >
                        <div>
                          <p className={`text-[11px] font-semibold uppercase tracking-wide ${isMine ? "text-white/70" : "text-[#6b7795]"}`}>
                            {senderName}
                          </p>
                          <p className="mt-1 whitespace-pre-line text-sm">{message.body || "(no content)"}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] uppercase tracking-wide ${isMine ? "text-[#6f8bff]" : "text-[#9aa3ba]"}`}>
                        {formatShortTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="border-t border-[#d7def3] bg-white px-6 py-5">
          <div className="flex items-center gap-3 rounded-[20px] border border-[#d7def3] bg-[#f9fbff] px-4 py-3">
            <textarea
              value={messageBody}
              onChange={(event) => setMessageBody(event.target.value)}
              placeholder={activeConversation?.id ? "Write a message..." : "Search for a contact to start messaging"}
              disabled={!activeConversation?.id}
              className="h-12 w-full resize-none bg-transparent text-sm text-[#0a1f44] placeholder:text-[#9aa3ba] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!activeConversation?.id || !messageBody.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-[#2f5eff] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#2447cc] disabled:cursor-not-allowed disabled:bg-[#cdd6ff]"
            >
              Send
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
















