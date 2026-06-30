/** كارت إحصائية مستخدم في كل الـ Dashboards */
type Props = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor?: string; // Tailwind bg class e.g. 'bg-blue-500'
  sub?: string;
};

export default function StatCard({ label, value, icon, accentColor = 'bg-gold-600', sub }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`${accentColor} w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
