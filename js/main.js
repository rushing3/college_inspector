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

// Region color scale
var regionColorScale = d3.scaleOrdinal(d3.schemeCategory20);

// Create scales
var xScale = d3.scaleLinear().range([0, spWidth]);
var yScale = d3.scaleLinear().range([spHeight, 0]);

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
                        <td>$`+Math.round(d['median_earnings_after_8year'])+`</td>
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

}

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
        median_earnings_after_8year: +row['Median Earnings 8 years After Entry']
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
        return (d[chartScales.x] != 0 && d[chartScales.y] != 0);
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
    spXAxis.transition()
        .duration(750)
        .call(d3.axisBottom(xScale));

    spYAxis.transition()
        .duration(750)
        .call(d3.axisLeft(yScale));

    // Add a group for each region
    var dots = scatterPlot.selectAll('.dot')
        .data(data.filter(function(d) {
            return d.name.indexOf(filterTerm) != -1;
    }));

    console.log(filterTerm);
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
                                    <td>$`+Math.round(dataElement['median_earnings_after_8year'])+`</td>
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

// Calculate a linear regression from the data

// Takes 5 parameters:
// (1) Your data
// (2) The column of data plotted on your x-axis
// (3) The column of data plotted on your y-axis
// (4) The minimum value of your x-axis
// (5) The minimum value of your y-axis

// Returns an object with two points, where each point is an object with an x and y coordinate

function calcLinear(data, x, y, minX, minY){
    /////////
    //SLOPE//
    /////////

    // Let n = the number of data points
    var n = data.length;

    // Get just the points
    var pts = [];
    data.forEach(function(d,i){
        var obj = {};
        obj.x = d[x];
        obj.y = d[y];
        obj.mult = obj.x*obj.y;
        pts.push(obj);
    });

    // Let a equal n times the summation of all x-values multiplied by their corresponding y-values
    // Let b equal the sum of all x-values times the sum of all y-values
    // Let c equal n times the sum of all squared x-values
    // Let d equal the squared sum of all x-values
    var sum = 0;
    var xSum = 0;
    var ySum = 0;
    var sumSq = 0;
    pts.forEach(function(pt){
        sum = sum + pt.mult;
        xSum = xSum + pt.x;
        ySum = ySum + pt.y;
        sumSq = sumSq + (pt.x * pt.x);
    });
    var a = sum * n;
    var b = xSum * ySum;
    var c = sumSq * n;
    var d = xSum * xSum;

    // Plug the values that you calculated for a, b, c, and d into the following equation to calculate the slope
    // slope = m = (a - b) / (c - d)
    var m = (a - b) / (c - d);

    /////////////
    //INTERCEPT//
    /////////////

    // Let e equal the sum of all y-values
    var e = ySum;

    // Let f equal the slope times the sum of all x-values
    var f = m * xSum;

    // Plug the values you have calculated for e and f into the following equation for the y-intercept
    // y-intercept = b = (e - f) / n
    var b = (e - f) / n;

    // TODO print the r2 value

    // return an object of two points
    // each point is an object with an x and y coordinate
    return {
        ptA : {
            x: minX,
            y: m * minX + b
        },
        ptB : {
            y: minY,
            x: (minY - b) / m
        }
    }

}
