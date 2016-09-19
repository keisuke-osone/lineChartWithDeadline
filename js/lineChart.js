var margin = {top: 15, right: 30, bottom: 80, left: 30},
    width = 640 - margin.left - margin.right,
    height = 380 - margin.top - margin.bottom;

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

    var values = data.map(function(d) {
        return {
            'date': d.date,
            'name': 'Trump',
            'rate': d['Trump']
          }
    });

    var msft = data.map(function(d) {
        return {
            'date': d.date,
            'name': 'Clinton',
            'rate': d['Clinton']
          }
    });

    x.domain([values[0].date, values[values.length - 1].date]);
    y.domain([d3.min(values, function(d) { if (d.rate > 0 ) { return d.rate;} }), d3.max(msft, function(d) { return d.rate; })]).nice();

    var targetDate = d3.select("#legend")
                        .append('div')
                        .attr('id', 'target-date');

    var legend = d3.select("#legend")
                    .selectAll('.flex-box')
                    .data(CANDIDATES)
                    .enter()
                    .append('div')
                    .attr('class', 'flex-box');

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
        .attr("transform", "translate(0," + (height + 15) + ")")
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
        .attr('y1', 1)
        .attr('x2', function (d) {
            return x(d.date);
        })
        .attr('y2', height)
        .attr('stroke-width', 2)
        .attr("opacity", function (d) {
            if (d.date > Date.now() && nearest_line == 0)  {
                nearest_line = 1;
                return 1;
            } else if (d.Event == '１１/８　大統領選挙') {
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
            return x(d.date) - d.Event.length * 14;
        })
        .attr('y1', function (d, i) {
            return height - i * 18 - 6;
        })
        .attr('x2', function (d) {
            return x(d.date);
        })
        .attr('y2', function (d, i) {
            return height - i * 18 - 6;
        })
        .attr('stroke-width', 2)
        .attr("opacity", function (d) {
            if (d.date > Date.now() && nearest_under_line == 0)  {
                nearest_under_line = 1;
                return 1;
            } else if (d.Event == '１１/８　大統領選挙') {
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
            return x(d.date) - d.Event.length * 14;
        })
        .attr('y', function (d, i) {
            return height - i * 18 - 10;
        })
        .attr('height', 30)
        .attr('width', 80)
        .attr("opacity", function (d) {
            if (d.date > Date.now() && nearest_name == 0)  {
                nearest_name = 1;
                return 1;
            } else if (d.Event == '１１/８　大統領選挙') {
                return 1;
            }
            return 0;
        })
        .style('font-size', '14px')
        .style('background-color', '#777')
        .text(function(d){ return d.Event;});

    svg.selectAll('.line')
        .data([values, msft])
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
        .attr('height', height)
        .attr('width', width)
        .attr('class', 'curtain')
        .attr('transform', 'rotate(180)')
        .style('fill', '#ffffff')

  var t = svg.transition()
            .delay(550)
            .duration(3000)
            .ease('linear')
            .each('end', function() {
              d3.select('line.guide')
                .transition()
                .style('opacity', 0)
                .remove()
            });

    t.select('rect.curtain')
        .attr('width', 0);
    t.select('line.guide')
        .attr('transform', 'translate(' + width + ', 0)')

    d3.select("#show_guideline").on("change", function(e) {
        curtain.attr("opacity", this.checked ? 0.75 : 1);
    })
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
            console.log(key);
            console.log(d.value[key]);
            d3.select('#approval-rate-' + key)
                .text(d.value[key] + '%');
        }
        var formatDay = d3.time.format('%Y/%m/%d');
        date = new Date(d.date);
        d3.select('#target-date').text(formatDay(date));
    }
}