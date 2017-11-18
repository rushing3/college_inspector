var svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object
var padding = {t: 20, r: 20, b: 20, l: 250};

function Visual(x, y) {
    this.x = x;
    this.y = y;
}

Visual.prototype.init = function(g, data) {
    var viz = d3.select(g);
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

    // **** Your JavaScript code goes here ****
    var histoG = svg.selectAll('.viz')
        .data(dataset)
        .enter()
        .append('g')
        .attr('transform', function(d,i) {
            var tx = (i * 2);
            var ty = (padding.t);
            return 'translate('+[tx, ty]+')';
        });

});
