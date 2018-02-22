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

            function removeLegendElement() {
                var legendElement = chart.container.querySelector('.ct-legend');
                if (legendElement) {
                    legendElement.parentNode.removeChild(legendElement);
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

            // Append the legend element to the DOM
            function appendLegendToDOM(legendElement) {
                if (!(options.position instanceof HTMLElement)) {
                    switch (options.position) {
                        case 'top':
                            chart.container.insertBefore(legendElement, chart.container.childNodes[0]);
                            break;

                        case 'bottom':
                            chart.container.insertBefore(legendElement, null);
                            break;
                    }
                } else {
                    // Appends the legend element as the last child of a given HTMLElement
                    options.position.insertBefore(legendElement, null);
                }
            }

            function addClickHandler(legendElement, legends, useLabels) {
                legendElement.addEventListener('click', function(e) {
                    var li = e.target;
                    if (li.parentNode !== legendElement || !li.hasAttribute('data-legend'))
                        return;
                    e.preventDefault();

                    var legendIndex = parseInt(li.getAttribute('data-legend'));
                    var legend = legends[legendIndex];

                    legend.active = !legend.active;

                    var activeLegends = legends.filter(function(legend) { return legend.active; });
                    var activateAll = activeLegends.length === 0 && !options.removeAll;
                    var activeSeries = [];
                    legends.forEach(function(legend) {
                        if (activateAll)
                            legend.active = true;
                        if (legend.active) {
                            legend.element.classList.remove('inactive');
                            activeSeries = activeSeries.concat(legend.series);
                        } else {
                            legend.element.classList.add('inactive');
                        }
                    });

                    chart.data.series = activeSeries.map(function(series) { return series.data; });
                    if (useLabels) {
                        chart.data.labels = activeSeries.map(function(series) { return series.label; });
                    }

                    chart.update();

                    if (options.onClick) {
                        options.onClick(chart, e);
                    }
                });
            }

            removeLegendElement();

            var legendElement = createLegendElement();
            var useLabels = chart instanceof Chartist.Pie && chart.data.labels && chart.data.labels.length;
            var legendNames = getLegendNames(useLabels);
            var legends = [];

            // Check if given class names are viable to append to legends
            var classNamesViable = Array.isArray(options.classNames) && options.classNames.length === legendNames.length;

            // Loop through all legends to set each name in a list item.
            legendNames.forEach(function (legend, i) {
                var legendText = legend.name || legend;
                var legendSeriesIndices = legend.series || [i];
                var legendSeries = legendSeriesIndices.map(function(i) {
                    return {
                        data: chart.data.series[i],
                        label: useLabels ? chart.data.labels[i] : null
                    }});

                var li = createNameElement(i, legendText, classNamesViable);
                legendElement.appendChild(li);

                legends.push({
                    text: legendText,
                    series: legendSeries,
                    element: li,
                    active: true
                });
            });

            chart.on('created', function (data) {
                appendLegendToDOM(legendElement);
            });

            if (options.clickable) {
                setSeriesClassNames();
                addClickHandler(legendElement, legends, useLabels);
            }
        };
    };

    return Chartist.plugins.legend;

}));
