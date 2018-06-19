import React, { Component } from 'react';
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
import moment from 'moment'

class Day extends Component {

  renderDaySuffix() {
    let suffix = "";
    for (let i=0; i < this.props.meetings.length; i++) {
      suffix += "*"
    }
  
    return suffix;
  }

  render() {
    const daySelectedClass = this.props.isSelectedDay ? "selected" : "";
    const dayCurrentClass = this.props.isToday ? "current" : "";
    const meetings = this.props.meetings.map((meeting, index) => {
      return <span key={index}>{meeting.start.format("HH:mm")} - {meeting.end.format("HH:mm")}: {meeting.name} </span>
    });
    let dayCell;

    if (this.props.isDetailed) {
      dayCell = <td className = {daySelectedClass + " " + dayCurrentClass} 
                onClick = {(event)=>this.props.handleDayClick(event, this.props.day, this.props.weekDay, this.props.month)}>
        <span>{this.props.day}</span><br/>
        <span>{WEEKDAYS[this.props.weekDay]}</span><br/>
        - - - <br/>
        <div>{meetings}</div>
        - - - <br/>
      </td>
    } else {
      dayCell = <td className = {daySelectedClass + " " + dayCurrentClass} 
        onClick = {(event)=>this.props.handleDayClick(event, this.props.day, this.props.weekDay, this.props.month)}>
        {this.props.day} {this.renderDaySuffix()}
      </td>
    }

    return (
      dayCell
    );
  }
}


class Month extends Component {
  renderDays(currentYear, currentMonth, daysCurMonth, daysPrevMonth, daysNextMonth, weekdayOffset, currentDayIdx, handleDayClick, isWeekMode) {
    let weeks = [];
    let dayCells = [];
    const numDays = daysCurMonth.length;
    const currentWeekNumber = Math.floor((currentDayIdx + weekdayOffset + 1) / 7);
    
    // Iterate rows
    for (let i=0; i < NUM_WEEKS; i++) {
      // In Week Mode we only print the current week
      if (isWeekMode && i !== currentWeekNumber)
        continue;

      dayCells = [];

      //Iterate columns
      for (let j=0; j < DAYS_IN_WEEK; j++) {

        const tableIndex = (i*7 + j);
        const isDayOfCurrentMonth = (
          tableIndex > weekdayOffset && 
          tableIndex <= (numDays + weekdayOffset)
        );
        const dayClass = isDayOfCurrentMonth ? "" : "inactive";       
        let dayNumber;
        let days;  
        let month = currentMonth;

        // Setup current day number, month
        if (isDayOfCurrentMonth) {
          dayNumber = tableIndex - weekdayOffset;   
          days = daysCurMonth;
          month = currentMonth;
          //meetingCount = days[dayNumber-1].meetings.length;       
        } else if (tableIndex <= weekdayOffset) {
          dayNumber = daysPrevMonth.length + tableIndex - weekdayOffset;
          days = daysPrevMonth;
          month = currentMonth - 1;
          //mod(currentMonth - 1, MONTHS_IN_YEAR); 
        } else if (tableIndex > (numDays + weekdayOffset)) {
          dayNumber = tableIndex - (numDays + weekdayOffset);
          days = daysNextMonth;     
          month = currentMonth + 1;  
        }
        
        // Print calendar days
        if (
          (isWeekMode && month >= 0 && month < 12) 
          || isDayOfCurrentMonth
        ) {
          const isDayToday = isToday(dayNumber, currentMonth, currentYear); 
          const isSelectedDay = ( (dayNumber-1) === (currentDayIdx));   
          const meetings = days[dayNumber-1].meetings;
          
          dayCells.push(
            <Day 
              key = {tableIndex} 
              day = {dayNumber} 
              month = {month}
              isSelectedDay = {isSelectedDay}
              weekDay = {j}
              handleDayClick = {handleDayClick}
              meetings ={meetings}
              isToday = {isDayToday} 
              isDetailed={isWeekMode}
            />);
        } else  {
          dayCells.push(
              <td key={tableIndex} className={dayClass}>{dayNumber}</td>
          );
        }         
      }
      weeks.push(<tr key={i}>{dayCells.slice()}</tr>);
    }
    
    return <tbody>{weeks}</tbody>
  }

  render() {
    const weekdayOffset = new Date(this.props.currentYear, this.props.currentMonth, 1).getDay() - 1;
 
    return (
      <div>
        <table className="days">
          <thead>
            <tr>
              <td colSpan="2">
                <div className="radio-group">
                  <input type="radio" id="option-one" name="selector" 
                         value="month" 
                         checked={this.props.isWeekMode === false} 
                         onChange={(event) => this.props.handleOptionChange(event)}/>
                  <label htmlFor="option-one">Month</label>
                  <input type="radio" id="option-two" name="selector" 
                         value="week" 
                         checked={this.props.isWeekMode === true} 
                         onChange={(event) => this.props.handleOptionChange(event)}/>
                  <label htmlFor="option-two">Week</label>
                </div>
              </td>
              <td colSpan="3">
                {MONTH_NAMES[this.props.currentMonth] + " " + this.props.currentYear}
              </td>
              <td colSpan="2">
                <button onClick={(event) => this.props.handleCalendarPeriodChangeButton(event, false, this.props.isWeekMode)}>←</button>  
                <button onClick={(event) => this.props.handleCalendarPeriodChangeButton(event, true, this.props.isWeekMode)}>→</button>
              </td>
            </tr>
            <tr>
              <td>Sun</td><td>Mon</td><td>Tue</td><td>Wed</td><td>Thu</td><td>Fri</td><td>Sat</td>
            </tr>
          </thead>
          {this.renderDays(this.props.currentYear, this.props.currentMonth, this.props.days, this.props.daysPrevMonth, this.props.daysNextMonth,
                           weekdayOffset, this.props.currentDayIdx, this.props.handleDayClick, this.props.isWeekMode)}
        </table>
      </div>
    );
  }
}

export default Month;