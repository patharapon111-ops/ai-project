
import React, { useState } from 'react';
import { 
  User, 
  GoodDeed, 
  Role, 
  PrizeDraw 
} from './types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_DEEDS, 
  POINTS_TO_RIGHT_RATIO 
} from './constants';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Heart, Shield, User as UserIcon, ArrowRight, Sparkles, Lock, ChevronLeft } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<User[]>(INITIAL_STUDENTS);
  const [deeds, setDeeds] = useState<GoodDeed[]>(INITIAL_DEEDS);
  const [draws, setDraws] = useState<PrizeDraw[]>([]);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [setupData, setSetupData] = useState({ name: '', surname: '', room: '' });
  const [error, setError] = useState('');

  const ADMIN_PASSWORD = 'POMR_ct-69';

  const handleInitialLogin = (role: Role) => {
    setError('');
    if (role === Role.ADMIN) {
      if (adminPassword === ADMIN_PASSWORD) {
        setCurrentUser({
          id: 'admin-1',
          name: 'ผู้ดูแลระบบ',
          email: 'admin@school.edu',
          role: Role.ADMIN,
          points: 0,
          rights: 0
        });
      } else {
        setError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่');
      }
    } else {
      const existing = students.find(s => s.email === loginEmail);
      if (existing) {
        setCurrentUser(existing);
      } else {
        setIsSettingUp(true);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginEmail('');
    setAdminPassword('');
    setIsSettingUp(false);
    setIsAdminLogin(false);
    setError('');
  };

  const handleCompleteSetup = () => {
    const newUser: User = {
      id: Date.now().toString(),
      name: setupData.name,
      surname: setupData.surname,
      room: setupData.room,
      email: loginEmail,
      role: Role.STUDENT,
      points: 0,
      rights: 0,
      isBanned: false
    };
    setStudents(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsSettingUp(false);
  };

  const handleAddDeed = (deedData: Partial<GoodDeed>) => {
    if (!currentUser || currentUser.isBanned) return;
    const newDeed: GoodDeed = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: currentUser.id,
      studentEmail: currentUser.email,
      studentName: `${currentUser.name} ${currentUser.surname || ''}`,
      studentRoom: currentUser.room,
      description: deedData.description || '',
      pointsAwarded: deedData.pointsAwarded || 0,
      evidenceUrl: deedData.evidenceUrl,
      referenceCode: deedData.referenceCode,
      status: 'PENDING',
      timestamp: Date.now(),
    };
    setDeeds(prev => [...prev, newDeed]);
  };

  const handleApproveDeed = (deedId: string) => {
    const deed = deeds.find(d => d.id === deedId);
    if (!deed) return;

    setDeeds(prev => prev.map(d => d.id === deedId ? { ...d, status: 'APPROVED' } : d));
    
    setStudents(prev => prev.map(s => {
      if (s.id === deed.studentId) {
        const newPoints = s.points + deed.pointsAwarded;
        return {
          ...s,
          points: newPoints,
          rights: Math.floor(newPoints / POINTS_TO_RIGHT_RATIO)
        };
      }
      return s;
    }));

    if (currentUser?.id === deed.studentId) {
      setCurrentUser(prev => {
        if (!prev) return null;
        const newPoints = prev.points + deed.pointsAwarded;
        return {
          ...prev,
          points: newPoints,
          rights: Math.floor(newPoints / POINTS_TO_RIGHT_RATIO)
        };
      });
    }
  };

  const handleRejectDeed = (deedId: string) => {
    setDeeds(prev => prev.map(d => d.id === deedId ? { ...d, status: 'REJECTED' } : d));
  };

  const handleBanToggle = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updated = { ...s, isBanned: !s.isBanned };
        if (currentUser?.id === studentId) setCurrentUser(updated);
        return updated;
      }
      return s;
    }));
  };

  const handleResetMonth = () => {
    setStudents(prev => prev.map(s => ({
      ...s,
      points: 0,
      rights: 0
    })));
    if (currentUser && currentUser.role === Role.STUDENT) {
      setCurrentUser(prev => prev ? { ...prev, points: 0, rights: 0 } : null);
    }
  };

  const handleRunDraw = (prizeName: string) => {
    const pool: string[] = [];
    students.filter(s => !s.isBanned).forEach(s => {
      for (let i = 0; i < s.rights; i++) {
        pool.push(s.id);
      }
    });

    if (pool.length === 0) {
      alert("ไม่มีนักเรียนที่มีสิทธิ์สุ่มรางวัลในขณะนี้ (หรือนักเรียนที่ติดแบนถูกคัดออก)");
      return;
    }

    const winnerId = pool[Math.floor(Math.random() * pool.length)];
    const newDraw: PrizeDraw = {
      id: Date.now().toString(),
      month: new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(new Date()),
      winners: [winnerId],
      prizeName,
      timestamp: Date.now()
    };

    setDraws(prev => [...prev, newDraw]);
    alert(`ยินดีด้วย! ผู้โชคดีได้รับ "${prizeName}" คือ คุณ${students.find(s => s.id === winnerId)?.name}`);
  };

  // Login / Setup Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-['Kanit']">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 max-w-md w-full animate-in fade-in zoom-in duration-500">
          {!isSettingUp && !isAdminLogin ? (
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="bg-teal-600 p-4 rounded-3xl shadow-xl shadow-teal-100">
                  <Sparkles className="text-white" size={40} />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">ทำดีมีโชค</h1>
                <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">Do Well and Win</p>
                <div className="mt-2 h-1 w-16 bg-teal-500 mx-auto rounded-full" />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">อีเมลนักเรียน</label>
                  <input 
                    type="email" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition"
                  />
                </div>
                <button 
                  onClick={() => handleInitialLogin(Role.STUDENT)}
                  disabled={!loginEmail.includes('@')}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-teal-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserIcon size={20} /> เข้าใช้งาน
                </button>
                
                <button 
                  onClick={() => setIsAdminLogin(true)}
                  className="w-full py-4 text-slate-400 text-sm font-medium hover:text-slate-600 transition"
                >
                  <Shield size={16} className="inline mr-1" /> ระบบจัดการ (ผู้ดูแล)
                </button>
              </div>
            </div>
          ) : isAdminLogin ? (
            <div className="space-y-8">
              <button onClick={() => { setIsAdminLogin(false); setError(''); }} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition font-medium text-sm">
                <ChevronLeft size={16} /> ย้อนกลับ
              </button>
              <div className="text-center">
                <div className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-slate-200">
                  <Lock size={32} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">ผู้ดูแลระบบ</h1>
                <p className="text-slate-400 font-medium">กรุณากรอกรหัสผ่านเพื่อเข้าใช้งาน</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">รหัสผ่าน</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-800 outline-none transition"
                  />
                  {error && <p className="text-xs text-rose-500 font-bold mt-2 ml-1 animate-pulse">{error}</p>}
                </div>
                <button 
                  onClick={() => handleInitialLogin(Role.ADMIN)}
                  disabled={!adminPassword}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  เข้าสู่ระบบ Admin
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">ลงทะเบียนนักเรียน</h1>
                <p className="text-slate-400 font-medium">เข้าร่วมกิจกรรม "ทำดีมีโชค"</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">ชื่อ</label>
                  <input 
                    type="text" 
                    placeholder="เช่น กิติพล"
                    value={setupData.name}
                    onChange={(e) => setSetupData({...setupData, name: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">นามสกุล</label>
                  <input 
                    type="text" 
                    placeholder="เช่น บุญชา"
                    value={setupData.surname}
                    onChange={(e) => setSetupData({...setupData, surname: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">ชั้นเรียน</label>
                  <input 
                    type="text" 
                    placeholder="เช่น 4/2"
                    value={setupData.room}
                    onChange={(e) => setSetupData({...setupData, room: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>

                <button 
                  onClick={handleCompleteSetup}
                  disabled={!setupData.name || !setupData.surname || !setupData.room}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-teal-100 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  เริ่มสะสมแต้มเลย <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Kanit']">
      {currentUser.role === Role.ADMIN ? (
        <div className="py-8">
          <header className="max-w-7xl mx-auto px-4 mb-8 flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className="bg-teal-600 p-2.5 rounded-xl text-white shadow-lg shadow-teal-100"><Sparkles size={20} /></div>
               <span className="text-xl font-bold tracking-tight text-slate-800">ทำดีมีโชค <span className="text-teal-600">Admin</span></span>
             </div>
             <button onClick={handleLogout} className="text-slate-400 font-medium hover:text-rose-500 transition px-4 py-2 hover:bg-rose-50 rounded-xl">ออกจากระบบ</button>
          </header>
          <AdminDashboard 
            students={students} 
            deeds={deeds} 
            draws={draws}
            onApprove={handleApproveDeed}
            onReject={handleRejectDeed} 
            onRunDraw={handleRunDraw}
            onBanToggle={handleBanToggle}
            onResetMonth={handleResetMonth}
          />
        </div>
      ) : (
        <StudentDashboard 
          user={currentUser} 
          deeds={deeds}
          onAddDeed={handleAddDeed}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default App;
