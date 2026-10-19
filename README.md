# Tejas Kaushik · PCB to server

My portfolio: **https://tejas-kaushik.github.io/**

An interactive 3D circuit board, built with Three.js and no build step. Every chip on the board is one of my projects.

- **Boot screen:** the board powers on from a terminal boot log. The chips drop onto the board, and signal pulses start running along the copper traces.
- **Chips:** hover a chip and it lifts and lights its bus back to the CPU. Click it and the camera flies in and the project opens in a side panel. The CPU chip is the About page.
- **CLK knob:** drag it sideways or scroll over it to change the board clock. The pulses, LEDs and scope speed up or slow down with it.
- **Scope:** shows a live RLC step response. Click it to cycle the damping.
- **Connectors:** the RJ45 jack opens GitHub, the USB-C port opens LinkedIn, and the pin header shows my email.
- **Terminal:** press `~`, then try `help`, `ls`, `open redis`, `clk 3`, `scope 0.2` or `sudo hire tejas`.
- **Keys:** `1`–`9` open projects, the arrow keys step between projects, and `Esc` closes.
- **Sound and motion toggles** sit in the top bar. Phones get a transposed portrait board.

`classic.html` is a plain, fast-to-read version of the same content, and the 3D page falls back to it if WebGL isn't available.

## Run locally

```bash
python -m http.server 5173
```

Then open http://127.0.0.1:5173/. Add `?skipboot` to skip the boot screen.

## Picture credits

- "Tektronix Oscilloscope 475A" by Pittigrilli, CC BY-SA 4.0, via Wikimedia Commons
- "Printed Circuit Board 9990" by Ashley Pomeroy, CC BY 4.0, via Wikimedia Commons
- "University of Glasgow Gilbert Scott Building - Feb 2008" by Diliff, CC BY 3.0, via Wikimedia Commons
- "Triangular wave and square wave on oscilloscope screen" by Xato, CC0, via Wikimedia Commons

These photos are used on the classic page. The 3D board is modelled in code. The trace plots come from my [transient-trace-analyzer](https://github.com/Tejas-kaushik/transient-trace-analyzer), and the screenshots are of my own projects' live demos.
