var svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object
var padding = {t: 20, r: 20, b: 20, l: 20};

// Locale color scale
var localeColorScale = d3.scaleOrdinal(d3.schemeCategory20);

// Num of dots in row
var rowNum;

// Dot radius
var dotRad = 6;

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
        .sortKeys(d3.ascending)
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
        .attr('transform', 'translate('+[svgWidth - 120, 500]+') scale(0.8, 0.8)')
        .call(localeLegend);

    updateViz(regionData);
});

function updateViz(data) {
    // Add a group for each region
    var uViz = svg.selectAll('.viz')
        .data(data, function(d) {
            return d.key;
        });

    if (data.length > 11) {
        rowNum = Math.floor(((svgWidth - padding.l - padding.r)/11)/dotSpace) - 1;
    } else {
        rowNum = Math.floor(((svgWidth - padding.l - padding.r)/data.length)/dotSpace) - 1;
    }

    var uVizEnter = uViz.enter()
        .append('g')
        .attr('class', 'viz');

    uViz.merge(uVizEnter)
        .transition()
        .duration(950)
        .attr('transform', function(d,i) {
            if (data.length > 11) {
                var tx = ((i%11) * ((svgWidth - padding.l - padding.r)/11)) + padding.l;
            } else {
                var tx = ((i%11) * ((svgWidth - padding.l - padding.r)/data.length)) + padding.l;
            }
            if (i > 10) {
                var ty = (padding.t) + svgHeight/2;
            } else {
                var ty = (padding.t);
            }
            return 'translate('+[tx, ty]+')';
        });

    // Make and add Visual for each group
    uVizEnter.each(function(d) {
        rV = new Visual(0);
        rV.init(d, this);
    });

    uViz.exit().remove();
}

function onCategoryChanged() {
    var select = d3.select('#catSelect').node();
    var category = select.options[select.selectedIndex].value;
    var newData;

    if (category == 'no_cat') {
        // Nest region data
        newData = d3.nest()
            .key(function(d) {
                return 'All Colleges';
            })
            .rollup(function(v) { return {
                values: v,
                avg_sat: d3.mean(v, function(d) { return d.sat_average; }),
                avg_pop: d3.mean(v, function(d) { return d.undergrad_population; })
            }; })
            .entries(globalData);
    } else {
        // Nest region data
        newData = d3.nest()
            .key(function(d) {
                return d[category];
            })
            .sortKeys(d3.ascending)
            .rollup(function(v) { return {
                values: v,
                avg_sat: d3.mean(v, function(d) { return d.sat_average; }),
                avg_pop: d3.mean(v, function(d) { return d.undergrad_population; })
            }; })
            .entries(globalData);
    }
    updateViz(newData);
}
