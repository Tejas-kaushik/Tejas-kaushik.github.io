# Tejas Kaushik · PCB to server

My portfolio: **https://tejas-kaushik.github.io/**

A static site with no build step: `index.html`, `styles.css` and `main.js`, with GSAP and ScrollTrigger loaded from cdnjs and Jost from Google Fonts.

- The hero is a real Tektronix 475A whose screen draws a live series RLC step response. Drag the resistance and the damping, overshoot and ring frequency update.
- Projects open in place, with code and demo links.
- Motion respects `prefers-reduced-motion`. Add `?motion=full` to the URL to preview the full animation on a machine that has animations turned off.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 5173
```

## Picture credits

- "Tektronix Oscilloscope 475A" by Pittigrilli, CC BY-SA 4.0, via Wikimedia Commons
- "Printed Circuit Board 9990" by Ashley Pomeroy, CC BY 4.0, via Wikimedia Commons
- "University of Glasgow Gilbert Scott Building - Feb 2008" by Diliff, CC BY 3.0, via Wikimedia Commons
- "Triangular wave and square wave on oscilloscope screen" by Xato, CC0, via Wikimedia Commons

The trace plots come from my [transient-trace-analyzer](https://github.com/Tejas-kaushik/transient-trace-analyzer). The screenshots are of my own projects' live demos.
