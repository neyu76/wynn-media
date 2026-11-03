"""T002 SFX track: kit synth cues (audio_kit) + ElevenLabs foley (paint can, pipette squeeze; 60 ms fades).
usage: python3 -I build_sfx.py <kit_production_dir> <episode_dir> <out.wav> <dur>"""
import sys, json, subprocess, importlib.util, numpy as np
kitp, ep, out, dur = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
spec = importlib.util.spec_from_file_location('audio_kit', kitp + '/audio_kit.py'); ak = importlib.util.module_from_spec(spec); spec.loader.exec_module(ak)
SR = ak.SR
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).astype(float); return x / (np.abs(x).max() + 1e-9) * 0.9
EL = {k: load(f'{ep}/audio/sfx_el/{k}.mp3') for k in ('can', 'pipette')}
def cut(x, d, f=0.06):
    y = x[:int(d * SR)].copy(); k = int(f * SR); y[:k] *= np.linspace(0, 1, k); y[-k:] *= np.linspace(1, 0, k); return y
# t (video s), name, gain, [dur for EL cues]   word marks: voice/align.json + 0.10; impacts match setKicks in main.js
EV = [(0.2, 'pop', 0.24), (1.3, 'sparkle', 0.22), (2.48, 'ting', 0.26),
      (3.05, 'whoosh', 0.24), (3.9, 'thump', 0.3), (5.14, 'pop', 0.3), (5.75, 'boing', 0.18), (6.52, 'pop', 0.3), (7.12, 'boing', 0.18),
      (7.8, 'whoosh_fast', 0.18), (9.9, 'flipclick', 0.26),
      (10.4, 'whoosh', 0.24), (10.95, 'can', 0.5, 0.9), (11.25, 'can', 0.42, 0.8), (12.55, 'pipette', 0.5, 0.7), (13.05, 'pipette', 0.5, 0.7),
      (14.85, 'pop', 0.32), (15.5, 'ting', 0.34), (16.54, 'thump', 0.4), (16.65, 'boing', 0.2), (17.4, 'whoosh_fast', 0.18),
      (18.7, 'whoosh', 0.24), (20.0, 'pop', 0.22), (21.9, 'flipclick', 0.3), (23.16, 'sparkle', 0.22), (24.0, 'flipclick', 0.3), (25.25, 'pop', 0.3), (25.6, 'ting', 0.26),
      (26.9, 'whoosh', 0.24), (27.35, 'paper', 0.34), (28.55, 'thump', 0.3), (30.1, 'pop', 0.24), (32.34, 'whoosh_fast', 0.2), (33.4, 'riser', 0.2), (35.6, 'ting', 0.26),
      (36.8, 'paper', 0.34), (37.95, 'whoosh', 0.22), (39.67, 'pop', 0.22), (40.7, 'boing', 0.18), (42.36, 'can', 0.5, 0.7), (42.5, 'thump', 0.36),
      (44.04, 'sparkle', 0.2), (45.2, 'whoosh', 0.24), (45.62, 'ting', 0.32), (46.71, 'bell', 0.2)]
buf = np.zeros(int(SR * dur))
for e in EV:
    t, name, g = e[:3]
    x = cut(EL[name], e[3]) if name in EL else ak.SFX[name]()
    ak.place(buf, x, t, g)
ak.write(out, ak.norm(buf, 0.9) if np.abs(buf).max() > 0.9 else buf)
json.dump([{'t': e[0], 'name': e[1], 'gain': e[2], **({'dur': e[3]} if len(e) > 3 else {})} for e in EV], open(out.replace('.wav', '_events.json'), 'w'), indent=0)
print(len(EV), 'cues ->', out)
