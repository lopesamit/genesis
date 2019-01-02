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
      filters: [],
      columnClicked: '',
      isPloting: false,
      stats: {},
      isAsc: false
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
    await d3.csv(data, item => {
      items.push(item);
    });

    await this.setState({
      items: items,
      filteredItems: items
    });
  }

  async componentDidMount() {
    await this.getData();

    var heading = [];
    if (this.state.items[0]) {
      heading = Object.keys(this.state.items[0]);
    }

    await this.setState({
      heading: heading
    });
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

  handleHoverCell(rowNo) {
    this.setState({
      cell: rowNo
    });
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

  async handleFilter(e, column) {
    let items = this.state.items;
    if (Object.values(this.state.filters).length > 1) {
      items = this.state.filteredItems;
    }

    const filteredItems = items.filter(i => {
      return i[column].toLowerCase().includes(e);
    });

    await this.setState({
      filteredItems: filteredItems
    });
  }

  async statistics() {
    // const a = []
    // let b = 0
    // await this.state.heading.map((h, index) => {
    //   this.state.items.map((i, index) => {
    //     a.push( { [h] : i[h] })
    //     this.setState(byPropKey('stats'+[h], { [h] : i[h] }))
    //   });
    // });
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
          {/* <FileReader /> */}
          <InputLabel className="d-block">
            <span className="text-danger"> Current cell row number : </span> {this.state.cell}
          </InputLabel>
          <InputLabel className="d-block">
            <span className="text-danger"> Current Column : </span> {this.state.column} 
            <span className="text-danger"> Sorting: </span>{this.state.isSorting ? this.state.isAsc? 'Ascending' : 'Descending' : 'Not Sorting'}
            <span className="text-danger"> Filter: </span>{this.state.isFiltering ? 'Text Filter' : 'No Filter'}
          </InputLabel>
          <Button
            color="primary"
            variant="contained"
            className="m-2"
            onClick={this.handleAddFilter}
          >
            {this.state.isFiltering ? "Remove " : "Add "} filter
          </Button>
          <Button
            color="primary"
            variant="contained"
            className="m-2"
            onClick={this.handleAddGraph}
          >
            {this.state.isPloting ? "Remove " : "Add "} Graph
          </Button>
          {this.state.isSorting ? (
            <Button
              color="primary"
              variant="contained"
              className="m-2"
              onClick={this.handleRemoveSort}
            >
              Remove sorting
            </Button>
          ) : null}
          {graphComponent}
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
                      <td>
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
                      <td>
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
              {this.state[
                this.state.isFiltering ? "filteredItems" : "items"
              ].map((item, index) => {
                var rowNo = index + 1;
                return (
                  <tr>
                    <td>{rowNo}</td>
                    {Object.values(item).map((i, index) => {
                      return (
                        <td
                          key={index}
                          onMouseOver={e => {
                            this.handleHoverCell(rowNo);
                          }}
                        >
                          {i}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {/* <tr>
                <td>sum</td>
                {this.state.heading.map((h, index) => {
                  return <td />;
                })}
              </tr> */}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default App;
