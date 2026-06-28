import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Shield, CreditCard, Building2,
  HelpCircle, Award, MessageSquare, CalendarDays, User,
  Settings, LogOut, Bot, Send, X, ChevronRight, Bell, Menu
} from "lucide-react";
import { clsx } from "clsx";
import useAuthStore from "../../store/authStore";
import { aiAPI } from "../../utils/api";
import toast from "react-hot-toast";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "main" },
  { to: "/courses", label: "All Courses", icon: BookOpen, section: "main" },
  { to: "/courses/1", label: "Digital Basics", icon: BookOpen, section: "learn" },
  { to: "/courses/2", label: "Cyber Safety", icon: Shield, section: "learn" },
  { to: "/courses/3", label: "Digital Payments", icon: CreditCard, section: "learn" },
  { to: "/courses/4", label: "Govt Services", icon: Building2, section: "learn" },
  { to: "/certificates", label: "Certificates", icon: Award, section: "tools" },
  { to: "/community", label: "Community", icon: MessageSquare, section: "tools" },
  { to: "/workshops", label: "Workshops", icon: CalendarDays, section: "tools" },
  { to: "/profile", label: "My Profile", icon: User, section: "account" },
];

const sections = { main: "Main", learn: "Learning Modules", tools: "Tools", account: "Account" };

// ── AI Chat Widget ────────────────────────────────────────────────
function SahayakChat() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const [messages, setMessages] = useState([
    { role: "ai", text: "👋 Hello! I'm Sahayak AI. Ask me about UPI, scam awareness, Aadhaar, or any digital skill!" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [history, setHistory] = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async () => {
    if (!input.trim() || typing) return;
    const userText = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setTyping(true);

    const newHistory = [...history, { role: "user", content: userText }];

    try {
      const { data } = await aiAPI.chat({ message: userText, language: lang, history });
      const reply = data.reply;
      setMessages((m) => [...m, { role: "ai", text: reply }]);
      setHistory([...newHistory, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Sorry, I'm having trouble connecting. Please try again!" }]);
    } finally {
      setTyping(false);
    }
  };

  const quickQuestions = {
    en: ["What is UPI?", "How to detect scams?", "Aadhaar update steps"],
    te: ["UPI అంటే ఏమిటి?", "మోసాలు ఎలా గుర్తించాలి?"],
    hi: ["UPI क्या है?", "धोखाधड़ी कैसे पहचानें?"],
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 w-80 md:w-96 h-[520px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
            <div className="flex-1">
              <div className="text-white font-bold text-sm">Sahayak AI</div>
              <div className="text-white/70 text-xs">Digital Literacy Assistant · EN / తె / हि</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Language selector */}
          <div className="flex gap-2 px-3 pt-2">
            {[["en", "English"], ["te", "తెలుగు"], ["hi", "हिंदी"]].map(([l, lbl]) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={clsx(
                  "text-xs px-2 py-1 rounded-md font-semibold border transition-all",
                  lang === l
                    ? "bg-primary-500 text-white border-primary-500"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                )}
              >{lbl}</button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={clsx(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-line",
                  m.role === "ai"
                    ? "bg-primary-50 dark:bg-primary-900/30 text-gray-800 dark:text-gray-100"
                    : "bg-primary-500 text-white"
                )}>{m.text}</div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-sm text-gray-500">
                  Typing…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick questions */}
          <div className="px-3 flex gap-1 flex-wrap">
            {(quickQuestions[lang] || []).map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700 px-2 py-1 rounded-full hover:bg-primary-100 transition-colors"
              >{q}</button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
            <input
              className="flex-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={typing || !input.trim()}
              className="w-9 h-9 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg flex items-center justify-center"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-br from-primary-500 to-blue-600 text-white rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center z-50 text-2xl"
        title="Sahayak AI Assistant"
      >
        {open ? <X size={22} /> : <Bot size={26} />}
      </button>
    </>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────
export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const grouped = navItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  if (user?.role === "admin") {
    grouped["account"] = [
      ...grouped["account"],
      { to: "/admin", label: "Admin Panel", icon: Settings, section: "account" },
    ];
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl flex items-center justify-center text-xl">🌱</div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white text-sm">DigiSahayak</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Community Empowerment</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-4">
        {Object.entries(grouped).map(([sec, items]) => (
          <div key={sec}>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 px-3 mb-1">
              {sections[sec]}
            </div>
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/dashboard"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-0.5",
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name}</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 px-4 flex-shrink-0">
          <button className="md:hidden text-gray-500" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Bell size={18} />
          </button>
          <NavLink to="/profile" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </NavLink>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <SahayakChat />
    </div>
  );
}
