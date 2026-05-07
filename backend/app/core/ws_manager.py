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
