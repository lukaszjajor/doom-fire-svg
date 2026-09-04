# DOOM fire in SVG

The fire effect from the PlayStation port of DOOM and from Doom 64, reimplemented with **nothing but SVG filters and SMIL animation**. No JavaScript, no canvas, not a single frame of raster imagery. Each flame is a standalone file of roughly 3 kB.

The point is not the flame. The point is what happens when you move an effect built on **memory between frames** into a system that has no memory at all.

*[Polska wersja tego pliku](README.pl.md) · [pełne omówienie po polsku](lekcja/lekcja-bonus-ogien.md)*

## Preview

Open `index.html`, or open any file in `svg/` directly — they are self-contained animated images.

| file | variant |
|---|---|
| `svg/ogien.svg` | original palette: black → red → orange → yellow → white |
| `svg/ogien-lod.svg` | ice — blue channel rises first |
| `svg/ogien-plazma.svg` | plasma — red and blue rise together |
| `svg/ogien-kwas.svg` | acid — green leads from the start |

All four share an **identical filter and identical animation**. They differ by eighteen numbers in `feComponentTransfer` — six per colour channel. That is the entire palette.

## How the original worked

The buffer in the 1995 version does not hold colours. It holds **temperatures**.

The bottom row is a burner pinned to the maximum value. Every pixel above takes heat from the pixels below it and loses part of that heat on the way. The shape of the flame is nothing more than a plot of energy loss — remove the loss and the whole screen turns white. A palette maps those temperatures to colours at the very end, which is why the same buffer can render as fire, plasma or ice.

Two families of the algorithm exist and they are worth telling apart:

- **The DOOM version copies.** A pixel takes the value below it, subtracts a random 0 or 1, and writes to a target randomly shifted one cell left or right. Three lines of code. Grainy, sharp-edged.
- **The demoscene version averages.** A pixel takes the mean of several neighbours below and subtracts random cooling. Averaging blurs, so the tongues come out softer.

`demo/index.html` runs both, with a toggle.

In the game itself the fire was a **sky texture** — which explains the odd 64 × 128 buffer. DOOM does not draw skies as ceilings: a sector marked `F_SKY1` is treated as a hole and the sky is drawn column by column like a wall, at **full brightness**, bypassing all distance shading. That made the sky the one place in the engine where a hand-tuned 37-colour palette survives to the screen untouched, and where a texture rewritten every frame needs no renderer changes at all.

## How the SVG version works

Each part of the buffer is replaced by something declarative:

| buffer | SVG filter |
|---|---|
| temperature falling with height | vertical gradient, white to black |
| randomness of burner and cooling | `feTurbulence` |
| lateral drift, blur | `feDisplacementMap` |
| colour palette | `feComponentTransfer` |

The first row is the interesting one. In the buffer the temperature distribution **emerged** frame by frame from energy loss. In the filter it is simply **drawn** — a gradient, finished, with no computation. That inversion is what makes the rest possible.

Perlin noise is not periodic, so scrolling it upward eventually snaps back and the jump is visible. The fix is a crossfade of two copies offset by half a cycle, with `feComposite operator="arithmetic"` weighting them by animated triangles, so each copy's snap lands exactly when its weight is zero.

## What this costs

The filter version looks smoother and loops cleanly, but it loses something real. In the buffer, every tongue had a history — it grew from a specific gap in the burner, rose, weakened and died, and its shape in one frame depended on the frame before. Here everything is one breathing noise field, and after a while the eye reads it as aurora rather than fire. `feDisplacementMap` computes each frame from scratch.

This is not an SVG-specific limitation. When someone asked on the ZDoom forum whether the effect could be reproduced with a shader in GZDoom, the answer was much the same: each frame modifies the previous one, and a shader has no straightforward access to the previous render.

**An effect that lives on memory sits badly in systems that recompute everything from nothing.** The 1995 algorithm is closer to physics than the 2026 filter graph.

## Usage

Files in `svg/` are self-contained. Drop them in like any other image:

```html
<img src="ogien.svg" alt="Flame" width="520" height="360">
```

SMIL animation **does** run inside `<img>`; scripts do not — irrelevant here, since there are none. If you want to drive the effect from outside (palette, wind, temperature), inline the SVG into the document instead of loading it through `<img>`.

To change the colour, swap the three `tableValues` rows. To change the flame height, move the `offset` of the second `<stop>` in the gradient — higher means a taller fire.

A word of warning if you build your own palettes: the eye does not weigh channels equally. Green reads far brighter than red at the same value, blue far darker. A palette whose green rises as fast as red does in the fire preset will produce a visibly larger, washed-out flame, because the dark tail brightens too early. The three variants shipped here are matched to the fire's luminance profile, so they change hue only and leave the shape alone.

## Compatibility

Requires SMIL animation on filter primitives. Works in Chrome, Safari and Firefox.

Filters are computationally expensive — four flames at once will tax weaker hardware. In production, run one and serve the rest as static images.

## Repository layout

```
├── index.html                     preview page, four variants
├── svg/                           self-contained SVG files
├── demo/index.html                historical version: pixel buffer in JS,
│                                  DOOM ↔ demoscene toggle (page in Polish)
├── lekcja/lekcja-bonus-ogien.md   full write-up (Polish, ~30 min read)
└── playground/                    presets for the SVG course playground on iFox.pl
```

## Credits

The effect comes from the PlayStation and Nintendo 64 ports of DOOM. The porting team finished ahead of budget and spent the spare CPU cycles on an animated sky.

- [Fabien Sanglard, *How DOOM fire was done*](https://fabiensanglard.net/doom_fire_psx/) — the algorithm, with images of each stage
- [Samuel Villarreal, *PSX Doom / Doom 64 Firesky*](https://codepen.io/svkaiser/pen/xXmOvY) — the original reconstruction from N64 assembly
- [Fabien Sanglard, *DoomFirePSX*](https://github.com/fabiensanglard/DoomFirePSX) — Villarreal's version cleaned up
- [Doom Wiki: *Sky*](https://doomwiki.org/wiki/Sky) — why the fire was a sky texture

This implementation was written from scratch and contains no id Software code or assets.

## Related

Written as a bonus lesson for the [SVG course at iFox.pl](https://ifox.pl/kurs-svg/) (in Polish), building on its lessons about [filters](https://ifox.pl/lekcja-11-filtry/), [animation](https://ifox.pl/lekcja-12-trzy-drogi-animacji/) and [security](https://ifox.pl/lekcja-19-bezpieczenstwo/).

The `playground/` directory only matters if you run that course's interactive playground yourself.

## License

MIT — see [LICENSE](LICENSE).
