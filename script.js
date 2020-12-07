const url =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

fetch(url)
  .then((response) => response.json())
  .then((data) => {
    dataset = data.monthlyVariance;
    baseTemp = data.baseTemperature;

    const w = 1500;
    const h = 600;
    const padding = 100;

    colorRange = [
      '#004D8B',
      '#63ADEA',
      '#BEE1FE',
      '#FBFFB2',
      '#FCDE4B',
      '#FEB95A',
      '#E80000',
    ];

    const minVar = d3.min(dataset, function (d) {
      return d.variance;
    });

    const maxVar = d3.max(dataset, function (d) {
      return d.variance;
    });

    const minTemp = getTemp(minVar);
    const maxTemp = getTemp(maxVar);

    ///////// MAIN GRAPH /////////
    const xScale = d3
      .scaleBand()
      .domain(dataset.map((d) => d.year))
      .range([padding, w - padding]);

    const yScale = d3
      .scaleBand()
      .domain(dataset.map((d) => d.month))
      .range([padding, h - padding]);

    const colorScale = d3
      .scaleQuantize()
      .domain([minTemp, maxTemp])
      .range(colorRange);

    const svg = d3
      .select('.container')
      .append('svg')
      .attr('width', w)
      .attr('height', h);

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('id', 'tooltip')
      .style('opacity', 0);

    const rec = svg
      .selectAll('rect')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('y', (d, i) => yScale(d.month))
      .attr('x', (d, i) => xScale(d.year))
      .attr('width', (d, i) => xScale.bandwidth())
      .attr('height', (d, i) => yScale.bandwidth())
      .attr('fill', function (d, i) {
        return colorScale(getTemp(d.variance));
      })
      .attr('class', 'cell')
      .attr('data-month', (d) => d.month - 1)
      .attr('data-year', (d) => d.year)
      .attr('data-temp', (d) => getTemp(d.variance));

    rec.on('mouseover', handleMouseOver).on('mouseout', handleMouseOut);

    // Main Axes
    let tickLabels = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const xAxisGenerator = d3.axisBottom(xScale).tickValues(
      xScale.domain().filter(function (d, i) {
        return !(d % 10);
      })
    );

    const yAxisGenerator = d3
      .axisLeft(yScale)
      .tickFormat((d, i) => tickLabels[i]);

    const xAxis = svg
      .append('g')
      .attr('transform', 'translate(0,' + (h - padding) + ')')
      .attr('id', 'x-axis')
      .call(xAxisGenerator.tickSizeOuter(0));

    const yAxis = svg
      .append('g')
      .attr('transform', 'translate(' + padding + ' , 0)')
      .attr('id', 'y-axis')
      .call(yAxisGenerator.tickSizeOuter(0));

    ///////// LEGEND /////////
    const wLeg = 450;
    const hLeg = 60;
    const padLeg = 20;

    const xScaleLegend = d3
      .scaleLinear()
      .domain([minTemp, maxTemp])
      .range([padLeg, wLeg - padLeg]);

    const xScaleColorLegend = d3
      .scaleBand()
      .domain(colorRange.map((d) => d))
      .range([padLeg, wLeg - padLeg]);

    const svgLegend = d3
      .select('#legend')
      .append('svg')
      .attr('width', wLeg)
      .attr('height', hLeg);

    svgLegend
      .selectAll('rect')
      .data(colorRange)
      .enter()
      .append('rect')
      .attr('y', padLeg)
      .attr('x', (d, i) => xScaleColorLegend(d))
      .attr('width', (d, i) => xScaleColorLegend.bandwidth())
      .attr('height', hLeg - 2 * padLeg)
      .attr('fill', (d, i) => d);

    const f = d3.format('.1f');

    const xAxisLegGenerator = d3
      .axisBottom(xScaleLegend)
      .tickValues(getTicks())
      .tickFormat(function (d) {
        return f(d);
      });

    const xAxisLeg = svgLegend
      .append('g')
      .attr('transform', 'translate(0,' + (hLeg - padLeg) + ')')
      .attr('id', 'x-legend-axis')
      .call(xAxisLegGenerator);

    ///////// HANDLERS FUNCTIONS /////////
    function handleMouseOver(e, d) {
      tooltip.transition().duration(200).style('opacity', 1);
      tooltip
        .html(
          d.year +
            '-' +
            d.month +
            '<br/>' +
            getTemp(d.variance) +
            '<br/>' +
            d.variance +
            '℃'
        )
        .style('left', e.x + 'px')
        .style('top', e.y + 'px');

      tooltip.attr('data-year', d.year);
    }

    function handleMouseOut(e, d) {
      tooltip.transition().duration(500).style('opacity', 0);
    }

    function getTemp(variance) {
      return baseTemp + variance;
    }

    function getTicks() {
      const span = (maxTemp - minTemp) / colorRange.length;
      let tickValues = [];
      let i = minTemp;
      while (i < maxTemp) {
        tickValues.push(i);
        i += span;
      }
      return (tickValues = [...tickValues, maxTemp]);
    }
  });
