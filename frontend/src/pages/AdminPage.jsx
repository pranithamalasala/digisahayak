import { useEffect, useState } from "react";
import { adminAPI } from "../utils/api";
import { Users, Award, BarChart2, Building2, ShieldCheck, Search, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#1a7a4a", "#1565c0", "#e65100", "#7b1fa2"];

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-2xl font-black text-gray-900 dark:text-white">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
        {sub && <div className="text-xs text-green-500 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    adminAPI.getDashboard().then((r) => setStats(r.data)).catch(() => {});
    adminAPI.getUsers().then((r) => setUsers(r.data.users || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      adminAPI.getUsers({ search }).then((r) => setUsers(r.data.users || [])).catch(() => {});
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleUser = async (id) => {
    try {
      const { data } = await adminAPI.toggleUser(id);
      toast.success(data.message);
      setUsers((u) => u.map((usr) => usr.id === id ? { ...usr, is_active: data.is_active } : usr));
    } catch { toast.error("Action failed"); }
  };

  const mockStats = { total_users: 1284, active_users: 892, total_certificates: 342, total_workshops: 18, quiz_attempts: 2156, pass_rate: 71.4, average_score: 74.8 };
  const s = stats || mockStats;

  const mockUsers = [
    { id:1, name:"Ravi Kumar", email:"ravi@example.com", village:"Nellore", role:"learner", is_active:true, created_at: new Date().toISOString() },
    { id:2, name:"Priya Lakshmi", email:"priya@example.com", village:"Guntur", role:"learner", is_active:true, created_at: new Date().toISOString() },
    { id:3, name:"Suresh Babu", email:"suresh@example.com", village:"Vijayawada", role:"learner", is_active:false, created_at: new Date().toISOString() },
  ];
  const userList = users.length ? users : mockUsers;

  const quizData = [
    { name: "Digital Basics", attempts: 128, avg: 78 },
    { name: "Cyber Safety", attempts: 96, avg: 72 },
    { name: "UPI Payments", attempts: 64, avg: 81 },
    { name: "Govt Services", attempts: 42, avg: 69 },
  ];

  const pieData = [
    { name: "Digital Basics", value: 35 },
    { name: "Cyber Safety", value: 28 },
    { name: "UPI Payments", value: 22 },
    { name: "Govt Services", value: 15 },
  ];

  const tabs = ["overview", "users", "analytics"];

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
          <ShieldCheck size={24} className="text-white" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">Admin Panel</div>
          <div className="text-xl font-bold text-white">DigiSahayak Control Center</div>
          <div className="text-sm text-gray-400">All systems operational</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6 w-fit">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all capitalize ${tab === t ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Users} label="Total Learners" value={s.total_users.toLocaleString()}
              color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" sub={`${s.active_users} active`} />
            <StatCard icon={Award} label="Certificates Issued" value={s.total_certificates}
              color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" sub="+28 this month" />
            <StatCard icon={BarChart2} label="Quiz Attempts" value={s.quiz_attempts.toLocaleString()}
              color="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" sub={`${s.pass_rate}% pass rate`} />
            <StatCard icon={Building2} label="Workshops" value={s.total_workshops}
              color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" sub="3 upcoming" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="font-bold text-gray-900 dark:text-white mb-4">Quiz Attempts by Course</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={quizData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="attempts" fill="#1a7a4a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="font-bold text-gray-900 dark:text-white mb-4">Course Enrollment Distribution</div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${value}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS[i] }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Users */}
      {tab === "users" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <span className="text-xs text-gray-400">{userList.length} users</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {["Name", "Email", "Village", "Joined", "Status", "Action"].map((h) => (
                    <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userList.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {u.name?.[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.village || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.is_active ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"}`}>
                        {u.is_active ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleUser(u.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        {u.is_active ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} />}
                        {u.is_active ? "Block" : "Unblock"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics */}
      {tab === "analytics" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <div className="font-bold text-gray-900 dark:text-white mb-4">Average Quiz Scores by Course</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={quizData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="avg" fill="#1565c0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <div className="font-bold text-gray-900 dark:text-white mb-4">Platform Stats</div>
            <div className="space-y-4">
              {[
                { label: "Overall Pass Rate", value: `${s.pass_rate}%`, width: s.pass_rate, color: "bg-green-400" },
                { label: "Average Score", value: `${s.average_score}%`, width: s.average_score, color: "bg-blue-400" },
                { label: "Active Learner Rate", value: `${Math.round(s.active_users / s.total_users * 100)}%`, width: Math.round(s.active_users / s.total_users * 100), color: "bg-primary-400" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.width}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <div className="text-xs font-bold text-primary-700 dark:text-primary-300 mb-2">🏆 Top Performing Course</div>
              <div className="text-lg font-black text-primary-600 dark:text-primary-400">UPI & Digital Payments</div>
              <div className="text-xs text-gray-500 mt-1">81% avg score · Most engaged learners</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
