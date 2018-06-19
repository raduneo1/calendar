import React, { Component } from 'react';
import update from 'immutability-helper';
import moment from 'moment'

import Modal from './Modal';
import DayPanel from './DayPanel';
import Month from './Month'
import { 
  MAX_DAYS_IN_CAL_MONTH,
  DAYS_IN_WEEK,
  NUM_WEEKS,
  MONTHS_IN_YEAR,
  WEEKDAYS,
  MONTH_LENGTHS,
  MONTH_NAMES,
  loadJS,
  isToday
  } from './Utilities'
  import './App.css';

class Calendar extends Component {
  constructor(props) {
    super(props);

    this.handleDayClick = this.handleDayClick.bind(this);
    this.handleModalCloseButton = this.handleModalCloseButton.bind(this);
    this.handleDayPanelNoteChange = this.handleDayPanelNoteChange.bind(this);
    this.handleCalendarPeriodChangeButton = this.handleCalendarPeriodChangeButton.bind(this);
    this.handleDayPanelMeetingAddButton = this.handleDayPanelMeetingAddButton.bind(this);
    this.handleDayPanelMeetingChange = this.handleDayPanelMeetingChange.bind(this);
    this.handleDayPanelMeetingEditButton = this.handleDayPanelMeetingEditButton.bind(this);
    this.handleDayPanelMeetingBlur = this.handleDayPanelMeetingBlur.bind(this);
    this.handleDayPanelMeetingDeleteButton = this.handleDayPanelMeetingDeleteButton.bind(this);
    this.forecastCallback = this.forecastCallback.bind(this);
    this.handleDayPanelSummaryClick = this.handleDayPanelSummaryClick.bind(this);
    this.handleModalIsCompletedChange = this.handleModalIsCompletedChange.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
      // Connect the forecastCallback() to the global window context, so Yahoo WEATHER API can invoke it
    window.forecastCallback = this.forecastCallback;  

    this.state = {
      months: this.initializeYear(),
      currentYear: moment().years(),
      currentMonthIdx : moment().months(),
      currentDayIdx : moment().date() - 1,
      isWeekMode: true,
      isDetailsOpen: false,
      forecasts: [],
      nextMeeting : null,
      isModalOpen: false
    };
  }
  
  componentDidMount() {
      // GET request for Yahoo WEATHER API
      const yql = escape("select item from weather.forecast where woeid in (select woeid from geo.places(1) where text='montreal, qc') and u='c'");
      const weatherQuery = "https://query.yahooapis.com/v1/public/yql?q=" + yql + "&format=json&callback=forecastCallback";
      loadJS(weatherQuery);
      
      // Check for meetings
      setInterval(() => {
        const meetings = this.state.months[this.state.currentMonthIdx][this.state.currentDayIdx].meetings;
        const oneHourFromNow = moment().add(2, 'hours');
        const pastAndFirstUpcomingMeetings = meetings.filter((meeting) => {
          return (
            !meeting.isCompleted && meeting.start.isBefore(oneHourFromNow)
          );
        });
        
        // Only look at past meetings and at the first upcoming one
        pastAndFirstUpcomingMeetings.forEach((meeting) => {
          if (!isToday(this.state.currentDayIdx + 1, this.state.currentMonthIdx, this.state.currentYear)) 
            return;
          
          if (!meeting.isEditMode
              && meeting.start.isBetween(moment(), oneHourFromNow)) {
            this.setState({
              nextMeeting: meeting,
              isModalOpen: true
            });
          }
        });
      }, 10000);
    }

  getOffsetFromToday() {
    const currentDate = moment().year(this.state.currentYear).month(this.state.currentMonthIdx).date(this.state.currentDayIdx + 1)
    const offsetFromToday = currentDate.format("DDD") - moment().format("DDD");
    // isWeatherAvail reflects that the Yahoo Weather API only returns weather data for 10 days
    const isWeatherAvail = (
      offsetFromToday >= 0 &&
      offsetFromToday < 10
    );
    return ({offsetFromToday, isWeatherAvail});
  }

  forecastCallback(data) {
    if (data.query.results) {
      const forecasts = data.query.results.channel.item.forecast;
      this.setState({forecasts});
    }
  };

  handleOptionChange(event) {
    let isWeekMode = false;
    if (event.target.value === "week")
      isWeekMode = true
    else if (event.target.value === "month")
      isWeekMode = false;
    this.setState({ isWeekMode });
  }

  handleDayClick(event, day, weekDay, month) {
    this.setState({
      isDetailsOpen : true,
      currentDayIdx : day - 1,
      currentMonthIdx : month
      });
  }

  handleDayPanelSummaryClick(event) {
    // Prevent default to avoid double toggle
    event.preventDefault();

    this.setState((prevState) => ({
      isDetailsOpen : !prevState.isDetailsOpen
    }));
  }

  handleDayPanelMeetingEditButton(event, appointment, meetIdx) {
    // IMMUTABILITY: use update since using slice() would only perform a shallow copy
    const months = update(this.state.months, {
      [this.state.currentMonthIdx]: {  
        [this.state.currentDayIdx]: { 
          meetings: {
            [meetIdx]: {
              isEditMode: {$set: true}
            }
          }
        }
      }
    });

    this.setState({months: months});
  };

  handleDayPanelMeetingBlur(event, meetIdx) {
    let meetingText = this.state.months[this.state.currentMonthIdx][this.state.currentDayIdx].meetings[meetIdx].name;
    if (meetingText.trim() === "")
      meetingText = "New Meeting";

    // IMMUTABILITY: use update since using slice() would only perform a shallow copy
    const months = update(this.state.months, {
      [this.state.currentMonthIdx]: {  
        [this.state.currentDayIdx]: { 
          meetings: {
            [meetIdx]: {
              isEditMode: {$set: false},
              name: {$set: meetingText}
            }
          }
        }
      }
    });

    this.setState({months: months});
  };

  handleDayPanelMeetingDeleteButton(event, selMeeting, meetIdx) {
    // IMMUTABILITY: use update since using slice() would only perform a shallow copy
    const meetings = this.state.months[this.state.currentMonthIdx][this.state.currentDayIdx].meetings;

    const months = update(this.state.months, {
      [this.state.currentMonthIdx]: {  
        [this.state.currentDayIdx]: { 
          meetings: {$set: meetings.filter(meeting => meeting.start !== selMeeting.start)}
        }
      }
    });

    this.setState({months: months});
  };

  handleDayPanelMeetingAddButton(event, meeting) {
    // IMMUTABILITY: use update since using slice() would only perform a shallow copy
    const meet = meeting;
    meet.isEditMode = true;
    meet.name = "";

    const months = update(this.state.months, {
      [this.state.currentMonthIdx]: {  
        [this.state.currentDayIdx]: { 
          meetings: {$push: [meet]}
        }
      }
    });
    months[this.state.currentMonthIdx][this.state.currentDayIdx].meetings.sort((a, b) => {
      var startA = a.start;
      var startB = b.start;
      if (startA.isBefore(startB)) {
        return -1;
      }
      if (startA.isAfter(startB)) {
        return 1;
      }
    
      return 0;
    });

    this.setState({months: months});
  };

  handleDayPanelMeetingChange(event, meetIdx, showInputError) {
    // IMMUTABILITY: use update since using slice() would only perform a shallow copy
    let meetingText = event.target.value;
    if (meetingText.length > 0)
      meetingText = meetingText[0].toUpperCase() + meetingText.slice(1);

    const months = update(this.state.months, {
                          [this.state.currentMonthIdx]: {  
                            [this.state.currentDayIdx]: { 
                              meetings: {
                                [meetIdx]: {
                                  name: {$set: meetingText}
                                }
                              }
                            }
                          }
                        });

    this.setState({months: months});
  }

  handleDayPanelNoteChange(event) {
    // IMMUTABILITY: use update since using slice() would only perform a shallow copy
    const months = update(this.state.months, {
                          [this.state.currentMonthIdx]: {  
                            [this.state.currentDayIdx]: { 
                              note: {$set: event.target.value}
                            }
                          }
                        });

    this.setState({months: months});
  }

  handleModalIsCompletedChange(event, meetIdx) {
    // IMMUTABILITY: use update since using slice() would only perform a shallow copy
    const isCompleted = this.state.months[this.state.currentMonthIdx][this.state.currentDayIdx].meetings[meetIdx].isCompleted;
    const months = update(this.state.months, {
                          [this.state.currentMonthIdx]: {  
                            [this.state.currentDayIdx]: { 
                              meetings: {
                                [meetIdx]: {
                                  isCompleted: {$set: !isCompleted}
                                }
                              }
                            }
                          }
                        });

    this.setState({months: months});
  }

  handleModalCloseButton() {
    this.setState({
      isModalOpen : false
      });
  }

  handleCalendarPeriodChangeButton(event, next = true, isWeekMode = false) {
    if (isWeekMode) {
      if (next) {
        if (this.state.currentMonthIdx === (MONTHS_IN_YEAR - 1)
            && ((this.state.currentDayIdx + 7) > MONTH_LENGTHS[this.state.currentMonthIdx]))
          return;

        if ((this.state.currentDayIdx + 7) > MONTH_LENGTHS[this.state.currentMonthIdx]) {
          this.setState({
            currentDayIdx: (7 - (MONTH_LENGTHS[this.state.currentMonthIdx] - this.state.currentDayIdx)),
            currentMonthIdx: this.state.currentMonthIdx + 1
          });
        } else {
          this.setState({currentDayIdx: (this.state.currentDayIdx + 7)});
        }
      } else {
        if (this.state.currentMonthIdx === 0
            && ((this.state.currentDayIdx - 7) <= 0))
          return;

        if ((this.state.currentDayIdx - 7) < 0) {
          this.setState({
            currentDayIdx: (MONTH_LENGTHS[this.state.currentMonthIdx - 1] - (7 - this.state.currentDayIdx)),
            currentMonthIdx: this.state.currentMonthIdx - 1
          });
        } else {
          this.setState({currentDayIdx: (this.state.currentDayIdx - 7)});
        }    
      }
    } else {
      if (next) {
        if (this.state.currentMonthIdx < (MONTHS_IN_YEAR - 1))
          this.setState({currentMonthIdx: (this.state.currentMonthIdx + 1)});
      } else {
        if (this.state.currentMonthIdx > 0) {
          this.setState({currentMonthIdx: (this.state.currentMonthIdx - 1)});
        }
      }
    }
  }

 initializeYear() {
    const months = [];
    MONTH_LENGTHS.forEach(function(monthLength, monthIndex) {
      const month = [];
  
      for (let day = 1; day <= monthLength; day++) {
        month.push({
          day: day,
          note: "",
          meetings: []
        });
      }
  
      months.push(month.slice());
    });
    return months.slice();
  }

  render() {
    const {offsetFromToday, isWeatherAvail} = this.getOffsetFromToday();
    const daysPrevMonth = (this.state.currentMonthIdx > 0) ? this.state.months[this.state.currentMonthIdx - 1] : this.state.months[(MONTHS_IN_YEAR - 1)];
    const daysNextMonth = (this.state.currentMonthIdx < (MONTHS_IN_YEAR - 1)) ? this.state.months[this.state.currentMonthIdx + 1] : this.state.months[0];

    return(
      <div>
        <br/><br/>
        <br/><br/>
        <Month days = {this.state.months[this.state.currentMonthIdx]} 
               daysPrevMonth = {daysPrevMonth}
               daysNextMonth = {daysNextMonth}
               currentMonth= {this.state.currentMonthIdx} 
               currentYear = {this.state.currentYear} 
               currentDayIdx = {this.state.currentDayIdx}  
               handleDayClick= {this.handleDayClick} 
               handleCalendarPeriodChangeButton = {this.handleCalendarPeriodChangeButton}
               handleOptionChange = {this.handleOptionChange}
               isWeekMode = {this.state.isWeekMode}/>
        <br/><br/>

        <DayPanel currentDayIdx = {this.state.currentDayIdx}
                  currentMonthIdx = {this.state.currentMonthIdx}
                  currentYear = {this.state.currentYear}
                  isDetailsOpen = {this.state.isDetailsOpen}
                  day = {this.state.months[this.state.currentMonthIdx][this.state.currentDayIdx]}
                  handleDayPanelNoteChange = {this.handleDayPanelNoteChange}
                  handleDayPanelSummaryClick = {this.handleDayPanelSummaryClick}
                  handleDayPanelMeetingAddButton = {this.handleDayPanelMeetingAddButton}
                  handleDayPanelMeetingEditButton = {this.handleDayPanelMeetingEditButton}
                  handleDayPanelMeetingBlur = {this.handleDayPanelMeetingBlur}
                  handleDayPanelMeetingChange = {this.handleDayPanelMeetingChange}
                  handleDayPanelMeetingDeleteButton = {this.handleDayPanelMeetingDeleteButton} 
                  forecasts = {this.state.forecasts}
                  offsetFromToday = {offsetFromToday}
                  isWeatherAvail = {isWeatherAvail}
                  maxLength = {15} />

        <Modal isOpen={this.state.isModalOpen}
               meetings={this.state.months[this.state.currentMonthIdx][this.state.currentDayIdx].meetings}
               nextMeeting={this.state.nextMeeting} 
               handleModalCloseButton = {this.handleModalCloseButton}
               handleModalIsCompletedChange = {this.handleModalIsCompletedChange}/>
      </div>
    )
  }
}

export default Calendar;
