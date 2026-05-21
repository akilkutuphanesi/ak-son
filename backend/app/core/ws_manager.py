"""
WebSocket Connection Manager — Study Rooms
Sunucu yeniden başlayana kadar bağlantıları in-memory tutar.
Redis gerektirmez, tek sunucu için yeterli.
"""
from fastapi import WebSocket
from typing import Dict, List
import json
from datetime import datetime


class ConnectionManager:
    def __init__(self):
        # { room_id: [ {ws, user_id, display_name, avatar_url} ] }
        self.active: Dict[int, List[dict]] = {}
        # { room_id: { is_running, duration, remaining, last_updated, timer_type, session } }
        self.timers = {}

    # ── Timer Yardımcıları ────────────────────────────────────
    def update_timer(self, room_id: int, action: str, duration: int = None,
                     remaining: int = None, timer_type: str = None, session: int = None):
        if room_id not in self.timers:
            self.timers[room_id] = {
                "is_running": False,
                "duration": 1500,
                "remaining": 1500,
                "last_updated": datetime.now(),
                "timer_type": "work",
                "session": 1
            }

        timer = self.timers[room_id]
        
        # Calculate dynamic remaining time before state change
        current_remaining = self.get_remaining_time(room_id)
        
        if action == "start":
            timer["is_running"] = True
            timer["last_updated"] = datetime.now()
            if remaining is not None:
                timer["remaining"] = remaining
            else:
                timer["remaining"] = current_remaining
        elif action == "pause":
            if timer["is_running"]:
                timer["remaining"] = current_remaining
                timer["is_running"] = False
            timer["last_updated"] = datetime.now()
        elif action == "reset":
            timer["is_running"] = False
            reset_duration = duration if duration is not None else timer["duration"]
            timer["duration"] = reset_duration
            timer["remaining"] = reset_duration
            timer["timer_type"] = "work"
            timer["session"] = 1
            timer["last_updated"] = datetime.now()
        elif action == "sync":
            if remaining is not None:
                timer["remaining"] = remaining
            if duration is not None:
                timer["duration"] = duration
            if timer_type is not None:
                timer["timer_type"] = timer_type
            if session is not None:
                timer["session"] = session
            timer["last_updated"] = datetime.now()
            
        if duration is not None:
            timer["duration"] = duration
        if timer_type is not None:
            timer["timer_type"] = timer_type
        if session is not None:
            timer["session"] = session

    def get_remaining_time(self, room_id: int) -> int:
        if room_id not in self.timers:
            return 1500
        timer = self.timers[room_id]
        if not timer["is_running"]:
            return timer["remaining"]
        elapsed = (datetime.now() - timer["last_updated"]).total_seconds()
        rem = int(timer["remaining"] - elapsed)
        return max(0, rem)

    def get_timer_state(self, room_id: int) -> dict:
        if room_id not in self.timers:
            return {
                "is_running": False,
                "duration": 1500,
                "remaining": 1500,
                "timer_type": "work",
                "session": 1
            }
        timer = self.timers[room_id]
        rem = self.get_remaining_time(room_id)
        return {
            "is_running": timer["is_running"],
            "duration": timer["duration"],
            "remaining": rem,
            "timer_type": timer["timer_type"],
            "session": timer["session"]
        }

    # ── Bağlan ────────────────────────────────────────────────
    async def connect(self, room_id: int, websocket: WebSocket, user_id: int,
                      display_name: str, avatar_url: str | None):
        await websocket.accept()
        if room_id not in self.active:
            self.active[room_id] = []
        self.active[room_id].append({
            "ws":           websocket,
            "user_id":      user_id,
            "display_name": display_name,
            "avatar_url":   avatar_url,
        })

    # ── Bağlantıyı kaldır ─────────────────────────────────────
    def disconnect(self, room_id: int, websocket: WebSocket):
        if room_id in self.active:
            self.active[room_id] = [
                c for c in self.active[room_id] if c["ws"] != websocket
            ]
            if not self.active[room_id]:
                del self.active[room_id]

    # ── Odadaki katılımcı sayısı ───────────────────────────────
    def participant_count(self, room_id: int) -> int:
        return len(self.active.get(room_id, []))

    # ── Odadaki aktif kullanıcı listesi ───────────────────────
    def room_users(self, room_id: int) -> list:
        return [
            {"user_id": c["user_id"], "display_name": c["display_name"], "avatar_url": c["avatar_url"]}
            for c in self.active.get(room_id, [])
        ]

    # ── Odaya broadcast ───────────────────────────────────────
    async def broadcast(self, room_id: int, payload: dict):
        if room_id not in self.active:
            return
        dead = []
        for conn in self.active[room_id]:
            try:
                await conn["ws"].send_json(payload)
            except Exception:
                dead.append(conn)
        # Kopuk bağlantıları temizle
        for d in dead:
            self.active[room_id].remove(d)

    # ── Belirli bir kullanıcıya mesaj ─────────────────────────
    async def send_to_user(self, room_id: int, user_id: int, payload: dict):
        for conn in self.active.get(room_id, []):
            if conn["user_id"] == user_id:
                try:
                    await conn["ws"].send_json(payload)
                except Exception:
                    pass

    # ── Tüm odaların özeti (Admin için) ───────────────────────
    def all_rooms_summary(self) -> list:
        return [
            {"room_id": rid, "online_count": len(conns)}
            for rid, conns in self.active.items()
        ]


# Uygulama genelinde tek instance
manager = ConnectionManager()
