import React, { Component } from 'react';
import * as d3 from 'd3'

class D3graph extends Component{
  constructor(props){
    super(props)

    this.plotGraph = this.plotGraph.bind(this)
  }

  plotGraph(){
    var testData = []

    Object.keys(this.state.data).forEach((key, index) =>{
      testData.push({Xaxis: key})
    })
    
    Object.values(this.state.data).forEach((value, index) =>{
      testData[index] = { ...testData[index] , Yaxis: value[this.props.column ] || 0 }
    })


    var data = testData.map(function(entry) {
      return {
        Xaxis: entry.Xaxis,
        Yaxis: +entry.Yaxis
      }
    });

    var svg = d3.select("svg"),
      margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    var x = d3.scaleTime()
      .rangeRound([0, width]);
  
    var y = d3.scaleLinear()
      .rangeRound([height, 0]);
  
    var line = d3.line()
      .x(function(d) { return x(d.Xaxis); })
      .y(function(d) { return y(d.Yaxis); });
    
  
    x.domain(d3.extent(data, function(d) { return d.Xaxis; }));
    y.domain(d3.extent(data, function(d) { return d.Yaxis; }));
  
    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
  
    g.append("g")
      .call(d3.axisLeft(y))
  
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", `#${Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, 0)}`)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  }

  async componentDidMount(){ 
    await this.setState({
      // data: jsonData.data
      data: this.props.state
    })
    this.plotGraph()
  }
  
  componentWillReceiveProps(){
    this.setState({
      data: this.props.state
    })

    this.plotGraph()
  }

  render() {


    return (
      <div className="d-flex justify-content-center">
          <div>{this.props.column}</div>
          <svg className="d-block" width="600" height="180"></svg>
      </div>
    );
  }
  
}

export default D3graph