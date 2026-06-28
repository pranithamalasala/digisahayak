import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Award, BarChart2, CheckCircle, ArrowRight, CalendarDays } from "lucide-react";
import { progressAPI, workshopsAPI } from "../utils/api";
import useAuthStore from "../store/authStore";

function StatCard({ icon: Icon, label, value, change, color }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        {change && <div className="text-xs text-green-600 dark:text-green-400 mt-1">{change}</div>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [progress, setProgress] = useState(null);
  const [workshops, setWorkshops] = useState([]);

  useEffect(() => {
    progressAPI.get().then((r) => setProgress(r.data)).catch(() => {});
    workshopsAPI.getAll().then((r) => setWorkshops(r.data.slice(0, 2))).catch(() => {});
  }, []);

  const totalCourses = progress?.courses?.length || 4;
  const completedLessons = progress?.courses?.reduce((s, c) => s + c.completed_lessons, 0) || 0;

  return (
    <div className="p-6 max-w-5xl">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-primary-700 to-blue-700 rounded-2xl p-8 mb-6 overflow-hidden">
        <div className="absolute right-0 top-0 text-[160px] opacity-5 leading-none select-none">📱</div>
        <div className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
          👋 Welcome back
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
          Good day, {user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-white/80 text-sm mb-5 max-w-md">
          Continue your digital learning journey. Every lesson brings you closer to digital independence!
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link to="/courses"
            className="bg-white text-primary-700 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-1">
            Continue Learning <ArrowRight size={15} />
          </Link>
          <Link to="/certificates"
            className="bg-white/20 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors border border-white/30">
            My Certificates
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={BookOpen} label="Courses Enrolled" value={totalCourses}
          color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" change="+1 this month" />
        <StatCard icon={CheckCircle} label="Lessons Done" value={completedLessons}
          color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" change="Keep going!" />
        <StatCard icon={BarChart2} label="Avg Quiz Score" value={`${progress?.average_score || 0}%`}
          color="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" />
        <StatCard icon={Award} label="Certificates" value={progress?.total_certificates || 0}
          color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Course Progress */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 dark:text-white">My Progress</h2>
            <Link to="/courses" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {(progress?.courses || [
              { course_id: 1, course_title: "Digital Basics", emoji: "📱", percentage: 75 },
              { course_id: 2, course_title: "Cyber Safety", emoji: "🔒", percentage: 40 },
              { course_id: 3, course_title: "Digital Payments", emoji: "💳", percentage: 20 },
              { course_id: 4, course_title: "Govt Services", emoji: "🏛️", percentage: 0 },
            ]).map((c) => (
              <Link key={c.course_id} to={`/courses/${c.course_id}`}
                className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 hover:border-primary-200 dark:hover:border-primary-700 transition-colors">
                <span className="text-2xl">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{c.course_title}</div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-blue-500"
                      style={{ width: `${c.percentage}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{c.percentage}% complete</div>
                </div>
                <ArrowRight size={14} className="text-gray-300" />
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Workshops */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 dark:text-white">Upcoming Workshops</h2>
            <Link to="/workshops" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {(workshops.length ? workshops : [
              { id: 1, title: "Mobile Banking Workshop", date: new Date().toISOString(), location: "Community Hall, Vijayawada", enrolled: 8, max_seats: 20 },
            ]).map((w) => {
              const d = new Date(w.date);
              return (
                <div key={w.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex gap-4">
                  <div className="text-center bg-primary-50 dark:bg-primary-900/30 rounded-lg px-3 py-2 flex-shrink-0">
                    <div className="text-xl font-bold text-primary-600 dark:text-primary-400 leading-none">
                      {d.getDate()}
                    </div>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase">
                      {d.toLocaleString("default", { month: "short" })}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{w.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                      <CalendarDays size={11} /> {w.location}
                    </div>
                    <Link to="/workshops"
                      className="text-xs bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-lg font-semibold transition-colors inline-block">
                      Register Free
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
            <div className="text-sm font-bold text-gray-900 dark:text-white mb-3">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: "/quiz/2", label: "Take Cyber Quiz", emoji: "🧪" },
                { to: "/community", label: "Ask Community", emoji: "💬" },
                { to: "/certificates", label: "View Certs", emoji: "🏆" },
                { to: "/profile", label: "Edit Profile", emoji: "👤" },
              ].map((a) => (
                <Link key={a.to} to={a.to}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-300 text-xs font-medium transition-colors">
                  <span>{a.emoji}</span>{a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
