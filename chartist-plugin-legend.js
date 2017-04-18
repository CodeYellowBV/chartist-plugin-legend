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

        function compareNumbers(a, b) {
            return a - b;
        }

        // Catch invalid options
        if (options && options.position) {
           if (!(options.position === 'top' || options.position === 'bottom' || options.position instanceof HTMLElement)) {
              throw Error('The position you entered is not a valid position');
           }
           if(options.position instanceof HTMLElement){
              // Detatch DOM element from options object, because Chartist.extend currently chokes on circular references present in HTMLElements
              var cachedDOMPosition = options.position;
              delete options.position;
           }
        }

        options = Chartist.extend({}, defaultOptions, options);

        if(cachedDOMPosition){
            // Reattatch the DOM Element position if it was removed before
            options.position = cachedDOMPosition
        }

        return function legend(chart) {
            var existingLegendElement = chart.container.querySelector('.ct-legend');
            if (existingLegendElement) {
                // Clear legend if already existing.
                existingLegendElement.parentNode.removeChild(existingLegendElement);
            }

            var legendElement = document.createElement('ul'),
                isPieChart = chart instanceof Chartist.Pie;
            legendElement.className = 'ct-legend';
            if (chart instanceof Chartist.Pie) {
                legendElement.classList.add('ct-legend-inside');
            }
            if (typeof options.className === 'string' && options.className.length > 0) {
                legendElement.classList.add(options.className);
            }

            chart.on('created', function (data) {
               // Append the legend element to the DOM
               if(!(options.position instanceof HTMLElement))
               {
                  switch (options.position) {
                     case 'top':
                        chart.container.insertBefore(legendElement, chart.container.childNodes[0]);
                        break;

                     case 'bottom':
                        chart.container.insertBefore(legendElement, null);
                        break;
                   }
               }
               else {
                  // Appends the legend element as the last child of a given HTMLElement
                  options.position.insertBefore(legendElement, null);
               }
            });
            chart.on('data', function (data) {
              // empty when ready.
              $(legendElement).empty();
            });

            chart.on('draw', function(e) {
                if(e.type == 'line' && e.series) {
                    var class_name = 'ct-series-' + e.index;
                    var existingLi = chart.container.querySelector('.'+class_name);
                    if (existingLi) {
                        existingLi.parentNode.removeChild(existingLi);
                    }

                    var classes = class_name + ' ' + (e.series.className || options.classNames[e.index]);
                    var name = e.series.name || legendNames[e.index];
                    var li = document.createElement('li');

                    li.className = classes
                    li.textContent = name;
                    li.setAttribute('data-hidden', 0);
                    legendElement.appendChild(li);

                    if (options.clickable) {
                      li.addEventListener('click', function (p) {
                        if(e.group.classes().indexOf('inactive') > -1) {
                          e.group.removeClass('inactive');
                          li.classList.remove('inactive');
                        } else {
                          e.group.addClass('inactive');
                          li.classList.add('inactive');
                        }
                      });
                    }
                }
            });
        };

    };

    return Chartist.plugins.legend;

}));
