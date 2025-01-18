/**
 * reference: https://blog.braveridge.com/blog/archives/338
 */
Chart.register({
    id:'verticalLinePlugin',
    lineLabels: [],
    x: NaN,
    defaults: {
        lineWidth: '2',
        color: 'black',
        lineDash: [3, 3],
        addedLine: {
            lineWidth: '2',
            color: 'red',
            lineDash: [3, 3],
        },
    },
    beforeInit: function(chart, args, options) {
        chart.verticalLinePlugin = {};
        chart.verticalLinePlugin.addLineLabel = (lineLabel) => {
            this.lineLabels.push(lineLabel);
        }
        chart.verticalLinePlugin.removeLineLabel = (lineLabel) => {
            this.lineLabels = this.lineLabels.filter(l => l !== lineLabel);
        }
        chart.verticalLinePlugin.getLineLabels = () => {
            return this.lineLabels;
        }
    },
    beforeEvent: function (chart, args, options) {
        const e = args.event;
        const elms = chart.getElementsAtEventForMode(e, 'nearest', { intersect: false }, true);
        if ((elms.length > 0) &&
            (e.x >= e.chart.chartArea.left) && (e.x <= e.chart.chartArea.right) &&
            (e.y >= e.chart.chartArea.top) && (e.y <= e.chart.chartArea.bottom)) {
                this.x = elms[0].element.x
        } else {
            this.x = NaN;
        }
    },
    afterDatasetsDraw : function(chart, args, options) {
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;

        for (let lineLabel of this.lineLabels) {
            const x = chart.scales.x.getPixelForValue(lineLabel);
            ctx.save();
            ctx.lineWidth = options.addedLine.lineWidth;
            ctx.strokeStyle = options.addedLine.color;
            ctx.setLineDash(options.addedLine.lineDash);
            ctx.beginPath();
            ctx.moveTo(x, chartArea.bottom);
            ctx.lineTo(x, chartArea.top);
            ctx.stroke();
            ctx.restore();
        }

        if (isNaN(this.x)) {
            return;
        }

        ctx.save();
        ctx.lineWidth = options.lineWidth;
        ctx.strokeStyle = options.color;
        ctx.setLineDash(options.lineDash);
        ctx.beginPath();
        ctx.moveTo(this.x, chartArea.bottom);
        ctx.lineTo(this.x, chartArea.top);
        ctx.stroke();
        ctx.restore();
    },
});
