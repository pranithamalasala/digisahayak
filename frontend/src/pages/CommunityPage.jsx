import { useEffect, useState } from "react";
import { communityAPI } from "../utils/api";
import { ThumbsUp, MessageSquare, CheckCircle, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "general" });
  const [filter, setFilter] = useState("all");

  const fetchPosts = () => {
    const params = filter !== "all" ? { category: filter } : {};
    communityAPI.getPosts(params).then((r) => setPosts(r.data.posts || r.data)).catch(() => {});
  };

  useEffect(fetchPosts, [filter]);

  const submitPost = async (e) => {
    e.preventDefault();
    try {
      await communityAPI.createPost(form);
      toast.success("Question posted!");
      setForm({ title: "", content: "", category: "general" });
      setShowForm(false);
      fetchPosts();
    } catch { toast.error("Could not post. Please try again."); }
  };

  const upvote = async (id) => {
    try {
      await communityAPI.upvote(id);
      fetchPosts();
    } catch {}
  };

  const mockPosts = [
    { id:1, title:"How do I create a Gmail account safely?", author:"Radha K.", created_at:new Date(Date.now()-7200000).toISOString(), reply_count:5, upvotes:12, is_resolved:true, category:"basics" },
    { id:2, title:"I received a suspicious link on WhatsApp — what to do?", author:"Suresh M.", created_at:new Date(Date.now()-18000000).toISOString(), reply_count:8, upvotes:7, is_resolved:false, category:"safety" },
    { id:3, title:"Difference between UPI and NEFT?", author:"Priya L.", created_at:new Date(Date.now()-86400000).toISOString(), reply_count:3, upvotes:15, is_resolved:true, category:"finance" },
  ];

  const list = posts.length ? posts : mockPosts;
  const cats = ["all","basics","safety","finance","services","general"];

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Community Forum</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ask questions, share knowledge, get help</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? "Cancel" : "Ask Question"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitPost} className="bg-white dark:bg-gray-900 rounded-xl border-2 border-primary-200 dark:border-primary-700 p-5 mb-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">Post Your Question</h3>
          <div className="space-y-3">
            <input required className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="Your question title..." value={form.title} onChange={(e) => setForm({...form, title:e.target.value})} />
            <textarea required rows={3} className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
              placeholder="Describe your question in detail..." value={form.content} onChange={(e) => setForm({...form, content:e.target.value})} />
            <select className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={form.category} onChange={(e) => setForm({...form, category:e.target.value})}>
              {cats.filter(c=>c!=="all").map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
            <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">Post Question</button>
          </div>
        </form>
      )}

      <div className="flex gap-2 flex-wrap mb-4">
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={clsx("text-xs px-3 py-1.5 rounded-full font-semibold border transition-all", filter===c ? "bg-primary-500 text-white border-primary-500" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300")}>
            {c.charAt(0).toUpperCase()+c.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.map((post) => (
          <div key={post.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <div className="flex gap-2 items-center flex-wrap mb-2">
                  {post.is_resolved && (
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full font-semibold">
                      <CheckCircle size={11} /> Resolved
                    </span>
                  )}
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full capitalize">{post.category}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400">
                  {post.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>👤 {post.author}</span>
                  <span>🕐 {new Date(post.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={11} /> {post.reply_count}</span>
                </div>
              </div>
              <button onClick={() => upvote(post.id)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 transition-colors">
                <ThumbsUp size={14} /> {post.upvotes}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
