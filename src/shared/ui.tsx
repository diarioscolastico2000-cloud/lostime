export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} style={{ minHeight: 44, borderRadius: 12 }} />;
}
export function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ borderRadius: 16, padding: 16, background: '#1e1e2a' }}>{children}</div>;
}
