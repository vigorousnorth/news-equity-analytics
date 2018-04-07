
const margin = ({top: 20, right: 20, bottom: 120, left: 50});

var svgs, 
  mentions, 
  totwidth = 800;

var tool_tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([8, 8])
    .direction('s');

const sqlDate = d3.timeParse('%Y-%m-%d');
const prettyDate = d3.timeFormat('%b %_d') 

var projection = d3.geoAlbers()
  .center([0, 40.73])
  .rotate([73.88, 0])
  .parallels([50, 60])

var path = d3.geoPath()
  .projection(projection);

var color = d3.scaleLinear().domain([0,0.01,0.1,0.5]).range(['#ddd','#fdcc8a','#fc8d59','#88419d']);

var bars_n = Math.ceil((totwidth - margin.left - margin.right) / 70);

var keyscale = d3.scaleLinear()
  .domain([0,0.4])
  .range([0,120]);

var keyAxis = d3.axisBottom()
  .scale(keyscale).ticks(2)
  .tickSize(12)
  .tickFormat(function(d) { return d; });

const newspapers = [
  {"name": "New York Daily News", "id": 2, "gini": null},
  {"name": "New York Post", "id": 3, "gini": null},
  {"name": "New York Times", "id": 5, "gini": null}
]

Promise.all([
    d3.json('../topojson/nyctopo.json'),
    d3.json('../js/nycplacementions.json')
  ]).then( ([nyc, mentions]) => {
  
  totwidth = d3.select('body').node().getBoundingClientRect().width - 10;
  var width = (totwidth < 520) ? totwidth : totwidth/3,
    height = width * 1.5;

  projection
    .scale(width * 175)
    .translate([width / 2, height / 2]);

  mentions = mentions.filter( d => {
      return (d.geocode).slice(0,2) != "36";  // filter out borough-level results
    })
    .map( d => { 
      d.geocode = d.geocode.split(', '); 
      d.place_mentions = d.place_mentions ? 
        d.place_mentions.map( m => { m.date = sqlDate(m.date); return m;}) : [];
      d.mentionsPerK = d.place_mentions.length * 1000 / d.population;
      return d; 
    })
    .sort( (a,b) => { return b.mentionsPerK - a.mentionsPerK; });

  //GINI CALCULATION
  newspapers.map( value => {
    var filteredMentions = mentions.map( d => { 
      var filteredArray = d.place_mentions.filter( mention => mention.feed_id === value.id ); 
      return [d.place_name, filteredArray.length/d.population ]; 
    });

    // sort in ascending order
    filteredMentions.sort((a,b) => { return a[1] - b[1] });

    var n = filteredMentions.length;
    var numerator = 0, denominator = 0;
    // perform the sums
    filteredMentions.map( (v,i) => { numerator += (2*i - n - 1)*v[1]; denominator += v[1]; } );
    value.gini = numerator / (n * denominator);
    return value; 
  });

  
  //APPEND MAP CONTAINERS FOR EACH NEWSPAPER
  var svgs = d3.select("div#map").selectAll("svg")
    .data(newspapers)
    .enter().append('svg')
    .attr("width", width)
    .attr("height", height)
    .each(drawMap)
    .call(tool_tip);

  maptitle = svgs.append('text')
    .attr('transform', 'translate(2,20)')
    .attr('class','map-heading')

  maptitle.append('tspan').text(d => d.name)

  maptitle.append('tspan').text(d => { return "Gini coeff. of coverage: " + d.gini.toFixed(4) })
    .attr("x",0).attr('dy','1.2em');     

  //DRAW MAPS
  function drawMap(d, newspaperindex) {
    d3.select(this).append("g")
    .selectAll("path")
    .data(topojson.feature(nyc, nyc.objects.nycgeo).features)
    .enter().append("path")
      .attr("d", path)
      .attr('fill', d => {
        var thisNabe = findNeighborhood(mentions, d.id);
        var thisFeed = newspapers[newspaperindex].id;
        if (thisNabe) {
          var stories = (thisNabe.place_mentions).filter( d => d.feed_id === thisFeed );
          storiesPer1000 = stories.length * 1000 / thisNabe.population;
          return color(storiesPer1000);
        } else return "#bbdaa4";
      })
      .attr('title', d => d.properties.ntaname)
      .on('mouseover', d => { d.newspaperindex = newspaperindex; if (findNeighborhood(mentions, d.id)) { tool_tip.show(d) } })
      .on('mouseout', tool_tip.hide)
      .on('click', d => { showlist(findNeighborhood(mentions, d.id)); })

  };

  //TOOLTIP
  tool_tip.html(d => {
      var n = findNeighborhood(mentions, d.id);
      var thisFeed = newspapers[d.newspaperindex].id;
      var filteredList =  n.place_mentions.filter( d => d.feed_id === thisFeed ).slice(0,5);
      var head = "<h5>" + n.place_name + "</h5>";
      var list = ( filteredList.length > 0 ) ? "Recent articles (click for full list):<br/><ul>" : "No articles for this neighborhood."
      filteredList.map( item => list += "<li>" + item.headline + "</li>" );
      list += "</ul>"
      return head + list;
    }); 

  // LEGEND
  var key = svgs.append('g')
      .attr('class', 'svgKey')
      .attr('transform', 'translate(10,' + (height - 40) + ')');
  
  key.append("text")
    .text("Articles per 1,000 residents:")
    .attr('transform', 'translate(10, 10)');  

  var legend = key.append('g').attr('class','legend')
    .attr('transform', 'translate(10, 15)'); 

  legend.selectAll("rect.keyblock")
    .data(d3.pairs(keyscale.ticks(20)))
    .enter().append("rect")
     .attr('class','keyblock')
     .attr("height", 10)
     .attr("x", function(d) { return keyscale(d[0]); })
     .attr("width", function(d) { return (keyscale(d[1]) - keyscale(d[0])).toFixed(2); })
     .style("fill", function(d) { return color( d[0]+(d[1]-d[0])/2); });

  legend.call(keyAxis);

  legend.selectAll("rect.keyblock")
    .style("fill", function(d) { return color( d[0]+(d[1]-d[0])/2); });

  var barheight = (height > 350) ? 350 : height; 

  var bar_svg = d3.select("div#barchart_most").append("svg")
    .attr("width", totwidth)
    .attr("height", barheight);

  var bars = bar_svg.append("g")
    .attr('transform','translate('+margin.left+','+margin.top+')');
  
  var most_x = d3.scaleBand()
    .domain(mentions.slice(0,bars_n).map( d => d.place_name ))
    .rangeRound([5, (totwidth - margin.left - margin.right)])
    .paddingInner(0.2)
    .align(0.05);

  y = d3.scaleLinear()
    .domain([0,0.6])
    .range([barheight - margin.bottom, margin.top])

  var xAxis = d3.axisBottom(most_x);
  
  bars.append("g").call(d3.axisLeft(y)).select('.domain').remove();
  
  bars.append("g")
    .attr("transform", "translate(0," + (barheight - margin.bottom) + ")")
    .call(xAxis)
    .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)")
  
  bars.append('text')
    .attr('transform','translate('+totwidth/2+','+margin.top+')')
    .attr('text-anchor','middle')
    .text('Most-mentioned areas (per capita)');
  
  bars.append("text")
    .attr("transform", "translate(-40," + margin.top + ")rotate(-90)")
    .attr("text-anchor","end")
    .text("Articles per 1,000 residents");
  
  bars.selectAll('.bar')
    .data(mentions.slice(0,bars_n)) 
  .enter().append('rect')
    .attr('fill','#bbb')
    .attr('class','bar')
    .attr('x',d => most_x(d.place_name))
    .attr('y', d => y(d.mentionsPerK) )
    .attr('width', most_x.bandwidth())
    .attr('height', d => (barheight - margin.bottom) - y(d.mentionsPerK))
    .on('click', showlist);
  
  d3.select('#hidebutton').on('click', hideList)

  function showlist(d) {
    // console.log(d);
    d3.select('#list').style('display','inline');
    
    d3.select('#neighborhood_title').html(d.place_name);

    d3.select('#neighborhood_info').html("2010 Census population: " + d.population);
    var list = d3.select('#storylist');
    list.selectAll('li').remove();
    list.selectAll('li')
      .data(d.place_mentions.sort( (a,b) => { return b.date - a.date; }))
      .enter().append('li').html(d => {
        return "<a href='" + d.url + "'>" + 
          d.headline + "</a> <span class='sourceline'>" +
          newspapers.find( e => e.id === d.feed_id).name + ", " + prettyDate(d.date) +
          "</span>";
      });
  }

  function hideList() { d3.select('#list').style('display','none'); }

});


function findNeighborhood(parentArray, geocode) {
  var returnVal = null;
  for (var i=0; i < parentArray.length; i++) {
    if ((parentArray[i].geocode).indexOf(geocode) > -1) {
          returnVal = parentArray[i];
    } else continue;
  } 
  return returnVal;
}
