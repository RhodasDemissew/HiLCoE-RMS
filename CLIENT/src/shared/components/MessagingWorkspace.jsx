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
  const others = (conversation.participants || []).filter((p) => toId(p?.user?.id || p?.user) !== currentUserId);
  if (others.length) {
    return others
      .map((p) => p?.user?.name || p?.user?.email || p?.role || "Member")
      .filter(Boolean)
      .join(", ");
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



function normalizeProject(project) {
  if (!project) return null;
  const projectId = toId(project._id || project.id || project);
  const researcherDoc = project.researcher || null;
  const advisorDoc = project.advisor || null;
  const researcher = researcherDoc
    ? {
        id: toId(researcherDoc._id || researcherDoc.id || researcherDoc),
        name: researcherDoc.name || '',
        email: researcherDoc.email || '',
      }
    : null;
  const advisor = advisorDoc
    ? {
        id: toId(advisorDoc._id || advisorDoc.id || advisorDoc),
        name: advisorDoc.name || '',
        email: advisorDoc.email || '',
      }
    : null;
  return {
    id: projectId,
    title: project.title || "Untitled Project",
    researcher,
    advisor,
  };
}



export default function MessagingWorkspace({ currentUser = null, emptyStateTitle = "Start a conversation", roleLabel = "Member" }) {
  const currentUserId = toId(currentUser?.id || currentUser?._id);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messagesCursor, setMessagesCursor] = useState(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isInitialMessagesLoad, setIsInitialMessagesLoad] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectOptionsLoaded, setProjectOptionsLoaded] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  const isCoordinator = useMemo(() => {
    const role = (currentUser?.role || "").toLowerCase();
    return role.includes("coordinator") || role.includes("admin");
  }, [currentUser]);

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

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return computedConversations;
    const q = searchTerm.trim().toLowerCase();
    return computedConversations.filter((conversation) => {
      if (conversation.title?.toLowerCase().includes(q)) return true;
      return (conversation.participants || []).some((p) => {
        const name = p?.user?.name || p?.user?.email || p?.role;
        return name?.toLowerCase().includes(q);
      });
    });
  }, [computedConversations, searchTerm]);

  const activeConversation = useMemo(
    () => filteredConversations.find((item) => item.id === activeConversationId) || filteredConversations[0] || null,
    [filteredConversations, activeConversationId]
  );

  useEffect(() => {
    if (!activeConversation && filteredConversations.length > 0) {
      const fallbackId = filteredConversations[0]?.id;
      if (fallbackId && fallbackId !== activeConversationId) setActiveConversationId(fallbackId);
    }
  }, [activeConversation, filteredConversations, activeConversationId]);

  const uniqueActiveParticipants = useMemo(() => dedupeParticipants(activeConversation?.participants || [], currentUserId), [activeConversation, currentUserId]);

  const spotlightParticipants = useMemo(() => {
    if (uniqueActiveParticipants.length > 0) {
      return uniqueActiveParticipants.slice(0, 4);
    }
    const firstFew = [];
    filteredConversations.forEach((conversation) => {
      dedupeParticipants(conversation.participants || [], currentUserId).forEach((p) => {
        const id = toId(p?.user?.id || p?.user);
        if (!id || id === currentUserId) return;
        if (firstFew.some((existing) => toId(existing?.user?.id || existing?.user) === id)) return;
        firstFew.push(p);
      });
    });
    return firstFew.slice(0, 4);
  }, [uniqueActiveParticipants, filteredConversations, currentUserId]);

  useEffect(() => {
    let ignore = false;
    async function fetchConversations(initial = false) {
      try {
        if (initial) setIsLoadingConversations(true);
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
      } finally {
        if (!ignore) setIsLoadingConversations(false);
      }
    }
    fetchConversations(true);
    const interval = setInterval(() => fetchConversations(false), POLL_INTERVAL);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [activeConversationId]);

  useEffect(() => {
    if (!currentUserId || projectOptionsLoaded) return;
    let ignore = false;
    async function loadProjects() {
      try {
        const res = await api("/projects", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load projects");
        const data = await res.json().catch(() => []);
        if (ignore) return;
        const normalized = Array.isArray(data)
          ? data.map(normalizeProject).filter(Boolean)
          : [];
        const relevant = normalized.filter((project) => {
          if (!project) return false;
          if (isCoordinator) return true;
          const matchesResearcher = project.researcher && project.researcher.id === currentUserId;
          const matchesAdvisor = project.advisor && project.advisor.id === currentUserId;
          return matchesResearcher || matchesAdvisor;
        });
        setProjects(relevant);
      } catch (err) {
        console.error("Project load failed", err);
      } finally {
        if (!ignore) setProjectOptionsLoaded(true);
      }
    }
    loadProjects();
    return () => {
      ignore = true;
    };
  }, [currentUserId, isCoordinator, projectOptionsLoaded]);

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

  async function ensureProjectConversation(event) {
    event?.preventDefault();
    if (!selectedProjectId) return;
    try {
      setCreatingConversation(true);
      const res = await api(`/conversations/projects/${selectedProjectId}/ensure`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Unable to create conversation");
      const conversation = await res.json().catch(() => null);
      if (conversation) {
        const conversationId = String(conversation.id || conversation._id);
        setActiveConversationId(conversationId);
        setConversations((prev) => {
          const exists = prev.some((item) => String(item.id || item._id) === conversationId);
          return exists ? prev : [conversation, ...prev];
        });
      }
    } catch (err) {
      setError(err.message || "Unable to create conversation");
    } finally {
      setCreatingConversation(false);
    }
  }

  useEffect(() => {
    if (!activeConversationId && activeConversation?.id) {
      setActiveConversationId(activeConversation.id);
    }
  }, [activeConversation, activeConversationId]);

  const participantNames = uniqueActiveParticipants.map((p) => p?.user?.name || p?.user?.email || p?.role || roleLabel);

  const lastSeen = useMemo(() => {
    if (!activeConversation?.last_message_at) return "";
    return formatFullTime(activeConversation.last_message_at);
  }, [activeConversation]);

  return (
    <div className="flex h-full min-h-[600px] w-full overflow-hidden rounded-[32px] bg-[#f4f6fb]">
      <aside className="hidden w-[320px] flex-col border-r border-[#e0e7ff] bg-white/90 md:flex">
        <div className="px-6 pb-4 pt-6">
          <div className="relative">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search"
              className="w-full rounded-[18px] border border-[#e3e8f6] bg-[#f7f9ff] px-4 py-2 text-sm text-[#0a1f44] placeholder:text-[#9aa3ba] focus:border-[#2f5eff] focus:outline-none focus:ring-2 focus:ring-[#dbe4ff]"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 block -translate-y-1/2 text-xs text-[#9aa3ba]">?</span>
          </div>
        </div>

        {spotlightParticipants.length > 0 && (
          <div className="flex items-center gap-4 px-6 pb-4">
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

        <div className="flex-1 overflow-y-auto px-2 pb-6">
          <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-[#9aa3ba]">Messages</p>
          <div className="space-y-1">
            {isLoadingConversations ? (
              <div className="mx-4 rounded-[18px] border border-dashed border-[#d7def3] bg-[#f7f9ff] p-4 text-sm text-[#687193]">
                Loading conversations…
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="mx-4 rounded-[18px] border border-dashed border-[#d7def3] bg-[#f7f9ff] p-4 text-sm text-[#687193]">
                {conversations.length === 0 ? emptyStateTitle : "No matches found"}
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setActiveConversationId(conversation.id)}
                  className={`flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left transition ${
                    conversation.id === activeConversationId
                      ? "bg-[#2f5eff] text-white shadow"
                      : "bg-white text-[#1f2a44] hover:bg-[#eef2ff]"
                  }`}
                >
                  <span
                    className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-full border ${
                      conversation.id === activeConversationId
                        ? "border-white bg-[#3f6aff]"
                        : "border-[#e0e7ff] bg-[#eef2ff]"
                    } text-sm font-semibold`}
                  >
                    {initials(
                      (conversation.participants || [])
                        .find((p) => toId(p?.user?.id || p?.user) !== currentUserId)?.user?.name || conversation.title
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-sm font-semibold ${conversation.id === activeConversationId ? "text-white" : "text-[#0a1f44]"}`}>
                        {conversation.title}
                      </p>
                      {conversation.lastTimestamp && (
                        <span className={`text-[10px] uppercase ${conversation.id === activeConversationId ? "text-white/70" : "text-[#9aa3ba]"}`}>
                          {formatShortTime(conversation.lastTimestamp)}
                        </span>
                      )}
                    </div>
                    <p className={`mt-1 line-clamp-2 text-xs ${conversation.id === activeConversationId ? "text-white/80" : "text-[#6b7795]"}`}>
                      {conversation.last_message?.preview || "Start chatting"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {projects.length > 0 && (
          <form onSubmit={ensureProjectConversation} className="border-t border-[#e0e7ff] bg-white px-6 py-4">
            <label className="flex flex-col gap-2 text-xs font-semibold text-[#4c5a73]">
              Start a project channel
              <select
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                className="rounded-[14px] border border-[#d7def3] bg-white px-3 py-2 text-sm text-[#1f2a44] focus:border-[#2f5eff] focus:outline-none"
              >
                <option value="">Select project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={!selectedProjectId || creatingConversation}
              className="mt-3 w-full rounded-[14px] bg-[#2f5eff] py-2 text-sm font-semibold text-white transition hover:bg-[#2447cc] disabled:cursor-not-allowed disabled:bg-[#cdd6ff]"
            >
              {creatingConversation ? "Creating." : "Open Conversation"}
            </button>
          </form>
        )}
      </aside>

      <section className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[#d7def3] bg-white/95 px-6 py-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-[#0a1f44]">{activeConversation?.title || "Conversation"}</h2>
            {participantNames.length > 0 ? (
              <p className="text-sm text-[#6b7795]">
                {participantNames.join(", ")} {lastSeen ? ` - Last seen ${lastSeen}` : ""}
              </p>
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
                {loadingMore ? "Loading…" : messagesCursor ? "View previous messages" : "Beginning of chat"}
              </button>
            </div>
          )}

          {isInitialMessagesLoad ? (
            <div className="rounded-[18px] border border-dashed border-[#d7def3] bg-white px-6 py-8 text-center text-sm text-[#6b7795]">
              Loading messages…
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-[#d7def3] bg-white px-6 py-12 text-center text-sm text-[#6b7795]">
              {activeConversation?.id ? "No messages yet. Say hello!" : "Pick a conversation from the left to start messaging."}
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
              placeholder={activeConversation?.id ? "Write a text here" : "Select a conversation to start messaging"}
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















