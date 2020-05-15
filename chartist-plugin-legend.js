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

    const defaultOptions = {
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

        // Catch invalid options - position must be a string
        if (options && options.position) {
            if (!(typeof options.position === 'string')) {
                throw Error('The position you entered is not a valid position');
            }
        }

        options = Chartist.extend({}, defaultOptions, options);

        return function legend(chart) {

            function removeLegendElement() {
                const legendElement = chart.container.querySelector('.ct-legend');
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
                const legendElement = document.createElement('ul');
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
                const seriesMetadata = new Array(chart.data.series.length);
                for (let i = 0; i < chart.data.series.length; i++) {
                    seriesMetadata[i] = {
                        data: chart.data.series[i],
                        label: useLabels ? chart.data.labels[i] : null,
                        legend: -1
                    };
                }
                return seriesMetadata;
            }

            function createNameElement(i, legendText, classNamesViable) {
                const li = document.createElement('li');
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
                // If you named your div 'top' or 'bottom', it won't be attached
                switch (options.position) {
                    case 'top':
                        chart.container.insertBefore(legendElement, chart.container.childNodes[0]);
                        break;

                    case 'bottom':
                        chart.container.insertBefore(legendElement, null);
                        break;

                    default:
                        const pos = document.getElementById(options.position)
                        if (pos !== null) {
                            // Appends the legend element as the last child of a given HTMLElement
                            pos.insertBefore(legendElement, null);
                        } else {
                            throw Error('The position you entered is not a valid position');
                        }
                        break;
                }
            }

            function addClickHandler(legendElement, legends, seriesMetadata, useLabels) {
                legendElement.addEventListener('click', function(e) {
                    const li = e.target;
                    if (li.parentNode !== legendElement || !li.hasAttribute('data-legend'))
                        return;
                    e.preventDefault();

                    const legendIndex = parseInt(li.getAttribute('data-legend'));
                    const legend = legends[legendIndex];

                    if (!legend.active) {
                        legend.active = true;
                        li.classList.remove('inactive');
                    } else {
                        legend.active = false;
                        li.classList.add('inactive');

                        const activeCount = legends.filter(function (legend) {
                            return legend.active;
                        }).length;
                        if (!options.removeAll && activeCount === 0) {
                            // If we can't disable all series at the same time, let's
                            // reenable all of them:
                            for (let i = 0; i < legends.length; i++) {
                                legends[i].active = true;
                                legendElement.childNodes[i].classList.remove('inactive');
                            }
                        }
                    }

                    const newSeries = [];
                    const newLabels = [];

                    for (let i = 0; i < seriesMetadata.length; i++) {
                        if (seriesMetadata[i].legend !== -1 && legends[seriesMetadata[i].legend].active) {
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

            removeLegendElement();

            const legendElement = createLegendElement();
            const useLabels = chart instanceof Chartist.Pie && chart.data.labels && chart.data.labels.length;
            const legendNames = getLegendNames(useLabels);
            const seriesMetadata = initSeriesMetadata(useLabels);
            const legends = [];

            // Check if given class names are viable to append to legends
            const classNamesViable = Array.isArray(options.classNames) && options.classNames.length === legendNames.length;

            // Loop through all legends to set each name in a list item.
            legendNames.forEach(function (legend, i) {
                const legendText = legend.name || legend;
                const legendSeries = legend.series || [i];

                const li = createNameElement(i, legendText, classNamesViable);
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

            chart.on('created', function () {
                appendLegendToDOM(legendElement);
            });

            if (options.clickable) {
                setSeriesClassNames();
                addClickHandler(legendElement, legends, seriesMetadata, useLabels);
            }
        };
    };

    return Chartist.plugins.legend;

}));
