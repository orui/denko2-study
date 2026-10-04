// 学習記録の同期（NASの /api/state/<key> と端末のブラウザ保存を統合する）
// 使い方：Sync.init({key, sections, get, set, onChange}) を呼び、記録を保存するたびに Sync.touch()。
// 記録は「セクション（days・cards など）→ 項目」の形で持ち、項目ごとの最終更新時刻（_mt）が新しい方を採用する。
// 「すべて消す」は Sync.clear() で時刻（_clr）を残し、それより古い項目を全端末で消す。
(function(){
  const API = '/api/state/';
  let cfg = null, snap = {}, busy = false, again = false, timer = null, lastOk = 0, online = null;
  const id = (sec, k) => sec + '\t' + k;
  const now = () => Date.now();

  function meta(s){ if(!s._mt) s._mt = {}; return s._mt; }
  // 前回の保存から変わった項目に更新時刻を付ける
  function mark(){
    const s = cfg.get(), mt = meta(s), t = now();
    cfg.sections.forEach(sec => {
      const o = s[sec] || {};
      Object.keys(o).forEach(k => { const j = JSON.stringify(o[k]), i = id(sec, k); if(snap[i] !== j){ mt[i] = Math.max(t, (mt[i] || 0) + 1); snap[i] = j; } });
    });
  }
  function takeSnap(s){
    snap = {}; const mt = meta(s);
    cfg.sections.forEach(sec => Object.keys(s[sec] || {}).forEach(k => { const i = id(sec, k); snap[i] = JSON.stringify(s[sec][k]); if(!mt[i]) mt[i] = 1; }));
  }
  function merge(a, b){
    if(!b) return a;
    const out = JSON.parse(JSON.stringify(a)), ma = a._mt || {}, mb = b._mt || {}, mt = {};
    const clr = Math.max(a._clr || 0, b._clr || 0);
    cfg.sections.forEach(sec => {
      const A = a[sec] || {}, B = b[sec] || {}, R = {};
      new Set([...Object.keys(A), ...Object.keys(B)]).forEach(k => {
        const i = id(sec, k), ta = k in A ? (ma[i] || 1) : -1, tb = k in B ? (mb[i] || 1) : -1;
        const t = Math.max(ta, tb); if(t < clr) return;
        R[k] = JSON.parse(JSON.stringify(ta >= tb ? A[k] : B[k])); mt[i] = t;
      });
      out[sec] = R;
    });
    out._mt = mt; if(clr) out._clr = clr;
    return out;
  }
  function status(text, ok){
    const el = document.getElementById('syncStatus'); if(!el) return;
    el.textContent = text; el.dataset.ok = ok ? '1' : '0';
  }
  function hhmm(t){ const d = new Date(t); return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); }

  async function run(){
    if(busy){ again = true; return; }
    busy = true; again = false;
    try{
      mark();
      for(let tries = 0; tries < 3; tries++){
        const r = await fetch(API + cfg.key, {cache: 'no-store'});
        if(!r.ok) throw new Error('HTTP ' + r.status);
        const remote = await r.json();
        const local = cfg.get(), merged = merge(local, remote.data);
        const changed = JSON.stringify(merged) !== JSON.stringify(local);
        if(changed){ cfg.set(merged); takeSnap(merged); cfg.save(); if(cfg.onChange) cfg.onChange(); }
        if(remote.data && JSON.stringify(remote.data) === JSON.stringify(merged)) break; // NASも同じ内容なら送らない
        const p = await fetch(API + cfg.key, {method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({rev: remote.rev, data: merged})});
        if(p.status === 409) continue;
        if(!p.ok) throw new Error('HTTP ' + p.status);
        break;
      }
      lastOk = now(); online = true; status('同期済み ' + hhmm(lastOk), true);
    }catch(e){
      online = false; status('未同期（NASにつながっていません）', false);
    }finally{
      busy = false;
      if(again) setTimeout(run, 300);
    }
  }
  window.Sync = {
    init(c){
      cfg = c;
      if(location.protocol === 'file:'){ status('このMacだけに保存', false); return; }
      takeSnap(cfg.get());
      run();
      document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'visible') run(); });
      window.addEventListener('online', run);
      setInterval(() => { if(document.visibilityState === 'visible') run(); }, 60000);
    },
    // 記録を保存したあとに呼ぶ（1.5秒まとめてから同期する）
    touch(){ if(!cfg || location.protocol === 'file:') return; mark(); clearTimeout(timer); timer = setTimeout(run, 1500); },
    // 記録をすべて消したとき：消した時刻を残して、他の端末でも消えるようにする
    clear(){ if(!cfg) return; const s = cfg.get(); s._clr = now(); s._mt = {}; snap = {}; this.touch(); },
    // データの読み込みで記録を丸ごと入れ替えたとき
    replaced(){ if(!cfg) return; const s = cfg.get(), mt = meta(s), t = now(); cfg.sections.forEach(sec => Object.keys(s[sec] || {}).forEach(k => { mt[id(sec, k)] = t; })); takeSnap(s); this.touch(); },
    now: run, _merge: (a, b) => merge(a, b)
  };
})();
