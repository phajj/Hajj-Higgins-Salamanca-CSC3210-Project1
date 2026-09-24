# Hajj-Higgins-Salamanca-CSC3210-Project1
Computer Graphics Project 1: **Puzzle Pandemonium**

## Group Members:
- Peter Hajj
- Jackson Higgins
- Laura Salmanca

## Overview

Puzzle Pandemonium is a browser-based jigsaw puzzle built with [Three.js](https://threejs.org/). An octagonal board is procedurally cut into uniquely-shaped pieces, which are scattered randomly around the screen. Drag each piece back into its correct spot on the board to solve the puzzle.

## How to Play

- **Drag** a puzzle piece with the mouse to move it around the screen.
- **Release** a piece near its correct location on the octagon board and it will **snap into place**.
- Once a piece snaps into place, it **locks** and can no longer be moved.
- A sound effect plays each time a piece snaps into place.
- Solve the whole puzzle by locking every piece to hear the completion sound.

## Running the Project

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start a local server:
   ```bash
   npm start
   ```
3. Open the printed local address (e.g. `http://localhost:3000`) in your browser.

## Technical Docs

### Challenges 
- Getting the puzzle pieces to place randomly on the screen with minimal overlap.
   - Calculating overlap between pieces and the puzzle area
   - Making sure puzzle pieces were generated in the viewing space
   - Claude assisted with mathmatical functions for calculating overlap
- Sizing the puzzle area to be 500 x 500 pixels
   - I couldn't figure out how to implement real world measurements, and was struggling to find the proper documnetion 
   - Looked over the options to implement the pixel size with Claude Code (see [prompts.md](docs/prompts.md))

### Above and Beyond Implementations
- Adding sound effects
   - Copied code from threejs wenbsite to implement the snapping into place and puzzle completion sound effects.
- Adding piece highlighting
   - Editing the mouse down and mouse up functions to to also change the color of the piecs
   - Utilized claude code to adjust the color hex by a variable amount (see [prompts.md](docs/prompts.md))