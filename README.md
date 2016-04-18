# chartist-plugin-legend

[![Build Status](https://travis-ci.org/CodeYellowBV/chartist-plugin-legend.svg?branch=master)](https://travis-ci.org/CodeYellowBV/chartist-plugin-legend)
[![Coverage Status](https://coveralls.io/repos/github/CodeYellowBV/chartist-plugin-legend/badge.svg?branch=master)](https://coveralls.io/github/CodeYellowBV/chartist-plugin-legend?branch=master)

Implements a legend for [Chartist](https://github.com/gionkunz/chartist-js) charts.

**[Demo](https://codeyellowbv.github.io/chartist-plugin-legend/)**

## Install

```
$ npm install chartist-plugin-legend --save
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

## Usage

In an example chart:

```js
require('chartist-plugin-legend');

new Chartist.Bar('.ct-chart', data, {
        stackBars: true,
    },
    plugins: [
        Chartist.plugins.legend()
    ]
});
```

| __Option__ | __Description__ | __Type__ | __Default__ |
| ---        | ---             | ---      | ---         |
| `className` | Add extra classes. | `string` | `''` |
| `clickable` | Make the legend items clickable; when clicked the corresponding series will disappear. | `bool` | `true` |
| `legendNames` | Use custom names for the legend. By default the `name` property of the series will be used (for charts labels will be used) | `mixed` | `false` |
| `onClick` | Accepts a function that gets invoked if `clickable` is true. The function has the `chart`, and the click event (`e`), as arguments. | `mixed` | `false` |
