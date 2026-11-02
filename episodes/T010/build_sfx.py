"""T010 SFX track: kit synth cues (audio_kit) + ElevenLabs foley (chairs, awning, lemonade pour; 60 ms fades).
usage: python3 -I build_sfx.py <kit_production_dir> <episode_dir> <out.wav> <dur>"""
import sys, json, subprocess, importlib.util, numpy as np
kitp, ep, out, dur = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
spec = importlib.util.spec_from_file_location('audio_kit', kitp + '/audio_kit.py'); ak = importlib.util.module_from_spec(spec); spec.loader.exec_module(ak)
SR = ak.SR
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).astype(float); return x / (np.abs(x).max() + 1e-9) * 0.9
EL = {k: load(f'{ep}/audio/sfx_el/{k}.mp3') for k in ('chairs', 'awning', 'pour')}
def cut(x, d, f=0.06):  # trim x to d seconds with fades
    y = x[:int(d * SR)].copy(); k = int(f * SR); y[:k] *= np.linspace(0, 1, k); y[-k:] *= np.linspace(1, 0, k); return y
# t (video s), name, gain, [dur for EL cues]   word marks: voice/align.json + 0.10 (≈1 cue / 1.5 s, quiet around the closer)
EV = [(0.12, 'whoosh', 0.25), (1.70, 'coins', 0.42),
      (4.10, 'pop', 0.28), (4.60, 'pop', 0.28), (5.10, 'pop', 0.28), (5.62, 'thump', 0.38), (7.62, 'ting', 0.34), (8.10, 'sparkle', 0.30),
      (11.65, 'wind', 0.22), (12.50, 'whoosh', 0.28), (13.00, 'riser', 0.22), (15.15, 'chairs', 0.45, 2.0), (17.60, 'pop', 0.26),
      (19.20, 'pour', 0.28, 1.0), (21.05, 'chairs', 0.32, 1.4), (22.80, 'whoosh', 0.28), (24.80, 'thump', 0.30), (26.02, 'flipclick', 0.40),
      (27.13, 'paper', 0.34), (28.30, 'boing', 0.28), (30.50, 'coins', 0.42), (31.38, 'paper', 0.40), (31.85, 'whoosh', 0.26),
      (32.90, 'clang', 0.16), (33.30, 'clang', 0.14), (33.80, 'awning', 0.55, 2.4), (36.40, 'sparkle', 0.28), (37.85, 'chairs', 0.42, 2.0),
      (39.55, 'coins', 0.38), (40.15, 'whoosh', 0.26), (42.25, 'ting', 0.34), (43.85, 'paper', 0.40), (44.85, 'crickets', 0.30),
      (46.45, 'thump', 0.40), (47.30, 'pour', 0.42, 1.0), (48.30, 'coins', 0.42), (49.70, 'sparkle', 0.22)]
buf = np.zeros(int(SR * dur))
for e in EV:
    t, name, g = e[:3]
    x = cut(EL[name], e[3]) if name in EL else ak.SFX[name]()
    ak.place(buf, x, t, g)
ak.write(out, ak.norm(buf, 0.9) if np.abs(buf).max() > 0.9 else buf)
json.dump([{'t': e[0], 'name': e[1], 'gain': e[2], **({'dur': e[3]} if len(e) > 3 else {})} for e in EV], open(out.replace('.wav', '_events.json'), 'w'), indent=0)
print(len(EV), 'cues ->', out)
