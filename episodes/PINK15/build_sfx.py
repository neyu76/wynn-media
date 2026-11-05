"""PINK15 SFX track: kit synth cues (audio_kit) + ElevenLabs foley (roller, pour/stir, cell door + steps, guards laughing), 60 ms fades.
usage: python3 -I build_sfx.py <kit_production_dir> <episode_win_dir> <out.wav> <dur>"""
import sys, json, subprocess, importlib.util, numpy as np
kitp, ep, out, dur = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
spec = importlib.util.spec_from_file_location('audio_kit', kitp + '/audio_kit.py'); ak = importlib.util.module_from_spec(spec); spec.loader.exec_module(ak)
SR = ak.SR
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).astype(float); return x / (np.abs(x).max() + 1e-9) * 0.9
EL = {k: load(f'{ep}/audio/sfx_el/{k}.mp3') for k in ('roller', 'pour', 'door', 'laugh')}
def span(x, d, f=0.06):  # cut/loop x to length d with short crossfades, fade in/out
    n = int(d * SR); xf = int(0.08 * SR); y = x.copy()
    while len(y) < n: y = np.concatenate([y[:-xf], y[-xf:] * np.linspace(1, 0, xf) + x[:xf] * np.linspace(0, 1, xf), x[xf:]])
    y = y[:n]; k = int(f * SR); y[:k] *= np.linspace(0, 1, k); y[-k:] *= np.linspace(1, 0, k); return y
# t, name, gain, [dur for ElevenLabs cues] — on the on-screen actions (word times = align.json take2 + 0.10)
EV = [(0.0, 'roller', 0.4, 1.1), (1.85, 'roller', 0.42, 1.3), (3.6, 'whoosh_fast', 0.32), (4.18, 'pop', 0.22), (4.33, 'pop', 0.22), (4.46, 'ting', 0.3),
      (4.8, 'whoosh', 0.22), (6.0, 'whoosh_fast', 0.28), (6.42, 'pop', 0.2), (6.95, 'pour', 0.55, 1.75), (8.55, 'sparkle', 0.3), (8.65, 'whoosh', 0.2),
      (9.86, 'ting', 0.28), (10.05, 'whoosh', 0.2), (10.36, 'roller', 0.45, 1.0), (11.5, 'whoosh', 0.22), (11.6, 'laugh', 0.42, 1.4),
      (12.92, 'whoosh_fast', 0.3), (13.0, 'door', 0.5, 2.3), (14.55, 'thump', 0.35), (15.15, 'crickets', 0.18)]
EV.sort(key=lambda e: e[0])
buf = np.zeros(int(SR * dur))
for e in EV:
    t, name, g = e[:3]
    x = span(EL[name], e[3]) if name in EL else ak.SFX[name]()
    ak.place(buf, x, t, g)
ak.write(out, ak.norm(buf, 0.9) if np.abs(buf).max() > 0.9 else buf)
json.dump([{'t': e[0], 'name': e[1], 'gain': e[2], **({'dur': e[3]} if len(e) > 3 else {})} for e in EV], open(out.replace('.wav', '_events.json'), 'w'), indent=0)
print(len(EV), 'cues ->', out)
