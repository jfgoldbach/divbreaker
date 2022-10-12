# divbreaker project
[🔴 View live](https://jfgoldbach.github.io/divbreaker/)

This is and arcanoid-style game powered purely by javascript with some aid from css.

I started the project at the end of 2021 and started to work on it again after some time in 2022 by making huge changes to the way the layout (Everything scales and gets calculated properly no matter the screen size and window dimensions) works, but also by fixes bugs and adding new features.

## controls
**Left Arrow** -> Move left

**Right Arrow** -> Move right

**Spacebar** -> Release ball

**Shift** + **F** -> Show FPS

**Shift** + **B** -> Show ball debug info

## gameplay
![divbreaker_preview](https://user-images.githubusercontent.com/87607216/195464482-238b4f15-e594-4571-b810-33bc823d6751.png)

The ball reflects from the paddle dependent on the distance from the paddles center: the farther on the outside, the steeper the angle and the higher the speed.

By destroying all blocks a new level loads. If you destroy the rainbow block, the ball becomes invincible for 7 seconds and ignores the collision of all blocks. The game has infinite levels. By leveling up the speed of the ball and paddle increases until a set maximum is reached.

Block/Chance to spawn per block:

Heart: 10%

Grow: 1%

Shrink: 0.5%

Faster: 0.5%

Slower: 0.5%

Plus ten: 0.2%

Rainbow: 0.1%
