# chartist-plugin-legend

Implements a legend for [Chartist](https://github.com/gionkunz/chartist-js) charts.

Significantly Forked from Code Yellow BV:

 * To use chartist draw signals so data can be kept live.
 * To stop using copies of the series data.
 * To use an inactive class instead of reformatting the series data.

Pie charts and some features maybe effected. Patched welcome.

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
.ct-series.inactive {
  visibility: hidden;
}
```

## Usage

In an example chart:

```js
require('chartist-plugin-legend');

var chart = new Chartist.Bar('.ct-chart', data, {
        stackBars: true,
        plugins: [
            Chartist.plugins.legend()
        ]
    },
});

...

chart.update(new_data);

```

| __Option__ | __Description__ | __Type__ | __Default__ |
| ---        | ---             | ---      | ---         |
| `className` | Adds a class to the `ul` element. | `string` | `''` |
| `clickable` | Sets the legends clickable state; setting this value to `false` disables toggling graphs on legend click. | `bool` | `true` |
| `legendNames` | Sets custom legend names. By default the `name` property of the series will be used if none are given. | `mixed` | `false` |
| `onClick` | Accepts a function that gets invoked if `clickable` is true. The function has the `chart`, and the click event (`e`), as arguments. | `mixed` | `false` |
| `classNames` | Accepts a array of strings as long as the chart's series, those will be added as classes to the `li` elements. | `mixed` | `false` |
| `removeAll` | Allow all series to be removed at once. | `bool` | `false` |
| `position` | Sets the position of the legend element. `top`, `bottom` or any DOM2 Element are currently accepted. If a DOM Element is given, the legend will be appended as it's last child. | `'top'|'bottom'|HTMLElement` | `'top'` |
