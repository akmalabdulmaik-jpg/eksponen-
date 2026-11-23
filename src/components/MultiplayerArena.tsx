import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Play,
  RefreshCw,
  ShieldCheck,
  Timer,
  Trophy,
  Users,
  XCircle,
} from 'lucide-react';
import { InlineMathText } from './MathExpr';

interface PlayerLeaderboardItem {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
  score: number;
  correctCount: number;
  streak: number;
  hasAnsweredCurrent: boolean;
  syaratBasisCorrect: number;
  syaratBasisTotal: number;
}

interface ActiveRaceQuestion {
  index: number;
  total: number;
  id: string;
  topic: string;
  topicLabel: string;
  difficulty: string;
  prompt: string;
  options: string[];
}

interface SummaryQuestionItem {
  index: number;
  topic: string;
  topicLabel: string;
  prompt: string;
  correctAnswer: string;
  steps: string[];
}

interface SessionCreds {
  roomCode: string;
  title: string;
  playerId: string;
  playerToken: string;
  isHost: boolean;
  securityPinDisplay?: string; // kept in-memory for host reference only
}

export const MultiplayerArena: React.FC = () => {
  const [entryMode, setEntryMode] = useState<'join' | 'create'>('join');

  // Create form state
  const [hostName, setHostName] = useState<string>('');
  const [roomTitle, setRoomTitle] = useState<string>('');
  const [createPin, setCreatePin] = useState<string>('');
  const [showCreatePin, setShowCreatePin] = useState<boolean>(false);

  // Join form state
  const [joinName, setJoinName] = useState<string>('');
  const [joinRoomCode, setJoinRoomCode] = useState<string>('');
  const [joinPin, setJoinPin] = useState<string>('');
  const [showJoinPin, setShowJoinPin] = useState<boolean>(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Active room session (kept strictly in JS memory, never localStorage)
  const [creds, setCreds] = useState<SessionCreds | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [roomStatus, setRoomStatus] = useState<'waiting' | 'active' | 'revealing' | 'finished'>('waiting');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [players, setPlayers] = useState<PlayerLeaderboardItem[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<ActiveRaceQuestion | null>(null);
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(0);
  const [questionDurationMs, setQuestionDurationMs] = useState<number>(25000);
  const [remainingMs, setRemainingMs] = useState<number>(25000);

  const [answerAck, setAnswerAck] = useState<{
    questionIndex: number;
    selectedOption: number;
    correct: boolean;
    correctIndex: number;
    earnedPoints: number;
    steps: string[];
  } | null>(null);

  const [revealData, setRevealData] = useState<{
    questionIndex: number;
    correctIndex: number;
    steps: string[];
  } | null>(null);

  const [summaryQuestions, setSummaryQuestions] = useState<SummaryQuestionItem[]>([]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);

  // Local countdown display synchronized with authoritative server start timestamp
  useEffect(() => {
    if (roomStatus !== 'active' || !questionStartedAt) return;
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - questionStartedAt;
      setRemainingMs(Math.max(0, questionDurationMs - elapsed));
    }, 150);
    return () => window.clearInterval(interval);
  }, [roomStatus, questionStartedAt, questionDurationMs]);

  // WebSocket lifecycle with automatic reconnect while creds remain in memory
  useEffect(() => {
    if (!creds) return;

    let cancelled = false;
    let reconnectTimer: number | null = null;

    const connect = () => {
      if (cancelled) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        ws.send(
          JSON.stringify({
            event: 'room:auth',
            payload: {
              roomCode: creds.roomCode,
              playerId: creds.playerId,
              playerToken: creds.playerToken,
            },
          })
        );
      };

      ws.onmessage = (evt) => {
        let msg: { event?: string; payload?: Record<string, unknown> };
        try {
          msg = JSON.parse(evt.data);
        } catch {
          return;
        }
        const p = msg.payload || {};

        if (msg.event === 'room:error') {
          setFormError(String(p.message || 'Koneksi ruangan bermasalah.'));
          return;
        }

        if (msg.event === 'room:state') {
          setRoomStatus((p.status as typeof roomStatus) || 'waiting');
          setRoundNumber(Number(p.roundNumber || 1));
          setPlayers((p.players as PlayerLeaderboardItem[]) || []);
          setActiveQuestion((p.question as ActiveRaceQuestion) || null);
          setQuestionStartedAt(Number(p.questionStartedAt || 0));
          setQuestionDurationMs(Number(p.questionDurationMs || 25000));
        }

        if (msg.event === 'room:players') {
          setPlayers((p.players as PlayerLeaderboardItem[]) || []);
        }

        if (msg.event === 'race:question') {
          setRoomStatus('active');
          setRoundNumber(Number(p.roundNumber || 1));
          setActiveQuestion((p.question as ActiveRaceQuestion) || null);
          setQuestionStartedAt(Number(p.questionStartedAt || Date.now()));
          setQuestionDurationMs(Number(p.questionDurationMs || 25000));
          setRemainingMs(Number(p.questionDurationMs || 25000));
          setPlayers((p.players as PlayerLeaderboardItem[]) || []);
          setAnswerAck(null);
          setRevealData(null);
          setSummaryQuestions([]);
        }

        if (msg.event === 'race:answer_ack') {
          setAnswerAck({
            questionIndex: Number(p.questionIndex),
            selectedOption: Number(p.selectedOption),
            correct: Boolean(p.correct),
            correctIndex: Number(p.correctIndex),
            earnedPoints: Number(p.earnedPoints || 0),
            steps: (p.steps as string[]) || [],
          });
        }

        if (msg.event === 'race:reveal') {
          setRoomStatus('revealing');
          setRevealData({
            questionIndex: Number(p.questionIndex),
            correctIndex: Number(p.correctIndex),
            steps: (p.steps as string[]) || [],
          });
          setPlayers((p.players as PlayerLeaderboardItem[]) || []);
        }

        if (msg.event === 'race:finished') {
          setRoomStatus('finished');
          setRoundNumber(Number(p.roundNumber || 1));
          setPlayers((p.players as PlayerLeaderboardItem[]) || []);
          setSummaryQuestions((p.summaryQuestions as SummaryQuestionItem[]) || []);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        if (!cancelled) {
          reconnectTimer = window.setTimeout(connect, 1500);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [creds]);

  const generateSecurePinSuggestion = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const arr = new Uint32Array(6);
    window.crypto.getRandomValues(arr);
    const pin = Array.from(arr, (n) => chars[n % chars.length]).join('');
    setCreatePin(pin);
    setShowCreatePin(true);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const resp = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName,
          title: roomTitle,
          securityCode: createPin,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setFormError(data.error || 'Gagal membuat ruangan.');
        return;
      }
      setCreds({
        roomCode: data.roomCode,
        title: data.title,
        playerId: data.playerId,
        playerToken: data.playerToken,
        isHost: true,
        securityPinDisplay: createPin.trim(),
      });
    } catch {
      setFormError('Tidak dapat terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const resp = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: joinName,
          roomCode: joinRoomCode.toUpperCase().trim(),
          securityCode: joinPin,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setFormError(data.error || 'Gagal masuk ke ruangan.');
        return;
      }
      setCreds({
        roomCode: data.roomCode,
        title: data.title,
        playerId: data.playerId,
        playerToken: data.playerToken,
        isHost: false,
      });
    } catch {
      setFormError('Tidak dapat terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartRace = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ event: 'race:start', payload: {} }));
  };

  const handleSubmitRaceAnswer = (optionIndex: number) => {
    if (!activeQuestion || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (answerAck && answerAck.questionIndex === activeQuestion.index) return;
    wsRef.current.send(
      JSON.stringify({
        event: 'race:answer',
        payload: {
          questionIndex: activeQuestion.index,
          optionIndex,
        },
      })
    );
  };

  const handleLeaveRoom = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setCreds(null);
    setPlayers([]);
    setActiveQuestion(null);
    setAnswerAck(null);
    setRevealData(null);
    setSummaryQuestions([]);
    setRoomStatus('waiting');
  };

  const copyRoomAccess = () => {
    if (!creds) return;
    const text = creds.securityPinDisplay
      ? `Kode Ruangan: ${creds.roomCode} | Kode Keamanan (PIN): ${creds.securityPinDisplay}`
      : `Kode Ruangan: ${creds.roomCode}`;
    navigator.clipboard?.writeText(text);
    setCopiedCode(true);
    window.setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section className="bg-white border border-[#e4e9f2] rounded-2xl p-6 sm:p-8 shadow-[0_5px_18px_rgba(23,37,84,0.04)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e4e9f2]">
        <div>
          <p className="text-xs font-semibold text-[#3858d6]">
            WebSocket Real-Time · 10 Soal Dinamis Selalu Berubah
          </p>
          <h2 className="text-2xl font-bold text-[#172554] mt-1">
            Lomba Online Multiplayer Eksponen
          </h2>
          <p className="text-sm text-[#5a657a] mt-1">
            Ruangan dilindungi Kode Ruangan + Kode Keamanan (PIN) terhash di server dengan pembatas percobaan otomatis.
          </p>
        </div>

        {creds && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#5a657a] tabular-nums">
              {wsConnected ? 'Terhubung Real-Time' : 'Menghubungkan...'}
            </span>
            <button
              type="button"
              onClick={handleLeaveRoom}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] text-xs font-semibold hover:brightness-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              Keluar Ruangan
            </button>
          </div>
        )}
      </div>

      {/* ENTRY VIEW: CREATE OR SECURE JOIN */}
      {!creds && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-1 p-1 bg-white border border-[#e4e9f2] rounded-xl w-fit">
              <button
                type="button"
                onClick={() => {
                  setEntryMode('join');
                  setFormError(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  entryMode === 'join' ? 'bg-[#3858d6] text-white' : 'text-[#172554]'
                }`}
              >
                Masuk Ruangan (Peserta)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEntryMode('create');
                  setFormError(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  entryMode === 'create' ? 'bg-[#3858d6] text-white' : 'text-[#172554]'
                }`}
              >
                Buat Ruangan Lomba (Host)
              </button>
            </div>

            {formError && (
              <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-xl px-4 py-3 text-xs font-semibold text-[#be123c] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{formError}</span>
              </div>
            )}

            {entryMode === 'join' ? (
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                  <label htmlFor="join-name" className="block text-xs font-bold text-[#172554] mb-1.5">
                    Nama Peserta
                  </label>
                  <input
                    id="join-name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={24}
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    placeholder="Contoh: Raka Pratama"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#dce3f0] text-sm text-[#172554] focus:outline-2 focus:outline-[#3858d6]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="join-code" className="block text-xs font-bold text-[#172554] mb-1.5">
                      Kode Ruangan (6 Karakter)
                    </label>
                    <input
                      id="join-code"
                      type="text"
                      required
                      maxLength={6}
                      value={joinRoomCode}
                      onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="Misal: XP7K9M"
                      autoComplete="off"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#dce3f0] font-math text-sm font-bold tracking-wider uppercase text-[#172554] focus:outline-2 focus:outline-[#3858d6]"
                    />
                  </div>

                  <div>
                    <label htmlFor="join-pin" className="block text-xs font-bold text-[#172554] mb-1.5">
                      Kode Keamanan / PIN Ruangan
                    </label>
                    <div className="relative">
                      <input
                        id="join-pin"
                        type={showJoinPin ? 'text' : 'password'}
                        required
                        minLength={4}
                        maxLength={16}
                        value={joinPin}
                        onChange={(e) => setJoinPin(e.target.value)}
                        placeholder="Masukkan PIN rahasia"
                        autoComplete="off"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white border border-[#dce3f0] font-math text-sm text-[#172554] focus:outline-2 focus:outline-[#3858d6]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowJoinPin((v) => !v)}
                        aria-label={showJoinPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5a657a] hover:text-[#172554] cursor-pointer"
                      >
                        {showJoinPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3858d6] text-white text-sm font-semibold hover:bg-[#2d49b8] disabled:opacity-60 cursor-pointer"
                >
                  <Lock className="w-4 h-4" aria-hidden="true" />
                  {submitting ? 'Memverifikasi Kode...' : 'Masuk Lomba dengan Aman'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="host-name" className="block text-xs font-bold text-[#172554] mb-1.5">
                      Nama Host / Guru
                    </label>
                    <input
                      id="host-name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={24}
                      value={hostName}
                      onChange={(e) => setHostName(e.target.value)}
                      placeholder="Contoh: Pak Dimas"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#dce3f0] text-sm text-[#172554] focus:outline-2 focus:outline-[#3858d6]"
                    />
                  </div>
                  <div>
                    <label htmlFor="room-title" className="block text-xs font-bold text-[#172554] mb-1.5">
                      Nama Lomba (Opsional)
                    </label>
                    <input
                      id="room-title"
                      type="text"
                      maxLength={24}
                      value={roomTitle}
                      onChange={(e) => setRoomTitle(e.target.value)}
                      placeholder="Misal: Kelas X-A Bab Eksponen"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#dce3f0] text-sm text-[#172554] focus:outline-2 focus:outline-[#3858d6]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="create-pin" className="text-xs font-bold text-[#172554]">
                      Buat Kode Keamanan / PIN Ruangan (min. 4 karakter)
                    </label>
                    <button
                      type="button"
                      onClick={generateSecurePinSuggestion}
                      className="text-xs font-semibold text-[#3858d6] hover:underline cursor-pointer"
                    >
                      Acak PIN Aman
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="create-pin"
                      type={showCreatePin ? 'text' : 'password'}
                      required
                      minLength={4}
                      maxLength={16}
                      value={createPin}
                      onChange={(e) => setCreatePin(e.target.value)}
                      placeholder="Masukkan PIN untuk melindungi ruangan"
                      autoComplete="off"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white border border-[#dce3f0] font-math text-sm text-[#172554] focus:outline-2 focus:outline-[#3858d6]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePin((v) => !v)}
                      aria-label={showCreatePin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5a657a] hover:text-[#172554] cursor-pointer"
                    >
                      {showCreatePin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16865b] text-white text-sm font-semibold hover:brightness-95 disabled:opacity-60 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" aria-hidden="true" />
                  {submitting ? 'Membuat Ruangan...' : 'Buat Ruangan Lomba 10 Soal'}
                </button>
              </form>
            )}
          </div>

          {/* Security & Format Guarantees Info */}
          <div className="lg:col-span-5 bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#172554]">
              <ShieldCheck className="w-5 h-5 text-[#16865b]" aria-hidden="true" />
              <span>Perlindungan Ruangan & Aturan Lomba</span>
            </div>
            <ul className="space-y-2.5 text-xs text-[#42506b] leading-relaxed">
              <li>
                <strong className="text-[#172554]">Verifikasi PIN di Server:</strong> Kode keamanan di-hash dengan scrypt dan salt unik per ruangan—tidak pernah disimpan polos di browser.
              </li>
              <li>
                <strong className="text-[#172554]">Anti Tebak Kode:</strong> Maksimal 5 kali salah memasukkan kode/PIN per menit sebelum jeda pengaman aktif otomatis.
              </li>
              <li>
                <strong className="text-[#172554]">10 Soal Selalu Berubah:</strong> Setiap ronde membangkitkan 10 soal acak baru di server, termasuk soal jebakan syarat basis (a = 1, 0, -1).
              </li>
              <li>
                <strong className="text-[#172554]">Skor Resmi Server:</strong> Kunci jawaban tidak dikirim ke peserta sebelum dijawab. Jawaban benar bernilai 100 + bonus kecepatan hingga +50.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ACTIVE ROOM VIEW */}
      {creds && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT STAGE: LOBBY / ACTIVE QUESTION / PODIUM */}
          <div className="lg:col-span-8 space-y-5">
            {/* Room Code Access Banner */}
            <div className="bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#5a657a]">
                  {creds.title} · Ronde ke-{roundNumber}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-4 font-math text-sm text-[#172554]">
                  <span>
                    Kode Ruangan: <strong className="text-lg text-[#3858d6]">{creds.roomCode}</strong>
                  </span>
                  {creds.securityPinDisplay && (
                    <span>
                      PIN Keamanan: <strong className="text-[#172554]">{creds.securityPinDisplay}</strong>
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={copyRoomAccess}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#dce3f0] text-xs font-semibold text-[#172554] hover:bg-[#eef2ff] cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#16865b]" aria-hidden="true" />
                    Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    Salin Kode Akses
                  </>
                )}
              </button>
            </div>

            {/* STATE 1: WAITING LOBBY */}
            {roomStatus === 'waiting' && (
              <div className="bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-6 sm:p-8 text-center space-y-4">
                <Users className="w-8 h-8 text-[#3858d6] mx-auto" aria-hidden="true" />
                <h3 className="text-xl font-bold text-[#172554]">
                  Ruang Tunggu Lomba ({players.length} Peserta Bergabung)
                </h3>
                <p className="text-sm text-[#42506b] max-w-lg mx-auto">
                  Bagikan <strong>Kode Ruangan ({creds.roomCode})</strong> dan <strong>PIN Keamanan</strong> kepada peserta lain. Kamu juga dapat membuka tab browser kedua dengan alamat yang sama untuk menguji lomba multiplayer langsung.
                </p>

                {creds.isHost ? (
                  <button
                    type="button"
                    onClick={handleStartRace}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#16865b] text-white text-sm font-semibold hover:brightness-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4" aria-hidden="true" />
                    Mulai Lomba 10 Soal Sekarang
                  </button>
                ) : (
                  <div className="text-xs font-semibold text-[#3858d6]">
                    Menunggu host memulai lomba 10 soal...
                  </div>
                )}
              </div>
            )}

            {/* STATE 2: ACTIVE / REVEALING QUESTION */}
            {(roomStatus === 'active' || roomStatus === 'revealing') && activeQuestion && (
              <div className="bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[#3858d6] tabular-nums">
                    Soal {activeQuestion.index + 1} / {activeQuestion.total} · {activeQuestion.topicLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-math text-sm font-bold text-[#172554] tabular-nums">
                    <Timer className="w-4 h-4 text-[#3858d6]" aria-hidden="true" />
                    {Math.ceil(remainingMs / 1000)} detik
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-[#dce3f0] rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${Math.max(0, Math.min(100, (remainingMs / questionDurationMs) * 100))}%`,
                    }}
                    className="h-full bg-[#3858d6] transition-[width] duration-150"
                  />
                </div>

                <div className="bg-white border border-[#e4e9f2] rounded-xl p-5">
                  <h3 className="text-lg sm:text-xl font-bold text-[#172554] leading-snug">
                    <InlineMathText text={activeQuestion.prompt} />
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeQuestion.options.map((opt, idx) => {
                    const myAnswer =
                      answerAck && answerAck.questionIndex === activeQuestion.index
                        ? answerAck
                        : null;
                    const resolvedCorrectIdx =
                      revealData && revealData.questionIndex === activeQuestion.index
                        ? revealData.correctIndex
                        : myAnswer?.correctIndex;

                    const isSelected = myAnswer?.selectedOption === idx;
                    const isCorrectOpt = resolvedCorrectIdx === idx;
                    const locked = Boolean(myAnswer) || roomStatus === 'revealing';

                    let cls =
                      'bg-white border-[#dce3f0] text-[#172554] hover:border-[#3858d6] hover:bg-[#eef2ff]';
                    if (locked) {
                      if (typeof resolvedCorrectIdx === 'number' && isCorrectOpt) {
                        cls = 'bg-[#f4fbf8] border-[#16865b] text-[#16865b] font-semibold';
                      } else if (isSelected && !isCorrectOpt) {
                        cls = 'bg-[#fff1f2] border-[#be123c] text-[#be123c]';
                      } else {
                        cls = 'bg-white/70 border-[#e4e9f2] text-[#5a657a]';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={locked}
                        onClick={() => handleSubmitRaceAnswer(idx)}
                        className={`text-left px-4 py-3.5 rounded-xl border transition-colors cursor-pointer disabled:cursor-default flex items-center gap-3 ${cls}`}
                      >
                        <span className="font-math text-xs font-bold w-6 h-6 rounded-md bg-[#f5f7fb] border border-[#dce3f0] flex items-center justify-center shrink-0 text-[#172554]">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="font-math text-sm">
                          <InlineMathText text={opt} />
                        </span>
                      </button>
                    );
                  })}
                </div>

                {(answerAck || revealData) && (
                  <div
                    className={`rounded-xl border p-4 space-y-1.5 ${
                      answerAck?.correct
                        ? 'bg-[#f4fbf8] border-[#c8eadc]'
                        : answerAck && !answerAck.correct
                        ? 'bg-[#fff1f2] border-[#fecdd3]'
                        : 'bg-white border-[#e4e9f2]'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold">
                      {answerAck ? (
                        answerAck.correct ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-[#16865b]" aria-hidden="true" />
                            <span className="text-[#16865b]">
                              Benar (+{answerAck.earnedPoints} poin)
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-[#be123c]" aria-hidden="true" />
                            <span className="text-[#be123c]">Kurang Tepat (0 poin)</span>
                          </>
                        )
                      ) : (
                        <span className="text-[#172554]">Waktu Soal Selesai — Pembahasan</span>
                      )}
                    </div>
                    <div className="text-xs text-[#172033] space-y-0.5">
                      {(answerAck?.steps || revealData?.steps || []).map((s, si) => (
                        <div key={si}>
                          • <InlineMathText text={s} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STATE 3: RACE FINISHED PODIUM */}
            {roomStatus === 'finished' && (
              <div className="bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Trophy className="w-6 h-6 text-[#3858d6]" aria-hidden="true" />
                    <div>
                      <h3 className="text-xl font-bold text-[#172554]">
                        Hasil Akhir Lomba 10 Soal (Ronde {roundNumber})
                      </h3>
                      <p className="text-xs text-[#5a657a]">
                        Setiap ronde baru menghasilkan 10 soal acak yang berbeda.
                      </p>
                    </div>
                  </div>

                  {creds.isHost && (
                    <button
                      type="button"
                      onClick={handleStartRace}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3858d6] text-white text-xs font-semibold hover:bg-[#2d49b8] cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                      Mulai Ronde Baru (10 Soal Baru)
                    </button>
                  )}
                </div>

                {/* Review 10 Questions */}
                {summaryQuestions.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-[#e4e9f2]">
                    <div className="text-xs font-bold text-[#172554]">
                      Ringkasan 10 Soal Ronde Ini:
                    </div>
                    {summaryQuestions.map((sq) => (
                      <div key={sq.index} className="bg-white border border-[#e4e9f2] rounded-xl p-3.5 text-xs space-y-1">
                        <div className="font-bold text-[#172554]">
                          {sq.index + 1}. <InlineMathText text={sq.prompt} />
                        </div>
                        <div className="text-[#16865b] font-semibold">
                          Jawaban: <span className="font-math"><InlineMathText text={sq.correctAnswer} /></span> · {sq.topicLabel}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT PANEL: LIVE REAL-TIME LEADERBOARD */}
          <div className="lg:col-span-4 bg-[#f5f7fb] border border-[#e4e9f2] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#172554]">
                Papan Skor Langsung ({players.length})
              </h3>
              <span className="text-[11px] font-semibold text-[#5a657a]">Real-time</span>
            </div>

            <div className="space-y-2">
              {players.map((p, rank) => {
                const isSelf = p.id === creds.playerId;
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-3 ${
                      isSelf
                        ? 'bg-[#eef2ff] border-[#3858d6]'
                        : 'bg-white border-[#e4e9f2]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-math text-xs font-bold text-[#5a657a] tabular-nums">
                          #{rank + 1}
                        </span>
                        <span className="text-sm font-bold text-[#172554] truncate">
                          {p.name}
                        </span>
                        {p.isHost && (
                          <span className="text-[11px] font-semibold text-[#3858d6]">Host</span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#5a657a] tabular-nums mt-0.5">
                        Benar: {p.correctCount} · {p.connected ? 'Aktif' : 'Terputus'}
                        {roomStatus === 'active' && (
                          <> · {p.hasAnsweredCurrent ? 'Sudah jawab' : 'Menjawab...'}</>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-math text-base font-bold text-[#3858d6] tabular-nums">
                        {p.score}
                      </div>
                      {p.syaratBasisTotal > 0 && roomStatus === 'finished' && (
                        <div className="text-[10px] text-[#5a657a] tabular-nums">
                          Syarat Basis {p.syaratBasisCorrect}/{p.syaratBasisTotal}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
