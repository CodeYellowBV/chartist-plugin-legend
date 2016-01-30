var expect = chai.expect;

var chartDataLine = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    series: [
        {name: 'Blue pill', data: [12, 9, 7, 8, 5]},
        {name: 'Red pill', data: [2, 1, 3.5, 7, 3]},
        {name: 'Purple pill', data: [1, 3, 4, 5, 6]}
    ]
};

var chartDataPie = {
    labels: ['Piece A', 'Piece B', 'Piece C', 'Piece D'],
    series: [20, 10, 30, 40]
};

function generateChart(type, chartData, legendOptions) {
    return new Chartist[type]('.ct-chart', chartData, {
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

    function destroyChart() {
        chart.detach();
        chart.container.innerHTML = '';
        chart = undefined;
    }

    it('should be defined in chartist', function () {
        expect(window.Chartist.plugins.legend).to.exist;
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
            var matches = chart.container.querySelectorAll('ul.ct-legend');
            expect(matches.length).to.equal(1);
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

    describe('allow options', function() {
        it('should use custom legend names if provided', function(done) {
            var legendNames = ['Sheep', 'are', 'animals'];
            chart = generateChart('Line', chartDataLine, { legendNames: legendNames });

            chart.on('created', function() {
                var legendKey = 0;
                var parent = chart.container.querySelector('ul.ct-legend');

                [].forEach.call(parent.childNodes, function(item) {
                    expect(item.innerHTML).to.equal(legendNames[legendKey]);
                    legendKey += 1;
                });

                destroyChart();
                done();
            });
        });

        describe('clickable', function() {
            before(function(done) {
                chart = generateChart('Line', chartDataLine, { clickable: true });

                chart.on('created', function() { done(); });
            });

            after(destroyChart);

            it('should enforce a className for each series', function() {
                expect(chart.data.series[0].className).to.equal('ct-series-a');
                expect(chart.data.series[1].className).to.equal('ct-series-b');
                expect(chart.data.series[2].className).to.equal('ct-series-c');
            });

            it('should hide a series after a click on the legend item', function() {
                var seriesB = chart.container.querySelector('ul.ct-legend > .ct-series-1');

                expect(chart.data.series.length).to.equal(3);

                // The first click should hide the corresponding series.
                console.log('ha', seriesB);
                seriesB.click();
                expect(chart.data.series.length).to.equal(2);
                expect(chart.data.series[0].name).to.equal('Blue pill');
                expect(chart.data.series[1].name).to.equal('Purple pill');
                var svgSeries = chart.container.querySelectorAll('g.ct-series');
                expect(svgSeries.length).to.equal(2);
                expect(svgSeries[0].className.baseVal).to.contain('ct-series-a');
                expect(svgSeries[1].className.baseVal).to.contain('ct-series-c');

                // A second click should show the corresponding series again.
                seriesB.click();
                var svgSeries2 = chart.container.querySelectorAll('g.ct-series');
                expect(svgSeries2.length).to.equal(3);
                expect(svgSeries2[0].className.baseVal).to.contain('ct-series-a');
                expect(svgSeries2[1].className.baseVal).to.contain('ct-series-b');
                expect(svgSeries2[2].className.baseVal).to.contain('ct-series-c');
            });

            it('should update the legend item classes', function() {
                var seriesB = chart.container.querySelector('ul.ct-legend > .ct-series-1');

                // The first click should hide the corresponding series.
                seriesB.click();
                var legendItems = chart.container.querySelectorAll('ul.ct-legend > li');
                expect(legendItems[0].className).to.equal('ct-series-0');
                expect(legendItems[1].className).to.equal('ct-series-1 inactive');
                expect(legendItems[2].className).to.equal('ct-series-2');

                // A second click should show the corresponding series again.
                seriesB.click();
                var inactiveItem = chart.container.querySelectorAll('ul.ct-legend > li.inactive');
                expect(inactiveItem.length).to.equal(0);
            });
        });
    });
});
