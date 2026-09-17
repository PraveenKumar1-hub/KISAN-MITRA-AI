import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Kisan Mitra AI Dashboard</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-semibold text-primary-700">Welcome, {user?.full_name}!</h2>
        <p className="mt-2 text-slate-600">This is your protected dashboard. More features will be added soon.</p>
      </div>
    </div>
  );
}
