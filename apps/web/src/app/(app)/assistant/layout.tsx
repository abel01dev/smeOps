/**
 * Full-height assistant shell: counteracts AppShell main padding so chat
 * can use the viewport below the top bar.
 */
export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-m-4 flex h-[calc(100dvh-3.5rem)] min-h-[32rem] flex-col md:-m-6 md:h-[100dvh]">
      {children}
    </div>
  );
}
