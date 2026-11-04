"""T005 SFX track: kit synth cues (audio_kit) + ElevenLabs foley (printer, countdown beeps, ticket flutter, switch-off, paper pile), 60 ms fades.
usage: python3 -I build_sfx.py <kit_production_dir> <episode_win_dir> <out.wav> <dur>"""
import sys, json, subprocess, importlib.util, numpy as np
kitp, ep, out, dur = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
spec = importlib.util.spec_from_file_location('audio_kit', kitp + '/audio_kit.py'); ak = importlib.util.module_from_spec(spec); spec.loader.exec_module(ak)
SR = ak.SR
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).astype(float); return x / (np.abs(x).max() + 1e-9) * 0.9
EL = {k: load(f'{ep}/audio/sfx_el/{k}.mp3') for k in ('printer', 'beeps', 'flutter', 'switchoff', 'pile')}
def span(x, d, f=0.06):  # cut/loop x to length d with short crossfades, fade in/out
    n = int(d * SR); xf = int(0.08 * SR); y = x.copy()
    while len(y) < n: y = np.concatenate([y[:-xf], y[-xf:] * np.linspace(1, 0, xf) + x[:xf] * np.linspace(0, 1, xf), x[xf:]])
    y = y[:n]; k = int(f * SR); y[:k] *= np.linspace(0, 1, k); y[-k:] *= np.linspace(1, 0, k); return y
# t, name, gain, [dur for ElevenLabs cues] — on the on-screen actions (word times from align.json + 0.10)
EV = [(0.0, 'printer', 0.45, 0.9), (0.3, 'flutter', 0.35, 1.8), (1.95, 'beeps', 0.3, 0.7), (2.4, 'pop', 0.22), (2.45, 'ting', 0.28), (2.75, 'printer', 0.4, 0.5),
      (3.2, 'whoosh', 0.22), (4.42, 'pop', 0.3), (4.95, 'whoosh', 0.22), (6.0, 'beeps', 0.28, 0.6), (7.22, 'thump', 0.45), (7.8, 'whoosh', 0.22), (9.3, 'sparkle', 0.3),
      (10.3, 'whoosh', 0.22), (11.12, 'whoosh_fast', 0.3), (11.42, 'thump', 0.6), (11.45, 'boing', 0.22), (12.3, 'sparkle', 0.3), (12.75, 'paper', 0.3), (13.1, 'ting', 0.3),
      (13.95, 'beeps', 0.4, 0.75), (15.13, 'printer', 0.5, 1.1), (15.5, 'flutter', 0.4, 1.9), (17.38, 'pop', 0.2),
      (18.02, 'beeps', 0.4, 0.75), (19.4, 'ting', 0.28), (20.6, 'ting', 0.22), (20.69, 'printer', 0.5, 0.8), (21.0, 'flutter', 0.38, 0.9), (21.84, 'pop', 0.2), (22.77, 'beeps', 0.35, 0.6),
      (23.4, 'flutter', 0.22, 4.6), (23.9, 'whoosh', 0.3), (25.9, 'pop', 0.25), (26.55, 'pop', 0.25), (27.2, 'boing', 0.25),
      (28.45, 'whoosh', 0.25), (29.4, 'whoosh', 0.2), (30.9, 'whoosh', 0.28), (31.1, 'ting', 0.3), (32.1, 'whoosh', 0.2), (34.9, 'ting', 0.45), (35.0, 'sparkle', 0.25),
      (35.96, 'switchoff', 0.55, 1.3), (36.9, 'whoosh', 0.35), (36.95, 'flutter', 0.4, 0.8), (37.9, 'whoosh', 0.2), (38.9, 'whoosh', 0.22),
      (39.66, 'pile', 0.6, 2.0), (40.6, 'pop', 0.2), (41.34, 'thump', 0.3), (41.4, 'ting', 0.3), (42.1, 'whoosh', 0.22), (43.29, 'sparkle', 0.4),
      (43.85, 'whoosh', 0.2), (44.4, 'pile', 0.4, 1.5), (44.75, 'boing', 0.28), (45.55, 'pop', 0.22), (46.38, 'ting', 0.35), (46.75, 'crowd_laugh', 0.16)]
# time compression: a quiet printer chatter every 0.42 s while the loop runs fast, every 0.84 s after
EV += [(23.35 + i * 0.42, 'printer', 0.16, 0.22) for i in range(11)] + [(28.1 + i * 0.84, 'printer', 0.13, 0.22) for i in range(9)]
EV.sort(key=lambda e: e[0])
buf = np.zeros(int(SR * dur))
for e in EV:
    t, name, g = e[:3]
    x = span(EL[name], e[3]) if name in EL else ak.SFX[name]()
    ak.place(buf, x, t, g)
ak.write(out, ak.norm(buf, 0.9) if np.abs(buf).max() > 0.9 else buf)
json.dump([{'t': e[0], 'name': e[1], 'gain': e[2], **({'dur': e[3]} if len(e) > 3 else {})} for e in EV], open(out.replace('.wav', '_events.json'), 'w'), indent=0)
print(len(EV), 'cues ->', out)
