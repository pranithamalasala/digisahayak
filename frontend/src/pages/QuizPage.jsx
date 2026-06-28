import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { quizzesAPI } from "../utils/api";
import { CheckCircle, XCircle, Award, RotateCcw } from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";

export default function QuizPage() {
  const { courseId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizzesAPI.getForCourse(courseId)
      .then((r) => setQuestions(r.data))
      .catch(() => toast.error("Could not load quiz"))
      .finally(() => setLoading(false));
  }, [courseId]);

  const q = questions[current];
  const totalQ = questions.length;

  const selectAnswer = (qId, opt) => {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qId]: opt }));
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length < totalQ) {
      toast.error("Please answer all questions first!");
      return;
    }
    try {
      const { data } = await quizzesAPI.submit({ course_id: parseInt(courseId), answers });
      setResult(data);
      setSubmitted(true);
    } catch {
      toast.error("Submission failed. Please try again.");
    }
  };

  const reset = () => {
    setAnswers({});
    setCurrent(0);
    setSubmitted(false);
    setResult(null);
    quizzesAPI.getForCourse(courseId).then((r) => setQuestions(r.data));
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading quiz…</div>;
  if (!questions.length) return (
    <div className="p-8 text-center">
      <p className="text-gray-500">No questions available for this course yet.</p>
      <Link to="/courses" className="text-primary-600 hover:underline mt-2 inline-block">Back to Courses</Link>
    </div>
  );

  // ── Results Screen ────────────────────────────────────────
  if (submitted && result) {
    const pass = result.passed;
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center mb-6">
          <div className="text-6xl mb-4">{pass ? "🎉" : "😔"}</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {pass ? "Congratulations!" : "Keep Practicing!"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {pass ? "You passed! Certificate will be issued after all lessons are complete." : "You need 60% to pass. Review the lessons and try again."}
          </p>
          <div className={clsx("text-5xl font-black mb-2", pass ? "text-green-500" : "text-red-500")}>
            {result.percentage}%
          </div>
          <p className="text-sm text-gray-500">{result.score} of {result.total} correct</p>
          {pass && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-semibold">
              <Award size={16} /> Certificate Unlocked!
            </div>
          )}
          <div className="flex gap-3 justify-center mt-6">
            <button onClick={reset} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <RotateCcw size={15} /> Try Again
            </button>
            {pass && (
              <Link to="/certificates" className="flex items-center gap-2 bg-primary-500 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                <Award size={15} /> View Certificate
              </Link>
            )}
          </div>
        </div>

        {/* Answer review */}
        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Answer Review</h3>
        <div className="space-y-4">
          {result.results.map((r, i) => (
            <div key={i} className={clsx(
              "rounded-xl border p-4",
              r.correct
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            )}>
              <div className="flex gap-2 items-start">
                {r.correct ? <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" /> : <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />}
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{i + 1}. {r.question}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Your answer: <span className={r.correct ? "text-green-600 dark:text-green-400 font-semibold" : "text-red-600 dark:text-red-400 font-semibold"}>{r.your_answer}</span></p>
                  {!r.correct && <p className="text-xs text-green-700 dark:text-green-400">Correct: <span className="font-semibold">{r.correct_answer}</span></p>}
                  {r.explanation && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">💡 {r.explanation}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Quiz Screen ───────────────────────────────────────────
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
            Question {current + 1} of {totalQ}
          </span>
          <span className="text-xs text-gray-400">{Object.keys(answers).length} answered</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mb-6">
          <div className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-blue-500 transition-all"
            style={{ width: `${((current) / totalQ) * 100}%` }} />
        </div>

        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5 leading-relaxed">{q.question}</h3>

        <div className="space-y-3 mb-6">
          {Object.entries(q.options).filter(([, v]) => v).map(([opt, text]) => (
            <button
              key={opt}
              onClick={() => selectAnswer(q.id, opt)}
              className={clsx(
                "w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all",
                answers[q.id] === opt
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold"
                  : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
              )}
            >
              <span className="font-bold mr-2">{opt}.</span> {text}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 justify-between">
          <button disabled={current === 0}
            onClick={() => setCurrent((c) => c - 1)}
            className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors">
            ← Previous
          </button>
          {current < totalQ - 1 ? (
            <button onClick={() => setCurrent((c) => c + 1)}
              className="px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors">
              Next →
            </button>
          ) : (
            <button onClick={submitQuiz}
              className="px-6 py-2 text-sm bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
              Submit Quiz ✓
            </button>
          )}
        </div>

        {/* Question dots */}
        <div className="flex gap-1.5 justify-center mt-5 flex-wrap">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={clsx(
                "w-7 h-7 rounded-full text-xs font-bold transition-all",
                i === current ? "bg-primary-500 text-white" :
                  answers[questions[i]?.id] ? "bg-green-400 text-white" :
                    "bg-gray-100 dark:bg-gray-800 text-gray-400"
              )}>{i + 1}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
