import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { generateDynamicRaceQuestions } from './src/data/questionBank.ts';
import type { BankQuestion } from './src/data/questionBank.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

const QUESTION_DURATION_MS = 25000;
const REVEAL_PAUSE_MS = 2500;
const MAX_PLAYERS_PER_ROOM = 30;
const RACE_QUESTION_COUNT = 10;

interface PlayerState {
  id: string;
  name: string;
  tokenHash: Buffer;
  isHost: boolean;
  connected: boolean;
  score: number;
  correctCount: number;
  streak: number;
  answeredIndices: Set<number>;
  syaratBasisCorrect: number;
  syaratBasisTotal: number;
  socket: WebSocket | null;
}

interface RoomState {
  code: string;
  title: string;
  pinSalt: string;
  pinHash: Buffer;
  status: 'waiting' | 'active' | 'revealing' | 'finished';
  roundNumber: number;
  createdAt: number;
  questions: BankQuestion[];
  currentQuestionIndex: number;
  questionStartedAt: number;
  questionTimer: ReturnType<typeof setTimeout> | null;
  revealTimer: ReturnType<typeof setTimeout> | null;
  players: Map<string, PlayerState>;
}

interface RateLimitEntry {
  failures: number;
  blockedUntil: number;
  windowStart: number;
}

const rooms = new Map<string, RoomState>();
const joinRateLimits = new Map<string, RateLimitEntry>();

function hashPin(pin: string, salt: string): Buffer {
  return crypto.scryptSync(pin, salt, 32);
}

function hashToken(token: string): Buffer {
  return crypto.createHash('sha256').update(token).digest();
}

function generateRoomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += alphabet[bytes[i] % alphabet.length];
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

function sanitizeDisplayName(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/[\r\n\t<>]/g, '').trim().slice(0, 24);
}

function sanitizeRoomCode(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

function sanitizePin(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim().slice(0, 16);
}

function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function checkRateLimit(key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = joinRateLimits.get(key);
  if (!entry) return { allowed: true, retryAfterSec: 0 };

  if (entry.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  if (now - entry.windowStart > 60000) {
    joinRateLimits.delete(key);
    return { allowed: true, retryAfterSec: 0 };
  }

  return { allowed: true, retryAfterSec: 0 };
}

function recordJoinFailure(key: string): void {
  const now = Date.now();
  const entry = joinRateLimits.get(key);
  if (!entry || now - entry.windowStart > 60000) {
    joinRateLimits.set(key, { failures: 1, blockedUntil: 0, windowStart: now });
    return;
  }
  entry.failures += 1;
  if (entry.failures >= 5) {
    entry.blockedUntil = now + 45000;
  }
}

function clearTimers(room: RoomState): void {
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
  }
  if (room.revealTimer) {
    clearTimeout(room.revealTimer);
    room.revealTimer = null;
  }
}

function serializeLeaderboard(room: RoomState) {
  return Array.from(room.players.values())
    .map((p) => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      connected: p.connected,
      score: p.score,
      correctCount: p.correctCount,
      streak: p.streak,
      hasAnsweredCurrent: p.answeredIndices.has(room.currentQuestionIndex),
      syaratBasisCorrect: p.syaratBasisCorrect,
      syaratBasisTotal: p.syaratBasisTotal,
    }))
    .sort((a, b) => b.score - a.score || b.correctCount - a.correctCount);
}

function stripQuestionForClient(q: BankQuestion, index: number, total: number) {
  return {
    index,
    total,
    id: q.id,
    topic: q.topic,
    topicLabel: q.topicLabel,
    difficulty: q.difficulty,
    prompt: q.prompt,
    options: q.options,
  };
}

function broadcastRoom(room: RoomState, event: string, payload: unknown): void {
  const msg = JSON.stringify({ event, payload });
  for (const player of room.players.values()) {
    if (player.socket && player.socket.readyState === WebSocket.OPEN) {
      player.socket.send(msg);
    }
  }
}

function sendToPlayer(player: PlayerState, event: string, payload: unknown): void {
  if (player.socket && player.socket.readyState === WebSocket.OPEN) {
    player.socket.send(JSON.stringify({ event, payload }));
  }
}

function buildPublicRoomSnapshot(room: RoomState) {
  const activeQ =
    (room.status === 'active' || room.status === 'revealing') &&
    room.questions[room.currentQuestionIndex]
      ? stripQuestionForClient(
          room.questions[room.currentQuestionIndex],
          room.currentQuestionIndex,
          room.questions.length
        )
      : null;

  return {
    code: room.code,
    title: room.title,
    status: room.status,
    roundNumber: room.roundNumber,
    totalQuestions: room.questions.length,
    currentQuestionIndex: room.currentQuestionIndex,
    questionStartedAt: room.questionStartedAt,
    questionDurationMs: QUESTION_DURATION_MS,
    question: activeQ,
    players: serializeLeaderboard(room),
  };
}

function startQuestion(room: RoomState, index: number): void {
  clearTimers(room);
  if (index >= room.questions.length) {
    finishRace(room);
    return;
  }

  room.status = 'active';
  room.currentQuestionIndex = index;
  room.questionStartedAt = Date.now();

  const q = room.questions[index];
  broadcastRoom(room, 'race:question', {
    roundNumber: room.roundNumber,
    questionStartedAt: room.questionStartedAt,
    questionDurationMs: QUESTION_DURATION_MS,
    question: stripQuestionForClient(q, index, room.questions.length),
    players: serializeLeaderboard(room),
  });

  room.questionTimer = setTimeout(() => {
    revealAndAdvance(room);
  }, QUESTION_DURATION_MS);
}

function revealAndAdvance(room: RoomState): void {
  clearTimers(room);
  if (room.status !== 'active') return;

  room.status = 'revealing';
  const q = room.questions[room.currentQuestionIndex];
  broadcastRoom(room, 'race:reveal', {
    questionIndex: room.currentQuestionIndex,
    correctIndex: q.correctIndex,
    steps: q.steps,
    players: serializeLeaderboard(room),
  });

  room.revealTimer = setTimeout(() => {
    const nextIdx = room.currentQuestionIndex + 1;
    if (nextIdx >= room.questions.length) {
      finishRace(room);
    } else {
      startQuestion(room, nextIdx);
    }
  }, REVEAL_PAUSE_MS);
}

function finishRace(room: RoomState): void {
  clearTimers(room);
  room.status = 'finished';

  const summaryQuestions = room.questions.map((q, idx) => ({
    index: idx,
    topic: q.topic,
    topicLabel: q.topicLabel,
    prompt: q.prompt,
    correctAnswer: q.options[q.correctIndex],
    steps: q.steps,
  }));

  broadcastRoom(room, 'race:finished', {
    roundNumber: room.roundNumber,
    players: serializeLeaderboard(room),
    summaryQuestions,
  });
}

// Cleanup inactive rooms older than 2 hours
setInterval(() => {
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  for (const [code, room] of rooms.entries()) {
    const anyConnected = Array.from(room.players.values()).some((p) => p.connected);
    if (!anyConnected && room.createdAt < cutoff) {
      clearTimers(room);
      rooms.delete(code);
    }
  }
}, 15 * 60 * 1000);

async function bootstrap() {
  const app = express();
  app.use(express.json({ limit: '32kb' }));

  // Create a new protected multiplayer race room
  app.post('/api/rooms', (req, res) => {
    const hostName = sanitizeDisplayName(req.body?.hostName);
    const securityCode = sanitizePin(req.body?.securityCode);
    const titleRaw = sanitizeDisplayName(req.body?.title);

    if (hostName.length < 2) {
      res.status(400).json({ error: 'Nama host minimal 2 karakter.' });
      return;
    }
    if (securityCode.length < 4) {
      res.status(400).json({
        error: 'Kode keamanan ruangan (PIN) minimal 4 karakter agar ruang lomba terlindungi.',
      });
      return;
    }

    const code = generateRoomCode();
    const pinSalt = crypto.randomBytes(16).toString('hex');
    const pinHash = hashPin(securityCode, pinSalt);

    const playerId = crypto.randomUUID();
    const playerToken = crypto.randomBytes(24).toString('hex');

    const hostPlayer: PlayerState = {
      id: playerId,
      name: hostName,
      tokenHash: hashToken(playerToken),
      isHost: true,
      connected: false,
      score: 0,
      correctCount: 0,
      streak: 0,
      answeredIndices: new Set<number>(),
      syaratBasisCorrect: 0,
      syaratBasisTotal: 0,
      socket: null,
    };

    const room: RoomState = {
      code,
      title: titleRaw || `Lomba Eksponen ${code}`,
      pinSalt,
      pinHash,
      status: 'waiting',
      roundNumber: 1,
      createdAt: Date.now(),
      questions: generateDynamicRaceQuestions(RACE_QUESTION_COUNT),
      currentQuestionIndex: 0,
      questionStartedAt: 0,
      questionTimer: null,
      revealTimer: null,
      players: new Map([[playerId, hostPlayer]]),
    };

    rooms.set(code, room);

    res.status(201).json({
      roomCode: code,
      title: room.title,
      playerId,
      playerToken,
      isHost: true,
    });
  });

  // Public non-sensitive room existence check
  app.get('/api/rooms/:code/status', (req, res) => {
    const code = sanitizeRoomCode(req.params.code);
    const room = rooms.get(code);
    if (!room) {
      res.status(404).json({ error: 'Ruangan tidak ditemukan.' });
      return;
    }
    res.json({
      code: room.code,
      title: room.title,
      status: room.status,
      playerCount: room.players.size,
      maxPlayers: MAX_PLAYERS_PER_ROOM,
    });
  });

  // Join existing room securely using Room Code + Security PIN (rate-limited & scrypt verified)
  app.post('/api/rooms/join', (req, res) => {
    const ip = getClientIp(req);
    const roomCode = sanitizeRoomCode(req.body?.roomCode);
    const securityCode = sanitizePin(req.body?.securityCode);
    const playerName = sanitizeDisplayName(req.body?.playerName);

    const rateKey = `${ip}:${roomCode || 'global'}`;
    const rateCheck = checkRateLimit(rateKey);
    if (!rateCheck.allowed) {
      res.status(429).json({
        error: `Terlalu banyak percobaan kode salah. Coba lagi dalam ${rateCheck.retryAfterSec} detik.`,
      });
      return;
    }

    if (roomCode.length !== 6) {
      res.status(400).json({ error: 'Kode ruangan harus terdiri dari 6 huruf/angka.' });
      return;
    }
    if (playerName.length < 2) {
      res.status(400).json({ error: 'Nama peserta minimal 2 karakter.' });
      return;
    }
    if (securityCode.length < 4) {
      recordJoinFailure(rateKey);
      res.status(400).json({ error: 'Kode keamanan ruangan (PIN) tidak valid.' });
      return;
    }

    const room = rooms.get(roomCode);
    if (!room) {
      recordJoinFailure(rateKey);
      res.status(404).json({ error: 'Kode ruangan atau kode keamanan salah.' });
      return;
    }

    const candidateHash = hashPin(securityCode, room.pinSalt);
    if (!crypto.timingSafeEqual(candidateHash, room.pinHash)) {
      recordJoinFailure(rateKey);
      res.status(401).json({ error: 'Kode ruangan atau kode keamanan salah.' });
      return;
    }

    if (room.players.size >= MAX_PLAYERS_PER_ROOM) {
      res.status(409).json({ error: 'Ruangan sudah penuh.' });
      return;
    }

    const duplicateName = Array.from(room.players.values()).some(
      (p) => p.name.toLowerCase() === playerName.toLowerCase()
    );
    if (duplicateName) {
      res.status(409).json({ error: 'Nama tersebut sudah digunakan di ruangan ini. Gunakan nama lain.' });
      return;
    }

    const playerId = crypto.randomUUID();
    const playerToken = crypto.randomBytes(24).toString('hex');

    const newPlayer: PlayerState = {
      id: playerId,
      name: playerName,
      tokenHash: hashToken(playerToken),
      isHost: false,
      connected: false,
      score: 0,
      correctCount: 0,
      streak: 0,
      answeredIndices: new Set<number>(),
      syaratBasisCorrect: 0,
      syaratBasisTotal: 0,
      socket: null,
    };

    room.players.set(playerId, newPlayer);

    res.status(200).json({
      roomCode: room.code,
      title: room.title,
      playerId,
      playerToken,
      isHost: false,
    });
  });

  if (!IS_PROD) {
    const vite = await import('vite');
    const viteServer = await vite.createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(viteServer.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexHtml = path.join(distPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build belum tersedia.');
      }
    });
  }

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const reqUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    if (reqUrl.pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws);
      });
    } else {
      // Allow Vite HMR websocket or other paths to pass or close cleanly if unhandled
      if (IS_PROD) {
        socket.destroy();
      }
    }
  });

  wss.on('connection', (ws) => {
    let boundRoom: RoomState | null = null;
    let boundPlayer: PlayerState | null = null;

    ws.on('message', (raw) => {
      let msg: { event?: string; payload?: Record<string, unknown> };
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (msg.event === 'room:auth') {
        const roomCode = sanitizeRoomCode(msg.payload?.roomCode);
        const playerId = typeof msg.payload?.playerId === 'string' ? msg.payload.playerId : '';
        const playerToken = typeof msg.payload?.playerToken === 'string' ? msg.payload.playerToken : '';

        const room = rooms.get(roomCode);
        const player = room?.players.get(playerId);
        if (!room || !player || !playerToken) {
          ws.send(JSON.stringify({ event: 'room:error', payload: { message: 'Sesi ruangan tidak valid.' } }));
          ws.close();
          return;
        }

        const candidateTokenHash = hashToken(playerToken);
        if (!crypto.timingSafeEqual(candidateTokenHash, player.tokenHash)) {
          ws.send(JSON.stringify({ event: 'room:error', payload: { message: 'Token peserta tidak sah.' } }));
          ws.close();
          return;
        }

        boundRoom = room;
        boundPlayer = player;
        player.socket = ws;
        player.connected = true;

        sendToPlayer(player, 'room:state', {
          ...buildPublicRoomSnapshot(room),
          selfId: player.id,
          isHost: player.isHost,
        });

        broadcastRoom(room, 'room:players', {
          players: serializeLeaderboard(room),
        });
        return;
      }

      if (!boundRoom || !boundPlayer) {
        ws.send(JSON.stringify({ event: 'room:error', payload: { message: 'Belum terautentikasi ke ruangan.' } }));
        return;
      }

      if (msg.event === 'race:start') {
        if (!boundPlayer.isHost) return;
        if (boundRoom.status !== 'waiting' && boundRoom.status !== 'finished') return;

        // Fresh 10 dynamic randomized questions on every start / rematch!
        if (boundRoom.status === 'finished') {
          boundRoom.roundNumber += 1;
          boundRoom.questions = generateDynamicRaceQuestions(RACE_QUESTION_COUNT);
        }

        for (const p of boundRoom.players.values()) {
          p.score = 0;
          p.correctCount = 0;
          p.streak = 0;
          p.answeredIndices.clear();
          p.syaratBasisCorrect = 0;
          p.syaratBasisTotal = 0;
        }

        startQuestion(boundRoom, 0);
        return;
      }

      if (msg.event === 'race:answer') {
        if (boundRoom.status !== 'active') return;
        const qIndex = Number(msg.payload?.questionIndex);
        const optIndex = Number(msg.payload?.optionIndex);

        if (qIndex !== boundRoom.currentQuestionIndex) return;
        if (!Number.isInteger(optIndex) || optIndex < 0 || optIndex > 3) return;
        if (boundPlayer.answeredIndices.has(qIndex)) return;

        const q = boundRoom.questions[qIndex];
        if (!q) return;

        boundPlayer.answeredIndices.add(qIndex);
        const isCorrect = optIndex === q.correctIndex;
        const elapsed = Math.max(0, Date.now() - boundRoom.questionStartedAt);
        const speedRatio = Math.max(0, 1 - elapsed / QUESTION_DURATION_MS);
        const earned = isCorrect ? 100 + Math.round(speedRatio * 50) : 0;

        if (isCorrect) {
          boundPlayer.score += earned;
          boundPlayer.correctCount += 1;
          boundPlayer.streak += 1;
        } else {
          boundPlayer.streak = 0;
        }

        if (q.topic === 'syarat-basis') {
          boundPlayer.syaratBasisTotal += 1;
          if (isCorrect) boundPlayer.syaratBasisCorrect += 1;
        }

        sendToPlayer(boundPlayer, 'race:answer_ack', {
          questionIndex: qIndex,
          selectedOption: optIndex,
          correct: isCorrect,
          correctIndex: q.correctIndex,
          earnedPoints: earned,
          steps: q.steps,
        });

        broadcastRoom(boundRoom, 'room:players', {
          players: serializeLeaderboard(boundRoom),
        });

        // If all connected players answered, reveal & move on promptly
        const connectedPlayers = Array.from(boundRoom.players.values()).filter((p) => p.connected);
        const allAnswered =
          connectedPlayers.length > 0 &&
          connectedPlayers.every((p) => p.answeredIndices.has(qIndex));
        if (allAnswered) {
          revealAndAdvance(boundRoom);
        }
      }
    });

    ws.on('close', () => {
      if (boundPlayer && boundRoom) {
        if (boundPlayer.socket === ws) {
          boundPlayer.connected = false;
          boundPlayer.socket = null;
          broadcastRoom(boundRoom, 'room:players', {
            players: serializeLeaderboard(boundRoom),
          });
        }
      }
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server berjalan di http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
