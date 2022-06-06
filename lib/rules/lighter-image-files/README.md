# lighter-image-files

Suggest to use lighter image formats like JPEG.

<!-- prettier-ignore -->
```css
background-image: url('image.ps');
/**                           ↑
    * Unrecommended format of image file*/
```

The following patterns are considered problems:

<!-- prettier-ignore -->
```css
background-image: url('image.ppm');
```

<!-- prettier-ignore -->
```css
background-image: url('image.ps')
```

<!-- prettier-ignore -->
```css
background-image: url('image.rgb')
```

<!-- prettier-ignore -->
```css
background-image: url('image.png')
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
background-image: url('image.svg')
```

<!-- prettier-ignore -->
```css
background-image: url('image.webp')
```

<!-- prettier-ignore -->
```css
background-image: url('image.gif')
```

<!-- prettier-ignore -->
```css
background-image: url('image.jpg')
```
