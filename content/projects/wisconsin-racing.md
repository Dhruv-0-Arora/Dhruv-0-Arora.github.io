+++
kind = "project"
title = "Wisconsin Racing"
nav = "wisconsin-racing"
description = "Firmware for UW-Madison's Formula SAE racecar: battery management and the driver display, with LiDAR perception in progress."
summary = "Battery and display firmware for a Formula SAE racecar."
note = "safety-critical"
group = "physical"
order = 40
tech = ["C", "ESP32-S3", "STM32", "CMake"]
role = "my team"
when = "September 2025 - present"
+++
Firmware for UW-Madison's Formula SAE racecar.

The battery management system balances cells and protects against over and under-voltage.
It is safety-critical code on a real pack.

The driver display runs on an ESP32-S3.
A GPIO driver talks to the car's ECU and translates its data for a 5-inch screen.

## Now

I am building LiDAR perception for the team's driverless car.
The job is to find the cones around the car and publish where they are.

It is in progress.
Nothing is measured yet.
