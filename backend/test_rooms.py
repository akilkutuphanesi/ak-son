"""Study Rooms API test script"""
import urllib.request
import urllib.parse
import json
import sys

BASE = "http://localhost:8000"

# 1. Register test user (zaten varsa 400 doner, sorun yok)
print("=== 1. REGISTER ===")
try:
    reg_data = json.dumps({"email": "test_room@test.com", "password": "test1234", "department": "Bilgisayar Muhendisligi"}).encode()
    req = urllib.request.Request(f"{BASE}/auth/register", data=reg_data, headers={"Content-Type": "application/json"})
    resp = urllib.request.urlopen(req)
    print("  Yeni kullanici olusturuldu")
except urllib.error.HTTPError as e:
    print(f"  Kullanici zaten var (status {e.code}), devam ediliyor...")

# 2. Login
print("\n=== 2. LOGIN ===")
data = urllib.parse.urlencode({"username": "test_room@test.com", "password": "test1234"}).encode()
try:
    req = urllib.request.Request(f"{BASE}/auth/login", data=data, headers={"Content-Type": "application/x-www-form-urlencoded"})
    resp = urllib.request.urlopen(req)
    token_data = json.loads(resp.read())
    token = token_data["access_token"]
    print(f"  Token alindi: {token[:30]}...")
except Exception as e:
    print(f"  Login basarisiz: {e}")
    sys.exit(1)

headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# 3. Oda listele
print("\n=== 3. ODALARI LISTELE ===")
req = urllib.request.Request(f"{BASE}/rooms", headers=headers)
resp = urllib.request.urlopen(req)
rooms = json.loads(resp.read())
print(f"  Aktif oda sayisi: {len(rooms)}")

# 4. Oda olustur
print("\n=== 4. ODA OLUSTUR ===")
room_data = json.dumps({"name": "Test Odasi", "topic": "Python Calisma", "max_participants": 5}).encode()
req = urllib.request.Request(f"{BASE}/rooms", data=room_data, headers=headers, method="POST")
resp = urllib.request.urlopen(req)
room = json.loads(resp.read())
room_id = room["id"]
print(f"  Oda olusturuldu: id={room_id}, name={room['name']}, katilimci={room['participant_count']}")

# 5. Oda detayi
print("\n=== 5. ODA DETAYI ===")
req = urllib.request.Request(f"{BASE}/rooms/{room_id}", headers=headers)
resp = urllib.request.urlopen(req)
detail = json.loads(resp.read())
print(f"  {detail['name']} | topic={detail['topic']} | host={detail['host_name']} | status={detail['status']}")

# 6. Mesaj gonder
print("\n=== 6. MESAJ GONDER ===")
msg_data = json.dumps({"content": "Merhaba! Bu bir test mesajidir."}).encode()
req = urllib.request.Request(f"{BASE}/rooms/{room_id}/messages", data=msg_data, headers=headers, method="POST")
resp = urllib.request.urlopen(req)
msg = json.loads(resp.read())
print(f"  Mesaj gonderildi: id={msg['id']}, sender={msg['sender_name']}")

# 7. Mesajlari listele
print("\n=== 7. MESAJLARI LISTELE ===")
req = urllib.request.Request(f"{BASE}/rooms/{room_id}/messages", headers=headers)
resp = urllib.request.urlopen(req)
messages = json.loads(resp.read())
print(f"  Toplam mesaj: {len(messages)}")
for m in messages:
    prefix = "[SISTEM]" if m["is_system"] else f"[{m['sender_name']}]"
    print(f"    {prefix} {m['content']}")

# 8. Katilimcilar
print("\n=== 8. KATILIMCILAR ===")
req = urllib.request.Request(f"{BASE}/rooms/{room_id}/participants", headers=headers)
resp = urllib.request.urlopen(req)
participants = json.loads(resp.read())
for p in participants:
    print(f"  - {p['display_name']}")

# 9. Seans bilgisi
print("\n=== 9. AKTIF SEANS ===")
req = urllib.request.Request(f"{BASE}/rooms/{room_id}/session", headers=headers)
resp = urllib.request.urlopen(req)
session = json.loads(resp.read())
print(f"  Seans #{session['session_number']} | tip={session['type']} | sure={session['duration_secs']}sn")

# 10. Odayi kapat
print("\n=== 10. ODAYI KAPAT ===")
req = urllib.request.Request(f"{BASE}/rooms/{room_id}/close", data=b"{}", headers=headers, method="POST")
resp = urllib.request.urlopen(req)
result = json.loads(resp.read())
print(f"  {result['message']}")

print("\n" + "="*50)
print("ALL TESTS PASSED!")
print("="*50)
