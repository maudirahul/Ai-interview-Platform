const roles = [
  { id: "mern_stack_developer", label: "MERN Stack" },
  { id: "react_developer", label: "React Developer" },
  { id: "nodejs_developer", label: "Node.js Developer" },
  { id: "python_developer", label: "Python Developer" },
  { id: "fullstack_developer", label: "Full Stack" },
  { id: "java_developer", label: "Java Developer" },
  { id: "ai_ml", label: "AI ML" },
  { id: "plsql_developer", label: "PL/SQL Developer" },
];

export default function Roles() {
  return (
    <section id="roles" className="py-5 px-20 max-w-300 mx-auto w-full relative z-10 box-border">
      <div className="flex items-center gap-4 mb-10">
        <span className="text-[12px] font-mono text-green-400 tracking-[2px] uppercase whitespace-nowrap">
          available roles
        </span>
        <div className="flex-1 h-[0.5px] bg-white/10" />
      </div>

      <div className="grid grid-cols-3 gap-5">
        {roles.map((r, i) => (
          <div
            key={r.id}
            className={
              "p-6 rounded-[10px] cursor-pointer border flex flex-col bg-[#111a14]  hover:bg-green-400/5 border-green-400/25"
            }
          >
            <div className={"text-[14px] font-medium mb-1.5 text-[#f8faf8]"}>
              {r.label}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-6">
              {["fresher", "mid", "senior"].map((lv) => (
                <span
                  key={lv}
                  className={
                    "text-[11px] font-mono px-2.5 py-1 rounded-[20px] border border-white/10 text-[#4a5e4e] hover:border-green-400/30  bg-green-400/10"
                  }
                >
                  {lv}
                </span>
              ))}
            </div>
          </div>
        ))}
        <div className="col-span-1 bg-[#111a14] border border-white/5 rounded-xl p-6 flex items-center justify-center">
          <span className="text-[20px] text-[#4a5e4e] font-mono">
            MORE COMING SOON
          </span>
        </div>
      </div>
    </section>
  );
}
