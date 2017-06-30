var expect = chai.expect;

var chartDataLine = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    series: [
        {name: 'Blue pill', data: [12, 9, 7, 8, 5]},
        {name: 'Red pill', data: [2, 1, 3.5, 7, 3]},
        {name: 'Purple pill', data: [1, 3, 4, 5, 6]}
    ]
};

var chart2DataLine = {
    labels: ['Week 1', 'Week 2'],
    series: [
        {name: 'Second pill', data: [20, 10]}
    ]
};

var chartDataPie = {
    labels: ['Piece A', 'Piece B', 'Piece C', 'Piece D'],
    series: [20, 10, 30, 40]
};

// PhantomJS can't do a `.click()` on a DOM element, this is a workaround.
function click(el){
    var ev = document.createEvent('MouseEvent');
    ev.initMouseEvent(
        'click',
        true, true,
        window, null,
        0, 0, 0, 0,
        false, false, false, false,
        0, null
    );
    el.dispatchEvent(ev);
}

function generateChart(type, chartData, legendOptions, chartNumber) {
    chartNumber = chartNumber || 1;
    return new Chartist[type]('.ct-chart-' + chartNumber, chartData, {
        fullWidth: true,
        chartPadding: {
            right: 40
        },
        plugins: [
            Chartist.plugins.legend(legendOptions)
        ]
    });
}

describe('Chartist plugin legend', function() {
    var chart;
    var chart2;

    function destroyChart() {
        chart.detach();
        chart.container.innerHTML = '';
        chart = undefined;
        if (chart2) {
            chart2.detach();
            chart2.container.innerHTML = '';
            chart2 = undefined;
        }
    }

    it('should be defined in chartist', function () {
        expect(window.Chartist.plugins.legend).to.exist;
    });

    before(function() {
        var chartEl = document.createElement('div');
        chartEl.classList.add('ct-chart-1');
        document.body.appendChild(chartEl);
        var chartEl2 = document.createElement('div');
        chartEl2.classList.add('ct-chart-2');
        document.body.appendChild(chartEl2);
    });

    describe('work with a Line chart', function() {
        before(function(done) {
            chart = generateChart('Line', chartDataLine);

            chart.on('created', function() { done(); });
        });

        after(destroyChart);

        it('should insert a list', function () {
            var matches = chart.container.querySelectorAll('ul.ct-legend');
            expect(matches.length).to.equal(1);
        });

        it('list items should be the same size as the series', function () {
            var matches = chart.container.querySelectorAll('ul.ct-legend > li');
            expect(matches.length).to.equal(chartDataLine.series.length);
        });

        it('should insert list items in correct series order', function () {
            var legendKey = 0;
            var parent = chart.container.querySelector('ul.ct-legend');

            [].forEach.call(parent.childNodes, function(item) {
                expect(item.dataset.legend).to.equal(String(legendKey));
                expect(item.className).to.equal('ct-series-' + String(legendKey));
                expect(item.innerHTML).to.equal(chartDataLine.series[legendKey].name);
                legendKey += 1;
            });
        });

        it('should not modify the series', function () {
            expect(chart.data.series.length).to.equal(chartDataLine.series.length);
        });

        it('should not insert legend twice', function () {
            window.Chartist.plugins.legend()(chart);
            // Set a delay on the test to ensure it doesn't overlap with the plugin native 'created' handler
            chart.on('created', function () {
               setTimeout(function () {
                  var matches = chart.container.querySelectorAll('ul.ct-legend');
                  expect(matches.length).to.equal(1);

               }, 10)
            });
        });
    });

    describe('work with a Pie chart', function() {
        before(function(done) {
            chart = generateChart('Pie', chartDataPie);

            chart.on('created', function() { done(); });
        });

        after(destroyChart);

        it('should insert a list', function () {
            var matches = chart.container.querySelectorAll('ul.ct-legend');
            expect(matches.length).to.equal(1);
            expect(matches[0].className).to.equal('ct-legend ct-legend-inside');
        });

        it('list items should be the same size as the labels', function () {
            var matches = chart.container.querySelectorAll('ul.ct-legend > li');
            expect(matches.length).to.equal(chartDataPie.labels.length);
        });

        it('should insert list items in correct labels order', function () {
            var legendKey = 0;
            var parent = chart.container.querySelector('ul.ct-legend');

            [].forEach.call(parent.childNodes, function(item) {
                expect(item.dataset.legend).to.equal(String(legendKey));
                expect(item.className).to.equal('ct-series-' + String(legendKey));
                expect(item.innerHTML).to.equal(chartDataPie.labels[legendKey]);
                legendKey += 1;
            });
        });
    });

    describe('work with two legends', function() {
        before(function(done) {
            chart = generateChart('Line', chartDataLine);

            chart.on('created', function() {
                chart.off('created');
                chart2 = generateChart('Line', chart2DataLine, null, 2);
                chart2.on('created', function() {
                    chart2.off('created');
                    done();
                });
            });
        });

        after(destroyChart);

        it('should create unique legends', function () {
            const legendText1 = chart.container.querySelector('ul.ct-legend').textContent;
            const legendText2 = chart2.container.querySelector('ul.ct-legend').textContent;
            expect(legendText1).to.equal('Blue pillRed pillPurple pill');
            expect(legendText2).to.equal('Second pill');
        });
    });

    describe('allow options', function() {
        it('should use custom legend names if provided', function(done) {
            var legendNames = ['Sheep', 'are', 'animals'];
            chart = generateChart('Line', chartDataLine, { legendNames: legendNames });

            // Set a delay on the test to ensure it doesn't overlap with the plugin native 'created' handler
            chart.on('created', function () {
               setTimeout(function () {
                  var legendKey = 0;
                  var parent = chart.container.querySelector('ul.ct-legend');

                  expect(parent.childNodes.length).to.equal(3);
                  [].forEach.call(parent.childNodes, function (item)
                  {
                     expect(item.innerHTML).to.equal(legendNames[legendKey]);
                     legendKey += 1;
                  });

                  destroyChart();
                  done();

               }, 10)
            });
        });

        it('should use the data object name when labels are not defined', function (done) {
            var chartDataNoLabels = {
                labels: [], // adding empty arry because chartist.js converts null or undefined labels into empty array
                series: [
                    {name: 'Piece A', value: 20},
                    {name: 'Piece B', value: 10},
                    {name: 'Piece C', value: 30},
                    {name: 'Piece D', value: 40}
                ]
            };
            chart = generateChart('Pie', chartDataNoLabels);

            // Set a delay on the test to ensure it doesn't overlap with the plugin native 'created' handler
            chart.on('created', function() {
                setTimeout(function () {
                    var legendKey = 0;
                    var parent = chart.container.querySelector('ul.ct-legend');

                    expect(parent.childNodes.length).to.equal(4);

                    [].forEach.call(parent.childNodes, function(item) {
                        expect(item.innerHTML).to.equal(chartDataNoLabels.series[legendKey].name);
                        legendKey += 1;
                    });

                    destroyChart();
                    done();
                }, 10);
            });


        });

        it('should allow a custom class name', function(done) {
            chart = generateChart('Line', chartDataLine, { className: 'bananas' });

            // Set a delay on the test to ensure it doesn't overlap with the plugin native 'created' handler
            chart.on('created', function () {
               setTimeout(function () {
                  var legend = chart.container.querySelector('ul.ct-legend');
                  expect(legend.classList[1]).to.equal('bananas');
                  destroyChart();
                  done();

               }, 10)
            });
        });

        it('should allow multiple custom class names', function (done) {
           var classNames = ['multiclass-0', 'multiclass-1', 'multiclass-hidden'];
           chart = generateChart('Line', chartDataLine, { classNames: classNames });

           // Set a delay on the test to ensure it doesn't overlap with the plugin native 'created' handler
           chart.on('created', function () {
              setTimeout(function () {
                 var legend = chart.container.querySelector('ul.ct-legend');

                 expect(chart.data.series.length).to.equal(3);
                 expect(legend.children[0].classList.contains(classNames[0])).to.be.true;
                 expect(legend.children[1].classList.contains(classNames[1])).to.be.true;
                 expect(legend.children[2].classList.contains(classNames[2])).to.be.true;
                 destroyChart();
                 done();

              }, 10)
           });
        });

        describe('allow custom positioning', function () {
           it('should allow top positioning', function (done) {
              chart = generateChart('Line', chartDataLine, { position: 'top' });

              // Set a delay on the test to ensure it doesn't overlap with the plugin native 'created' handler
              chart.on('created', function () {
                 setTimeout(function () {
                    expect(chart.container.childNodes.length).to.equal(2);
                    var listElement = chart.container.querySelector("ul");
                    expect(chart.container.childNodes[0]).to.equal(listElement);
                    done();
                 }, 10)
              });
           });

           it('should allow bottom positioning', function (done) {
              chart = generateChart('Line', chartDataLine, { position: 'bottom' });

              // Set a delay on the test to ensure it doesn't overlap with the plugin native 'created' handler
              chart.on('created', function () {
                 setTimeout(function () {
                    expect(chart.container.childNodes.length).to.equal(2);
                    var listElement = chart.container.querySelector("ul");
                    expect(chart.container.childNodes[1]).to.equal(listElement);
                    done();
                 }, 10)
              });
           });

           it('should allow positioning to any DOM2 element', function (done) {
              var testDOMElement = document.createElement('div');
              document.body.insertBefore(testDOMElement , null);

              chart = generateChart('Line', chartDataLine, { position: testDOMElement });

              // Set a delay on the test to ensure it doesn't overlap with the plugin native 'created' handler
              chart.on('created', function () {
                 setTimeout(function () {
                    expect(testDOMElement.childNodes.length).to.equal(1);
                    var listElement = testDOMElement.querySelector("ul");
                    expect(testDOMElement.childNodes[0]).to.equal(listElement);

                     // Clean up
                    document.body.removeChild(testDOMElement);
                    done();
                 }, 100)
              });
           });
        });

        it('should allow to remove all series at once', function () {
           chart = generateChart('Line', chart2DataLine, { removeAll: true });

           chart.on('created', function () {
              var seriesA = chart.container.querySelector('ul.ct-legend > .ct-series-0');

              expect(chart.data.series.length).to.equal(1);
              click(seriesA);
              expect(chart.data.series.length).to.equal(0);
              click(seriesA);
              expect(chart.data.series.length).to.equal(1);
              destroyChart();
              done();
           });
        })

        describe('clickable', function() {
            before(function(done) {
                chart = generateChart('Line', chartDataLine, {
                    clickable: true,
                    onClick: function(chart,e) {
                        chart.legendClicked = true;
                    }
                });

                chart.on('created', function() {
                    chart.off('created');
                    done();
                });
            });

            after(destroyChart);

            it('should enforce a className for each series', function() {
                expect(chart.data.series[0].className).to.equal('ct-series-a');
                expect(chart.data.series[1].className).to.equal('ct-series-b');
                expect(chart.data.series[2].className).to.equal('ct-series-c');
            });

            it('should hide a series after a click on the legend item', function() {
                var seriesA = chart.container.querySelector('ul.ct-legend > .ct-series-0');
                var seriesB = chart.container.querySelector('ul.ct-legend > .ct-series-1');
                var seriesC = chart.container.querySelector('ul.ct-legend > .ct-series-2');

                expect(chart.data.series.length).to.equal(3);

                // The first click should hide the corresponding series.
                click(seriesB);
                expect(chart.data.series.length).to.equal(2);
                expect(chart.data.series[0].name).to.equal('Blue pill');
                expect(chart.data.series[1].name).to.equal('Purple pill');
                var svgSeries = chart.container.querySelectorAll('g.ct-series');
                expect(svgSeries.length).to.equal(2);
                expect(svgSeries[0].className.baseVal).to.contain('ct-series-a');
                expect(svgSeries[1].className.baseVal).to.contain('ct-series-c');

                // A second click should show the corresponding series again.
                click(seriesB);
                var svgSeries2 = chart.container.querySelectorAll('g.ct-series');
                expect(svgSeries2.length).to.equal(3);
                expect(svgSeries2[0].className.baseVal).to.contain('ct-series-a');
                expect(svgSeries2[1].className.baseVal).to.contain('ct-series-b');
                expect(svgSeries2[2].className.baseVal).to.contain('ct-series-c');

                // A click in the last active series should set all series active again.
                click(seriesA);
                click(seriesB);
                expect(chart.data.series.length).to.equal(1);
                expect(chart.data.series[0].name).to.equal('Purple pill');
                click(seriesC);
                expect(svgSeries2.length).to.equal(3);
                expect(svgSeries2[0].className.baseVal).to.contain('ct-series-a');
                expect(svgSeries2[1].className.baseVal).to.contain('ct-series-b');
                expect(svgSeries2[2].className.baseVal).to.contain('ct-series-c');
            });

            it('should update the legend item classes', function() {
                var seriesA = chart.container.querySelector('ul.ct-legend > .ct-series-0');
                var seriesB = chart.container.querySelector('ul.ct-legend > .ct-series-1');
                var seriesC = chart.container.querySelector('ul.ct-legend > .ct-series-2');

                // The first click should hide the corresponding series.
                click(seriesB);
                var legendItems = chart.container.querySelectorAll('ul.ct-legend > li');
                expect(legendItems[0].className).to.equal('ct-series-0');
                expect(legendItems[1].className).to.equal('ct-series-1 inactive');
                expect(legendItems[2].className).to.equal('ct-series-2');

                // A second click should show the corresponding series again.
                click(seriesB);
                var inactiveItem = chart.container.querySelectorAll('ul.ct-legend > li.inactive');
                expect(inactiveItem.length).to.equal(0);

                // A click in the last active series should set all series active again.
                click(seriesA);
                click(seriesB);
                var legendItems = chart.container.querySelectorAll('ul.ct-legend > li');
                expect(legendItems[0].className).to.equal('ct-series-0 inactive');
                expect(legendItems[1].className).to.equal('ct-series-1 inactive');
                expect(legendItems[2].className).to.equal('ct-series-2');
                click(seriesC);
                var inactiveItem = chart.container.querySelectorAll('ul.ct-legend > li.inactive');
                expect(inactiveItem.length).to.equal(0);

            });

            it('should call a function after a click on the legend item', function() {
                var seriesB = chart.container.querySelector('ul.ct-legend > .ct-series-1');

                click(seriesB);
                expect(chart.legendClicked).to.equal(true);
            });
        });

        describe('clickable for a pie', function() {
            before(function(done) {
                chart = generateChart('Pie', chartDataPie, {
                    clickable: true,
                });

                chart.on('created', function() {
                    chart.off('created');
                    done();
                });
            });

            after(destroyChart);

            it('should enforce a className for each series', function() {
                expect(chart.data.series[0].className).to.equal('ct-series-a');
                expect(chart.data.series[1].className).to.equal('ct-series-b');
            });

            it('should hide a series after a click on the legend item', function() {
                var seriesB = chart.container.querySelector('ul.ct-legend > .ct-series-1');

                expect(chart.data.labels.length).to.equal(4);

                // The first click should hide the corresponding series.
                click(seriesB);
                expect(chart.data.series.length).to.equal(3);
                var svgSeries = chart.container.querySelectorAll('g.ct-series');
                expect(svgSeries.length).to.equal(3);
                expect(svgSeries[0].className.baseVal).to.contain('ct-series-d');
                expect(svgSeries[1].className.baseVal).to.contain('ct-series-c');
                expect(chart.data.labels.length).to.equal(3);

                // A second click should show the corresponding series again.
                click(seriesB);
                var svgSeries2 = chart.container.querySelectorAll('g.ct-series');
                expect(svgSeries2.length).to.equal(4);
                expect(svgSeries2[0].className.baseVal).to.contain('ct-series-d');
                expect(svgSeries2[1].className.baseVal).to.contain('ct-series-c');
                expect(svgSeries2[2].className.baseVal).to.contain('ct-series-b');
                expect(svgSeries2[3].className.baseVal).to.contain('ct-series-a');
                expect(chart.data.labels.length).to.equal(4);
            });
        });
    });
});
