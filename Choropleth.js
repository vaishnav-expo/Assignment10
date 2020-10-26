var width = 960, height = 600;
var color_domain = [200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400]
var ext_color_domain = [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400]
var legend_labels = ["< 200", "200+", "400+", "600+", "800+", "1000+", "1200+", "1400+", "1600+", "1800+", "2000+", "2200+", "2400+"]
var color = d3.scale.threshold()

    .domain(color_domain)
    .range(["#dcdcdc", "#d0d6cd", "#bdc9be", "#aabdaf", "#97b0a0", "#84a491", "#719782", "#5e8b73", "#4b7e64", "#387255", "#256546", "#125937", "#004d28"]);

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("margin", "-15px auto");
var path = d3.geo.path()

queue()
    .defer(d3.json, "us.json")
    .defer(d3.csv, "population.csv")
    .await(ready);

function ready(error, us, data) {
    var pairBirthsWithName = {};
    var pairIdsWithName = {};



    //Moves selction to front
    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };

    //Moves selction to back
    d3.selection.prototype.moveToBack = function() {
        return this.each(function() {
            var firstChild = this.parentNode.firstChild;
            if (firstChild) {
                this.parentNode.insertBefore(this, firstChild);
            }
        });
    };

    data.forEach(function(d) {
        pairBirthsWithName[d["CTYNAME"]] = d["BIRTHS2019"];
        var code = (+d.STATE*1000);
        code +=  + d.COUNTY;
        pairIdsWithName[code] = d["CTYNAME"];
        console.log("ID: "+code + " Name : "+d["CTYNAME"]);

    });

    console.log("Data : ",data)

    var max = d3.max(data, function(d) { return +d["BIRTHS2019"]; } );

    console.log("Max : "+max)

    var min = d3.min(data, function(d) { return +d["BIRTHS2019"]; } );

    console.log("Min : "+min)

    console.log("Pairs with name : "+pairIdsWithName[6001]);


    svg.append("g")
        .attr("class", "county")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("d", path)
        .style ( "fill" , function (d) {
            return color (pairBirthsWithName[pairIdsWithName[+d.id]]);
        })
        .style("opacity", 0.8)
        .on("mouseover", function(d) {
            var sel = d3.select(this);
            sel.moveToFront();
            d3.select(this).transition().duration(300).style({'opacity': 1, 'stroke': 'black', 'stroke-width': 1.5});
            div.transition().duration(300)
                .style("opacity", 1)
            div.text(pairIdsWithName[+d.id] + ": " +   pairBirthsWithName[pairIdsWithName[+d.id]])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY -30) + "px");
        })
        .on("mouseout", function() {
            var sel = d3.select(this);
            sel.moveToBack();
            d3.select(this)
                .transition().duration(300)
                .style({'opacity': 0.8, 'stroke': 'white', 'stroke-width': 1});
            div.transition().duration(300)
                .style("opacity", 0);
        })

};

var legend = svg.selectAll("legend")
    .data(ext_color_domain)
    .enter().append("g")
    .attr("class", "legend");

var ls_w = 73, ls_h = 20;

legend.append("rect")
    .attr("x", function(d, i){ return width - (i*ls_w) - ls_w;})
    .attr("y", 550)
    .attr("width", ls_w)
    .attr("height", ls_h)
    .style("fill", function(d, i) { return color(d); })
    .style("opacity", 0.8);

legend.append("text")
    .attr("x", function(d, i){ return width - (i*ls_w) - ls_w;})
    .attr("y", 590)
    .text(function(d, i){ return legend_labels[i]; });

var legend_title = "Number of births";

svg.append("text")
    .attr("x", 10)
    .attr("y", 540)
    .attr("class", "legend_title")
    .text(function(){return legend_title});