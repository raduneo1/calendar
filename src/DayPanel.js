import React, { Component } from 'react';
import { 
  MAX_DAYS_IN_CAL_MONTH,
  DAYS_IN_WEEK,
  NUM_WEEKS,
  MONTHS_IN_YEAR,
  WEEKDAYS,
  MONTH_LENGTHS,
  MONTH_NAMES
  } from './Utilities'
import moment from 'moment';
// Import SVG images
import snow from './SVG/23.svg';
import hail from './SVG/40.svg';
import rain from './SVG/18.svg';
import storm from './SVG/15.svg';
import freezingRain from './SVG/7.svg';
import cloud from './SVG/14.svg';
import fair from './SVG/3.svg';
import clear from './SVG/1.svg';
import sun from './SVG/28.svg';

class Meeting extends Component {
  componentDidUpdate() {
    this.nameInput.focus();
  }

  render() {
    const hasMeeting = this.props.hasMeeting;
    const isEditMode = this.props.meeting.isEditMode;

    const editButtonClass = (hasMeeting) ? "" : "nodisplay";
    const deleteButtonClass = (hasMeeting) ? "delete" : "nodisplay";
    const addButtonClass = (hasMeeting) ? "nodisplay" : "";
    const editClass = (isEditMode) ? "" : "nodisplay";
    const finalClass = (!isEditMode) ? "" : "nodisplay";
    
    return (
        <tr>
          <td>{this.props.meeting.start.format("HH:mm")}</td> 
          <td>
              <span className={finalClass}>{this.props.meeting.name}</span>
              <input type="text" name='meetingName'
                                 className={editClass}
                                 ref={input => this.nameInput = input}
                                 value={this.props.meeting.name} 
                                 onChange={event => this.props.handleDayPanelMeetingChange(event, this.props.meetingIdx, this.showInputError)}
                                 onBlur={event => this.props.handleDayPanelMeetingBlur(event, this.props.meetingIdx)}
                                 maxLength="15">
              </input>
              <div className="error" id="meetingNameError" />
          </td>
          <td><button className={editButtonClass}
                      onClick={event => this.props.handleDayPanelMeetingEditButton(event, this.props.meeting, this.props.meetingIdx)}>Edit</button></td>
          <td><button className={deleteButtonClass}
                      onClick={event => this.props.handleDayPanelMeetingDeleteButton(event, this.props.meeting, this.props.meetingIdx)}>X</button></td> 
          <td><button className={addButtonClass} onClick={event => this.props.handleDayPanelMeetingAddButton(event, this.props.meeting)}>+</button></td>          
        </tr>
      );
  }
}

function WeatherImg(props) {
  var imgSrc;
  switch (parseInt(props.forecastCode)) {
    case 16: case 13: case 41: case 46: case 42: case 15: case 5: case 7: {
      // Snow
      imgSrc = snow;
      break;
    } case 17: case 18: case 6: {
      // Hail / sleet
      imgSrc = hail;
      break;
    } case 11: case 8: case 35: case 40:{
      // Rain
      imgSrc = rain;
      break;
    } case 3: case 4: case 45: case 37: case 38: case 39: {
      // Thunerstorm
      imgSrc = storm;
      break;
    } case 10: {
      // Freezing rain
      imgSrc = freezingRain;
      break;
    } case 29: case 30: case 28: case 27: case 26: {
      // Cloudy
      imgSrc = cloud;
      break;
    } case 33: case 34: {
      // Fair
      imgSrc = fair;
      break;
    } case 31: {
      // clear (night)
      imgSrc = clear;
      break;
    } case 32: case 36: {
      // Sun
      imgSrc = sun;
      break;
    } default: {
      imgSrc = clear;
    }
  };

  return (
    <img src={imgSrc} width="80" height="80" />
  )
}

function Weather(props) {
  if (props.isWeatherAvail &&
      props.forecasts &&
      props.forecasts.length > 0) {
    return (
      <table className="weather">
        <tbody>
          <tr>
            <td>
              <div>
              <p>Forecast: </p>
              <p>Low °: </p>
              <p>High °: </p>
              </div>
            </td>
            <td>
              <div>
              <strong><p>{props.forecasts[props.offsetFromToday].text}</p></strong>
              <strong><p>{props.forecasts[props.offsetFromToday].low} ° C</p></strong>
              <strong><p>{props.forecasts[props.offsetFromToday].high} ° C</p></strong>
              </div>
            </td>
            <td>
              &nbsp; 
              <WeatherImg forecastCode={props.forecasts[props.offsetFromToday].code}/>
            </td>
          </tr>
        </tbody>
      </table>
    );
  } else {
    return (
      <div>
      <p>Forecast: Not available</p>
      </div>
    );
  }
}

class DayPanel extends Component {
  renderMeetings(meetings) {
    const meetingRows = [];
    let meetingIdx = 0;

    for (let i=0; i < 24; i += 1) {
      // Do not show times before 8 am
      if (i < 8)
        continue;
      
      let meeting = meetings[meetingIdx];
      const startTime = moment().hours(i).minutes(0).seconds(0);
      const endTime = moment().hours(i+1).minutes(0).seconds(0);
      const hasMeeting = (
        meetingIdx in meetings
        && startTime.isSame(meeting.start, "minute")
      );

      if (hasMeeting) {
        meetingIdx += 1;
      } else {
        // Dummy meeting (empty)
        meeting = {
          name : "---   ---   ---   ",
          start : startTime,
          end: endTime,
          isEditMode: false,
          isCompleted: false
        } 
      }
        
      meetingRows.push(
        <Meeting key={i} 
                 meeting={meeting} 
                 meetingIdx={meetingIdx-1}
                 hasMeeting={hasMeeting} 
                 handleDayPanelMeetingAddButton={this.props.handleDayPanelMeetingAddButton}
                 handleDayPanelMeetingEditButton={this.props.handleDayPanelMeetingEditButton}
                 handleDayPanelMeetingChange={this.props.handleDayPanelMeetingChange}
                 handleDayPanelMeetingBlur={this.props.handleDayPanelMeetingBlur}
                 handleDayPanelMeetingDeleteButton={this.props.handleDayPanelMeetingDeleteButton}/>);
    }
        
    return (
      meetingRows
    );
  }

  render() {
    return (
      <details open={this.props.isDetailsOpen} className="details5">
        <summary onClick={(event) => this.props.handleDayPanelSummaryClick(event)}>
          Day: <strong>{this.props.day.day} {MONTH_NAMES[this.props.currentMonthIdx]}, {this.props.currentYear}</strong>
        </summary>

        <Weather forecasts={this.props.forecasts}
                 offsetFromToday={this.props.offsetFromToday}
                 isWeatherAvail={this.props.isWeatherAvail}/>
        <br/>
        <table className = "meetings">
          <tbody>
            {this.renderMeetings(this.props.day.meetings)}
          </tbody>
        </table>
        <br/>

        <p>Note:</p><br/>
        <textarea type="text" rows="4" cols="50" 
                  value = {this.props.day.note} 
                  onChange = {(event) => this.props.handleDayPanelNoteChange(event)} 
              />
        <br/><br/>
      </details>
    )
  }
}

export default DayPanel;