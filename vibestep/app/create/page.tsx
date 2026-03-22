import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { CreateProjectForm } from "@/components/create-project-form";

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-[#030014] text-white relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb orb-violet w-[600px] h-[600px] top-[-15%] right-[-10%]" />
      <div className="orb orb-pink w-[400px] h-[400px] bottom-[10%] left-[-5%]" />

      <AppHeader />

      <main className="relative z-10 mx-auto w-full max-w-2xl px-6 py-12">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-white/35 hover:text-white/70 transition-colors duration-200 mb-8 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform duration-200">←</span>
          Back to dashboard
        </Link>

        {/* Card */}
        <div className="glass-strong rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-violet-900/20 animate-scale-in">
          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b border-white/6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-lg">
                💡
              </div>
              <div>
                <h1 className="text-xl font-black text-white">New project</h1>
                <p className="text-xs text-white/35">Powered by Claude AI</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="px-8 py-5 border-b border-white/5 bg-violet-500/5">
            <p className="text-sm text-white/50 leading-relaxed">
              Describe your idea in plain English — no structure needed.
              We&apos;ll generate{" "}
              <span className="text-violet-300 font-semibold">10 atomic build steps</span>
              {" "}and save everything automatically.
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <CreateProjectForm />
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 glass rounded-2xl p-5 border border-white/6 animate-fade-in-up delay-200">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Tips for great results</p>
          <ul className="space-y-2">
            {[
              'Be specific about your target audience',
              'Mention the tech stack if you have a preference',
              'Describe the core problem you\'re solving',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-xs text-white/35">
                <span className="text-violet-400/60 mt-0.5 flex-shrink-0">✦</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
