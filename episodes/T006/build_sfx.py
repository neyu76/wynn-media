"""T006 SFX track: kit synth cues (audio_kit) + ElevenLabs foley (chess piece, clockwork, applause; 60 ms fades).
usage: python3 -I build_sfx.py <kit_production_dir> <episode_dir> <out.wav> <dur>"""
import sys, json, subprocess, importlib.util, numpy as np
kitp, ep, out, dur = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
spec = importlib.util.spec_from_file_location('audio_kit', kitp + '/audio_kit.py'); ak = importlib.util.module_from_spec(spec); spec.loader.exec_module(ak)
SR = ak.SR
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).astype(float); return x / (np.abs(x).max() + 1e-9) * 0.9
EL = {k: load(f'{ep}/audio/sfx_el/{k}.mp3') for k in ('piece', 'gears', 'applause')}
def cut(x, d, f=0.06):
    y = x[:int(d * SR)].copy(); k = int(f * SR); y[:k] *= np.linspace(0, 1, k); y[-k:] *= np.linspace(1, 0, k); return y
# t (video s), name, gain, [dur for EL cues]   word marks: voice/align.json + 0.10; impacts match setKicks in main.js
EV = [(0.3, 'gears', 0.3, 0.45), (1.27, 'piece', 0.55, 0.6), (1.35, 'applause', 0.32, 1.9), (2.0, 'whoosh_fast', 0.2), (2.88, 'sparkle', 0.24),
      (3.42, 'whoosh', 0.24), (5.26, 'pop', 0.26), (6.12, 'ting', 0.24), (6.9, 'whoosh_fast', 0.18), (7.92, 'whoosh', 0.2), (9.37, 'gears', 0.3, 0.45),
      (10.6, 'whoosh', 0.22), (11.86, 'piece', 0.5, 0.6), (12.42, 'pop', 0.2), (13.2, 'gears', 0.32, 0.45), (13.89, 'piece', 0.55, 0.6), (14.6, 'whoosh_fast', 0.16),
      (15.94, 'sparkle', 0.2), (17.16, 'whoosh', 0.2), (17.5, 'boing', 0.18),
      (18.95, 'whoosh', 0.24), (19.1, 'flipclick', 0.3), (20.43, 'pop', 0.3), (21.79, 'ting', 0.3), (22.3, 'pop', 0.26), (24.17, 'piece', 0.45, 0.6), (24.2, 'clang', 0.14),
      (24.6, 'whoosh_fast', 0.16), (25.45, 'pop', 0.26), (26.1, 'gears', 0.36, 0.45), (26.5, 'gears', 0.3, 0.45), (27.05, 'piece', 0.55, 0.6),
      (27.45, 'whoosh', 0.22), (28.1, 'piece', 0.42, 0.6), (28.6, 'gears', 0.34, 0.45), (29.01, 'piece', 0.55, 0.6), (29.6, 'flipclick', 0.26), (30.85, 'sparkle', 0.2),
      (31.91, 'thump', 0.4), (32.0, 'flipclick', 0.3), (33.0, 'ting', 0.28), (34.45, 'whoosh', 0.22), (34.9, 'flipclick', 0.26),
      (35.7, 'whoosh', 0.22), (36.3, 'applause', 0.36, 2.0), (36.57, 'bell', 0.16), (37.5, 'pop', 0.2), (38.4, 'whoosh_fast', 0.16), (39.0, 'applause', 0.28, 2.0),
      (39.8, 'whoosh', 0.22), (40.1, 'sparkle', 0.18), (41.85, 'ting', 0.26), (43.2, 'applause', 0.36, 2.0), (43.9, 'whoosh', 0.2),
      (44.4, 'whoosh', 0.22), (44.6, 'ting', 0.3), (45.88, 'whoosh_fast', 0.2), (46.0, 'applause', 0.4, 1.95), (46.2, 'thump', 0.3)]
buf = np.zeros(int(SR * dur))
for e in EV:
    t, name, g = e[:3]
    x = cut(EL[name], e[3]) if name in EL else ak.SFX[name]()
    ak.place(buf, x, t, g)
ak.write(out, ak.norm(buf, 0.9) if np.abs(buf).max() > 0.9 else buf)
json.dump([{'t': e[0], 'name': e[1], 'gain': e[2], **({'dur': e[3]} if len(e) > 3 else {})} for e in EV], open(out.replace('.wav', '_events.json'), 'w'), indent=0)
print(len(EV), 'cues ->', out)
