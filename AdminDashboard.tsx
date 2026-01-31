
import React, { useState, useEffect } from 'react';
import { User, GoodDeed, PrizeDraw } from '../types';
import { 
  Users, 
  ClipboardCheck, 
  Gift, 
  BarChart3, 
  Check, 
  X, 
  Sparkles,
  Search,
  Ban,
  ShieldCheck,
  Eye,
  AlertCircle,
  Ticket,
  RotateCcw,
  Loader2,
  Clock,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface Props {
  students: User[];
  deeds: GoodDeed[];
  draws: PrizeDraw[];
  onApprove: (deedId: string) => void;
  onReject: (deedId: string) => void;
  onRunDraw: (prizeName: string) => void;
  onBanToggle: (studentId: string) => void;
  onResetMonth: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ 
  students, 
  deeds, 
  draws, 
  onApprove, 
  onReject, 
  onRunDraw,
  onBanToggle,
  onResetMonth
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [prizeName, setPrizeName] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'students' | 'draws'>('pending');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // States for long processing times
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tickerName, setTickerName] = useState('');
  const [drawTimer, setDrawTimer] = useState(10);
  const [showSuccess, setShowSuccess] = useState(false);

  const pendingDeeds = deeds.filter(d => d.status === 'PENDING');
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.room?.includes(searchTerm)
  );

  const studentsWithRights = students.filter(s => s.rights > 0 && !s.isBanned);

  // Lottery Ticker Logic
  useEffect(() => {
    let interval: any;
    if (isDrawing && studentsWithRights.length > 0) {
      interval = setInterval(() => {
        const randomStudent = studentsWithRights[Math.floor(Math.random() * studentsWithRights.length)];
        setTickerName(randomStudent.name);
      }, 80);
    } else {
      setTickerName('');
    }
    return () => clearInterval(interval);
  }, [isDrawing, studentsWithRights]);

  // Draw Countdown Timer
  useEffect(() => {
    let timer: any;
    if (isDrawing && drawTimer > 0) {
      timer = setInterval(() => setDrawTimer(t => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isDrawing, drawTimer]);

  const handleAdminAction = (deedId: string, action: 'approve' | 'reject') => {
    setProcessingId(deedId);
    setProgress(0);
    setShowSuccess(false);
    
    // Smooth progress bar update for 4 seconds
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 1;
      });
    }, 40);

    // Final action after 4 seconds
    setTimeout(() => {
      if (action === 'approve') onApprove(deedId);
      else onReject(deedId);
      setProcessingId(null);
      setProgress(0);
      
      // Show success toast temporarily
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 4000);
  };

  const handleStartDraw = () => {
    if (!prizeName) return;
    setIsDrawing(true);
    setDrawTimer(10);
    
    // Extended lottery draw for 10 seconds
    setTimeout(() => {
      onRunDraw(prizeName);
      setPrizeName('');
      setIsDrawing(false);
    }, 10000);
  };

  const chartData = students.map(s => ({
    name: s.name.split(' ')[0],
    points: s.points
  })).sort((a,b) => b.points - a.points).slice(0, 5);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 animate-in fade-in duration-500">
      {/* Toast-like Notifications */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] space-y-2 pointer-events-none">
        {processingId && (
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-8 duration-300">
            <Loader2 className="animate-spin text-teal-400" size={20} />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">Processing...</span>
              <div className="w-32 h-1 bg-white/20 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="h-full bg-teal-400 transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
        {showSuccess && !processingId && (
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-8 duration-300">
            <CheckCircle2 size={20} />
            <span className="text-sm font-bold tracking-tight">Action Completed Successfully!</span>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[150] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" />
          <button className="absolute top-6 right-6 text-white p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition"><X size={24}/></button>
        </div>
      )}

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[32px] max-w-sm w-full shadow-2xl space-y-6 animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <RotateCcw size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900">เริ่มต้นรอบเดือนใหม่?</h3>
              <p className="text-sm text-slate-500 font-medium">คะแนนและสิทธิ์ของนักเรียนทุกคนจะถูกรีเซ็ตเป็น 0 เพื่อเริ่มเก็บแต้มใหม่ประจำเดือน</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition">ยกเลิก</button>
              <button onClick={() => { onResetMonth(); setShowResetConfirm(false); }} className="flex-1 py-4 bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-600 transition">ยืนยันรีเซ็ต</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 group hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">นักเรียน</p>
            <Users className="text-indigo-500 group-hover:scale-110 transition-transform" size={20} />
          </div>
          <h3 className="text-3xl font-black">{students.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 group hover:border-amber-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">รอตรวจ</p>
            <ClipboardCheck className="text-amber-500 group-hover:scale-110 transition-transform" size={20} />
          </div>
          <h3 className="text-3xl font-black text-amber-600">{pendingDeeds.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 group hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">สิทธิ์รวม</p>
            <Ticket className="text-emerald-500 group-hover:scale-110 transition-transform" size={20} />
          </div>
          <h3 className="text-3xl font-black text-emerald-600">{students.reduce((acc, s) => acc + s.rights, 0)}</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 group hover:border-rose-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">รางวัล</p>
            <Gift className="text-rose-500 group-hover:scale-110 transition-transform" size={20} />
          </div>
          <h3 className="text-3xl font-black text-rose-600">{draws.length}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex bg-slate-100 p-1 rounded-[16px] w-fit border border-slate-200 shadow-inner">
            <button onClick={() => setActiveTab('pending')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-white shadow-md text-indigo-600 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>รอตรวจสอบ ({pendingDeeds.length})</button>
            <button onClick={() => setActiveTab('students')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'students' ? 'bg-white shadow-md text-indigo-600 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>นักเรียน</button>
            <button onClick={() => setActiveTab('draws')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'draws' ? 'bg-white shadow-md text-indigo-600 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>ประวัติสุ่ม</button>
          </div>

          <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden min-h-[500px]">
            {activeTab === 'pending' && (
              <div className="p-0">
                {pendingDeeds.length === 0 ? (
                  <div className="p-24 text-center space-y-4">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-100 animate-pulse">
                      <Check size={40} />
                    </div>
                    <p className="text-slate-400 font-bold text-lg tracking-tight">ตรวจสอบครบแล้ว!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {pendingDeeds.map(deed => (
                      <div key={deed.id} className="p-6 hover:bg-slate-50/80 transition flex flex-col sm:flex-row gap-6 items-start sm:items-center relative overflow-hidden">
                        {/* Inline Processing Indicator */}
                        {processingId === deed.id && (
                          <div 
                            className="absolute bottom-0 left-0 h-1 bg-teal-500 transition-all duration-75"
                            style={{ width: `${progress}%` }}
                          />
                        )}

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                             <div className="bg-indigo-50 text-indigo-600 font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-tighter shadow-sm">ชั้น {deed.studentRoom || '-'}</div>
                             <h4 className="font-bold text-slate-900">{deed.studentName}</h4>
                          </div>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed">{deed.description}</p>
                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Clock size={12} /> ส่งเมื่อ: {new Date(deed.timestamp).toLocaleTimeString('th-TH')}</span>
                            <span>REF: {deed.referenceCode || 'NO-REF'}</span>
                            <span className="text-emerald-500">+{deed.pointsAwarded} POINTS</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          <div 
                            className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 cursor-zoom-in group relative shrink-0 shadow-sm"
                            onClick={() => setSelectedImage(deed.evidenceUrl || null)}
                          >
                            {deed.evidenceUrl ? (
                              <img src={deed.evidenceUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                            ) : (
                              <AlertCircle className="w-full h-full p-4 text-slate-300" />
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              disabled={!!processingId}
                              onClick={() => handleAdminAction(deed.id, 'reject')} 
                              className="p-3 text-rose-600 hover:bg-rose-50 rounded-2xl transition shadow-sm border border-rose-100 disabled:opacity-50" 
                              title="ปฏิเสธ"
                            >
                              <X size={20} />
                            </button>
                            <button 
                              disabled={!!processingId}
                              onClick={() => handleAdminAction(deed.id, 'approve')} 
                              className="p-3 px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl transition shadow-lg shadow-emerald-100 font-bold flex items-center gap-2 min-w-[140px] justify-center disabled:opacity-80 relative overflow-hidden" 
                              title="อนุมัติ"
                            >
                              {processingId === deed.id ? (
                                <Loader2 size={20} className="animate-spin" />
                              ) : (
                                <Check size={20} />
                              )}
                              <span>{processingId === deed.id ? `Processing...` : 'อนุมัติ'}</span>
                              
                              {processingId === deed.id && (
                                <div 
                                  className="absolute left-0 bottom-0 h-1 bg-white/40"
                                  style={{ width: `${progress}%` }}
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'students' && (
              <div className="p-0">
                <div className="p-6 border-b border-slate-50">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="ค้นหาชื่อ, อีเมล หรือ ชั้นเรียน..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                      <tr>
                        <th className="px-6 py-4">ข้อมูลนักเรียน</th>
                        <th className="px-6 py-4 text-center">คะแนน</th>
                        <th className="px-6 py-4 text-center">สิทธิ์</th>
                        <th className="px-6 py-4 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map(student => (
                        <tr key={student.id} className={`hover:bg-slate-50 transition group ${student.isBanned ? 'bg-rose-50/20' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${student.isBanned ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                {student.name[0]}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold ${student.isBanned ? 'text-rose-600 line-through' : 'text-slate-900'}`}>{student.name} {student.surname}</span>
                                  {student.isBanned && <Ban size={12} className="text-rose-500" />}
                                </div>
                                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">ห้อง {student.room || '-'} • {student.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-black text-slate-700">{student.points}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${student.rights > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                              <Ticket size={12} /> {student.rights}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => onBanToggle(student.id)}
                              className={`p-2 rounded-xl transition ${student.isBanned ? 'text-emerald-500 hover:bg-emerald-50' : 'text-rose-400 hover:bg-rose-50 hover:text-rose-600'}`}
                              title={student.isBanned ? 'ปลดแบน' : 'แบนนักเรียน'}
                            >
                              {student.isBanned ? <ShieldCheck size={20} /> : <Ban size={20} />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'draws' && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {draws.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest">ยังไม่มีประวัติสุ่มรางวัล</div>
                ) : draws.sort((a,b) => b.timestamp - a.timestamp).map(draw => (
                  <div key={draw.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 group hover:shadow-lg transition duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-200"><Gift size={24} /></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">{draw.month}</span>
                    </div>
                    <h4 className="font-black text-xl text-slate-900 mb-1">{draw.prizeName}</h4>
                    <p className="text-sm font-bold text-indigo-600">ยินดีกับ: {draw.winners.map(wid => students.find(s => s.id === wid)?.name).join(', ')}</p>
                    <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-tighter">TIMESTAMP: {new Date(draw.timestamp).toLocaleString('th-TH')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Enhanced Drawing Tool */}
          <div className="bg-white p-8 rounded-[32px] shadow-2xl shadow-rose-900/10 border border-slate-100 relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-100 group-hover:rotate-12 transition-transform"><Sparkles size={20} /></div>
                <h2 className="text-2xl font-black tracking-tight">สุ่มรางวัลใหญ่</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">ผู้มีสิทธิ์ลุ้นตอนนี้</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-slate-400" />
                      <span className="text-lg font-black">{studentsWithRights.length}</span>
                      <span className="text-xs text-slate-500 font-medium">คน</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket size={18} className="text-emerald-500" />
                      <span className="text-lg font-black text-emerald-600">{studentsWithRights.reduce((acc, s) => acc + s.rights, 0)}</span>
                      <span className="text-xs text-slate-500 font-medium">สิทธิ์</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อของรางวัล</label>
                    <input 
                      type="text" 
                      placeholder="เช่น เงินรางวัล, บัตรกำนัล..." 
                      value={prizeName} 
                      onChange={(e) => setPrizeName(e.target.value)} 
                      disabled={isDrawing}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition font-bold" 
                    />
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={handleStartDraw} 
                      disabled={!prizeName || studentsWithRights.length === 0 || isDrawing} 
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-6 rounded-2xl shadow-xl shadow-rose-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm relative overflow-hidden group/draw"
                    >
                      {isDrawing ? (
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] opacity-70 mb-1">กำลังสุ่มผู้โชคดี ({drawTimer} วินาที)</span>
                          <span className="text-xl animate-bounce">{tickerName || "???"}</span>
                        </div>
                      ) : (
                        <>
                          <Gift size={24} className="group-hover/draw:scale-125 transition-transform" />
                          <span>เริ่มสุ่มรางวัลใหญ่!</span>
                        </>
                      )}
                    </button>
                    {isDrawing && (
                      <div className="absolute inset-0 bg-white/10 pointer-events-none animate-pulse" />
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => setShowResetConfirm(true)}
                      className="w-full py-3 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition"
                    >
                      <RotateCcw size={14} /> เริ่มต้นรอบใหม่ (ล้างสิทธิ์ทั้งหมด)
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-rose-100/50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="absolute -left-6 -top-6 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-1000" />
          </div>

          {/* Top 5 Leaderboard */}
          <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100">
            <h2 className="text-xl font-black mb-8 flex items-center gap-3">
              <div className="p-2 bg-indigo-500 text-white rounded-xl"><BarChart3 size={18} /></div>
              อันดับนักเรียนทำดี
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={10} fontWeight="900" stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} fontWeight="900" stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                  <Bar dataKey="points" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-50 space-y-4">
               {students.sort((a,b) => b.points - a.points).slice(0, 3).map((s, i) => (
                 <div key={s.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{i+1}</span>
                      <span className="text-sm font-bold text-slate-700">{s.name} {s.surname}</span>
                    </div>
                    <span className="text-sm font-black text-indigo-500">{s.points}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
