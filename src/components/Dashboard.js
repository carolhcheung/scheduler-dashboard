import React, { Component } from "react";
import axios from "axios";

import classnames from "classnames";
import Loading from './Loading';
import Panel from "./Panel";

import {
  getTotalInterviews,
  getLeastPopularTimeSlot,
  getMostPopularDay,
  getInterviewsPerDay
} from "helpers/selectors";

import { setInterview } from "helpers/reducers";

//3 ways to fix onSelect is not a function
//Bind in Constructor
// Use Arrow Function in Class Property
// Use Arrow Function in Render >>>>>>>>>>>>using this method


const data = [
  {
    id: 1,
    label: "Total Interviews",
    getValue: getTotalInterviews
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    getValue: getLeastPopularTimeSlot
  },
  {
    id: 3,
    label: "Most Popular Day",
    getValue: getMostPopularDay
  },
  {
    id: 4,
    label: "Interviews Per Day",
    getValue: getInterviewsPerDay
  }
];

//loading set false to render panels
//add initial state object called focused with default null = unfocused
//change focused to 1-4 to focus on individual panels
class Dashboard extends Component {
  state = {
    loading: true,
    focused: null,
    days: [],
    appointments: {},
    interviewers: {}
    // instance method declaring for all instances of Dashboard class
    // use this.setState to apply state changes, instance method provided by superclass
    //selectPanel function is an action that we can pass to other components
  };

  selectPanel(id) {
    this.setState(previousState => ({
      focused: previousState.focused !== null ? null : id
    }));
  };

  //check to see if there is saved focus state after we render the application the first time
  componentDidMount() {
    const focused = JSON.parse(localStorage.getItem("focused"));

    if (focused) {
      this.setState({ focused });
    }
    //when component mounts, fetch request API data, after data return use this.setState to merge into existing state object
    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers")
    ]).then(([days, appointments, interviewers]) => {
      this.setState({
        loading: false,
        days: days.data,
        appointments: appointments.data,
        interviewers: interviewers.data
      });
    });
    //new instance var this.socket assign reference to websocket connection
    this.socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    //listen for messages on socket connection use them to update state when we book or cancel interview
    //add event handler to convert string data to JS data types, if data is object with correct type then update state, use setInterview
    this.socket.onmessage = event => {
      const data = JSON.parse(event.data);
    
      if (typeof data === "object" && data.type === "SET_INTERVIEW") {
        this.setState(previousState =>
          setInterview(previousState, data.id, data.interview)
        );
      }
    };
  }

  //listen for changes to the state, has access to props and state from previous update, compare them to existing state and if values change, write value to localStorage
  //convert our values before writing them to the localStorage
  //after adding componentDidMount and DidUpdate, if refresh browser will still be on current state unlike before will revert to initial null state
  componentDidUpdate(previousProps, previousState) {
    if (previousState.focused !== this.state.focused) {
      localStorage.setItem("focused", JSON.stringify(this.state.focused));
    }
  }
  //to close socket connection after lifecycle
  componentWillUnmount() {
    this.socket.close();
  }


  render() {
    //will see loading:true here with console.log(this.state) as well as loading:false without logging on ln103
    // console.log(this.state)
    //add conditional css class to dashboardClasses
    const dashboardClasses = classnames("dashboard", { "dashboard--focused": this.state.focused });

    if (this.state.loading) {
      return <Loading />;
    }
    //will see loading:false here with console.log(this.state) only
    // console.log(this.state)
    //passing Panel component four props
    //Map over the data array and create a new Panel for each of the four data objects
    //Use the this.state.focused value to filter panel data before converting it to components
    //if this.state.focused=null then return true for every panel, if equal to panel(panel.id) then let it through the filter
    //pass action onSelect action from Dashboard to each Panel component as a prop with onSelect with this.selectPanel because passing reference to instance method as a prop


    //update value to panel.getValue(this.state) to getValue render functions above to look up value with latest state each time it renders
    const panels = (this.state.focused ? data.filter(panel => this.state.focused === panel.id) : data)
      .map(panel => (
        <Panel
          key={panel.id}
          label={panel.label}
          value={panel.getValue(this.state)}
          onSelect={() => this.selectPanel(panel.id)} />
      ));

    //Render the panels array as children of the main element.
    return <main className={dashboardClasses}>{panels}</main>;
  }
}

//export or Loading.js wont render
export default Dashboard;