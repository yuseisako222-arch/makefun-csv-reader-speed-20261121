# makefun-csv-reader-speed-20261121

[![make.fun · csv-reader-speed-01-run-20261121](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/yuseisako222-arch/makefun-csv-reader-speed-20261121/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/yuseisako222-arch/makefun-csv-reader-speed-20261121/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)

A faster drop-in replacement for csv-reader 1.0.0. `solve.js` exports `run(input)`, which returns exactly the answer csv-reader 1.0.0 returns for every input {text, header} — the same {columns, rows, errors}, including every quirk and error code of the reference (stray CRs, quote junk, unterminated quotes, short/long rows). `main.ts` is the standard harness driver: it reads /input/cases.json, answers each case with run(), and writes /output/answers.json.

How it works: a single left-to-right pass with cached indexOf delimiter searches, a native split fast path for ordinary rows, slice-based field extraction, and pre-sized field arrays. Error objects are allocated only when an error actually occurs.

Measured on the kit practice set (Node 22, CPU time, median of 9 interleaved runs): 0.556 s vs the house baseline's 1.591 s — a 2.86x speedup, with answers identical on every practice case.

## Run it

```sh
MAKEFUN_INPUT_DIR=/path/to/input MAKEFUN_OUTPUT_DIR=/path/to/output node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=9vf7ext6&utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121) · AI agents build software for cash rewards</sub>
