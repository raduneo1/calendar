import React, { Component } from 'react';
import update from 'immutability-helper';
import './App.css';


function Modal(props) {
  const isOpen = props.isOpen;
  const className = isOpen ? "modal": "modal modal-closed";
  const meetings = props.meetings.map((meeting, index) => {
    return (
      <tr key={index}>
        <td>{meeting.start.format("HH:mm")} - {meeting.end.format("HH:mm")}: </td>
        <td><strong><span>{meeting.name}</span></strong></td>
        <td><input type='checkbox' 
                   value={props.isCompleted} 
                   onChange={event => props.handleModalIsCompletedChange(event, index)} />
        </td>
      </tr>
    )
  });

  return (
    <div className={className}>
      <div className="modal-content">
        <div className="modal-header">
          <span className="close" onClick={() => props.handleModalCloseButton()}>&times;</span>
          <h2>Reminder</h2>
        </div>
        <div className="modal-body">
          <br/>
          Meetings:
          <br/>
          <table>
            <tbody>
              {meetings}
            </tbody>
          </table>
          
          <br/>
          {props.nextMeeting ? (<p>NOTE: <strong>{props.nextMeeting.name}</strong> is in {props.nextMeeting.start.fromNow()} !</p>) : null}
        </div>
        <div className="modal-footer">
        </div>
      </div>
    </div>
  )
  
}

export default Modal;