import { useAuth0 } from "@auth0/auth0-react";

const navLinks = [
  { label: "How it works", id: "how-it-works" },
  { label: "Roles", id: "roles" },
  { label: "Reports", id: "reports" },
];

export default function Navbar() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="max-w-7xl mx-auto px-6">
      <nav className="relative z-10 flex items-center justify-between border-b border-white/10 py-4">
        {/* Left */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#4ade80]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="#0a0f0d"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8l3 3 7-7" />
            </svg>
          </div>

          <span className="text-[15px] font-semibold tracking-[-0.4px] text-white">
            PrepAI
          </span>
        </div>

        {/* Center */}
        <div className="flex gap-7">
          {navLinks.map((link) => (
            <span
              key={link.id}
              onClick={() => {
                document
                  .getElementById(link.id)
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="cursor-pointer text-[16px] text-[#8a9e8e] transition hover:text-white"
            >
              {link.label}
            </span>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loginWithRedirect()}
            className="rounded-lg border border-white/10 bg-transparent px-4 py-1.75 text-[16px] text-[#8a9e8e] transition hover:border-white/20 hover:text-white"
          >
            Log in
          </button>

          <button
            onClick={() => loginWithRedirect({ screen_hint: "signup" })}
            className="rounded-lg bg-[#4ade80] px-4 py-1.75 text-[13px] font-semibold text-[#0a0f0d] transition hover:bg-green-500"
          >
            Get started
          </button>
        </div>
      </nav>
    </div>
  );
}
