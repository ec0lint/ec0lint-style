# no-web-fonts

Disallows importing web fonts by _@import_ and _@font-face_ CSS rules. We recommend using system or locally hosted fonts.

System fonts are automatically installed in every operating system of any device, which is used to display a website. Even if you don’t like system fonts, you can add a static font file (we recommend WOFF2, see: https://ec0lint.com/features/no-ttf-font-files) to your website. All additional server requests and data transfer related to fonts can be saved.

# CO2 reduction

By using system fonts or fonts hosted locally, you do not import any data from an external server. If you choose Arial (system font) instead of Arimo (web font, Arial equivalent from Google Fonts) you can save up to **0.021 g CO2 per view**. To calculate the carbon footprint of a web font, the size of TTF font file can be multiplied by the end-user traffic (0.81 kWh/1000 MB) and by the energy emissions (442 g/kWh).

| Name           | Size    | CO2 reduction |
| -------------- | ------- | ------------- |
| Arimo font     | 0.061MB | 0.021g        |
| Roboto font    | 0.14MB  | 0.049g        |
| Open sans font | 0.516MB | 0.18g         |

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
