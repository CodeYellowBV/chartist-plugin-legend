(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['chartist'], function (chartist) {
            return (root.returnExportsGlobal = factory(chartist));
        });
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('chartist'));
    } else {
        root['Chartist.plugins.legend'] = factory(root.Chartist);
    }
}(this, function (Chartist) {
    /**
     * This Chartist plugin creates a legend to show next to the chart.
     *
     */
    'use strict';

    var defaultOptions = {
        className: '',
        classNames: false,
        removeAll: false,
        legendNames: false,
        clickable: true,
        onClick: null,
        position: 'top'
    };

    Chartist.plugins = Chartist.plugins || {};

    Chartist.plugins.legend = function (options) {

        // Catch invalid options
        if (options && options.position) {
            if (!(options.position === 'top' || options.position === 'bottom' || options.position instanceof HTMLElement)) {
                throw Error('The position you entered is not a valid position');
            }
            if (options.position instanceof HTMLElement) {
                // Detatch DOM element from options object, because Chartist.extend
                // currently chokes on circular references present in HTMLElements
                var cachedDOMPosition = options.position;
                delete options.position;
            }
        }

        options = Chartist.extend({}, defaultOptions, options);

        if (cachedDOMPosition) {
            // Reattatch the DOM Element position if it was removed before
            options.position = cachedDOMPosition
        }

        return function legend(chart) {

            // if the legend has been already created and appended, removes the appendedElement
            // otherwise it looks for an element with the .ct-legend class inside the chart container
            function removeLegendElement() {
                if(appendedElement instanceof HTMLElement) {
                    appendedElement.parentNode.removeChild(appendedElement);
                    appendedElement = null
                } else {
                    var legendElement = chart.container.querySelector('.ct-legend');
                    if (legendElement) {
                        legendElement.parentNode.removeChild(legendElement);
                    }
                }
            }

            // Set a unique className for each series so that when a series is removed,
            // the other series still have the same color.
            function setSeriesClassNames() {
                chart.data.series = chart.data.series.map(function (series, seriesIndex) {
                    if (typeof series !== 'object') {
                        series = {
                            value: series
                        };
                    }
                    series.className = series.className || chart.options.classNames.series + '-' + Chartist.alphaNumerate(seriesIndex);
                    return series;
                });
            }

            function createLegendElement() {
                var legendElement = document.createElement('ul');
                legendElement.className = 'ct-legend';
                if (chart instanceof Chartist.Pie) {
                    legendElement.classList.add('ct-legend-inside');
                }
                if (typeof options.className === 'string' && options.className.length > 0) {
                    legendElement.classList.add(options.className);
                }
                if (chart.options.width) {
                    legendElement.style.cssText = 'width: ' + chart.options.width + 'px;margin: 0 auto;';
                }
                return legendElement;
            }

            // Get the right array to use for generating the legend.
            function getLegendNames(useLabels) {
                return options.legendNames || (useLabels ? chart.data.labels : chart.data.series);
            }

            // Initialize the array that associates series with legends.
            // -1 indicates that there is no legend associated with it.
            function initSeriesMetadata(useLabels) {
                var seriesMetadata = new Array(chart.data.series.length);
                for (var i = 0; i < chart.data.series.length; i++) {
                    seriesMetadata[i] = {
                        data: chart.data.series[i],
                        label: useLabels ? chart.data.labels[i] : null,
                        legend: -1
                    };
                }
                return seriesMetadata;
            }

            function createNameElement(i, legendText, classNamesViable) {
                var li = document.createElement('li');
                li.classList.add('ct-series-' + i);
                // Append specific class to a legend element, if viable classes are given
                if (classNamesViable) {
                    li.classList.add(options.classNames[i]);
                }
                li.setAttribute('data-legend', i);
                li.textContent = legendText;
                return li;
            }

            // Append the legend element to the DOM, returns the appended element
            function appendLegendToDOM(legendElement) {
                if (!(options.position instanceof HTMLElement)) {
                    switch (options.position) {
                        case 'top':
                            return chart.container.insertBefore(legendElement, chart.container.childNodes[0]);

                        case 'bottom':
                            return chart.container.insertBefore(legendElement, null);
                    }
                } else {
                    // Appends the legend element as the last child of a given HTMLElement
                    return options.position.insertBefore(legendElement, null);
                }
            }

            function addClickHandler(legendElement, legends, seriesMetadata, useLabels) {
                legendElement.addEventListener('click', function(e) {
                    var li = e.target;
                    if (li.parentNode !== legendElement || !li.hasAttribute('data-legend'))
                        return;
                    e.preventDefault();

                    var legendIndex = parseInt(li.getAttribute('data-legend'));
                    var legend = legends[legendIndex];

                    if (!legend.active) {
                        legend.active = true;
                        li.classList.remove('inactive');
                    } else {
                        legend.active = false;
                        li.classList.add('inactive');

                        var activeCount = legends.filter(function(legend) { return legend.active; }).length;
                        if (!options.removeAll && activeCount == 0) {
                            // If we can't disable all series at the same time, let's
                            // reenable all of them:
                            for (var i = 0; i < legends.length; i++) {
                                legends[i].active = true;
                                legendElement.childNodes[i].classList.remove('inactive');
                            }
                        }
                    }

                    var newSeries = [];
                    var newLabels = [];

                    for (var i = 0; i < seriesMetadata.length; i++) {
                        if (seriesMetadata[i].legend != -1 && legends[seriesMetadata[i].legend].active) {
                            newSeries.push(seriesMetadata[i].data);
                            newLabels.push(seriesMetadata[i].label);
                        }
                    }

                    chart.data.series = newSeries;
                    if (useLabels) {
                        chart.data.labels = newLabels;
                    }

                    chart.update();

                    if (options.onClick) {
                        options.onClick(chart, e);
                    }
                });
            }

            // Init all vars
            var appendedElement;
            var legendElement;
            var useLabels;
            var legendNames;
            var seriesMetadata;
            var legends;
            var classNamesViable;
            // Set up the reset callBack
            var resetCallback = options.resetCallback
            // And the reset function
            var reset = function () {
                initLegend(chart)
            }

            // This puts all the above together
            function initLegend(chart) {
                removeLegendElement();
                legendElement = createLegendElement();
                useLabels = chart instanceof Chartist.Pie && chart.data.labels && chart.data.labels.length;
                legendNames = getLegendNames(useLabels);
                seriesMetadata = initSeriesMetadata(useLabels);
                legends = [];

                // Check if given class names are viable to append to legends
                classNamesViable = Array.isArray(options.classNames) && options.classNames.length === legendNames.length;

                // Loop through all legends to set each name in a list item.
                legendNames.forEach(function (legend, i) {
                    var legendText = legend.name || legend;
                    var legendSeries = legend.series || [i];

                    var li = createNameElement(i, legendText, classNamesViable);
                    legendElement.appendChild(li);

                    legendSeries.forEach(function(seriesIndex) {
                        seriesMetadata[seriesIndex].legend = i;
                    });

                    legends.push({
                        text: legendText,
                        series: legendSeries,
                        active: true
                    });
                });

                // Append the legend element
                chart.on('created', function () {
                    appendedElement = appendLegendToDOM(legendElement);
                    /* This needs a bit of explanation: the first part before && just checks if resetCallback actually exists
                       then, given that it exists, it calls resetCallback with the two arguments chart and reset
                       In the page rendering the chart we'd have set up something like this:
                       var resetCallback;
                       function chartResetCallback(chart, reset) {
                            resetCallback = reset
                       }
                       And then we load our plugin by passing chartResetCallback
                       Chartist.plugins.legend({
                          resetCallback: chartResetCallback,
                        })
                       What happens is that we are "passing in" our chartResetCallback to the plugin
                       The plugin runs it by calling resetCallback(chart, reset) and this will "pass out"
                       our reset function as an argument to chartResetCallback() and this will assign the internal
                       reset function to the external resetCallback variable.
                       So now, on our page, we can call resetCallback() and this will trigger the internal reset() function
                       */
                    resetCallback && resetCallback(chart, reset)
                });

                if (options.clickable) {
                    setSeriesClassNames();
                    addClickHandler(legendElement, legends, seriesMetadata, useLabels);
                }

            }

            // Let's now run it and create our legend
            initLegend(chart)

        };
    };

    return Chartist.plugins.legend;

}));
