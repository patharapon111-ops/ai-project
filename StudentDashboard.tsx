
import React, { useState, useRef } from 'react';
import { User, GoodDeed } from '../types';
import { MISSIONS, POINTS_TO_RIGHT_RATIO } from '../constants';
import { 
  Plus, 
  ChevronDown,
  LogOut,
  Camera,
  Loader2,
  Ticket,
  Image as ImageIcon,
  X,
  AlertOctagon,
  Info,
  Award,
  Images
} from 'lucide-react';

interface Props {
  user: User;
  deeds: GoodDeed[];
  onAddDeed: (deed: Partial<GoodDeed>) => void;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<Props> = ({ user, deeds, onAddDeed, onLogout }) => {
  const [selectedMissionId, setSelectedMissionId] = useState('');
  const [refCode, setRefCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showTickets, setShowTickets] = useState(false);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  const studentDeeds = deeds.filter(d => d.studentId === user.id);
  const selectedMission = MISSIONS.find(m => m.id === selectedMissionId);
  const progressPercent = (user.points % POINTS_TO_RIGHT_RATIO);

  const tickets = Array.from({ length: user.rights }, (_, i) => ({
    id: `DWW-${user.id.slice(-4)}-${(i + 1).toString().padStart(3, '0')}`,
    date: new Date().toLocaleDateString('th-TH', { month: 'short', year: '2-digit' })
  }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMissionId || user.isBanned) return;

    setIsSubmitting(true);
    
    const newDeed: Partial<GoodDeed> = {
      description: selectedMission?.label || '',
      pointsAwarded: selectedMission?.points || 0,
      referenceCode: refCode,
      evidenceUrl: imagePreview || undefined,
      status: 'PENDING',
    };

    setTimeout(() => {
      onAddDeed(newDeed);
      setSelectedMissionId('');
      setRefCode('');
      setImagePreview(null);
      setIsSubmitting(false);
    }, 1200);
  };

  if (user.isBanned) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-rose-100 p-6 rounded-full text-rose-600 animate-bounce">
            <AlertOctagon size={64} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">คุณถูกระงับการใช้งาน</h1>
        <p className="text-slate-500">บัญชีของคุณถูกระงับเนื่องจากทำผิดกฎกิจกรรม กรุณาติดต่อครูผู้ดูแลเพื่อขอปลดระงับ</p>
        <button onClick={onLogout} className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl shadow-lg">กลับสู่หน้าหลัก</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-8 space-y-8 min-h-screen bg-slate-50 relative pb-24">
      {/* Modal สิทธิ์ลุ้นรางวัล */}
      {showTickets && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-t-[40px] sm:rounded-[40px] p-8 space-y-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Award className="text-amber-500" /> สิทธิ์ของฉัน
              </h3>
              <button onClick={() => setShowTickets(false)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"><X size={20}/></button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {tickets.length > 0 ? tickets.map((t) => (
                <div key={t.id} className="relative bg-gradient-to-r from-amber-400 to-orange-500 p-4 rounded-2xl text-white shadow-md flex items-center justify-between overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Lucky Ticket</p>
                    <p className="text-xl font-black tracking-tighter">{t.id}</p>
                    <p className="text-[10px] mt-1 font-medium">{t.date} Drawing</p>
                  </div>
                  <Ticket size={48} className="absolute -right-2 opacity-20 rotate-12 group-hover:rotate-0 transition-transform" />
                  <div className="w-4 h-4 bg-white rounded-full absolute -left-2 top-1/2 -translate-y-1/2" />
                </div>
              )) : (
                <div className="py-10 text-center space-y-3">
                  <Ticket size={48} className="mx-auto text-slate-200" />
                  <p className="text-slate-400">คุณยังไม่มีสิทธิ์ลุ้นรางวัล<br/>สะสมให้ครบ 100 แต้มเพื่อรับสิทธิ์แรก!</p>
                </div>
              )}
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
              <p className="text-xs text-amber-700 leading-relaxed font-medium">
                ทุกๆ 100 แต้มสะสม ระบบจะออกตั๋วสิทธิ์ให้คุณโดยอัตโนมัติ ยิ่งมีตั๋วมาก ยิ่งมีโอกาสถูกรางวัลใหญ่!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="animate-in fade-in slide-in-from-left duration-500">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">สวัสดี, {user.name}</h1>
          <p className="text-slate-400 font-medium">{user.room}</p>
        </div>
        <button onClick={onLogout} className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-500 text-sm font-medium hover:bg-slate-50 transition active:scale-95">
          ออกจากระบบ
        </button>
      </div>

      {/* Points Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-teal-700 rounded-[32px] p-8 text-white shadow-2xl shadow-teal-900/30 group">
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-7xl font-black mb-1 tracking-tighter animate-in zoom-in duration-700">{user.points}</h2>
              <p className="text-slate-300 text-lg font-medium opacity-80 uppercase tracking-wide text-xs">คะแนนสะสมรวม</p>
            </div>
            
            <button 
              onClick={() => setShowTickets(true)}
              className="bg-amber-400 hover:bg-amber-300 text-amber-900 px-4 py-3 rounded-2xl text-center shadow-lg shadow-amber-900/40 transition-all active:scale-95 flex flex-col items-center min-w-[80px]"
            >
              <Ticket size={24} className="mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">สิทธิ์ของคุณ</span>
              <span className="text-2xl font-black mt-1 leading-none">{user.rights}</span>
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-teal-400 to-emerald-300 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(45,212,191,0.5)]" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            <div className="flex justify-between text-[11px] font-bold tracking-wide">
              <span className="text-teal-300">{progressPercent}% ของสิทธิ์ถัดไป</span>
              <span className="text-slate-300">ขาดอีก {POINTS_TO_RIGHT_RATIO - progressPercent} แต้ม</span>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
      </div>

      {/* Mission Form */}
      <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 space-y-6 border border-slate-50 animate-in fade-in slide-in-from-bottom duration-700 delay-150">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="p-1.5 bg-slate-800 rounded-full text-white shadow-lg"><Plus size={14} /></span>
          บันทึกภารกิจ
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <select
              value={selectedMissionId}
              onChange={(e) => setSelectedMissionId(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-600 font-medium focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition cursor-pointer pr-10"
              required
            >
              <option value="">เลือกกิจกรรม...</option>
              {MISSIONS.map(m => (
                <option key={m.id} value={m.id}>{m.label} (+{m.points} แต้ม)</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">หลักฐานภาพถ่าย</label>
              <p className="text-teal-600 font-black text-xl leading-none">+{selectedMission?.points || 0}</p>
            </div>
            
            {!imagePreview ? (
              <div className="w-full border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-2">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="h-32 flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-slate-100 hover:border-teal-400 hover:bg-teal-50/30 transition-all group"
                  >
                    <div className="p-3 bg-teal-50 text-teal-600 rounded-full group-hover:scale-110 transition-transform">
                      <Camera size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">ถ่ายรูป</span>
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => libraryInputRef.current?.click()}
                    className="h-32 flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-slate-100 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full group-hover:scale-110 transition-transform">
                      <ImageIcon size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">คลังรูปภาพ</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg group">
                <img src={imagePreview} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition backdrop-blur-sm"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            
            {/* Hidden Inputs */}
            <input 
              type="file" 
              ref={cameraInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/*" 
              capture="environment" 
            />
            <input 
              type="file" 
              ref={libraryInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <input 
            type="text"
            value={refCode}
            onChange={(e) => setRefCode(e.target.value)}
            placeholder="อธิบายภาพ (ถ้ามี)"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-600 focus:ring-2 focus:ring-teal-500 outline-none transition"
          />

          <button 
            type="submit"
            disabled={isSubmitting || !selectedMissionId}
            className="w-full py-5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "ยืนยันภารกิจ"}
          </button>
        </form>
      </div>

      <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
        <h3 className="text-xl font-bold text-slate-800">ประวัติล่าสุด</h3>
        <div className="space-y-3">
          {studentDeeds.length === 0 ? (
            <div className="h-20 bg-slate-100/50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
              <p className="text-slate-400 text-sm">ยังไม่มีประวัติภารกิจ</p>
            </div>
          ) : studentDeeds.slice(0, 3).map(deed => (
            <div key={deed.id} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-100 transition hover:shadow-md">
              <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                 {deed.evidenceUrl ? <img src={deed.evidenceUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-3 text-slate-300" />}
              </div>
              <div className="flex-1">
                <span className="font-semibold text-slate-700 block text-sm line-clamp-1">{deed.description}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                  deed.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 
                  deed.status === 'REJECTED' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {deed.status === 'APPROVED' ? 'อนุมัติ' : deed.status === 'REJECTED' ? 'ปฏิเสธ' : 'รอตรวจ'}
                </span>
              </div>
              <div className="text-teal-600 font-black">+{deed.pointsAwarded}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
