var svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object
var padding = {t: 90, r: 40, b: 40, l: 50};

// ScatterPlot dimensions
var spWidth = svgWidth*(2/3) - padding.l;
var spHeight = svgHeight - padding.t - padding.b;

// Create group for ScatterPlot
var scatterPlot = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

var spXAxis = scatterPlot.append('g')
    .attr('transform', 'translate('+[0, spHeight]+')');

var spYAxis = scatterPlot.append('g');

// Colors for colorscale range
var customColors = ["#3366cc", "#dc3912", "#ff9900", "#109618",
                    "#990099", "#0099c6", "#dd4477", "#66aa00",
                    "#b82e2e", "#316395","#994499", "#22aa99",
                    "#aaaa11", "#6633cc", "#e67300", "#8b0707",
                    "#651067", "#329262", "#5574a6", "#3b3eac"];


// Region color scale
//var regionColorScale = d3.scaleOrdinal(d3.schemeDark2);
var regionColorScale = d3.scaleOrdinal();
regionColorScale.range(customColors);

// Create scales
var xScale = d3.scaleLinear().range([0, spWidth]);
var yScale = d3.scaleLinear().range([spHeight, 0]);

// Regression line
var regression = d3.line();

// Filter term
var filterTerm = '';

// Dot radius
var dotRad = 5;

// Num of dots in row
var rowNum;

// Dot spacing
var dotSpace = dotRad*2 + 1;

// Make tooltip
var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .html(function(d) {
        return "<h5>"+d['name']+"</h5>" +
            `<table>
                <thead>
                    <tr>
                        <td>Median ACT</td>
                        <td>Admission Rate</td>
                        <td>Avg Cost</td>
                        <td>Control</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>`+d['act_median']+`</td>
                        <td>`+(d['admission_rate']*100).toFixed(2)+`%</td>
                        <td>$`+Math.round(d['avg_cost'])+`</td>
                        <td>`+d['control']+`</td>
                    </tr>
                </tbody>
                <thead>
                    <tr>
                        <td>Undergrad Population</td>
                        <td>Retention Rate</td>
                        <td>Median Debt</td>
                        <td>Mean Earnings</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>`+d['undergrad_population']+`</td>
                        <td>`+(d['retention_rate']*100).toFixed(2)+`%</td>
                        <td>$`+Math.round(d['median_debt'])+`</td>
                        <td>$`+Math.round(d['median_earnings_after_8years'])+`</td>
                    </tr>
                </tbody>
            </table>`
    });

svg.call(toolTip);

function Visual(x) {
    this.x = x;
}

Visual.prototype.init = function(data, group) {
    var viz = d3.select(group);

    // Add dot for each college in region, color coded by region
    viz.selectAll('.college')
        .data(data.value.values)
        .enter()
        .append('circle')
        .attr('fill', function(d) {
            return regionColorScale(d.region);
        })
        .attr('r', dotRad)
        .attr('cx', function(d, i) {
            return (i%rowNum)*dotSpace + 10;
        })
        .attr('cy', function(d, i) {
            return Math.floor(i/rowNum)*dotSpace + 70;
        })
        .on('mouseover', function(d, i) {
            t = d3.select(this.parentNode).attr('transform');
            t = t.split('(')[1].split(',')[0];
            t = parseFloat(t);
            cy = d3.select(this).attr('cy');
            cx = d3.select(this).attr('cx');
            absx = parseFloat(cx) + t;
            if(cy < 100 && absx < 200) {
                toolTip.direction('se');
            } else if (cy < 100) {
                toolTip.direction('s');
            } else if (absx < 200) {
                toolTip.direction('ne');
            } else {
                toolTip.direction('n');
            }
            toolTip.show(d, i);
        })
        .on('mouseout', toolTip.hide);

};

d3.csv('./data/colleges.csv',
function(row){
    // This callback formats each row of the data
    return {
        name: row['Name'],
        predominant_deg: +row['Predominant Degree'],
        highest_deg: +row['Highest Degree'],
        control: row['Control'],
        region: row['Region'],
        locale: row['Locale'],
        admission_rate: +row['Admission Rate'],
        act_median: +row['ACT Median'],
        sat_average: +row['SAT Average'],
        undergrad_population: +row['Undergrad Population'],
        percent_white: +row['% White'],
        percent_black: +row['% Black'],
        percent_hispanic: +row['% Hispanic'],
        percent_asian: +row['% Asian'],
        percent_american_indian: +row['% American Indian'],
        percent_pacific_islander: +row['% Pacific Islander'],
        percent_biracial: +row['% Biracial'],
        percent_nonresident_aliens: +row['% Nonresident Aliens'],
        percent_part_time: +row['% Part-time Undergrads'],
        avg_cost: +row['Average Cost'],
        expenditure_per_student: +row['Expenditure Per Student'],
        avg_faculty_salary: +row['Average Faculty Salary'],
        percent_full_time_faculty: +row['% Full-time Faculty'],
        percent_undergrad_w_pell_grant: +row['% Undergrads with Pell Grant'],
        completion_rate: +row['Completion Rate 150% time'],
        retention_rate: +row['Retention Rate (First Time Students)'],
        percent_undergrads_25plus: +row['% Undergrads 25+ y.o.'],
        three_year_default_rate: +row['3 Year Default Rate'],
        median_debt: +row['Median Debt'],
        median_debt_on_grad: +row['Median Debt on Graduation'],
        median_debt_on_widthdraw: +row['Median Debt on Withdrawal'],
        percent_federal_loans: +row['% Federal Loans'],
        percent_pell_recipients_avg_age_of_entry: +row['% Pell Grant Recipients Average Age of Entry'],
        avg_family_income: +row['Average Family Income'],
        median_family_income: +row['Median Family Income'],
        poverty_rate: +row['Poverty Rate'],
        num_unemployed_after_8years: +row['Number of Unemployed 8 years after entry'],
        num_employed_after_8years: +row['Number of Employed 8 years after entry'],
        mean_earnings_after_8years: +row['Mean Earnings 8 years After Entry'],
        median_earnings_after_8years: +row['Median Earnings 8 years After Entry'],
        employment_rate_after_8years: +row['Number of Employed 8 years after entry'] / (+row['Number of Employed 8 years after entry'] + +row['Number of Unemployed 8 years after entry'])
    }
},
function(error, dataset){
    if(error) {
        console.error('Error while loading ./data/colleges.csv dataset.');
        console.error(error);
        return;
    }
    // Define dataset globally
    globalData = dataset;

    // Nest region data
    var regionData = d3.nest()
        .key(function(d) {
            return d.region;
        })
        .entries(globalData);

    // Set localColor domain to be set of all unique regions
    var regionDomain = regionData.map(function(d) {
        return d.key;
    }).sort(function(a, b) {
        return d3.ascending(a, b);
    });
    regionColorScale.domain(regionDomain);

    // Define legend for region colors
    var regionLegend = d3.legendColor().scale(regionColorScale);

    // Add legend for region colors
    svg.append('g')
        .attr('transform', 'translate('+[svgWidth - 120, 500]+') scale(0.8, 0.8)')
        .call(regionLegend);

    svg.append('path')
        .attr('class', 'trendline')
        .attr('stroke-width', 1)
        .attr('stroke', 'black')
        .style('fill', 'none');

    legendCells = svg.selectAll('.cell')
        .on('mouseover', function(d){ // Add hover start event binding
            // Select the hovered g.dot
            var hovered = d3.select(this);
            text = hovered.select('text').text();
            scatterPlot.selectAll('.dot').classed('hidden', function(d) {
                return d.region != text;
            });
            // Show the text, otherwise hidden
            legendCells.classed('hidden', function(d) {
                return d != text;
            });
        })
        .on('mouseout', function(d){ // Add hover end event binding
            // Select the hovered g.dot
            var hovered = d3.select(this);
            scatterPlot.selectAll('.dot').classed('hidden', false);
            legendCells.classed('hidden', false);
        });

    // Create global object called chartScales to keep state
    chartScales = {x: 'sat_average', y: 'mean_earnings_after_8years'};

    updateViz();
});

function updateViz() {
    data = globalData.filter(function(d) {
        return (d[chartScales.x] != 0 && !isNaN(d[chartScales.x]) && d[chartScales.y] != 0 && !isNaN(d[chartScales.y]));
    });

    xDomain = d3.extent(data, function(data_element){
        return data_element[chartScales.x];
    });

    yDomain = d3.extent(data, function(data_element){
        return data_element[chartScales.y];
    });

    // Update the scales based on new data attributes
    xScale.domain(xDomain).nice();
    yScale.domain(yDomain).nice();

    // Update axises
    if (chartScales.y === 'mean_earnings_after_8years' || chartScales.y === 'median_debt') {
        spYAxis.transition()
            .duration(750)
            .call(d3.axisLeft(yScale).tickFormat(d3.format("$,i")));
    } else {
        spYAxis.transition()
            .duration(750)
            .call(d3.axisLeft(yScale).tickFormat(d3.format('.0%')));
    }

    if (chartScales.x === 'avg_cost' || chartScales.x === 'avg_family_income') {
        spXAxis.transition()
            .duration(750)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("$,i")));
    } else if (chartScales.x === 'admission_rate') {
        spXAxis.transition()
            .duration(750)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('.0%')));
    } else {
        spXAxis.transition()
            .duration(750)
            .call(d3.axisBottom(xScale));
    }

    // Add a group for each region
    var dots = scatterPlot.selectAll('.dot')
        .data(data.filter(function(d) {
            return d.name.toLowerCase().indexOf(filterTerm.toLowerCase()) != -1;
    }));

    var dotsEnter = dots.enter()
        .append('g')
        .attr('class', 'dot')
        .on('click', function(d, i) {
            dataElement = d;
            d3.select('body')
                .append('div')
                .attr("class", "card")
                .html(function(d) {
                    return "<h5>"+dataElement['name']+"</h5>" +
                        `<table>
                            <thead>
                                <tr>
                                    <td>Median ACT</td>
                                    <td>Admission Rate</td>
                                    <td>Avg Cost</td>
                                    <td>Control</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>`+dataElement['act_median']+`</td>
                                    <td>`+(dataElement['admission_rate']*100).toFixed(2)+`%</td>
                                    <td>$`+Math.round(dataElement['avg_cost'])+`</td>
                                    <td>`+dataElement['control']+`</td>
                                </tr>
                            </tbody>
                            <thead>
                                <tr>
                                    <td>Undergrad Population</td>
                                    <td>Retention Rate</td>
                                    <td>Median Debt</td>
                                    <td>Mean Earnings</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>`+dataElement['undergrad_population']+`</td>
                                    <td>`+(dataElement['retention_rate']*100).toFixed(2)+`%</td>
                                    <td>$`+Math.round(dataElement['median_debt'])+`</td>
                                    <td>$`+Math.round(dataElement['median_earnings_after_8years'])+`</td>
                                </tr>
                            </tbody>
                        </table>`
                })
                .on('click', function(d) {
                    d3.select(this).remove();
                });
        })
        .on('mouseover', function(d, i) {
            t = d3.select(this).attr('transform');
            t = t.split('(')[1].split(',');
            x = parseFloat(t[0]);
            y = parseFloat(t[1]);
            if(y < 100 && x < 200) {
                toolTip.direction('se');
            } else if (y < 100) {
                toolTip.direction('s');
            } else if (x < 200) {
                toolTip.direction('ne');
            } else {
                toolTip.direction('n');
            }
            toolTip.show(d, i);
        })
        .on('mouseout', toolTip.hide);

    dotsEnter.append('circle')
        .attr('r', dotRad);

    dots.merge(dotsEnter)
        .transition()
        .duration(750)

    dots.merge(dotsEnter)
        .transition()
        .duration(750)
        .attr('fill', function(d) {
            return regionColorScale(d.region);
        })
        .attr('transform', function(d) {
            var tx = xScale(d[chartScales.x]);
            var ty = yScale(d[chartScales.y]);
            return 'translate('+[tx, ty]+')';
        });

    dots.exit().remove();

    var records = getVals(chartScales.x, chartScales.y);

    regression.x(function (d) { return xScale(d.xVal); } )
        .y(function (d) { return yScale(d.yVal); } );

    var coefficients = leastSquares(records.x, records.y);
    var trendlineData = calculateLineData(coefficients, d3.extent(records.x), 500)

    var trendline = d3.selectAll('.trendline')
        .transition()
        .delay(1000)
        .duration(500)
        .attr('d', regression(trendlineData))
        .attr('transform', 'translate(' + [padding.l, padding.t] +')');
}

function onXChanged() {
    var select = d3.select('#xSelect').node();
    var x = select.options[select.selectedIndex].value;

    chartScales.x = x;

    updateViz();
}

function onYChanged() {
    var select = d3.select('#ySelect').node();
    var y = select.options[select.selectedIndex].value;

    chartScales.y = y;

    updateViz();
}

function onFilterTermChanged(newFilterTerm) {
    filterTerm = newFilterTerm;

    updateViz();
}

// returns slope, intercept and r-square of the line
//Pulled from http://bl.ocks.org/benvandyke/8459843
function leastSquares(xSeries, ySeries) {
    var reduceSumFunc = function(prev, cur) { return prev + cur; };

    var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
    var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

    var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
        .reduce(reduceSumFunc);

    var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
        .reduce(reduceSumFunc);

    var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
        .reduce(reduceSumFunc);

    var slope = ssXY / ssXX;
    var intercept = yBar - (xBar * slope);
    var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);

    return [slope, intercept, rSquare];
}

function calculateLineData(leastSquares,xRange,iterations){
    var returnData = [];
    for(var i=0; i<iterations; i++){
        var randomX = randomFloatBetween(xRange[0],xRange[1]);
        returnData.push({
            xVal:randomX,
            yVal: (randomX*leastSquares[0])+leastSquares[1]
        });
    }
    return returnData;
}

function randomFloatBetween(minValue,maxValue,precision){
    if(typeof(precision) == 'undefined'){
        precision = 2;
    }
    return parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)),maxValue).toFixed(precision));
}

function getVals(x, y) {
    var outX = [];
    var outY = [];
    data.forEach(function (d) {
        outX.push(d[x]);
        outY.push(d[y]);
    });

    return {x: outX, y: outY};
}
