// WorkshopsPage.jsx
import { useEffect, useState } from "react";
import { workshopsAPI } from "../utils/api";
import { MapPin, Clock, Users, CalendarCheck } from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState([]);

  const fetch = () => workshopsAPI.getAll().then((r) => setWorkshops(r.data)).catch(() => {});
  useEffect(fetch, []);

  const register = async (id, isReg) => {
    try {
      if (isReg) { await workshopsAPI.unregister(id); toast.success("Unregistered"); }
      else { await workshopsAPI.register(id); toast.success("🎉 Successfully registered!"); }
      fetch();
    } catch (e) { toast.error(e.response?.data?.error || "Action failed"); }
  };

  const mock = [
    { id:1, title:"Mobile Banking Workshop", description:"Hands-on UPI and net banking training", date: new Date(Date.now()+2*86400000).toISOString(), location:"Community Hall, Vijayawada", max_seats:20, enrolled:8, available:12, is_registered:false },
    { id:2, title:"Cyber Safety Awareness Camp", description:"Learn to identify scams and stay safe online", date: new Date(Date.now()+9*86400000).toISOString(), location:"Gram Panchayat, Guntur", max_seats:40, enrolled:22, available:18, is_registered:true },
    { id:3, title:"DigiLocker & Aadhaar Training", description:"Access government services digitally", date: new Date(Date.now()+16*86400000).toISOString(), location:"Public Library, Tirupati", max_seats:25, enrolled:5, available:20, is_registered:false },
  ];

  const list = workshops.length ? workshops : mock;

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Upcoming Workshops</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Free in-person community workshops near you</p>
      <div className="space-y-4">
        {list.map((w) => {
          const d = new Date(w.date);
          const full = w.available <= 0;
          return (
            <div key={w.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex gap-5">
              <div className="text-center bg-primary-50 dark:bg-primary-900/30 rounded-xl px-4 py-3 flex-shrink-0">
                <div className="text-2xl font-black text-primary-600 dark:text-primary-400 leading-none">{d.getDate()}</div>
                <div className="text-xs text-gray-500 font-bold uppercase">{d.toLocaleString("default",{month:"short"})}</div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{w.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{w.description}</p>
                <div className="flex gap-4 text-xs text-gray-400 flex-wrap mb-3">
                  <span className="flex items-center gap-1"><MapPin size={11} />{w.location}</span>
                  <span className="flex items-center gap-1"><Users size={11} />{w.enrolled}/{w.max_seats} enrolled</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mb-3">
                  <div className="h-1.5 rounded-full bg-primary-400" style={{width:`${(w.enrolled/w.max_seats)*100}%`}} />
                </div>
                <button
                  onClick={() => register(w.id, w.is_registered)}
                  disabled={full && !w.is_registered}
                  className={clsx(
                    "flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-colors",
                    w.is_registered
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      : full
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                        : "bg-primary-500 hover:bg-primary-600 text-white"
                  )}
                >
                  {w.is_registered ? <><CalendarCheck size={14}/> Registered — Click to Cancel</>
                    : full ? "Workshop Full" : "Register Free →"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
