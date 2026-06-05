# Murder on the Midnight Menu

A static browser murder mystery game.

## Build approach

- Plain HTML
- CSS
- Vanilla JavaScript
- JSON game data
- GitHub Pages compatible
- No backend
- No game engine yet

ComfyUI is used for generated character, scene, and clue assets. The current build includes a first SDXL-generated asset pass for all suspects, locations, and clue placeholders.

## Current version

Expanded 8-suspect version with:

1. Title screen
2. Opening narration screen
3. Investigation hub with 6 clickable locations
4. 8 suspect interview screens
5. Evidence notebook with tabs/sections
6. Clue collection
7. Final accusation screen
8. Result screen with 0–6 scoring and solution explanation

## Suspects

- Marcel Pepperidge — Maître d’
- Bianca Brûlée — Pastry chef
- Rufus Kale — Food critic
- Celeste Saffron — Investor
- Gordon Glaze — Rival celebrity chef
- Mina Mise — Junior sous-chef
- Dahlia Plate — Food influencer
- Arthur Spoon — eccentric old regular

## Correct solution

Murderer: Bianca Brûlée  
Motive: Voss stole The Moonless Torte and planned to sell it while erasing Bianca’s name.  
Opportunity: Bianca had dessert-service access and entered the private plating station before the final course.

Strong supporting clues include:

- Rewritten dessert ticket
- Bianca handwriting match
- B.B. black book page
- Chef’s portion note
- Mina saw Bianca enter plating station
- Voss stole The Moonless Torte

## Live test build

Public GitHub Pages test URL:

```text
https://sirvenis.github.io/midnight-menu-test/index.html?v=4
```

## How to run locally

From this folder:

```bash
python3 -m http.server 8780
```

Then open:

```text
http://127.0.0.1:8780/
```

## How to expand

Most story content lives in:

```text
data/case-midnight-menu.json
```

To expand the case later:

- Add suspects to `suspects[]`
- Add locations to `locations[]`
- Add clues to `clues[]`
- Link clues to locations with clue IDs
- Add interview questions under each suspect
- Add unlockable follow-up questions with `requires`
- Replace placeholder image paths with real ComfyUI-generated assets
