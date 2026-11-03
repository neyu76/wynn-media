"""T012 SFX track: kit synth cues (audio_kit) + ElevenLabs foley (stylus in clay, copper ingots; 60 ms fades).
usage: python3 -I build_sfx.py <kit_production_dir> <episode_dir> <out.wav> <dur>"""
import sys, json, subprocess, importlib.util, numpy as np
kitp, ep, out, dur = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
spec = importlib.util.spec_from_file_location('audio_kit', kitp + '/audio_kit.py'); ak = importlib.util.module_from_spec(spec); spec.loader.exec_module(ak)
SR = ak.SR
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).astype(float); return x / (np.abs(x).max() + 1e-9) * 0.9
EL = {k: load(f'{ep}/audio/sfx_el/{k}.mp3') for k in ('stylus', 'ingots')}
def cut(x, d, f=0.06):
    y = x[:int(d * SR)].copy(); k = int(f * SR); y[:k] *= np.linspace(0, 1, k); y[-k:] *= np.linspace(1, 0, k); return y
# t (video s), name, gain, [dur for EL cues]   word marks: voice/align.json + 0.10; impacts match setKicks in main.js
EV = [(0.15, 'stylus', 0.5, 1.6), (0.3, 'pop', 0.24), (1.17, 'thump', 0.4), (1.9, 'sparkle', 0.24),
      (3.05, 'whoosh', 0.24), (3.85, 'pop', 0.28), (5.35, 'pop', 0.28), (6.05, 'flipclick', 0.34), (7.3, 'ingots', 0.5, 0.9), (8.05, 'thump', 0.4),
      (9.08, 'ingots', 0.36, 0.7), (9.7, 'boing', 0.2), (10.95, 'whoosh', 0.24), (11.2, 'sparkle', 0.3), (12.6, 'ingots', 0.36, 0.7), (14.2, 'clang', 0.2),
      (15.5, 'whoosh_fast', 0.2), (16.35, 'ting', 0.3), (17.5, 'paper', 0.3), (18.5, 'pop', 0.26), (20.15, 'whoosh', 0.24), (20.3, 'pop', 0.3),
      (20.88, 'thump', 0.36), (21.28, 'pop', 0.3), (21.78, 'thump', 0.36), (22.2, 'stylus', 0.55, 1.5), (22.9, 'pop', 0.28), (23.7, 'riser', 0.22),
      (26.85, 'whoosh', 0.24), (27.3, 'pop', 0.3), (30.5, 'ting', 0.32), (31.6, 'pop', 0.24), (32.4, 'whoosh_fast', 0.18), (33.8, 'whoosh_fast', 0.18),
      (34.95, 'whoosh', 0.22), (35.4, 'riser', 0.16), (36.65, 'whoosh', 0.28), (38.0, 'bell', 0.16), (40.4, 'pop', 0.2), (44.25, 'crowd_laugh', 0.2),
      (46.0, 'thump', 0.4)]
buf = np.zeros(int(SR * dur))
for e in EV:
    t, name, g = e[:3]
    x = cut(EL[name], e[3]) if name in EL else ak.SFX[name]()
    ak.place(buf, x, t, g)
ak.write(out, ak.norm(buf, 0.9) if np.abs(buf).max() > 0.9 else buf)
json.dump([{'t': e[0], 'name': e[1], 'gain': e[2], **({'dur': e[3]} if len(e) > 3 else {})} for e in EV], open(out.replace('.wav', '_events.json'), 'w'), indent=0)
print(len(EV), 'cues ->', out)
