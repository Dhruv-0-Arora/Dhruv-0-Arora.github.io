import { notice } from "../../content/notice";

export function SimulatorNotice({ onEnter }: { onEnter?: () => void }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-6">
      <div className="w-full max-w-[60ch] rounded-lg border border-border bg-surface px-5 py-4 text-[13px] leading-6 shadow-sm">
        <h1 className="font-semibold text-text">{notice.title}</h1>
        <p className="mt-1 text-muted">{notice.body}</p>
        <a
          href={notice.plainSite.href}
          className="mt-3 inline-block text-accent underline decoration-border underline-offset-4 transition-colors hover:decoration-accent"
        >
          {notice.plainSite.label}
          <span aria-hidden="true">{" "}→</span>
        </a>
        {onEnter ? (
          <button
            type="button"
            onClick={onEnter}
            className="mt-1 block cursor-pointer text-left text-muted underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
          >
            {notice.enterAnyway}
          </button>
        ) : null}
      </div>
    </main>
  );
}
