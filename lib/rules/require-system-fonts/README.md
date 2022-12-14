# require-system-fonts

Disallow using other font-family than system-ui.

System fonts are prebuilt in the operating system of the device your web will be displayed to. There is no need for additional server requests/data transfers. Smart choice is to use system fonts for your text chunks of the page – users driven by highlighted titles with webfonts, have small chances of catching the system font in the body of the text.

# CO2 reduction

By using system fonts you do not import any data from the server. To compare two fonts: Arial (system font) and Arimo (web font, Arial equivalent from Google fonts). If you choose Arial instead of Arimo you could save up to **0.021**. By multiplying the tff font file by the end-user traffic (0.81 kWh / 1000 MB) and by the energy emissions (442 g/kWh), the carbon footprint of a library can be calculated.

| Name       | Size    | CO2 reduction |
| ---------- | ------- | ------------- |
| Arimo font | 0.061MB | 0.021g        |

# examples

The following patterns are considered problems:

<!-- prettier-ignore -->
```css
@font-face { font-family: 'foo'; src: url('/path/to/foo.ttf') }; 
```

<!-- prettier-ignore -->
```css
@import url("www.foo-font.com");
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
@font-face { font-family: system-ui; }
```

<!-- prettier-ignore -->
```css
 @font-face { font-family: system-ui, Verdana; }
```

<!-- prettier-ignore -->
```css
@import url("./foo.woff");
```
