import data from "./data.csv";
import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.scss";
import * as d3 from "d3";
import $ from "jquery";
import D3graph from "./components/D3graph";
import { Button, InputLabel, TextField } from "@material-ui/core";

const byPropKey = (propertyName, value) => () => ({
  [propertyName]: value
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      filteredItems: [],
      heading: [],
      isSorting: false,
      cell: '',
      column: 'None',
      isFiltering: false,
      filters: {},
      columnClicked: '',
      isPloting: false,
      stats: {},
      isAsc: false,
      sumStats: {},
      meanStats: {},
      filterObj: {}
    };
    this.handleSort = this.handleSort.bind(this);
    this.handleHoverCell = this.handleHoverCell.bind(this);
    this.handleHoverColumn = this.handleHoverColumn.bind(this);
    this.handleAddFilter = this.handleAddFilter.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.handleAddGraph = this.handleAddGraph.bind(this);
    this.handleRemoveSort = this.handleRemoveSort.bind(this);
    // this.handlePlotGraph = this.handlePlotGraph.bind(this)
  }

  async getData() {
    const items = [];
    await d3.csv(data, (item) => {      
      items.push(item);
    });

    await this.setState({
      items: items,
      filteredItems: items
    });
  }

  async componentDidMount() {
    await this.getData();

    let heading = [];
    if (this.state.items[0]) {
      heading = Object.keys(this.state.items[0]);
    }
    
    await this.setState({
      heading: heading
    });
    
    let filterObj = {}
    let headings = this.state.heading
    await headings.map((h) => {
      filterObj[h] = ''
    })
    
    this.setState({ filterObj : filterObj})
    this.statistics();
  }

  handleSort(column, e) {
    this.setState(prevState => {
      // return { isSorting: !prevState.isSorting };
      return { isSorting: true };
    });

    const items = this.state.items;
    const currentTarget = $(e.currentTarget);

    if (currentTarget.hasClass("asc")) {
      this.setState({
        isAsc : false
      })
      items.sort((a, b) => {
        if (isNaN(a[column])) {
          if (a[column] > b[column]) return -1;
        } else {
          if (a[column] * 1 > b[column] * 1) return -1;
        }
        return null;
      });

      this.setState({
        items: items
      });
      currentTarget
        .removeClass("asc")
        .addClass("desc")
        .siblings()
        .removeClass("desc");
    } else {
      this.setState({
        isAsc : true
      })
      items.sort((a, b) => {
        if (isNaN(a[column])) {
          if (a[column] < b[column]) return -1;
        } else {
          if (a[column] * 1 < b[column] * 1) return -1;
        }
        return null;
      });

      this.setState({
        items: items
      });
      currentTarget
        .addClass("asc")
        .removeClass("desc")
        .siblings()
        .removeClass("asc desc");
    }
  }

  handleHoverCell(rowNo, e) {
    this.setState({
      cell: rowNo
    });

    // console.log(e)
  }

  handleHoverColumn(columnName) {
    this.setState({
      column: columnName
    });
  }

  handleAddFilter() {
    this.setState(prevState => {
      return { isFiltering: !prevState.isFiltering, filters: [] };
    });
    this.getData();
  }
  handleAddGraph() {
    this.setState(prevState => {
      return { isPloting: !prevState.isPloting };
    });
    this.getData();
  }
  handleRemoveSort() {
    this.getData();
    $("th").removeClass("asc desc");
    this.setState({ isSorting: false });
  }

  async handlePlotGraph(e, column) {
    await this.handleAddGraph();

    this.setState(prevState => {
      return { columnClicked: column };
    });
    this.handleAddGraph();
  }

  async handleFilter(filterWord, column, event) {
    
    let filterObj = this.state.filterObj
    filterObj[column] = filterWord
    
    await this.setState({ filters: filterObj })
    
    let filterState = this.state.filters
    let filterArray = []
    for (let key in filterState){
      if (filterState.hasOwnProperty(key)) {
        filterArray.push({[key]: filterState[key]})
      } 
    }
    let filteredItems = {}
    let items = this.state.items;
    
    await filterArray.forEach(async (f) =>{
      filteredItems = items
      if(f[column]){
        filteredItems = await items.filter( i => {
          return i[column].toLowerCase().includes(f[column])
        })
      }
    })
    await this.setState({
      filteredItems: filteredItems
    });

  }

  async statistics() {
    const a = []

    await this.state.heading.map((h, index) => {
      this.state.items.map((i, index) => {
        a.push( { [h] : i[h] })
      });
    });
    
    let sumStats = {}
    let meanStats = {}

    await this.state.heading.forEach((h) => {
      let arrayLength = this.state.items.length
      let temp = a.slice(0, arrayLength)
      let sum = 0
      temp.forEach((t) => {
        sum = sum + (t[h] * 1)
        a.shift()
      })
      sumStats = { ...sumStats, [h] : sum}
      meanStats = { ...meanStats, [h] : Math.round(sum / arrayLength * 100) / 100}
    })

    this.setState({sumStats : sumStats, meanStats : meanStats})
  }

  render() {
    let graphComponent;
    if (this.state.isPloting) {
      graphComponent = (
        <D3graph state={this.state.items} column={this.state.columnClicked} />
      );
    } else {
      graphComponent = null;
    }
    return (
      <div className="container col-12">
        <div className="jumbotron text-center">
          <div className=" bg-white mb-2 rounded">
            <div className="d-flex col">
              <div className="d-inline-block mx-auto">
                <InputLabel className="d-block text-left bg-light p-2 rounded m-2">
                  <span className="text-danger"> Current cell row number : </span> {this.state.cell}
                </InputLabel>
                <InputLabel className="d-block text-left bg-light p-2 rounded m-2">
                  <span className="text-danger d-block"> Current Column : </span> {this.state.column} 
                  <span className="text-danger d-block"> Sorting: </span>{this.state.isSorting ? this.state.isAsc? 'Ascending' : 'Descending' : 'Not Sorting'}
                  <span className="text-danger d-block"> Filter: </span>{this.state.isFiltering ? 'Text Filter' : 'No Filter'}
                </InputLabel>
                
              </div>
              {graphComponent}
            </div>
            <Button
                color={`${this.state.isFiltering ? 'secondary' : 'primary'}`}
                variant="contained"
                className="m-2"
                onClick={this.handleAddFilter}
              >
                {this.state.isFiltering ? "Remove " : "Add "} filter
              </Button>
              <Button
                color={`${this.state.isPloting ? 'secondary' : 'primary'}`}
                variant="contained"
                className="m-2"
                onClick={this.handleAddGraph}
              >
                {this.state.isPloting ? "Remove " : "Add "} Graph
              </Button>
              {this.state.isSorting ? (
                <Button
                  color='secondary'
                  variant="contained"
                  className="m-2"
                  onClick={this.handleRemoveSort}
                >
                  Remove sorting
                </Button>
              ) : null}
          </div>
          <div className="bg-white py-3 rounded">
            <table className="mx-auto text-center data-table">
              <tbody>
                <tr className="col-12">
                  <th className="p-2">Row</th>
                  {this.state.heading.map((h, index) => {
                    return (
                      <th
                        className={`p-2 table-heading ${this.state.sortingApplied}`}
                        key={index}
                        onClick={e => this.handleSort(h, e)}
                        onMouseOver={e => {
                          this.handleHoverColumn(h);
                        }}
                        data-toggle="tooltip" title="Click to sort"
                      >
                        {h}
                      </th>
                    );
                  })}
                </tr>
                {this.state.isFiltering ? (
                  <tr>
                    <td>Filter</td>
                    {this.state.heading.map((h, index) => {
                      return (
                        <td key={index}>
                          <TextField
                            className="col"
                            placeholder="Enter filter"
                            onChange={e =>
                              this.handleFilter(e.currentTarget.value, h)
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                ) : null}
                {this.state.isPloting ? (
                  <tr>
                    <td>Plot</td>
                    {this.state.heading.map((h, index) => {
                      return (
                        <td key={index}>
                          {!isNaN(this.state.items[0][h]) ? (
                            <Button
                              color="primary"
                              variant="contained"
                              onClick={e => this.handlePlotGraph(e, h)}
                            >
                              plot
                            </Button>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ) : null}
                {/* {this.state[
                  this.state.isFiltering ? "filteredItems" : "items"
                ].map((item, index) => { */}
                {this.state.filteredItems.map((item, index) => {
                  var rowNo = index + 1;
                  return (
                    <tr key={index}>
                      <td>{rowNo}</td>
                      {Object.values(item).map((i, index) => {
                        return (
                          <td
                            key={index}
                            onMouseOver={e => {
                              this.handleHoverCell(rowNo, index);
                            }}
                          >
                            {i}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr className="bg-danger">
                  <td>Sum</td>
                  {Object.values(this.state.sumStats).map((s, index) => {
                    if(!isNaN(s)) {
                      return <td key={index}> {s} </td>;
                    } else {
                      return <td key={index}> - </td>
                    }

                  })}
                </tr>
                <tr className="bg-danger">
                  <td>Mean</td>
                  {Object.values(this.state.meanStats).map((s, index) => {
                    if(!isNaN(s)) {
                      return <td key={index}> {s} </td>;
                    } else {
                      return <td key={index}> - </td>
                    }

                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
