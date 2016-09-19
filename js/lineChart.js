var margin = {top: 80, right: 80, bottom: 80, left: 80},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parse = d3.time.format("%Y-%m").parse;

var x = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    xAxis = d3.svg.axis().scale(x).tickSize(-height).tickSubdivide(true),
    yAxis = d3.svg.axis().scale(y).ticks(4).orient("right");

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

d3.csv("data/data.csv", type, function(error, data) {
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
    y.domain([0, d3.max(values, function(d) { return d.rate; })]).nice();

    var svg = d3.select("#draw-area")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis);


    svg.selectAll('.guide')
        .data(all)
        .enter()
        .append('line')
        .attr('stroke', '#333')
        .attr('stroke-width', 0)
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
        .attr('stroke-width', 2)
        .attr("opacity", 0);

    svg.selectAll('.line')
        .data([values, msft])
        .enter()
        .append('path')
            .attr('class', 'line')
            .style('stroke', function(d) {
                console.log(d[0])
                var color = '#000'
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
    .delay(750)
    .duration(600)
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
    console.log(d.value);
    d3.selectAll('.guide').attr('opacity', 0);
    if (d.value.Trump > 0) {
        d3.select(line).attr("opacity", 1);
    }

}