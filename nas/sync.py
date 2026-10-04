"""学習記録の同期サーバー（NASのDockerで動かす）。

GET  /api/state/<key>          -> {"rev": n, "data": {...}}
PUT  /api/state/<key>  {"rev": n, "data": {...}}
     rev が保存中の値と同じなら保存して rev+1 を返す。違えば 409 と最新の内容を返す（端末側で統合して出し直す）。
key は denko2（学習ダッシュボード）と drill（過去問200選）のみ。保存先は /data/<key>.json、毎日1つ /data/backup/ に控えを残す。
"""
import json, os, re, threading, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

DATA = os.environ.get('DATA_DIR', '/data')
KEYS = {'denko2', 'drill'}
MAX_BODY = 5 * 1024 * 1024
lock = threading.Lock()
os.makedirs(os.path.join(DATA, 'backup'), exist_ok=True)

def path(key): return os.path.join(DATA, key + '.json')

def load(key):
    try:
        with open(path(key), encoding='utf-8') as f: return json.load(f)
    except FileNotFoundError:
        return {'rev': 0, 'data': None}

def store(key, doc):
    tmp = path(key) + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f: json.dump(doc, f, ensure_ascii=False)
    os.replace(tmp, path(key))
    day = time.strftime('%Y%m%d')
    bk = os.path.join(DATA, 'backup', f'{key}-{day}.json')
    if not os.path.exists(bk):
        with open(bk, 'w', encoding='utf-8') as f: json.dump(doc, f, ensure_ascii=False)

class H(BaseHTTPRequestHandler):
    def _send(self, code, obj):
        b = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(b)))
        self.end_headers(); self.wfile.write(b)

    def _key(self):
        m = re.fullmatch(r'/api/state/([a-z0-9]+)', self.path.split('?')[0])
        return m.group(1) if m and m.group(1) in KEYS else None

    def do_GET(self):
        if self.path == '/api/health': return self._send(200, {'ok': True})
        k = self._key()
        if not k: return self._send(404, {'error': 'not found'})
        with lock: self._send(200, load(k))

    def do_PUT(self):
        k = self._key()
        if not k: return self._send(404, {'error': 'not found'})
        n = int(self.headers.get('Content-Length') or 0)
        if n <= 0 or n > MAX_BODY: return self._send(413, {'error': 'too large'})
        try:
            body = json.loads(self.rfile.read(n))
            rev, data = int(body['rev']), body['data']
            if not isinstance(data, dict): raise ValueError
        except Exception:
            return self._send(400, {'error': 'bad request'})
        with lock:
            cur = load(k)
            if rev != cur['rev']: return self._send(409, cur)
            doc = {'rev': cur['rev'] + 1, 'data': data, 'saved': int(time.time() * 1000)}
            store(k, doc)
        self._send(200, {'rev': doc['rev']})

    def log_message(self, *a): pass

if __name__ == '__main__':
    ThreadingHTTPServer(('0.0.0.0', 8000), H).serve_forever()
