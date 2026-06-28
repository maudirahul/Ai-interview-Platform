import { useNavigate } from "react-router-dom";

const ROLES = [
  { id: "mern_stack_developer", label: "MERN Stack" },
  { id: "react_developer", label: "React Developer" },
  { id: "nodejs_developer", label: "Node.js Developer" },
  { id: "python_developer", label: "Python Developer" },
  { id: "fullstack_developer", label: "Full Stack" },
  { id: "java_developer", label: "Java Developer" },
  { id: "ai_ml", label: "AI ML" },
  { id: "plsql_developer", label: "PL/SQL Developer" },
];

export default function RolesPicker() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface border border-white/6 rounded-xl p-4.5 mb-3">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-mono text-dim uppercase tracking-widest">
          practice a role
        </span>
        <span
          className="text-[11px] text-muted cursor-pointer hover:text-[#f8faf8] transition-colors"
          onClick={() => navigate("/select-role")}
        >
          see all →
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {ROLES.map((r) => (
          <div
            key={r.id}
            onClick={() => navigate(`/select-role?role=${r.id}`)}
            className="flex items-center justify-between bg-surface2 border border-white/6 rounded-lg px-3 py-3 cursor-pointer hover:border-green-DEFAULT/25 hover:bg-green-DEFAULT/[0.04] transition-all"
          >
            <div>
              <div className="text-xs font-medium text-[#f8faf8] mb-0.5">
                {r.label}
              </div>
            </div>
            <span className="text-dim text-sm">→</span>
          </div>
        ))}
      </div>
    </div>
  );
}
