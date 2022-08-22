# require-font-display

Disallow using @font-face without font-display property.

The font-display property supports five different values, each describing a different method of behaviour for different scenarios. In short, it allows fine control over whether a fallback font is used immediately, and whether or not after a period of time (and the custom font has loaded) what should happen.

# examples

<!-- prettier-ignore -->
```css
@font-face {
	font-family: 'foo';
	src: url('/path/to/foo.ttf');
} 
```

The following patterns are considered problems:

<!-- prettier-ignore -->
```css
@font-face {
	font-family: "MyFont";
	src: url("myfont.ttf") format("ttf");
} 
```

<!-- prettier-ignore -->
```css
@font-face {
	font-family: "MyFont";
	src: url("myfont.ttf") format("ttf");
} 
```

<!-- prettier-ignore -->
```css
@font-face {  
	font-family: dashicons;,   
	src: url("myfont.ttf") format("ttf"); 
	font-weight: normal; 
	font-style: normal; 
} 
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
@font-face {
	font-family: 'foo';
	font-display = block;
	src: url('/path/to/foo.woff');
} 
```

<!-- prettier-ignore -->
```css
@font-face {
	font-family: 'MyFont';
	font-display = block;
	src: url('myfont.woff2') format('woff2');
} 
```

<!-- prettier-ignore -->
```css
{ 
	font-family: dashicons; 
	src: url(data:application/font-woff;charset=utf-8;base64, ABCDEF==) format ("woff"); 
	url(../fonts/dashicons.woff) format("truetype"); 
	url(../fonts/dashicons.svg#dashicons) format("svg"); 
	font-weight: normal; 
	font-style: normal; 
}
```
