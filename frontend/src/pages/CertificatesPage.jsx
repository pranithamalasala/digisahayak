import { useEffect, useState } from "react";
import { certificatesAPI } from "../utils/api";
import { Download, Award } from "lucide-react";
import toast from "react-hot-toast";

export default function CertificatesPage() {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    certificatesAPI.getAll().then((r) => setCerts(r.data)).catch(() => {});
  }, []);

  const download = async (cert) => {
    try {
      const { data } = await certificatesAPI.download(cert.id);
      const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${cert.certificate_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Download failed. Please try again."); }
  };

  const mockCerts = [
    { id:1, course_title:"Digital Basics", user_name:"Ravi Kumar", certificate_number:"DLC-01-ABCD1234", issued_date: new Date().toISOString(), emoji:"📱" },
    { id:2, course_title:"Cyber Safety", user_name:"Ravi Kumar", certificate_number:"DLC-02-EFGH5678", issued_date: new Date(Date.now()-7*86400000).toISOString(), emoji:"🔒" },
  ];

  const list = certs.length ? certs : mockCerts;

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">My Certificates</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Download and share your achievements</p>

      {list.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Award size={48} className="mx-auto mb-3 opacity-30" />
          <p>No certificates yet. Complete a course to earn one!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {list.map((cert) => (
            <div key={cert.id}
              className="relative bg-gradient-to-br from-primary-700 to-blue-700 rounded-2xl p-6 text-white overflow-hidden">
              <div className="absolute top-0 right-0 text-[120px] opacity-5 leading-none pointer-events-none">🏆</div>
              <div className="relative">
                <div className="text-xs uppercase tracking-widest opacity-70 mb-2">Certificate of Completion</div>
                <div className="text-3xl mb-3">{cert.emoji || "📜"}</div>
                <div className="font-bold text-lg mb-1">{cert.user_name}</div>
                <div className="text-sm opacity-80 mb-1">has successfully completed</div>
                <div className="text-xl font-extrabold mb-4">{cert.course_title}</div>
                <div className="flex justify-between text-xs opacity-60 mb-4 border-t border-white/20 pt-3">
                  <span>{new Date(cert.issued_date).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}</span>
                  <span>ID: {cert.certificate_number}</span>
                </div>
                <button onClick={() => download(cert)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  <Download size={14} /> Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
