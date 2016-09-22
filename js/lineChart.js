var char_span = 24;
var name_size = ((char_span / 2) - 3);

var margin = {top: 15 + (char_span), right: 30, bottom: 80, left: 30},
    width = 360 - margin.left - margin.right,
    height = 280 - margin.top - margin.bottom;
    curtain_height = height + (char_span * 2)

var parse = d3.time.format("%m/%d").parse;

var x = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    xAxis = d3.svg.axis().scale(x).tickSize(-height).tickSubdivide(true).tickFormat(d3.time.format("%m/%d")),
    yAxis = d3.svg.axis().scale(y).ticks(4).orient("left");

var area = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d["rate"]); });

var line = d3.svg.line()
        .interpolate("monotone")
        .x(function(d) {
            return x(d.date);
        })
        .y(function(d) {
            if (d.rate > 0) {
                return y(d.rate);
            }
      });

d3.csv(DATA_PATH + "data.csv", type, function(error, data) {
    if (error) throw error;

    var all = data.map(function(d) {
        return {
            'date': d.date,
            'value': {
                'Trump': d['Trump'],
                'Clinton': d['Clinton']
            }
        }
    });

    var events = data.filter(function(d) {
        return d['Event'] != '';
    });

    var candidatesApprovalRates = [];
    for (i in CANDIDATES) {
        var list = data.map(function(d) {
                return {
                    'date': d.date,
                    'name': CANDIDATES[i],
                    'rate': d[CANDIDATES[i]]
                  }
            });
        candidatesApprovalRates.push(list);
    }

    var min_date = candidatesApprovalRates[0][0].date;
    var max_date = candidatesApprovalRates[0][candidatesApprovalRates[0].length - 1].date;
    x.domain([candidatesApprovalRates[0][0].date, candidatesApprovalRates[0][candidatesApprovalRates[0].length - 1].date]);
    y.domain([
        d3.min(candidatesApprovalRates, function(candidate) {
            return d3.min(candidate, function(d) {if (d.rate > 0 ) { return d.rate;}})
        }),
        d3.max(candidatesApprovalRates, function(candidate) {
            return d3.max(candidate, function(d) {if (d.rate > 0 ) { return d.rate;}})
        }),
    ]).nice();

    var legend = d3.select("#legend")
                    .selectAll('.flex-box')
                    .data(CANDIDATES)
                    .enter()
                    .append('div')
                    .attr('class', 'flex-box');

    
    var targetDate = d3.select("#legend")
                        .append('div')
                        .attr('id', 'target-date');


    legend.append('div')
        .attr('id', function(d) {
            return 'approval-rate-' + d;
        })
        .attr('class', function(d) {
            return 'approval-rate';
        })
        .style('background-color', function(d) {
            return PARTY_COLOR[d];
        });
    

    legend.append('div')
        .attr('class', function(d) {
            return 'status ' + d;
        })
        .text(function(d) {
            return PARTY_NAME[d] + ' ' + CANDIDATE_NAME_JP[d]
        });


    var svg = d3.select("#draw-area")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height + char_span) + ")")
        .call(xAxis)
        .selectAll("text")    
        .attr("transform", function(d) {
            return "rotate(-30)" 
        });

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);


    svg.selectAll('.guide')
        .data(all)
        .enter()
        .append('line')
        .attr('stroke', '#333')
        .attr('class', 'guide')
        .attr('x1', function (d) {
            return x(d.date);
        })
        .attr('y1', 1)
        .attr('x2', function (d) {
            return x(d.date);
        })
        .attr('y2', height)
        .on('click', function(d) {
            actionEvent(this, d);
        })
        .on('mouseover', function(d) {
            actionEvent(this, d);
        })
        .attr('stroke-width', 1)
        .attr("opacity", 0);

    var nearest_line = 0;
    svg.selectAll('.events')
        .data(events)
        .enter()
        .append('line')
        .attr('stroke', '#777')
        .attr('stroke-width', 0)
        .attr('class', 'event')
        .attr('x1', function (d) {
            return x(d.date);
        })
        .attr('y1', function (d) {
            if (d.Event == '１１/８　投票日') {
                return 0 - char_span;
            }
            return 0 - (char_span / 2);
        })
        .attr('x2', function (d) {
            return x(d.date);
        })
        .attr('y2', height)
        .attr('stroke-width', 2)
        .attr("opacity", function (d) {
            if (d.date > Date.now() && nearest_line == 0)  {
                nearest_line = 1;
                return 1;
            } else if (d.Event == '１１/８　投票日') {
                return 1;
            }
            return 0;
        });


    var nearest_under_line = 0;
    svg.selectAll('.events')
        .data(events)
        .enter()
        .append('line')
        .attr('stroke', '#777')
        .attr('stroke-width', 0)
        .attr('class', 'event')
        .attr('x1', function (d) {
            return x(d.date) - d.Event.length * name_size;
        })
        .attr('y1', function (d, i) {
            if (d.Event == '１１/８　投票日') {
                return 0 - char_span + 6;
            }
            return 0 - (char_span / 2) + 8;
        })
        .attr('x2', function (d) {
            return x(d.date);
        })
        .attr('y2', function (d, i) {
            // return height - i * (char_span / 2) - char_span;
            if (d.Event == '１１/８　投票日') {
                return 0 - char_span + 6;
            }
            return 0 - (char_span / 2) + 8;
        })
        .attr('stroke-width', 2)
        .attr("opacity", function (d) {
            if (d.date > Date.now() && nearest_under_line == 0)  {
                nearest_under_line = 1;
                return 1;
            } else if (d.Event == '１１/８　投票日') {
                return 1;
            }
            return 0;
        });

    var nearest_name = 0;
    svg.selectAll('.events-name')
        .data(events)
        .enter()
        .append('text')
        .attr('class', 'event-name')
        .attr('x', function (d) {
            return x(d.date) - d.Event.length * name_size;
        })
        .attr('y', function (d) {
            if (d.Event == '１１/８　投票日') {
                return 0 - char_span + 4;
            }
            return 0 - (char_span / 2) + 4;
        })
        .attr('height', 30)
        .attr('width', 80)
        .attr("opacity", function (d) {
            if (d.date > Date.now() && nearest_name == 0)  {
                nearest_name = 1;
                return 1;
            } else if (d.Event == '１１/８　投票日') {
                return 1;
            }
            return 0;
        })
        .style('font-size', name_size + 'px')
        .style('background-color', '#777')
        .text(function(d){ return d.Event;});

    svg.selectAll('.line')
        .data(candidatesApprovalRates)
        .enter()
        .append('path')
            .attr('class', 'line')
            .style('stroke', function(d) {
                var color = '#444'
                if (d[0].name == 'Clinton') {
                    color = '#00f'
                } else if (d[0].name == 'Trump') {
                    color = '#f00'
                } 
                return color;
            })
            .attr('clip-path', 'url(#clip)')
            .attr('d', function(d) {
                return line(d);
            });


    var curtain = svg.append('rect')
        .attr('x', -1 * width)
        .attr('y', -1 * height)
        .attr('height', curtain_height)
        .attr('width', width)
        .attr('class', 'curtain')
        .attr('transform', 'rotate(180)')
        .style('fill', '#ffffff')

  var t = svg.transition()
            .delay(DELAY)
            .duration(DURATION)
            .ease('linear')
            .each('end', function() {
              d3.select('line.guide')
                .transition()
                .style('opacity', 0)
                .remove()
            })
            .tween("rates", tween_values);

    t.select('rect.curtain')
        .attr('width', 0);
    t.select('line.guide')
        .attr('transform', 'translate(' + width + ', 0)')

    function tween_values() {
    var idx = d3.interpolateNumber(0, data.length);
        return function(t){
            values = data[parseInt(idx(t), 10)];
            if (values.Trump > 0 && values.Clinton > 0) {
                d3.select('#approval-rate-' + 'Trump')
                        .text(values['Trump'] + '%');
                d3.select('#approval-rate-' + 'Clinton')
                        .text(values['Clinton'] + '%');
                var formatDay = d3.time.format('%Y/%m/%d');
                date = new Date(values['date']);
                d3.select('#target-date').text(formatDay(date));
            }
        };
    }
});

function type(d) {
    d.date = Date.parse(d["date"]);
    return d;
}

function actionEvent(line, d) {
    d3.selectAll('.guide').attr('opacity', 0);
    if (d.value.Trump > 0 && d.value.Clinton > 0) {
        d3.select(line).attr("opacity", 1);
        for (key in d.value){
            d3.select('#approval-rate-' + key)
                .text(d.value[key] + '%');
        }
        var formatDay = d3.time.format('%Y/%m/%d');
        date = new Date(d.date);
        d3.select('#target-date').text(formatDay(date));
    }
}