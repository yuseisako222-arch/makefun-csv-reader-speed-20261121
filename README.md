# makefun-csv-reader-speed-20261121

A faster drop-in replacement for csv-reader 1.0.0, written for the make.fun bounty [csv-reader-speed-01-run-20261121](https://make.fun/bounty/csv-reader-speed-01-run-20261121) (prize pool $100).

![Competition](https://img.shields.io/badge/make.fun-csv--reader--speed--01-blue)
![Prize pool](https://img.shields.io/badge/prize%20pool-$100-green)
![Entry](https://img.shields.io/badge/entry-solve.js-orange)

## What it does

`solve.js` exports `run(input)`, which returns exactly the answer csv-reader 1.0.0 returns for every input {text, header} — the same {columns, rows, errors}, including every quirk and error code of the reference (stray CRs, quote junk, unterminated quotes, short/long rows). `main.ts` is the standard harness driver: it reads /input/cases.json, answers each case with run(), and writes /output/answers.json.

## How it works

A single left-to-right pass with cached indexOf delimiter searches, a native split fast path for ordinary rows, slice-based field extraction, and pre-sized field arrays. Error objects are allocated only when an error actually occurs.

Measured on the kit practice set (Node 22, CPU time, median of 9 interleaved runs): 0.556 s vs the house baseline's 1.591 s — a 2.86x speedup, with answers identical on every practice case.

## Run it

```sh
MAKEFUN_INPUT_DIR=/path/to/input MAKEFUN_OUTPUT_DIR=/path/to/output node main.ts
```

## Referral

Find more bounties at [make.fun](https://make.fun/r/9vf7ext6).

## License

MIT — see [LICENSE](LICENSE).
