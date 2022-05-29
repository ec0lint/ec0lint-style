# no-ttf-font-files

Disallow using ttf custom font files.

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
