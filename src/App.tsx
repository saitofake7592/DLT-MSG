import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  LayoutDashboard, 
  Smartphone, 
  Trash2, 
  RefreshCw, 
  MessageSquare, 
  Clock, 
  ShieldCheck,
  PlusCircle
} from 'lucide-react';

interface NotificationLog {
  id: string;
  sender: string;
  message: string;
  app: string;
  timestamp: string;
}

export default function App() {
  const [view, setView] = useState<'mobile' | 'dashboard'>('mobile');
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'active' | 'idle'>('active');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!confirm('Are you sure you want to clear all cloud logs?')) return;
    try {
      await fetch('/api/logs', { method: 'DELETE' });
      setLogs([]);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  const simulateNotification = async () => {
    const apps = ['WhatsApp', 'Messenger', 'SMS', 'Instagram'];
    const senders = ['John Doe', 'Alice Smith', 'Mom', 'Work Group'];
    const messages = [
      'Hey, how are you?',
      'Did you see the news?',
      'Call me when you can.',
      'Meeting at 10 AM tomorrow.',
      'Check out this link!'
    ];

    const randomApp = apps[Math.floor(Math.random() * apps.length)];
    const randomSender = senders[Math.floor(Math.random() * senders.length)];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: randomSender,
          message: randomMessage,
          app: randomApp
        }),
      });
      const newLog = await response.json();
      setLogs(prev => [newLog, ...prev]);
    } catch (error) {
      console.error('Failed to simulate notification:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-neon-pink selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neon-pink flex items-center justify-center neon-border-pink">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tighter neon-text-pink">ARMI CLOUD</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setView('mobile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${view === 'mobile' ? 'bg-neon-pink text-white neon-border-pink' : 'text-gray-400 hover:text-white'}`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Mobile App</span>
            </button>
            <button 
              onClick={() => setView('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${view === 'dashboard' ? 'bg-neon-green text-black font-bold neon-border-green' : 'text-gray-400 hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'mobile' ? (
            <motion.div 
              key="mobile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto space-y-8"
            >
              <div className="glass-card p-8 text-center space-y-6">
                <div className="relative inline-block">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto border-2 ${status === 'active' ? 'border-neon-green neon-border-green' : 'border-gray-600'}`}>
                    <ShieldCheck className={`w-12 h-12 ${status === 'active' ? 'text-neon-green' : 'text-gray-600'}`} />
                  </div>
                  {status === 'active' && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-neon-green rounded-full animate-pulse" />
                  )}
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold mb-2">Live Status</h2>
                  <p className="text-gray-400">
                    {status === 'active' ? 'Tracking notifications in real-time...' : 'Service is currently idle.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => setView('dashboard')}
                    className="w-full py-4 bg-neon-pink hover:bg-neon-pink/80 rounded-xl font-bold transition-all neon-border-pink flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    View Saved Messages
                  </button>
                  
                  <button 
                    onClick={simulateNotification}
                    className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all border border-white/10 flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-5 h-5 text-neon-green" />
                    Simulate Notification
                  </button>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {logs.slice(0, 3).map(log => (
                    <div key={log.id} className="flex gap-4 p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5 h-5 text-neon-green" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold truncate">{log.sender}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400 uppercase">{log.app}</span>
                        </div>
                        <p className="text-sm text-gray-400 truncate">{log.message}</p>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <p className="text-center text-gray-600 py-4 italic">No notifications tracked yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-black tracking-tighter neon-text-green">CLOUD DASHBOARD</h1>
                  <p className="text-gray-400">Manage and view all intercepted notifications.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={fetchLogs}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
                    title="Refresh Logs"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button 
                    onClick={clearLogs}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-xl border border-red-500/30 transition-all font-bold"
                  >
                    <Trash2 className="w-5 h-5" />
                    Clear All
                  </button>
                </div>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Sender</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Message</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">App</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {logs.map((log) => (
                        <motion.tr 
                          layout
                          key={log.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-white/5 transition-colors group"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neon-pink/20 flex items-center justify-center">
                                <span className="text-neon-pink font-bold text-xs">{log.sender[0]}</span>
                              </div>
                              <span className="font-medium">{log.sender}</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300 max-w-md truncate">{log.message}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 rounded-md bg-neon-green/10 text-neon-green text-xs font-bold border border-neon-green/20">
                              {log.app}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 text-sm font-mono">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                      {logs.length === 0 && !loading && (
                        <tr>
                          <td colSpan={4} className="p-12 text-center text-gray-600 italic">
                            The cloud storage is empty. No messages found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-l-4 border-neon-pink">
                  <div className="text-gray-500 text-xs font-bold uppercase mb-1">Total Logs</div>
                  <div className="text-3xl font-black">{logs.length}</div>
                </div>
                <div className="glass-card p-6 border-l-4 border-neon-green">
                  <div className="text-gray-500 text-xs font-bold uppercase mb-1">Storage Status</div>
                  <div className="text-3xl font-black">OPTIMIZED</div>
                </div>
                <div className="glass-card p-6 border-l-4 border-white/20">
                  <div className="text-gray-500 text-xs font-bold uppercase mb-1">Last Sync</div>
                  <div className="text-sm font-mono text-gray-400">
                    {logs.length > 0 ? new Date(logs[0].timestamp).toLocaleTimeString() : 'Never'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-8 border-top border-white/5 text-center text-gray-600 text-xs uppercase tracking-widest">
        &copy; 2026 ARMI CLOUD SYSTEMS &bull; ZERO PHONE STORAGE TECHNOLOGY
      </footer>
    </div>
  );
}
