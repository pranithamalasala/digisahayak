// CourseDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { coursesAPI, lessonsAPI } from "../utils/api";
import { CheckCircle, Circle, PlayCircle, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);

  const fetchCourse = () => {
    coursesAPI.getOne(courseId).then((r) => setCourse(r.data)).catch(() => {});
  };
  useEffect(fetchCourse, [courseId]);

  const markComplete = async (lessonId) => {
    try {
      const { data } = await lessonsAPI.complete(lessonId);
      toast.success(data.certificate_issued ? "🎉 Lesson done! Certificate earned!" : "Lesson completed!");
      fetchCourse();
    } catch { toast.error("Could not mark lesson complete"); }
  };

  if (!course) return <div className="p-8 text-center text-gray-400">Loading course…</div>;

  return (
    <div className="p-6 max-w-4xl">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6 flex gap-5 items-center">
        <div className="text-5xl">{course.emoji}</div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{course.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{course.description}</p>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-1">
            <div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-blue-500" style={{ width:`${course.progress}%` }} />
          </div>
          <div className="text-xs text-gray-400">{course.progress}% complete · {course.lesson_count} lessons</div>
        </div>
        <Link to={`/quiz/${courseId}`}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <HelpCircle size={15} /> Take Quiz
        </Link>
      </div>

      <h2 className="font-bold text-gray-900 dark:text-white mb-3">Lessons</h2>
      <div className="space-y-3">
        {(course.lessons || []).map((lesson, i) => (
          <div key={lesson.id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4 hover:border-primary-200 dark:hover:border-primary-700 transition-colors">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${lesson.completed ? "bg-primary-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
              {lesson.completed ? <CheckCircle size={18} /> : i + 1}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{lesson.title}</div>
              <div className="text-xs text-gray-400">{lesson.duration_minutes} min · {lesson.completed ? "Completed ✓" : "Not started"}</div>
            </div>
            <div className="flex gap-2">
              <Link to={`/lessons/${lesson.id}`}
                className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-semibold border border-primary-200 dark:border-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
                <PlayCircle size={13} /> Study
              </Link>
              {!lesson.completed && (
                <button onClick={() => markComplete(lesson.id)}
                  className="text-xs text-green-600 dark:text-green-400 font-semibold border border-green-200 dark:border-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                  Mark Done
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
