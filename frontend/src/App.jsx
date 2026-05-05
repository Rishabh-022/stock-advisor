import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Search, 
  PieChart, 
  BarChart3, 
  DollarSign, 
  Shield, 
  Activity,
  ChevronRight,
  Bell,
  Settings,
  Sparkles,
  Star,
  Newspaper,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ExternalLink,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  User,
  Bookmark,
  BookmarkPlus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';

// Main App Component
export default function StockAdvisor() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState('recommend');
  const [isLoaded, setIsLoaded] = useState(false);
  const [jumpTicker, setJumpTicker] = useState(null); 

  useEffect(() => { setIsLoaded(true); }, []);

  const handleJumpToInvestigate = (ticker) => {
    setJumpTicker(ticker);
    setActiveTab('investigate');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'login' ? '/login' : '/register';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();

      if (data.error) {
        setAuthError(data.error);
      } else {
        setCurrentUser(data.user || { name: data.name, email: authForm.email });
        setAuthForm({ name: '', email: '', password: '' });
      }
    } catch (err) {
      setAuthError("Failed to connect to server. Make sure Python backend is running!");
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-4 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8 shadow-2xl relative z-10 animate-fadeIn">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center text-white mb-2">
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-center text-blue-300/50 mb-8">
            {authMode === 'login' ? 'Log in to access your AI portfolio' : 'Join the AI FinTech revolution'}
          </p>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 text-sm text-center animate-fadeIn">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
                <input 
                  type="text" required placeholder="Full Name"
                  value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                  className="w-full bg-slate-800/50 border border-blue-500/20 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-blue-300/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
              <input 
                type="email" required placeholder="Email Address"
                value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                className="w-full bg-slate-800/50 border border-blue-500/20 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-blue-300/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
              <input 
                type="password" required placeholder="Password"
                value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                className="w-full bg-slate-800/50 border border-blue-500/20 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-blue-300/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            
            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3.5 rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]">
              {authMode === 'login' ? <LogIn className="w-5 h-5"/> : <UserPlus className="w-5 h-5"/>}
              {authMode === 'login' ? 'Access Portfolio' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              {authMode === 'login' ? 'Register Now' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-600/5 to-cyan-400/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-blue-400/20"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: Math.random() * 5 + 's'
            }}
          ></div>
        ))}
      </div>

      <div className={`relative flex h-screen transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* SIDEBAR */}
        <nav className="w-72 bg-gradient-to-b from-slate-900/90 via-blue-950/50 to-slate-900/90 backdrop-blur-xl border-r border-blue-500/20 p-6 flex flex-col">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">StockAdvisor</h1>
                <p className="text-xs text-blue-300/60">AI-Powered Analysis</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 flex-1">
            <p className="text-xs font-semibold text-blue-300/40 uppercase tracking-wider mb-4 px-2">Main Menu</p>
            
            <button onClick={() => setActiveTab('recommend')}
              className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${activeTab === 'recommend' ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 border-blue-400/50' : 'hover:bg-white/5 border-transparent'} border p-3`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-all duration-300 ${activeTab === 'recommend' ? 'bg-blue-500/20 text-blue-400' : 'text-blue-300/50 group-hover:text-blue-400'}`}>
                  <PieChart className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-white">Portfolio Builder</p>
                  <p className="text-xs text-blue-300/40">AI recommendations</p>
                </div>
              </div>
              {activeTab === 'recommend' && <div className="absolute right-3 top-1/2 -translate-y-1/2"><ChevronRight className="w-4 h-4 text-blue-400" /></div>}
            </button>

            <button onClick={() => setActiveTab('investigate')}
              className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${activeTab === 'investigate' ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 border-blue-400/50' : 'hover:bg-white/5 border-transparent'} border p-3`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-all duration-300 ${activeTab === 'investigate' ? 'bg-blue-500/20 text-blue-400' : 'text-blue-300/50 group-hover:text-blue-400'}`}>
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-white">Stock Investigator</p>
                  <p className="text-xs text-blue-300/40">Deep dive analysis</p>
                </div>
              </div>
              {activeTab === 'investigate' && <div className="absolute right-3 top-1/2 -translate-y-1/2"><ChevronRight className="w-4 h-4 text-blue-400" /></div>}
            </button>

            {/* NEW WATCHLIST BUTTON */}
            <button onClick={() => setActiveTab('watchlist')}
              className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${activeTab === 'watchlist' ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 border-blue-400/50' : 'hover:bg-white/5 border-transparent'} border p-3`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-all duration-300 ${activeTab === 'watchlist' ? 'bg-blue-500/20 text-blue-400' : 'text-blue-300/50 group-hover:text-blue-400'}`}>
                  <Bookmark className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-white">My Watchlist</p>
                  <p className="text-xs text-blue-300/40">Saved stocks</p>
                </div>
              </div>
              {activeTab === 'watchlist' && <div className="absolute right-3 top-1/2 -translate-y-1/2"><ChevronRight className="w-4 h-4 text-blue-400" /></div>}
            </button>
          </div>

          <div className="mt-auto pt-6 border-t border-blue-500/20">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold uppercase text-sm">
                {currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                <button onClick={() => setCurrentUser(null)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Log Out</button>
              </div>
              <Settings className="w-4 h-4 text-blue-300/40 hover:text-blue-400 transition-colors" />
            </div>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {activeTab === 'recommend' ? 'Portfolio Builder' : activeTab === 'watchlist' ? 'My Watchlist' : 'Stock Analysis'}
                </h2>
                <p className="text-blue-300/50 text-sm mt-1">
                  {activeTab === 'recommend' ? 'Get AI-powered portfolio recommendations' : 
                   activeTab === 'watchlist' ? 'Your saved stocks with AI insights' : 'Analyze individual stocks in detail'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative p-2 text-blue-300/70 hover:text-blue-400 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                  <Sparkles className="w-4 h-4" /> Upgrade Pro
                </button>
              </div>
            </div>

            {/* Content View */}
            <div className="animate-fadeIn">
              {activeTab === 'recommend' ? (
                <RecommendView onJump={handleJumpToInvestigate} />
              ) : activeTab === 'investigate' ? (
                <InvestigateView jumpTicker={jumpTicker} setJumpTicker={setJumpTicker} currentUser={currentUser} />
              ) : (
                <WatchlistView currentUser={currentUser} onJump={handleJumpToInvestigate} />
              )}
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

// ============================================
// PORTFOLIO RECOMMENDER
// ============================================
function RecommendView({ onJump }) {
  const [amount, setAmount] = useState(5000);
  const [risk, setRisk] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:5000/portfolio-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), risk: Number(risk) }),
      });
      const data = await response.json();
      setPortfolioData(data);
    } catch (error) {
      console.error("Connection failed:", error);
      alert("Make sure your Python server is running!");
    } finally {
      setIsGenerating(false);
    }
  };

  const pieData = portfolioData ? [
    { name: 'Equities / Stocks', value: portfolioData.allocation.stocks_percent, color: '#3b82f6' },
    { name: 'Bonds / Fixed Income', value: portfolioData.allocation.bonds_percent, color: '#a855f7' },
    { name: 'Cash Reserves', value: portfolioData.allocation.cash_percent, color: '#22c55e' }
  ] : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="group relative bg-gradient-to-br from-slate-900/80 via-blue-950/50 to-slate-900/80 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 hover:border-blue-400/40 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-xl"><DollarSign className="w-6 h-6 text-blue-400" /></div>
              <div><h3 className="text-lg font-semibold text-white">Investment Amount</h3><p className="text-sm text-blue-300/50">How much would you like to invest?</p></div>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-blue-400 font-bold">$</div>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-800/50 border border-blue-500/20 rounded-xl py-4 pl-12 pr-4 text-3xl font-bold text-white focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="5000" />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[1000, 5000, 10000, 25000].map((val) => (
                <button key={val} onClick={() => setAmount(val)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${amount == val ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' : 'bg-slate-800/50 text-blue-300/50 border border-transparent hover:border-blue-500/20 hover:text-blue-400'}`}>
                  ${val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-slate-900/80 via-blue-950/50 to-slate-900/80 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 hover:border-blue-400/40 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-xl"><Shield className="w-6 h-6 text-blue-400" /></div>
              <div><h3 className="text-lg font-semibold text-white">Risk Tolerance</h3><p className="text-sm text-blue-300/50">How much risk are you comfortable with?</p></div>
            </div>
            <div className="relative pt-4">
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-green-400 font-medium">Conservative</span>
                <span className="text-yellow-400 font-medium">Moderate</span>
                <span className="text-red-400 font-medium">Aggressive</span>
              </div>
              <div className="relative h-3 bg-slate-800 rounded-full mt-2">
                <div className="absolute h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full transition-all duration-300" style={{ width: `${risk}%` }}></div>
                <input type="range" min="0" max="100" value={risk} onChange={(e) => setRisk(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-blue-500 transition-all duration-300" style={{ left: `${risk}%`, transform: `translate(-50%, -50%)` }}></div>
              </div>
              <div className="mt-6 text-center">
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">{risk}%</span>
              </div>
              <div className="flex justify-between mt-4">
                {['Low', 'Med-Low', 'Medium', 'Med-High', 'High'].map((level, i) => (
                  <div key={level} className={`text-xs px-3 py-1 rounded-full transition-all ${risk >= i * 25 ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' : 'bg-slate-800/50 text-blue-300/30 border border-transparent'}`}>{level}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={handleGenerate} disabled={isGenerating}
          className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white font-bold text-lg overflow-hidden hover:shadow-2xl hover:shadow-blue-500/25 transition-all disabled:opacity-50">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <span className="relative flex items-center gap-2">
            {isGenerating ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Analyzing Profile...</>) : (<><Sparkles className="w-5 h-5" />Generate Portfolio Recommendations</>)}
          </span>
        </button>
      </div>

      {portfolioData && (
        <div className="bg-gradient-to-br from-slate-900/80 via-blue-950/50 to-slate-900/80 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 animate-fadeIn">
          <div className="flex items-center gap-3 mb-8">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Recommended AI Allocation</h3>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full ml-auto">{portfolioData.risk_category} Risk</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="h-64 flex justify-center items-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#3b82f6', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }} itemStyle={{ fontWeight: 'bold', color: '#fff' }} formatter={(value) => `${value}%`} />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-3xl font-bold text-white">${Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1 }).format(portfolioData.investment_amount)}</p>
                <p className="text-xs text-blue-300/50">Total</p>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-blue-500/10 hover:border-blue-400/30 transition-all">
                <div className="flex justify-between items-center mb-3"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><h4 className="text-white font-medium">Equities / Stocks</h4></div><span className="text-2xl font-bold text-blue-400">{portfolioData.allocation.stocks_percent}%</span></div>
                <div className="h-3 bg-slate-700 rounded-full mb-3 overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000 shadow-lg shadow-blue-500/25" style={{ width: `${portfolioData.allocation.stocks_percent}%` }}></div></div>
                <p className="text-lg text-white font-semibold">${portfolioData.allocation.stocks_amount.toLocaleString()}</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/10 hover:border-purple-400/30 transition-all">
                <div className="flex justify-between items-center mb-3"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div><h4 className="text-white font-medium">Bonds / Fixed Income</h4></div><span className="text-2xl font-bold text-purple-400">{portfolioData.allocation.bonds_percent}%</span></div>
                <div className="h-3 bg-slate-700 rounded-full mb-3 overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full transition-all duration-1000 shadow-lg shadow-purple-500/25" style={{ width: `${portfolioData.allocation.bonds_percent}%` }}></div></div>
                <p className="text-lg text-white font-semibold">${portfolioData.allocation.bonds_amount.toLocaleString()}</p>
              </div>
              <div className="md:col-span-2 bg-slate-800/50 rounded-xl p-5 border border-green-500/10 hover:border-green-400/30 transition-all flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-green-500"></div><div><h4 className="text-white font-medium">Cash Reserves</h4><p className="text-xs text-blue-300/40">Emergency fund & dry powder</p></div></div>
                <div className="flex items-center gap-4"><p className="text-lg text-white font-semibold">${portfolioData.allocation.cash_amount.toLocaleString()}</p><span className="text-2xl font-bold text-green-400">{portfolioData.allocation.cash_percent}%</span></div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-700 pt-6">
            <div className="flex items-center gap-2 mb-4"><h4 className="text-sm text-blue-300/50 uppercase tracking-wider">Suggested Assets</h4><span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">Click to Analyze</span></div>
            <div className="flex flex-wrap gap-3">
              {portfolioData.recommendations.filter(asset => asset.symbol !== 'CASH').map((asset, index) => (
                <button key={index} onClick={() => onJump(asset.symbol)}
                  className="group bg-slate-900 border border-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 px-4 py-3 rounded-xl flex gap-3 items-center transition-all cursor-pointer">
                  <span className="font-bold text-white group-hover:text-blue-400 transition-colors text-lg">{asset.symbol}</span>
                  <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">{asset.name}</span>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md font-medium">{asset.allocation}%</span>
                  <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// STOCK INVESTIGATOR - WITH SAVE BUTTON
// ============================================
function InvestigateView({ jumpTicker, setJumpTicker, currentUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  
  useEffect(() => {
    if (jumpTicker) {
      setSearchQuery(jumpTicker);
      handleAnalyze(jumpTicker);
      setJumpTicker(null);
    }
  }, [jumpTicker]);

  const handleAnalyze = async (overrideTicker) => {
    const query = typeof overrideTicker === 'string' ? overrideTicker : searchQuery;
    if (query) {
      setIsAnalyzing(true);
      try {
        const response = await fetch('http://localhost:5000/analyze-stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker: query }),
        });
        const data = await response.json();
        if (data.error) { alert("Stock ticker not found!"); } 
        else { setSelectedStock(data); }
      } catch (error) {
        console.error("Connection failed:", error);
        alert("Make sure your Python server is running!");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSaveToWatchlist = async () => {
    if (!selectedStock || !currentUser) return;
    try {
      const response = await fetch('http://localhost:5000/watchlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: currentUser.id, 
          symbol: selectedStock.symbol, 
          name: selectedStock.name 
        })
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(`${selectedStock.symbol} saved to your Watchlist! ⭐`);
      }
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: '187.32', change: '+2.45%', up: true },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: '248.50', change: '-5.23%', up: false },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: '875.28', change: '+12.67%', up: true },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: '415.67', change: '+3.89%', up: true },
  ];

  const getSentimentIcon = (sentiment) => {
    if (sentiment === 'Positive') return <ThumbsUp className="w-5 h-5 text-green-400" />;
    if (sentiment === 'Negative') return <ThumbsDown className="w-5 h-5 text-red-400" />;
    return <Minus className="w-5 h-5 text-yellow-400" />;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Stock Investigator</h2>
        <p className="text-blue-300/50">Deep dive into any stock with AI-powered news sentiment analysis</p>
      </div>

      <div className="bg-gradient-to-br from-slate-900/80 to-blue-950/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value.toUpperCase())} onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()} placeholder="Enter stock symbol (e.g., AAPL, TSLA)"
              className="w-full bg-slate-800/50 border border-blue-500/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-400/50 transition-all" />
          </div>
          <button onClick={() => handleAnalyze()} disabled={!searchQuery || isAnalyzing}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isAnalyzing ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Analyzing News & Data...</>) : (<><BarChart3 className="w-5 h-5" />Analyze</>)}
          </button>
        </div>
        <div className="mt-6">
          <p className="text-sm text-blue-300/40 mb-3">Popular Stocks</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {popularStocks.map((stock) => (
              <button key={stock.symbol} onClick={() => setSearchQuery(stock.symbol)} className="bg-slate-800/50 rounded-xl p-4 border border-blue-500/10 hover:border-blue-400/30 transition-all text-left">
                <div className="flex justify-between items-center mb-1"><span className="text-white font-bold">{stock.symbol}</span><span className={`text-xs font-medium ${stock.up ? 'text-green-400' : 'text-red-400'}`}>{stock.change}</span></div>
                <p className="text-xs text-blue-300/50">{stock.name}</p>
                <p className="text-sm text-blue-300/70 mt-1">${stock.price}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedStock && (
        <div className="animate-fadeIn">
          <div className={`bg-gradient-to-br from-slate-900/80 to-blue-950/50 backdrop-blur-sm border-2 rounded-2xl p-8 ${selectedStock.verdict.includes('BUY') ? 'border-green-500/30' : selectedStock.verdict === 'HOLD' ? 'border-yellow-500/30' : 'border-red-500/30'}`}>
            {/* Stock Header WITH SAVE BUTTON */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-white">{selectedStock.symbol}</h3>
                <p className="text-blue-300/50 text-lg">{selectedStock.name}</p>
              </div>
              <div className="flex items-center gap-6">
                {/* SAVE TO WATCHLIST BUTTON */}
                <button onClick={handleSaveToWatchlist}
                  className="flex items-center gap-2 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/30 border border-blue-500/20 px-4 py-2 rounded-lg transition-all">
                  <BookmarkPlus className="w-4 h-4" /> Save
                </button>
                <div className="text-right">
                  <p className="text-4xl font-bold text-white">${selectedStock.price}</p>
                  <p className={`text-lg font-medium ${selectedStock.isPositive ? 'text-green-400' : 'text-red-400'}`}>{selectedStock.change}</p>
                </div>
              </div>
            </div>

            {/* VERDICT BADGE */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`px-8 py-4 rounded-2xl border-2 ${selectedStock.verdict.includes('BUY') ? 'bg-green-500/20 border-green-400/30' : selectedStock.verdict === 'HOLD' ? 'bg-yellow-500/20 border-yellow-400/30' : 'bg-red-500/20 border-red-400/30'}`}>
                <span className={`text-3xl font-bold ${selectedStock.verdict.includes('BUY') ? 'text-green-400' : selectedStock.verdict === 'HOLD' ? 'text-yellow-400' : 'text-red-400'}`}>{selectedStock.verdict}</span>
              </div>
              <div><p className="text-white text-xl font-bold">{selectedStock.confidence}% Confidence</p><p className="text-blue-300/50 text-sm">AI Analysis Score</p></div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'News Sentiment', value: selectedStock.sentiment || 'N/A', color: selectedStock.sentiment === 'Positive' ? 'text-green-400' : selectedStock.sentiment === 'Negative' ? 'text-red-400' : 'text-yellow-400', icon: getSentimentIcon(selectedStock.sentiment), bgColor: selectedStock.sentiment === 'Positive' ? 'bg-green-500/10 border-green-500/20' : selectedStock.sentiment === 'Negative' ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20' },
                { label: 'Previous Close', value: `$${selectedStock.previousClose}` },
                { label: 'Target Price', value: selectedStock.targetPrice ? `$${selectedStock.targetPrice}` : 'N/A' },
                { label: 'Volume', value: selectedStock.volume?.toLocaleString() || 'N/A' },
                { label: 'Market Cap', value: selectedStock.marketCap ? `$${(selectedStock.marketCap / 1e9).toFixed(2)}B` : 'N/A' },
              ].map((item, i) => (
                <div key={i} className={`rounded-xl p-4 border hover:border-blue-400/30 transition-all ${item.bgColor || 'bg-slate-800/50 border-blue-500/10'}`}>
                  <p className="text-xs text-blue-300/40 mb-1 flex items-center gap-1.5">{item.label === 'News Sentiment' && <Newspaper className="w-3 h-3" />}{item.label}</p>
                  <div className="flex items-center gap-2">{item.icon && item.icon}<p className={`text-lg font-bold ${item.color || 'text-white'}`}>{item.value}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// NEW: WATCHLIST VIEW COMPONENT
// ============================================
function WatchlistView({ currentUser, onJump }) {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(null); // Track which stock is being analyzed

  // Fetch watchlist on load
  useEffect(() => {
    fetchWatchlist();
  }, [currentUser]);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/watchlist/${currentUser.id}`);
      const data = await response.json();
      setWatchlist(data.watchlist || []);
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (itemId, symbol) => {
    try {
      await fetch(`http://localhost:5000/watchlist/remove/${itemId}`, { method: 'DELETE' });
      setWatchlist(watchlist.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("Failed to remove:", error);
    }
  };

  const analyzeStock = (symbol) => {
    onJump(symbol);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">My Watchlist ⭐</h2>
          <p className="text-blue-300/50">Your saved stocks ready for AI analysis</p>
        </div>
        <button onClick={fetchWatchlist} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-lg transition-all border border-blue-500/20">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-gradient-to-br from-slate-900/80 to-blue-950/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-300/50">Loading your watchlist...</p>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-900/80 to-blue-950/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-12 text-center">
          <Bookmark className="w-16 h-16 text-blue-400/20 mx-auto mb-4" />
          <p className="text-xl text-blue-300/50 mb-2">Your watchlist is empty</p>
          <p className="text-sm text-blue-300/30">Go to Stock Investigator to analyze stocks and save them here!</p>
          <button onClick={() => onJump('AAPL')} className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white font-bold hover:shadow-lg transition-all">
            Analyze AAPL to Start
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((item) => (
            <div key={item.id} className="bg-gradient-to-br from-slate-900/80 to-blue-950/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 hover:border-blue-400/40 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{item.symbol}</h3>
                  <p className="text-xs text-blue-300/50 truncate max-w-[180px]">{item.name}</p>
                </div>
                <button onClick={() => removeFromWatchlist(item.id, item.symbol)}
                  className="text-slate-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => analyzeStock(item.symbol)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium transition-all text-sm">
                  <BarChart3 className="w-4 h-4" /> Analyze
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {watchlist.length > 0 && (
        <p className="text-xs text-blue-300/20 text-center mt-4">
          ⭐ {watchlist.length} stock{watchlist.length !== 1 ? 's' : ''} in your watchlist • Click "Analyze" to get AI insights
        </p>
      )}
    </div>
  );
}