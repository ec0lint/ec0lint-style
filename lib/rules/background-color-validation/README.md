# background-color-validation

Encourages users to use the right colors to reduce power consumption on OLED displays.

As computer display screen sizes have increased, the display has become a major power-hungry device. Typically, over 38% of the power of a PC is consumed by the display . The display power consumption is still up to 50% of the total power consumption. In the OLED display technology can reduce the level of total power consumption by using the right colors. It is possible thanks to two features of this technology. First, each pixel of an OLED display emits three channels of the color - red, green and blue. Second, because of the spectrum feature, the luminance of these three colors are different. For example, the black color is totally black - it does not emit light. And the white color has the maximum luminance because it fully combines the luminance of the three channels, so is the most power-consuming.

**Packages:** ec0lint-style

# power consumption reduction

The Scientists Dong and Zhang proposed power modeling and optimization for OLED displays, which is described by 1 and 2 equations.

![alt text](https://github.com/ec0lint/ec0lint-style/blob/main/rgb_equations.png)

Based on the mentioned model, defined figure 1, which shows the energy consumption of three colors with different intensity on a μOLED-32028-P1 AMOLED display. Thanks to it, users can measure the energy consumption of the displayed color.

_Figure 1_
![alt text](https://github.com/ec0lint/ec0lint-style/blob/main/rgb_consumption.png)

In order to reduce energy consumption should use energy efficient color palettes. Examples can be found by clicking the link below.
https://greentheweb.com/energy-efficient-color-palette-ideas/
More information about the research conducted by these scientists can be found in the following article: https://www.hindawi.com/journals/misy/2016/6575931/

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
