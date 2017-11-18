var svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object
var padding = {t: 20, r: 20, b: 20, l: 20};

function Visual(x) {
    this.x = x;
}

Visual.prototype.init = function(data, group) {
    var viz = d3.select(group);

    viz.append('text')
        .text(function(d) {
            return d.key;
        });
    viz.append('text')
        .text(function(d) {
            return '# of Colleges: ' + d.values.length;
        })
        .attr('transform', 'translate(10, 25)');

    viz.selectAll('.college')
        .data(data.values)
        .enter()
        .append('circle')
        .attr('r', 3)
        .attr('cx', function(d, i) {
            return 0;
        })
        .attr('cy', function(d, i) {
            return (i+1)*7;
        });

}

d3.csv('./data/colleges.csv',
function(row){
    // This callback formats each row of the data
    return {
        name: row['Name'],
        contorl: row['Control'],
        region: row['Region'],
        locale: row['Locale'],
        act_median: +row['ACT Median'],
        sat_average: +row['SAT Average'],
        undergrad_population: +row['Undergrad Population']
    }
},
function(error, dataset){
    if(error) {
        console.error('Error while loading ./data/colleges.csv dataset.');
        console.error(error);
        return;
    }

    var regionData = d3.nest()
        .key(function(d) {
            return d.region;
        })
        .entries(dataset);

    // **** Your JavaScript code goes here ****
    var regionViz = svg.selectAll('.viz')
        .data(regionData)
        .enter()
        .append('g')
        .attr('transform', function(d,i) {
            var tx = (i * ((svgWidth - padding.l - padding.r)/regionData.length)) + padding.l;
            var ty = (padding.t);
            return 'translate('+[tx, ty]+')';
        });
    console.log(regionData);

    regionViz.each(function(d) {
        rV = new Visual(0);
        rV.init(d, this);
    });

});
