+++
kind = "project"
title = "IMC Prosperity 4"
nav = "imc-prosperity-4"
description = "Team DAAB's market maker for IMC Prosperity 4: top-quartile PnL across 18,000+ teams, with the losing rounds written up."
summary = "A market maker for IMC's trading competition. The losing rounds are written up."
note = "+114,664 in round 3"
group = "judgment"
featured = 3
order = 20
tech = ["Python"]
role = "team DAAB, with Aditya Bankoti"
when = "April 2026"

[[links]]
label = "repo"
href = "https://github.com/Dhruv-0-Arora/imc-prosperity-4"
+++
Everything team DAAB wrote for rounds 1 to 4 of IMC's two-week algorithmic trading competition.
We finished with top-quartile PnL across 18,000+ teams.

Scores are competition points, not dollars.

| Round | Result |
|---|---|
| 1 | +10,127 |
| 2 | -667 |
| 3 | +114,664 |
| 4 | -39k, -25k, +1.76k, -3k across four test submissions |

## Round 2 lost 667

We rewrote the bot as mean reversion around an EMA fair value.
Tick-level autocorrelation of price changes was -0.51, so it looked right.

> A lagging estimator sits below a rising mid in steady state, so our asks were priced under where the market was heading and got picked off all day.

Tick-level mean reversion is real.
But positions are held over many ticks, and over that horizon the drift is all that matters.

## Round 3 paid

Ten call vouchers on one underlying.
The underlying's position limit was 200 lots.

We projected its mean-reversion signal onto every strike through delta.
Six strikes at 300 lots each is over 1500 deltas of the same trade.
Same signal, seven times the size.

## Round 4, the deeper bug

The signal was fine.
The live tape ran 1,000 ticks per day against 10,000 in the historical data, and every window was counted in trader calls.
A 1500-call EMA with a 5% half-life on the dataset had a 52% half-life live.

The wrong assumption: time is measured in trader calls.

Every retune that improved the backtest got there by removing a risk control.
The fix detects day length at runtime and scales the window to it.
