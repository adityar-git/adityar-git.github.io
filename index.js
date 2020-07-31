window.onload = function () {
  let barPosLeft = 0;
  let barInitTop;
  let lineInitTop;
  let circle3InitTop;

  const checkCirclePos = function () {
    let barCurrPos = document.getElementById("bar").getBoundingClientRect().top;
    let lineCurrPos = document.getElementById("line").getBoundingClientRect()
      .top;
    let circle3CurrPos = document
      .getElementById("circle3")
      .getBoundingClientRect().top;

    let conclusionPos = document.getElementById("fifth").getBoundingClientRect()
      .top;

    if (barCurrPos - 150 < 170 && barPosLeft != 25) {
      barPosLeft = 25;
      d3.select(".main-container")
        .transition()
        .ease(d3.easePolyIn)
        .style("transform", "translate(22%)")
        .style("z-index", 100);

      d3.select(".shift-container")
        .transition()
        .ease(d3.easePolyIn)
        .style("transform", "translate(-22%)")
        .style("z-index", 100);

      d3.select(".reset")
        .transition()
        .ease(d3.easePolyIn)
        .style("transform", "translate(-60%)")
        .style("visibility", "visible");
    }

    if (lineCurrPos - 100 < 250) {
      d3.select("#line")
        .selectAll("text")
        .transition()
        .delay(200)
        .ease(d3.easePolyIn)
        .style("opacity", 1);

      d3.select(".circle").style("display", "none");
      d3.select(".map").style("display", "block");
      d3.select(".reset").style("display", "none");
    } else {
      d3.select(".circle").style("display", "block");
      d3.select(".map").style("display", "none");
      d3.select(".reset").style("display", "block");
    }

    if (barPosLeft == 25) {
      d3.select(".shift-container")
        .style("z-index", 100)
        .transition()
        .delay(200)
        .ease(d3.easePolyIn)
        .style("opacity", 1)
        .style("transform", "translate(" + -25 + "%)");

      d3.select(".reset")
        .style("visibility", "visible")
        .transition()
        .delay(200)
        .ease(d3.easePolyIn)
        .style("transform", "translate(" + -60 + "%)");
    }

    if (circle3CurrPos - 100 < 250) {
      d3.select(".map").style("display", "none");
      d3.select(".bar").style("display", "block");
    } else {
      d3.select(".bar").style("display", "none");
    }

    if (conclusionPos - 100 < 560) {
      d3.select(".bar").style("display", "none");
      d3.select(".conclusion").style("display", "block");
    } else {
      d3.select(".conclusion").style("display", "none");
    }
  };

  const initAnim = function () {
    d3.select(".first-section")
      .transition()
      .ease(d3.easeLinear)
      .style("opacity", 1);

    d3.select(".main-container").on("scroll", checkCirclePos);
  };

  const drawMap = function (yearIndex) {
    var width = screen.width - 450;
    var height = screen.height - 150;

    var projection = d3
      .geoNaturalEarth()
      .scale(width / 5)
      .translate([550, 350]);

    var mapGroup = d3
      .select(".map")
      .append("g")
      .style("transform", "translate(-25%)");

    var svg = mapGroup
      .append("svg")
      .attr("id", "world-map")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", "150 -50 900 900");

    d3.json("data//world.geojson", function (data) {
      svg
        .append("g")
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .style("opacity", 0)
        .attr("fill", "#69b3a2")
        .on("mouseover", function (ele) {
          d3.select(this).style("opacity", 0.9);
        })
        .on("mouseout", function (ele) {
          d3.select(this).style("opacity", 1);
        })
        .attr("d", d3.geoPath().projection(projection))
        .style("stroke", "#fff")
        .style("cursor", "pointer")
        .style("opacity", 1);
    });

    d3.csv("data//locations.csv", function (data) {
      let countryCount = {};

      data.forEach((ele, i) => {
        const year = ele.pdate.split("-")[0];
        const countryName = ele.name == "United States" ? "USA" : ele.name;

        if (year in countryCount && countryName in countryCount[year]) {
          countryCount[year][countryName].value =
            countryCount[year][countryName].value + 1;
        } else {
          countryCount[year] = {
            ...countryCount[year],
            [countryName]: {
              value: 1,
              props: {
                type: "Feature",
                id: i,
                properties: {
                  name: countryName,
                },
                geometry: {
                  type: "Point",
                  coordinates: [ele.longitude, ele.latitude],
                },
              },
            },
          };
        }
      });

      let usa = 0;
      let india = 0;
      let china = 0;
      let canada = 0;

      let feat = [];

      Object.keys(countryCount).forEach((year) => {
        if (parseInt(year) > 2002 && parseInt(year) < 2014) {
          Object.keys(countryCount[year]).forEach((country) => {
            feat.push({
              ...countryCount[year][country].props,
              value: countryCount[year][country].value,
            });

            if (country == "USA") {
              usa = usa + countryCount[year][country].value;
            } else if (country == "Canada") {
              canada = canada + countryCount[year][country].value;
            } else if (country == "China") {
              china = china + countryCount[year][country].value;
            } else india = india + countryCount[year][country].value;
          });
        }
      });

      let loc = {
        type: "FeatureCollection",
        features: feat,
      };

      let patentValues = {
        USA: usa,
        India: india,
        China: china,
        Canada: canada,
      };

      var myColor = d3
        .scaleSequential()
        .domain([1500, 0])
        .interpolator(d3.interpolateSpectral);

      svg
        .append("g")
        .selectAll("g")
        .data(loc.features)
        .enter()
        .append("g")
        .attr("transform", function (d) {
          return "translate(" + projection(d.geometry.coordinates) + ")";
        })
        .append("text")
        .attr("x", -10)
        .attr("fill", "white")
        .style("border", "1px solid white")
        .text((e) => {
          return patentValues[e.properties.name];
        });

      svg
        .append("g")
        .append("text")
        .attr("x", 300)
        .attr("y", 700)
        .style("font-size", 20)
        .style("color", "black")
        .text("Number of patents of small molecule drugs between 2003-2013");

      svg.selectAll("path").attr("fill", function (e) {
        if (["USA", "Canada"].includes(e.properties.name)) {
          return myColor(patentValues[e.properties.name]);
        } else return "#69b3a2";
      });
    });
  };

  const drawCircles = function () {
    var width = screen.width / 2;
    var height = screen.height - 150;
    let result = [];

    var myVars = [
      "200814_at",
      "222103_at",
      "201453_x_at",
      "204131_s_at",
      "200059_s_at",
      "205067_at",
      "213702_x_at",
      "214435_x_at",
      "201334_s_at",
    ];

    var svg = d3
      .select(".circle2")
      .append("svg")
      .attr("id", "circle2")
      .attr("width", width)
      .attr("viewBox", "-50 -5 1000 1000")
      .style("display", "none")
      .attr("height", height);

    var svg2 = d3
      .select(".fourth-section")
      .append("svg")
      .attr("id", "circle3")
      .attr("width", width)
      .attr("viewBox", "-30 -5 800 800")
      .attr("height", height);

    circle3InitTop = document.getElementById("circle3").getBoundingClientRect()
      .top;

    const readCircleData = function (path, obj, method) {
      d3.csv(path, function (data) {
        const radius = 35;
        const defaultDrug = data[0].id;
        let uniqueData = [];

        data.forEach(function (d) {
          d.r = radius;
          d.x = width / 2;
          d.y = height / 2;

          myVars.forEach((col) => {
            result.push({
              name: d.id,
              group: col,
              var: d[col],
            });
          });

          if (uniqueData.find((ele) => ele.id == d.id) == undefined) {
            uniqueData.push(d);
          }
        });

        const rangeColor = d3.schemeTableau10;
        // var myGroups = [...new Set(data.map((e) => e.id))];

        var simulation = d3
          .forceSimulation()
          .force(
            "collide",
            d3
              .forceCollide(function (d) {
                return d.r + 8;
              })
              .iterations(16)
          )
          .force("charge", d3.forceManyBody())
          .force("y", d3.forceY().y(height / 2))
          .force("x", d3.forceX().x(width / 2));

        const onMouseBar = function (drug) {
          let mouseObj = d3
            .select(".bar")
            .append("svg")
            .attr("viewBox", "-300 -350 1500 1500")
            .attr("id", "bar2")
            .attr("width", width + 550)
            .attr("height", height + 400)
            .append("g");

          const barGroups = myVars;

          var xBar = d3
            .scaleBand()
            .range([0, width])
            .domain(barGroups)
            .padding(0.01);
          mouseObj
            .append("g")
            .attr("transform", "translate(60," + (height + 10) + ")")
            .call(d3.axisBottom(xBar))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .style("font-size", 16)
            .style("font-weight", "bold")
            .attr("dy", ".3em")
            .attr("transform", "rotate(-65)");

          var yBar = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

          mouseObj
            .append("g")
            .attr("transform", "translate(60," + 10 + ")")
            .call(d3.axisLeft(yBar))
            .selectAll("text")
            .style("font-size", 16)
            .style("font-weight", "bold");

          const barColor = d3
            .scaleSequential()
            .domain([-0.1, 0.1])
            .interpolator(d3.interpolateBlues);

          let uniqueEle = [];

          result.forEach((e) => {
            if (
              uniqueEle.find(
                (ele) => ele.name == e.name && ele.group == e.group
              ) == undefined
            ) {
              uniqueEle.push(e);
            }
          });

          let filtered = uniqueEle.filter((e) => e.name == drug);
          let mostUp = Math.max(...filtered.map((e) => e.var));
          let mostDown = Math.min(...filtered.map((e) => e.var));

          mouseObj
            .selectAll("rect")
            .data(filtered)
            .enter()
            .append("rect")
            .attr("x", function (d) {
              return xBar(d.group) + 60;
            })
            .attr("y", function (d) {
              return yBar(d.var) + 10;
            })
            .attr("width", xBar.bandwidth())
            .style("cursor", "pointer")
            .attr("stroke", "black")
            .attr("z", function (d) {
              if (d.var == mostUp) return 2;
              else if (d.var == mostDown) return 2;
              else return 0;
            })
            .attr("height", function (d) {
              return height - yBar(d.var);
            })
            .attr("fill", function (d, i) {
              if (d.var == mostUp) return "#784f6f";
              else if (d.var == mostDown) return "#4f785a";
              else return barColor(d.var);
            })
            .on("mouseover", function (d) {
              d3.select(this).attr("stroke", "#e8e8e8");
            })
            .on("mouseout", function (d) {
              d3.select(this).attr("stroke", function (d) {
                if (d.var == mostUp) return "red";
                else if (d.var == mostDown) return "green";
                else return "black";
              });
            });

          const info = data.filter((e) => e.id == drug)[0];

          const infoFont = 24;
          const tContainer = mouseObj
            .append("g")
            .style("transform", "translate(10%,5%)");

          mouseObj
            .append("text")
            .style("font-weight", "bold")
            .style("font-size", 30)
            .style("transform", "translate(10%, 2%)")
            .text(info.name);

          mouseObj
            .append("text")
            .style("font-weight", "bold")
            .style("font-size", 30)
            .style("transform", "translate(25%, " + 57 + "%)")
            .text("Genes");

          mouseObj
            .append("text")
            .style("font-weight", "bold")
            .style("font-size", 30)
            .style("transform", "translate(0%,35%) rotate(-90deg)")
            .text("Differential Expression");

          const iContainer = mouseObj
            .append("g")
            .style("transform", "translate(16%, 5%)");
          let marginY = 2;
          let marginX = 8;
          tContainer
            .append("text")
            .style("font-weight", "bold")
            .style("font-size", infoFont)
            .style("transform", "translate(0, " + marginY + "%)")
            .text("Drug ID:");
          iContainer
            .append("text")
            .style("font-size", infoFont)
            .style("transform", "translate(" + marginX + "%, " + marginY + "%)")
            .text(info.id);
          marginY = marginY + 2;
          tContainer
            .append("text")
            .style("font-weight", "bold")
            .style("font-size", infoFont)
            .style("transform", "translate(0, " + marginY + "%)")
            .text("Perturbagen Type:");
          iContainer
            .append("text")
            .style("font-size", infoFont)
            .style("transform", "translate(" + marginX + "%, " + marginY + "%)")
            .text(info.pert_type);

          marginY = marginY + 2;
          tContainer
            .append("text")
            .style("font-weight", "bold")
            .style("font-size", infoFont)
            .style("transform", "translate(0, " + marginY + "%)")
            .text("State:");
          iContainer
            .append("text")
            .style("font-size", infoFont)
            .style("transform", "translate(" + marginX + "%, " + marginY + "%)")
            .text(info.state);

          marginY = marginY + 2;
          tContainer
            .append("text")
            .style("font-weight", "bold")
            .style("font-size", infoFont)
            .style("transform", "translate(0, " + marginY + "%)")
            .text("Approved:");
          iContainer
            .append("text")
            .style("font-size", infoFont)
            .style("transform", "translate(" + marginX + "%, " + marginY + "%)")
            .text(function () {
              if (info.approved == "True") return "Yes";
              return "No";
            });

          marginY = marginY + 2;
          tContainer
            .append("text")
            .style("font-weight", "bold")
            .style("font-size", infoFont)
            .style("transform", "translate(0, " + marginY + "%)")
            .text("Withdrawn:");
          iContainer
            .append("text")
            .style("font-size", infoFont)
            .style("transform", "translate(" + marginX + "%, " + marginY + "%)")
            .text(function () {
              if (info.withdrawn == "True") return "Yes";
              return "No";
            });

          let intensityG = mouseObj
            .append("g")
            .style("transform", "translate(40%,5%)");

          let intensityT = mouseObj
            .append("g")
            .style("transform", "translate(42%,6%)");

          intensityG
            .append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .attr("stroke", "black")
            .attr("fill", "#784f6f");
          intensityT
            .append("text")
            .style("font-size", infoFont)
            .text("Highly Up-Regulated");

          intensityG
            .append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .style("transform", "translate(0,2%)")
            .attr("stroke", "black")
            .attr("fill", "#4f785a");
          intensityT
            .append("text")
            .style("font-size", infoFont)
            .style("transform", "translate(0,2.5%)")
            .text("Highly Down-Regulated");

          let purple = mouseObj
            .append("g")
            .style("transform", "translate(40%,6%)");

          purple
            .append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .style("transform", "translate(0,4%)")
            .attr("fill", barColor(-0.1));

          purple
            .append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .style("transform", "translate(1.4%,4%)")
            .attr("fill", barColor(0));

          purple
            .append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .style("transform", "translate(2.9%,4%)")
            .attr("fill", barColor(0.1));

          let sign = mouseObj
            .append("g")
            .style("transform", "translate(40%,12.9%)");

          sign
            .append("text")
            .style("font-size", 13)
            .style("transform", "translate(0,0%)")
            .text("low");

          sign
            .append("text")
            .style("font-size", 12)
            .style("transform", "translate(3%,0%)")
            .text("high");
        };

        onMouseBar(defaultDrug);

        const nodeClick = function (drug) {
          d3.select(".circle2").style("display", "none");
          d3.select("#bar2").remove();
          onMouseBar(drug);
        };

        var nodes = obj
          .selectAll("g")
          .data(uniqueData)
          .enter()
          .append("g")
          .call(
            d3
              .drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended)
          );

        nodes
          .append("circle")
          .attr("class", "circles")
          .attr("r", (e) => {
            if (e.id == defaultDrug) return radius * 2;
            else return radius;
          })
          .attr("stroke", "black")
          .style("cursor", "pointer")
          .attr("fill", (ele) => rangeColor[ele.nodes])
          .on("click", (ele) => nodeClick(ele.id))
          .on("mouseover", function (ele, i) {
            obj
              .selectAll("circle")
              .transition()
              .attr("r", function (e, ind) {
                if (i == ind) return radius + 10;
                else return radius;
              });
          })
          .on("mouseout", function (ele) {
            obj.selectAll("circle").transition().delay(100).attr("r", radius);
          });

        nodes
          .append("text")
          .style("font-size", 12)
          .attr("dx", -20)
          .attr("dy", 5)
          .attr("fill", "white")
          .text(function (d) {
            return d.id;
          })
          .style("cursor", "pointer")
          .on("mouseover", function (ele, i) {
            obj
              .selectAll("circle")
              .transition()
              .delay(100)
              .attr("r", function (e, ind) {
                if (i == ind) return radius + 10;
                else return radius;
              });
          })
          .on("mouseout", function (ele) {
            svg.selectAll("circle").transition().attr("r", radius);
          });

        nodes
          .selectAll("circle")
          .transition()
          .attrTween("r", function (d) {
            var i = d3.interpolate(0, d.r);
            return function (t) {
              return (d.radius = i(t));
            };
          });

        let clusters = [...new Set(data.map((e) => e.nodes))];

        obj
          .append("text")
          .attr("font-size", 22)
          .attr("x", 15)
          .attr("y", height)
          .attr("fill", "black")
          .text(method);

        obj
          .selectAll()
          .data(clusters)
          .enter()
          .append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("y", function (d, i) {
            return i * 10 + 15 + i * 2;
          })
          .attr("fill", function (d, i) {
            return rangeColor[d];
          });

        obj
          .selectAll()
          .data(clusters)
          .enter()
          .append("text")
          .attr("font-size", 14)
          .attr("x", 15)
          .attr("y", function (d, i) {
            return i * 10 + 25 + i * 2;
          })
          .attr("fill", function (d) {
            return "black";
          })
          .text(function (d) {
            return "Cluster " + d;
          });

        function ticked() {
          nodes.selectAll("text").attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
          });

          nodes
            .selectAll("circle")
            .attr("cx", function (d) {
              return d.x;
            })
            .attr("cy", function (d) {
              return d.y;
            });
        }

        simulation.nodes(data).on("tick", ticked);

        function dragstarted(d, i) {
          if (!d3.event.active) simulation.alpha(1).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(d, i) {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        }

        function dragended(d, i) {
          if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
          var me = d3.select(this);
          me.classed("selected", !me.classed("selected"));

          d3.selectAll("circle").style("fill", function (d, i) {
            return rangeColor[d.nodes];
          });
        }
      });
    };

    readCircleData("data//merged-bit.csv", svg2, "Structural Method");
  };

  const drugBank = function () {
    var width = screen.width / 2;
    var height = screen.height - 150;

    var bar = d3
      .select(".second-section")
      .append("svg")
      .attr("id", "bar")
      .attr("width", width)
      .attr("viewBox", "-100 0 1000 1000")
      .attr("height", height - 200)
      .attr("opacity", 1);

    barInitTop = document.getElementById("bar").getBoundingClientRect().top;

    d3.csv("data//drugs.csv", function (data) {
      const radius = 35;

      let approved = 0;
      let experimental = 0;
      let illicit = 0;
      let withdrawn = 0;
      let vet_approved = 0;
      let investigational = 0;

      data.forEach(function (e) {
        e.r = radius;
        e.x = width / 2;
        e.y = height / 2;

        if (e.approved == "True") {
          approved = approved + 1;
        }
        if (e.experimental == "True") {
          experimental = experimental + 1;
        }
        if (e.illicit == "True") {
          illicit = illicit + 1;
        }
        if (e.withdrawn == "True") {
          withdrawn = withdrawn + 1;
        }
        if (e.vet_approved == "True") {
          vet_approved = vet_approved + 1;
        }
        if (e.investigational == "True") {
          investigational = investigational + 1;
        }
      });

      const segment = data.slice(0, 500);
      const rangeColor = d3.schemeCategory10;

      let circleGenerator = function (genData) {
        var svg = d3
          .select(".circle")
          .append("svg")
          .attr("id", "circle")
          .attr("width", width + 100)
          .attr("viewBox", "-1000 -1100 3100 3100")
          .attr("height", height + 100);

        var simulation = d3
          .forceSimulation()
          .force(
            "collide",
            d3
              .forceCollide(function (d) {
                return d.r + 8;
              })
              .iterations(16)
          )
          .force("charge", d3.forceManyBody())
          .force("y", d3.forceY().y(height / 2))
          .force("x", d3.forceX().x(width / 2));

        var nodes = svg
          .selectAll("g")
          .data(genData, function (d) {
            return d.id;
          })
          .enter()
          .append("g")
          .call(
            d3
              .drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended)
          );

        var circles = nodes
          .append("circle")
          .attr("class", "circles")
          .attr("r", (e) => e.r)
          .attr("stroke", "black")
          .style("cursor", "pointer")
          .style("pointer-events", "all")
          .attr("fill", function (ele, i) {
            if (ele.approved == "True") return rangeColor[0];
            else if (ele.experimental == "True") return rangeColor[1];
            else if (ele.illicit == "True") return rangeColor[2];
            else if (ele.withdrawn == "True") return rangeColor[3];
            else if (ele.vet_approved == "True") return rangeColor[4];
            else return rangeColor[5];
          })
          .on("mouseover", function (ele, i) {
            svg
              .selectAll("circle")
              .transition()
              .attr("r", function (e, ind) {
                if (i == ind) return radius + 10;
                else return radius;
              });
          })
          .on("mouseout", function (ele) {
            svg.selectAll("circle").transition().attr("r", radius);
          });

        nodes
          .append("text")
          .style("font-size", 12)
          .attr("dx", -20)
          .attr("dy", 5)
          .attr("fill", "white")
          .text(function (d) {
            return d.id;
          })
          .style("cursor", "pointer")
          .on("mouseover", function (ele, i) {
            svg
              .selectAll("circle")
              .transition()
              .attr("r", function (e, ind) {
                if (i == ind) return radius + 10;
                else return radius;
              });
          })
          .on("mouseout", function (ele) {
            svg.selectAll("circle").transition().attr("r", radius);
          });

        nodes
          .selectAll("circle")
          .transition()
          .attrTween("r", function (d) {
            var i = d3.interpolate(0, d.r);
            return function (t) {
              return (d.radius = i(t));
            };
          });

        function ticked() {
          nodes.selectAll("text").attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
          });

          nodes
            .selectAll("circle")
            .attr("cx", function (d) {
              return d.x;
            })
            .attr("cy", function (d) {
              return d.y;
            });
        }

        svg
          .append("g")
          .append("text")
          .attr("x", -200)
          .attr("y", 1700)
          .style("font-size", 70)
          .style("color", "black")
          .text("Nodes representing drugs from drugbank");

        simulation.nodes(genData).on("tick", ticked);

        function dragstarted(d, i) {
          if (!d3.event.active) simulation.alpha(1).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(d, i) {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        }

        function dragended(d, i) {
          if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
          var me = d3.select(this);
          me.classed("selected", !me.classed("selected"));

          d3.selectAll("circle").style("fill", function (d, i) {
            return rangeColor[d.cluster];
          });
        }
      };

      circleGenerator(segment);

      let barGroups = [
        "approved",
        "experimental",
        "illicit",
        "withdrawn",
        "vet_approved",
        "investigational",
      ];

      d3.select(".reset").on("click", function () {
        d3.select("#circle").remove();
        circleGenerator(segment);
        checkCirclePos();
      });

      var xBar = d3
        .scaleBand()
        .range([0, width])
        .domain(barGroups)
        .padding(0.01);
      bar
        .append("g")
        .attr("transform", "translate(0," + (height + 50) + ")")
        .call(d3.axisBottom(xBar))
        .selectAll("text")
        .style("text-anchor", "end")
        .style("font-size", 22)
        .style("font-weight", "bold")
        .attr("dx", "-0.8em")
        .attr("dy", ".3em")
        .attr("transform", "rotate(-65)");

      bar
        .append("text")
        .style("transform", "translate(30%,95%)")
        .style("font-size", 35)
        .text("Types");

      bar
        .append("text")
        .style("transform", "translate(-9%,50%) rotate(-90deg)")
        .style("font-size", 35)
        .text("Frequency");

      var yBar = d3.scaleLinear().domain([0, 1000]).range([height, 0]);

      bar
        .append("g")
        .attr("transform", "translate(0,50)")
        .call(d3.axisLeft(yBar))
        .selectAll("text")
        .style("font-size", 22)
        .style("font-weight", "bold");

      let bargroup = {
        approved: approved,
        experimental: experimental,
        illicit: illicit,
        withdrawn: withdrawn,
        vet_approved: vet_approved,
        investigational: investigational,
      };

      let barG = bar
        .selectAll()
        .data(Object.keys(bargroup))
        .enter()
        .append("g");

      barG
        .selectAll("rect")
        .data(Object.keys(bargroup))
        .enter()
        .append("rect")
        .on("mouseover", function (d) {
          d3.select(this).attr("stroke", "black");
        })
        .on("mouseout", function (d) {
          d3.select(this).attr("stroke", "white");
        })
        .on("click", function (type) {
          d3.select("#circle").remove();
          newSeg = segment.filter((e) => e[type] == "True");
          circleGenerator(newSeg);
          checkCirclePos();
        })
        .style("cursor", "pointer")
        .transition()
        .delay(700)
        .attr("x", function (d) {
          return xBar(d);
        })
        .attr("y", function (d) {
          return yBar(bargroup[d]) + 50;
        })
        .attr("width", xBar.bandwidth())
        .attr("height", function (d) {
          return height - yBar(bargroup[d]);
        })
        .attr("fill", function (d, i) {
          return rangeColor[i];
        });

      barG
        .selectAll("text")
        .data(Object.keys(bargroup))
        .enter()
        .append("text")
        .transition()
        .delay(800)
        .attr("fill", "red")
        .style("font-size", 25)
        .style("font-weight", "bold")
        .attr("x", function (d) {
          return xBar(d) + 50;
        })
        .attr("y", function (d) {
          return yBar(bargroup[d]) + 40;
        })
        .text(function (d) {
          return bargroup[d];
        });
    });
  };

  const lineGraph = function () {
    var width = screen.width / 2;
    var height = screen.height - 550;

    var line = d3
      .select(".third-section")
      .append("svg")
      .attr("id", "line")
      .attr("width", width)
      .attr("viewBox", "50 0 900 600")
      .attr("height", height)
      .attr("opacity", 1);

    lineInitTop = document.getElementById("line").getBoundingClientRect().top;
    const groupX = [0.8, 0.75, 0.8, 0.85, 0.9, 0.9, 0.95, 1, 1, 1.1];
    let groupY = [];

    groupX.forEach((e) => groupY.push(Math.pow(e, 2)));

    var x = d3
      .scaleBand()
      .range([0, width + 400])
      .domain(groupX.map((e, i) => 2004 + i));
    line
      .append("g")
      .attr("transform", "translate(0," + (height + 50) + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .style("font-size", 22)
      .style("font-weight", "bold")
      .attr("dx", "0.5em")
      .attr("dy", "1em");

    var y = d3.scaleLinear().domain([0, 2.5]).range([height, 0]);

    line
      .append("g")
      .attr("transform", "translate(0," + 50 + ")")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", 22)
      .style("font-weight", "bold");

    line
      .append("path")
      .datum(groupX)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .x(function (d, i) {
            return x(i + 2004);
          })
          .y(function (d, i) {
            return y(groupY[i]);
          })
      );

    line
      .append("text")
      .attr("stroke", "black")
      .attr("y", 230)
      .attr("x", 20)
      .style("opacity", 0)
      .style("font-size", 30)
      .text("$802 million");

    line
      .append("text")
      .attr("stroke", "black")
      .attr("y", 150)
      .attr("x", 1030)
      .style("opacity", 0)
      .style("font-size", 30)
      .text("$1.3 billion");

    line
      .append("circle")
      .attr("stroke", "black")
      .attr("cy", 230)
      .attr("cx", 0)
      .attr("r", 5);

    line
      .append("circle")
      .attr("stroke", "black")
      .attr("cy", 160)
      .attr("cx", 1050)
      .attr("r", 5);
  };

  initAnim();
  drugBank();
  lineGraph();
  drawMap(0);
  drawCircles();
};
