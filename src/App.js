import data from "./data.csv";
import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.scss";
import * as d3 from "d3";
import $ from "jquery";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      filteredItems: [],
      heading: [],
      sort: false,
      cell: '',
      filter: true,
    };
    this.handleSort = this.handleSort.bind(this);
    this.handleHover = this.handleHover.bind(this)
    this.handleAddFilter = this.handleAddFilter.bind(this)
    this.handleFilter = this.handleFilter.bind(this)
  }

  async componentDidMount() {
    const items = [];
    await d3.csv(data, item => {
      items.push(item);
    });

    await this.setState({
      items: items,
      filteredItems: items
    });

    var heading = [];
    if (items[0]) {
      heading = Object.keys(items[0]);
    }

    await this.setState({
      heading: heading
    });
  }

  handleSort(column, e) {
    this.setState(prevState => {
      return { sort: !prevState.sort };
    });

    const items = this.state.items;
    const currentTarget = $(e.currentTarget);

    if (currentTarget.hasClass("asc")) {
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
      .removeClass("desc")
    } else {

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
        .removeClass("asc desc")
    }
  }

  handleHover(e) {
    this.setState({
      cell: e
    })
  }

  handleAddFilter(){
    this.setState((prevState) => {
      return ({ filter : !prevState.filter })
    })
  }

  async handleFilter(e, column) {
    const items = this.state.items;
    const filteredItems = items.filter((i) => {
      return (
        i[column].toLowerCase().includes(e.currentTarget.value)
      )
    })
    await this.setState({
      filteredItems: filteredItems
    });

  }

  render() {
    return (
      <div className="row col-12">
        <div className="jumbotron">
          <label> Current cell row : {this.state.cell} </label>
          <button className="d-block m-2" onClick={this.handleAddFilter}>Add filter</button>
          <table className="mx-auto text-center data-table">
            <tbody>
              <tr>
                <th className="p-2">Row</th>
                {this.state.heading.map((h, index) => {
                  return (
                    <th
                      className="p-2 table-heading"
                      key={index}
                      onClick={e => this.handleSort(h, e)}
                      onMouseOver={(e) => {this.handleHover(h)}}
                    >
                      {h}
                    </th>
                  );
                })}
              </tr>
              {this.state.filter? 
                <tr>
                  <td>Filter</td>
                  {this.state.heading.map((h, index) => {
                    return (
                      <td>
                        <input className="col"
                          onChange={(e) => this.handleFilter(e, h)}
                        >
                        </input> 
                      </td>
                    )
                  })}
                </tr>
                :
                null  
              }
              { this.state[this.state.filter ? 'filteredItems' : 'items'].map((item, index) => { 
                var rowNo = index + 1
                return (
                  <tr>
                    <td>{rowNo}</td>
                    {Object.values(item).map((i, index) => {
                      return <td 
                        key={index}
                        onMouseOver={(e) => {this.handleHover(rowNo)}}
                        >
                          {i} 
                        </td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default App;
