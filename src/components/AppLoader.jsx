'use client';

export default function AppLoader({ text = 'Preparing Academic Workspace...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 transition-all select-none">
      {/* Soft background ambient glow */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center">
        {/* Logo container with radial feathering mask that blurs borders seamlessly into background */}
        <div
          className="relative w-72 h-56 sm:w-96 sm:h-72 flex items-center justify-center animate-in fade-in zoom-in-95 duration-500"
          style={{
            maskImage: 'radial-gradient(ellipse at center, black 45%, rgba(0, 0, 0, 0.7) 65%, transparent 92%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 45%, rgba(0, 0, 0, 0.7) 65%, transparent 92%)',
          }}
        >
          <img
            src="/lecturePlanLBannerLoGo.png"
            alt="LecturePlan Banner Logo"
            className="w-full h-full object-contain pointer-events-none mix-blend-multiply"
          />
        </div>

        {/* Sleek loading animation bar & label */}
        <div className="flex flex-col items-center space-y-3 -mt-4">
          <div className="w-40 sm:w-48 h-1 bg-slate-200/90 rounded-full overflow-hidden relative shadow-inner">
            <div className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 rounded-full animate-indeterminate" />
          </div>
          <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
            <span>{text}</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%);
            width: 40%;
          }
          50% {
            transform: translateX(60%);
            width: 60%;
          }
          100% {
            transform: translateX(250%);
            width: 40%;
          }
        }
        .animate-indeterminate {
          animation: indeterminate 1.4s infinite cubic-bezier(0.65, 0.815, 0.735, 0.395);
        }
      `}</style>
    </div>
  );
}
