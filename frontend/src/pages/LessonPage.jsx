import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lessonsAPI } from "../utils/api";
import { CheckCircle, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    lessonsAPI.getOne(lessonId).then((r) => setLesson(r.data)).catch(() => {});
  }, [lessonId]);

  const markComplete = async () => {
    try {
      const { data } = await lessonsAPI.complete(lessonId);
      toast.success(data.certificate_issued ? "🎉 Course complete! Certificate earned!" : "Lesson completed!");
      setLesson((l) => ({ ...l, completed: true }));
    } catch { toast.error("Could not update progress"); }
  };

  if (!lesson) return <div className="p-8 text-center text-gray-400">Loading lesson…</div>;

  return (
    <div className="p-6 max-w-3xl">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4 transition-colors">
        <ArrowLeft size={15} /> Back to Course
      </button>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-blue-600 px-6 py-5">
          <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
          <p className="text-white/70 text-sm mt-1">{lesson.duration_minutes} min read</p>
        </div>
        {lesson.video_url && (
          <div className="aspect-video bg-black">
            <iframe className="w-full h-full" src={lesson.video_url}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen title={lesson.title} />
          </div>
        )}
        <div className="p-6">
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: lesson.content || "<p>Content coming soon…</p>" }}
          />
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            {lesson.completed ? (
              <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold text-sm">
                <CheckCircle size={18} /> Lesson Completed!
              </span>
            ) : (
              <button onClick={markComplete}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors">
                <CheckCircle size={16} /> Mark as Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
