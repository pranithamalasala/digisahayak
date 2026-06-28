// CoursesPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { coursesAPI } from "../utils/api";
import { ArrowRight } from "lucide-react";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  useEffect(() => { coursesAPI.getAll().then((r) => setCourses(r.data)).catch(() => {}); }, []);

  const fallback = [
    { id:1, title:"Digital Basics", description:"Smartphone, internet & email skills for beginners.", emoji:"📱", category:"beginner", difficulty:"beginner", progress:75, lesson_count:4 },
    { id:2, title:"Cyber Safety", description:"Stay safe online — passwords, scams, and privacy.", emoji:"🔒", category:"safety", difficulty:"beginner", progress:40, lesson_count:5 },
    { id:3, title:"Digital Payments", description:"Master UPI, QR codes, and online banking.", emoji:"💳", category:"finance", difficulty:"intermediate", progress:20, lesson_count:5 },
    { id:4, title:"Govt Services", description:"Access Aadhaar, DigiLocker and government portals.", emoji:"🏛️", category:"services", difficulty:"beginner", progress:0, lesson_count:4 },
  ];
  const list = courses.length ? courses : fallback;

  const colors = {1:"from-green-400 to-teal-500", 2:"from-blue-400 to-indigo-500", 3:"from-orange-400 to-amber-500", 4:"from-purple-400 to-violet-500"};

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">All Courses</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Build your digital skills step by step — free for everyone!</p>
      <div className="grid sm:grid-cols-2 gap-5">
        {list.map((c) => (
          <Link key={c.id} to={`/courses/${c.id}`}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all group">
            <div className={`h-32 bg-gradient-to-br ${colors[c.id] || "from-gray-300 to-gray-400"} flex items-center justify-center text-6xl`}>
              {c.emoji}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-900 dark:text-white">{c.title}</h3>
                <span className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full capitalize">{c.difficulty}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{c.description}</p>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mb-1">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-blue-500" style={{ width:`${c.progress || 0}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-3">
                <span>{c.progress || 0}% complete</span>
                <span>{c.lesson_count} lessons</span>
              </div>
              <div className="flex items-center text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:gap-2 gap-1 transition-all">
                {c.progress > 0 ? "Continue →" : "Start Learning →"} <ArrowRight size={12} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
