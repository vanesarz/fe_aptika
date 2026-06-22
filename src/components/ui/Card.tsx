export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition">
      {children}
    </div>
  );
}