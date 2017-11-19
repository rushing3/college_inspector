var svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object
var padding = {t: 20, r: 20, b: 20, l: 20};

// Locale color scale
var localeColorScale = d3.scaleOrdinal(d3.schemeSet2);

// Num of dots in row
var rowNum = 8;

// Dot radius
var dotRad = 7;

// Dot spacing
var dotSpace = dotRad*2 + 1;

function Visual(x) {
    this.x = x;
}

Visual.prototype.init = function(data, group) {
    var viz = d3.select(group);

    // Sort data by locale
    data.value.values.sort(function(a, b) {
        return d3.ascending(a.locale, b.locale);
    });

    // Add region label
    viz.append('text')
        .text(function(d) {
            return d.key;
        });

    // Add label for how many colleges are in that region
    viz.append('text')
        .text(function(d) {
            return '# of Colleges: ' + d.value.values.length;
        })
        .attr('transform', 'translate(10, 20)');

    // Add labels for avg info about colleges in that region
    viz.append('text')
        .text(function(d) {
            return 'Avg SAT: ' + Math.round(d.value.avg_sat);
        })
        .attr('transform', 'translate(15, 40)');

    viz.append('text')
        .text(function(d) {
            return 'Avg Pop: ' + Math.round(d.value.avg_pop);
        })
        .attr('transform', 'translate(15, 55)');

    // Add dot for each college in region, color coded by locale
    viz.selectAll('.college')
        .data(data.value.values)
        .enter()
        .append('circle')
        .attr('fill', function(d) {
            return localeColorScale(d.locale);
        })
        .attr('r', dotRad)
        .attr('cx', function(d, i) {
            return (i%rowNum)*dotSpace + 10;
        })
        .attr('cy', function(d, i) {
            return Math.floor(i/rowNum)*dotSpace + 70;
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

    // Nest locale data
    var localeData = d3.nest()
        .key(function(d) {
            return d.locale;
        })
        .entries(dataset);

    // Nest region data
    var regionData = d3.nest()
        .key(function(d) {
            return d.region;
        })
        .rollup(function(v) { return {
            values: v,
            avg_sat: d3.mean(v, function(d) { return d.sat_average; }),
            avg_pop: d3.mean(v, function(d) { return d.undergrad_population; })
        }; })
        .entries(dataset);

    // Set localColor domain to be set of all unique locales
    var localeDomain = localeData.map(function(d) {
        return d.key;
    }).sort(function(a, b) {
        return d3.ascending(a, b);
    });
    localeColorScale.domain(localeDomain);

    // Define legend for locale colors
    var localeLegend = d3.legendColor().scale(localeColorScale);

    // Add legend for locale colors
    svg.append('g')
        .attr('transform', 'translate(20, 500) scale(0.8, 0.8)')
        .call(localeLegend);

    // Add a group for each region
    var regionViz = svg.selectAll('.viz')
        .data(regionData)
        .enter()
        .append('g')
        .attr('transform', function(d,i) {
            var tx = (i * ((svgWidth - padding.l - padding.r)/regionData.length)) + padding.l;
            var ty = (padding.t);
            return 'translate('+[tx, ty]+')';
        });

    // Make and add Viz for each region group
    regionViz.each(function(d) {
        rV = new Visual(0);
        rV.init(d, this);
    });

});
