import React, { Component } from "react";

import classnames from "classnames";
import Loading from './Loading';
import Panel from "./Panel";

//3 ways to fix onSelect is not a function
//Bind in Constructor
// Use Arrow Function in Class Property
// Use Arrow Function in Render >>>>>>>>>>>>using this method


const data = [
  {
    id: 1,
    label: "Total Interviews",
    value: 6
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    value: "1pm"
  },
  {
    id: 3,
    label: "Most Popular Day",
    value: "Wednesday"
  },
  {
    id: 4,
    label: "Interviews Per Day",
    value: "2.3"
  }
];

//loading set false to render panels
//add initial state object called focused with default null = unfocused
//change focused to 1-4 to focus on individual panels
class Dashboard extends Component {
  state = {
    loading: false,
    focused: null,
    // instance method declaring for all instances of Dashboard class
    // use this.setState to apply state changes, instance method provided by superclass
    //selectPanel function is an action that we can pass to other components
  };

  selectPanel(id) {
    this.setState(previousState => ({
      focused: previousState.focused !== null ? null : id
    }));
  };


  render() {
    //add conditional css class to dashboardClasses
    const dashboardClasses = classnames("dashboard", { "dashboard--focused": this.state.focused });

    if (this.state.loading) {
      return <Loading />;
    }

    //passing Panel component four props
    //Map over the data array and create a new Panel for each of the four data objects
    //Use the this.state.focused value to filter panel data before converting it to components
    //if this.state.focused=null then return true for every panel, if equal to panel(panel.id) then let it through the filter
    //pass action onSelect action from Dashboard to each Panel component as a prop with onSelect with this.selectPanel because passing reference to instance method as a prop

    const panels = (this.state.focused ? data.filter(panel => this.state.focused === panel.id) : data)
      .map(panel => (
        <Panel
          key={panel.id}
          label={panel.label}
          value={panel.value}
          onSelect={() => this.selectPanel(panel.id)} />
      ));

    //Render the panels array as children of the main element.
    return <main className={dashboardClasses}>{panels}</main>;
  }
}

//export or Loading.js wont render
export default Dashboard;