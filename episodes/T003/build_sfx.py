"""T003 SFX track: kit synth cues (audio_kit) + ElevenLabs foley (hand press, newspaper; 60 ms fades).
usage: python3 -I build_sfx.py <kit_production_dir> <episode_dir> <out.wav> <dur>"""
import sys, json, subprocess, importlib.util, numpy as np
kitp, ep, out, dur = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
spec = importlib.util.spec_from_file_location('audio_kit', kitp + '/audio_kit.py'); ak = importlib.util.module_from_spec(spec); spec.loader.exec_module(ak)
SR = ak.SR
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).astype(float); return x / (np.abs(x).max() + 1e-9) * 0.9
EL = {k: load(f'{ep}/audio/sfx_el/{k}.mp3') for k in ('press', 'paper')}
def cut(x, d, f=0.06):
    y = x[:int(d * SR)].copy(); k = int(f * SR); y[:k] *= np.linspace(0, 1, k); y[-k:] *= np.linspace(1, 0, k); return y
# t (video s), name, gain, [dur for EL cues]   word marks: voice/align.json + 0.10
EV = [(0.1, 'paper', 0.35, 0.8), (0.75, 'pop', 0.3), (1.0, 'boing', 0.22), (1.5, 'sparkle', 0.26), (2.78, 'thump', 0.42),
      (3.45, 'whoosh', 0.26), (3.7, 'flipclick', 0.42), (5.62, 'pop', 0.24), (5.85, 'pop', 0.24), (6.1, 'pop', 0.24), (7.3, 'paper', 0.3, 0.7),
      (8.65, 'pop', 0.3), (10.6, 'ting', 0.3), (11.5, 'sparkle', 0.3), (12.9, 'whoosh', 0.26), (14.6, 'whoosh_fast', 0.2), (16.3, 'paper', 0.45, 1.2),
      (17.9, 'sparkle', 0.3), (19.65, 'pop', 0.3), (21.15, 'whoosh', 0.26), (22.15, 'flipclick', 0.28), (24.4, 'clang', 0.18), (25.75, 'thump', 0.45),
      (27.0, 'whoosh', 0.22), (28.35, 'pop', 0.28), (29.75, 'whoosh', 0.26), (30.2, 'riser', 0.2), (32.05, 'paper', 0.35, 0.6), (33.45, 'pop', 0.26),
      (33.9, 'paper', 0.32, 0.6), (35.5, 'whoosh', 0.3), (36.8, 'thump', 0.3), (37.15, 'whoosh', 0.24), (38.0, 'pop', 0.26), (39.5, 'pop', 0.26),
      (39.85, 'paper', 0.3, 0.5), (41.0, 'boing', 0.18), (42.4, 'whoosh_fast', 0.22), (44.6, 'paper', 0.3, 0.6), (45.85, 'whoosh', 0.24),
      (46.15, 'pop', 0.26), (47.1, 'press', 0.6, 2.0)]
buf = np.zeros(int(SR * dur))
for e in EV:
    t, name, g = e[:3]
    x = cut(EL[name], e[3]) if name in EL else ak.SFX[name]()
    ak.place(buf, x, t, g)
ak.write(out, ak.norm(buf, 0.9) if np.abs(buf).max() > 0.9 else buf)
json.dump([{'t': e[0], 'name': e[1], 'gain': e[2], **({'dur': e[3]} if len(e) > 3 else {})} for e in EV], open(out.replace('.wav', '_events.json'), 'w'), indent=0)
print(len(EV), 'cues ->', out)
