document.addEventListener('DOMContentLoaded', async () => {
    const DEBUG = false;
    let chart = null;

    const ctx = document.getElementById('csv-chart');
    const data = {
        labels: [],
        datasets: [{
            label: 'Loaded CSV Data',
            data: [],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        },]
    };
    const options = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        },
        onClick: (event, elements, chart) => {
            if (elements.length === 0 || !elements[0]) {
                return;
            }
            const i = elements[0].index;
            const label = chart.data.labels[i];
            if (chart.verticalLinePlugin.getLineLabels().indexOf(label) < 0) {
                chart.verticalLinePlugin.addLineLabel(label);
            } else {
                chart.verticalLinePlugin.removeLineLabel(label);
            }
            // console.log(chart.data.labels[i] + ': ' + chart.data.datasets[0].data[i]);
        },
        tooltips: {
            enabled: true,
            mode: 'nearest',
            intersect: false
        },
        plugins: {
            verticalLinePlugin: {
            },
        },
    };
    chart = new Chart(ctx, {
        type: 'line',
        data,
        options,
    });

    if (DEBUG) {
        const res = await fetch('./sample-data/0.csv');
        const csvText = await res.text();
        const values = csvText.split('\n')
            .map(row => row.split(','))
            .flat()
            .map(v => Number(v));
        const labelLength = chart.data.labels.length;
        for (let i in values) {
            const v = values[i];
            chart.data.datasets[0].data.push(v);
            chart.data.labels.push(labelLength + i)
        }
        chart.update();
    }

    function dropHandler(ev) {
        ev.preventDefault();
        if (ev.dataTransfer.items) {
            console.log('DataTransferItemList');
            [...ev.dataTransfer.items].forEach((item, i) => {
                const file = item.getAsFile();
                if (!file || file.type !== 'text/csv') {
                    alert('Please drop a valid CSV file.');
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    const csvText = e.target.result;
                    const values = csvText
                        .split('\n')
                        .map(row => row.split(','))
                        .flat()
                        .map(v => Number(v));
                    const labelLength = chart.data.labels.length;
                    for (let i in values) {
                        const v = values[i];
                        chart.data.datasets[0].data.push(v);
                        chart.data.labels.push(labelLength + i)
                    }
                    chart.update();
                    document.getElementById('download-button').disabled = false;
                };
                reader.readAsText(file);
            });
        } else {
            console.log('DataTransfer');
            [...ev.dataTransfer.files].forEach((file, i) => {
                console.log(`… file[${i}].name = ${file.name}`);
            });
        }
    }
    
    function dragOverHandler(ev) {
        console.log('File(s) in drop zone');
        ev.preventDefault();
    }

    ctx.addEventListener('drop', dropHandler);
    ctx.addEventListener('dragover', dragOverHandler);

    const downloadButton = document.getElementById('download-button');
    downloadButton.disabled = true;
    downloadButton.addEventListener('click', () => {
        const selectedLabels = chart.verticalLinePlugin.getLineLabels().sort();
        const indexes = [0].concat(selectedLabels.map(Number), [chart.data.datasets[0].data.length]);

        const anchor = document.createElement('a');
        const packaged = document.getElementById('packaged-one-file').checked;
        
        if (packaged) {
            let csvText = '';
            for (let i = 1; i < indexes.length; i++) {
                const i1 = indexes[i - 1];
                const i2 = indexes[i];
                const data = chart.data.datasets[0].data.slice(i1, i2);
                csvText += data.join(',');
                if (i !== indexes.length - 1) {
                    csvText += '\n';
                }
            }
            const blob = new Blob([csvText], {type: 'text/csv'});
            const url = URL.createObjectURL(blob);
            anchor.setAttribute('href', url);
            anchor.setAttribute('download', `data.csv`);
            anchor.click();
        } else {
            for (let i = 1; i < indexes.length; i++) {
                const i1 = indexes[i - 1];
                const i2 = indexes[i];
                const data = chart.data.datasets[0].data.slice(i1, i2);
                const csvText = data.join(',');
                const blob = new Blob([csvText], {type: 'text/csv'});
                const url = URL.createObjectURL(blob);
                anchor.setAttribute('href', url);
                anchor.setAttribute('download', `${i1}-${i2 - 1}.csv`);
                anchor.click();
            }
        }
    });
});
