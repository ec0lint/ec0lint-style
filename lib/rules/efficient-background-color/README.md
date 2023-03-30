# efficient-background-color

Encourages users to use energy-efficient colors to reduce the power consumption on OLED displays.

Rule efficient-background-color checks background-color CSS property and, based on particular components of color’s RGB format, decides if the level of energy consumption is not too high. The boundaries of RGB components values are red – 204, green – 204 and blue – 153, as shown in Figure 1.

![rgb-cube](https://github.com/ec0lint/ec0lint-style/blob/main/rgb_cube.png)
_Figure 1 - The recommended colors are inside the marked hexagon._

How OLED displays work

Each pixel of an OLED display emits three channels of color - red, green and blue. The luminance of the three colors is different. The black color does not emit light, so it is the least power-consuming color, whereas the white color has the maximum luminance, so it consumes the most power. More information: https://www.hindawi.com/journals/misy/2016/6575931/

Packages: ec0lint-style

# CO2 reduction

According to https://ieeexplore.ieee.org/abstract/document/5989813 we can calculate the power consumption of OLED displays as a sum of power consumption of each RGB color of a pixel. Figure 1 shows the energy consumption of three RGB colors of different intensities on a μOLED-32028-P1 AMOLED display. Research: https://ieeexplore.ieee.org/abstract/document/5989813

![rgb-consumption](https://github.com/ec0lint/ec0lint-style/blob/main/rgb_energy_consumption.png)
_Figure 2 - Power consumption for the R, G, and B components of a pixel of OLED screen with different intensity levels_

Based on the above figure we can see that the most power-consuming color is blue – this is why we decided to set in ec0lint a lower boundary value for blue color than for other two.

In order to reduce energy consumption we should use energy efficient color palettes. Examples: https://greentheweb.com/energy-efficient-color-palette-ideas/

# examples

<!-- prettier-ignore -->
```css
background-color: white;
/**                 ↑
    * Unrecommended color*/
```

The following patterns are considered problems:

<!-- prettier-ignore -->
```css
background-color: white;
```

<!-- prettier-ignore -->
```css
background-color: #fffff;
```

<!-- prettier-ignore -->
```css
background-color: hsl(0,100%,100%);
```

<!-- prettier-ignore -->
```css
background-color: rgb(255,255,255);
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
background-color: black;
```

<!-- prettier-ignore -->
```css
'background-color:#000000,
```

<!-- prettier-ignore -->
```css
background-color:hsl(0, 0%, 0%);
```

<!-- prettier-ignore -->
```css
background-color:rgb(0,0,0);
```
