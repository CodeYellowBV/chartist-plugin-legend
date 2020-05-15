# chartist-plugin-legend

[![Build Status](https://travis-ci.org/matteoraf/chartist-plugin-legend.svg?branch=master)](https://travis-ci.org/matteoraf/chartist-plugin-legend)

Implements a legend for [Chartist](https://github.com/gionkunz/chartist-js) charts.

**[Demo](https://codeyellowbv.github.io/chartist-plugin-legend/)**

## Why this Fork

Since I needed to use this plugin with a Vue.js project and I needed to append the legend to a DOM element which wasn't yet rendered at the time the plugin was loaded, 
I needed to be able to pass the id of the element and leave the trouble of retrieving the DOM element to the plugin itself.

## Install

```
$ npm install @matteoraf/chartist-plugin-legend --save
```

As styles are very different with each project, no CSS is included. You can copy paste this to use as base:

```scss
.ct-legend {
    position: relative;
    z-index: 10;

    li {
        position: relative;
        padding-left: 23px;
        margin-bottom: 3px;
    }

    li:before {
        width: 12px;
        height: 12px;
        position: absolute;
        left: 0;
        content: '';
        border: 3px solid transparent;
        border-radius: 2px;
    }

    li.inactive:before {
        background: transparent;
    }

    &.ct-legend-inside {
        position: absolute;
        top: 0;
        right: 0;
    }

    @for $i from 0 to length($ct-series-colors) {
        .ct-series-#{$i}:before {
            background-color: nth($ct-series-colors, $i + 1);
            border-color: nth($ct-series-colors, $i + 1);
        }
    }
}
```

If you are using this within a Vue.js component, you need to wrap it in a `<style lang='scss'>` tag.
Don't forget to import or define the `$ct-series-colors` variable


```scss
<style lang='scss'>
  $ct-series-colors: (
          #d70206,
          #f05b4f,
          #f4c63d,
          #d17905,
          #453d3f,
          #59922b,
          #0544d3,
          #6b0392,
          #f05b4f,
          #dda458,
          #eacf7d,
          #86797d,
          #b2c326,
          #6188e2,
          #a748ca
  ) !default;
  // Your scss code here
</style>
```


## Usage

In an example chart:

```js
require('chartist-plugin-legend');

new Chartist.Bar('.ct-chart', data, {
        stackBars: true,
        plugins: [
            Chartist.plugins.legend()
        ]
    },
)
```

## Usage in a Vue.js project with the vue-chartist component

Import the plugin together with chartist in a plugin file or in your main.js
```js
import Vue from 'vue'
import 'chartist/dist/chartist.min.css'
import 'chartist-plugin-legend/chartist-plugin-legend'

Vue.use(require('vue-chartist'))
```

Then use it in any of your components the same way you'd normally do:

```html
<chartist
        :data="data"
        :event-handlers="eventHandlers"
        :options="options"
        :ratio="ratio"
        :responsive-options="responsiveOptions"
        :type="type"
        style=""
      />
```

```js
data: {}
options: {
    plugins: [
        this.$chartist.plugins.legend({...}),
            ]
    }
```

Then in your component

| __Option__ | __Description__ | __Type__ | __Default__ |
| ---        | ---             | ---      | ---         |
| `className` | Adds a class to the `ul` element. | `string` | `''` |
| `clickable` | Sets the legends clickable state; setting this value to `false` disables toggling graphs on legend click. | `bool` | `true` |
| `legendNames` | Sets custom legend names. By default the `name` property of the series will be used if none are given. Multiple series can be associated with a legend item using this property as well. See examples for more details. | `mixed` | `false` |
| `onClick` | Accepts a function that gets invoked if `clickable` is true. The function has the `chart`, and the click event (`e`), as arguments. | `mixed` | `false` |
| `classNames` | Accepts a array of strings as long as the chart's series, those will be added as classes to the `li` elements. | `mixed` | `false` |
| `removeAll` | Allow all series to be removed at once. | `bool` | `false` |
| `position` | Sets the position of the legend element. `top`, `bottom` or the `id` of any DOM2 Element are currently accepted. If a DOM Element is given, the legend will be appended as it's last child. | `string` | `'top'` |
