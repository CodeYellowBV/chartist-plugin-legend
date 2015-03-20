# chartist-plugin-legend

Implements a legend for [Chartist](https://github.com/gionkunz/chartist-js) charts.

## Install

Install with npm. Then add this to your require.js config file:

```js
'shim': {
    'chartist-plugin-legend': {
        'deps': ['chartist', 'jquery']
    }
}
```

As styles are very different with each project, no CSS is included. You can copy paste this to use as base:

```scss
.ct-legend {
    li {
        position: relative;
        padding-left: 23px;
        margin-bottom: 3px;
    }

    li:before {
        width: 16px;
        height: 16px;
        position: absolute;
        top: 2px;
        left: 0;
        content: '';
        border-radius: 2px;
    }

    &.ct-legend-inside {
        position: absolute;
        top: 0;
        right: 0;
    }

    @for $i from 0 to length($ct-series-colors) {
        .ct-series-#{$i}:before {
            background-color: nth($ct-series-colors, $i + 1);
        }
    }
}
```

## Usage

In an example chart:

```js
ChartistLegend = require('chartist-plugin-legend');

new Chartist.Bar('.ct-chart', data, {
        stackBars: true,
    },
    plugins: [
        new ChartistLegend()
    ]
});
```

__TODO:__ Add options.

