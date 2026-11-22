+++
kind = "project"
title = "kerms"
description = "kerms is a model in training that prices Kalshi daily-high-temperature markets. It beats the market at 17 of 20 stations."
summary = "A model I am training to price Kalshi weather markets. It spends nothing yet."
note = "beats the market at 17 of 20 stations"
group = "judgment"
order = 30
tech = ["Python", "XGBoost", "pandas", "SQLite"]
role = "solo"
when = "July 2026 - present"
+++
A gradient-boosted model that prices daily-high-temperature markets on Kalshi, across 20 stations.

It trained on 571,914 settled rows over 1,345 station-days.
It reads 48 features: GFS, ECMWF and ICON ensemble members, the NWS point forecast, per-station bias, and order book state.

It runs as a shadow engine.
It prices every scan and spends nothing.

## Results, report only

- It beats the market mid at 17 of 20 stations.
  It loses at the three with the deepest books.
- The honest edge is 0.001 to 0.002 Brier over the mid.
- A ladder of 20 candidate models found no form that beats the incumbent.
  The only gain came from new data columns.
- The learning curve is flat past about 600 station-days.

Evaluation is walk-forward by settlement date.
Candidates are registered and the bars are frozen before any run.

## What I retired

The first version used a favorites rule from the maker side.
A backtest over 4.5M markets showed why it could not work: a resting maker bid is adversely selected by about 4.6 points of win rate, which is the whole bias.
653 of 655 unfilled orders would have won.
I removed it.
