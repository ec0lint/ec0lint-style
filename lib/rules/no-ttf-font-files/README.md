# no-ttf-font-files

Disallow using TTF custom font files.

Fonts should be converted to WOFF or WOFF2 format. WOFF2 is now the most modern and efficient format available in browsers. It was developed by Google as an update to the original WOFF format and is considered the best format of the bunch because it offers smaller file sizes and better performance for modern browsers that support it. We can achieve almost 80% reduction of file size simply through loading a WOFF2 file over a TTF and almost 60% in case of using WOFF instead of TTF font files.

# CO2 reduction

Convertion of only one of the most popular fonts used on websites – Helvetica Neue - from TTF to WOFF2 format can reduce the carbon footprint even up to 0.54 g per website view. By converting the same file to WOFF format we achieve 0.35 g CO2 reduction.

In the table below we show carbon footprint emission depending on file format for 10 popular fonts used on websites.

![alt text](https://github.com/ec0lint/ec0lint-css/blob/main/font_table.webp)

By multiplying the library size by the end-user traffic (0.81 kWh / 1000 Mb) and by the energy emissions (442 g/kWh , the carbon footprint of the TTF file (2.49 Mb for Helvetica Neue) – sums up to 0.89 g. For WOFF2 (0.99 Mb) the carbon footprint amounts to 0.35g and for WOFF (1.51MB) to 0.54g. So, by substracting 0.35 g and 0.54g from 0.89 g we get respectively 0.54 g (61% less CO2) and 0.35g (39% less CO2).

TTF font file sizes were checked at https://fonts.google.com/ and converted to WOFF and WOFF2 formats on https://cloudconvert.com/

# examples

<!-- prettier-ignore -->
```css
@font-face { font-family: 'foo'; src: url('/path/to/foo.ttf'); }
/**                                                     ↑
                       * Unrecommended format of the file*/
```

The following patterns are considered problems:

<!-- prettier-ignore -->
```css
@font-face { font-family: 'foo'; src: url('/path/to/foo.ttf'); }
```

<!-- prettier-ignore -->
```css
@font-face {\n font-family: "MyFont"; src: url("myfont.ttf") format("ttf");\n}
```

<!-- prettier-ignore -->
```css
@font-face {
	font-family: dashicons;
	src: url(data:application/font-ttf;charset=utf-8;base64, ABCDEF==) format("ttf");
	font-weight: normal;
	font-style: normal;
	}
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
@font-face { font-family: 'foo'; src: url('/path/to/foo.woff'); }
```

<!-- prettier-ignore -->
```css
@font-face {\n font-family: "MyFont"; src: url("myfont.woff2") format("woff2");\n}
```

<!-- prettier-ignore -->
```css
@font-face {
	font-family: dashicons;
	src: url(data:application/font-woff;charset=utf-8;base64, ABCDEF==) format("woff"),
	url(../fonts/dashicons.woff) format("truetype"),
	url(../fonts/dashicons.svg#dashicons) format("svg");
	font-weight: normal;
	font-style: normal;
}
```
