import React from "react";
import ReactDOM from "react-dom";
import styled, { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
    body {
        margin: 0px;
        font-family: "Avenir Next", Avenir, sans-serif;
        font-size: 16px;
    }
`;

const PomodoroContainer = styled.div`
  width: 500px;
  background-color: #db5a42;
  color: #ffd275;
  padding: 2rem;
  & .timer-container {
    margin-bottom: 2rem;
    & > p {
      text-align: center;
      font-size: 3rem;
      font-weight: 300;
      margin: 0px;
      padding: 2rem auto;
    }
  }
  & .actions-container {
    display: flex;
    justify-content: space-evenly;
  }
  & .action {
    border: none;
    background-color: #e8ae68;
    font-size: 0.9rem;
    box-sizing: border-box;
    padding: 0.5rem 1rem;
    box-shadow: inset 0 -0.6em 0 -0.35em rgba(0, 0, 0, 0.17);
    cursor: pointer;
    &.active {
      background-color: #b6e868;
    }
  }
`;

const time = {
  "25Min": 1500,
  "5min": 300,
  "30min": 1800
};

const step = {
  working: "working",
  shortPause: "shortPause",
  longPause: "longPause",
  reset: "reset"
};

class Pomodoro extends React.Component {
  constructor() {
    super();
    this.state = {
      count: time["25Min"],
      activeStep: null
    };
    this.countdownInterval = null;
    this.secondsToClock = this.secondsToClock.bind(this);
    this.startCountdown = this.startCountdown.bind(this);
    this.resetCountdown = this.resetCountdown.bind(this);
  }
  componentDidMount() {
    chrome.runtime.sendMessage({action: 'get_state'}, (state) => {
      // this.setState(state);
      console.log('yeah!!');
    });
  }
  componentWillUnmount() {
    clearInterval(this.countdownInterval);
  }
  secondsToClock(countdownSeconds) {
    const normalize = number => (number < 10 ? `0${number}` : number);
    const minutes = Math.floor(countdownSeconds / 60);
    const seconds = countdownSeconds % 60;
    return `${normalize(minutes)}:${normalize(seconds)}`;
  }
  startCountdown(count, activeStep) {
    clearInterval(this.countdownInterval);
    this.setState({ count, activeStep }, () => {
      this.countdownInterval = setInterval(() => {
        this.setState(({ count }) => {
          // When the timer ends throw a notification and restart
          if (count === 0) {
            this.showNotification('Timer ends', "The timer has ended!");
            return {
              count: time["25Min"]
            };
          } else {
            return {
              count: count - 1
            };
          }
        }, () => {
          // Persist the state in the background-script
          chrome.runtime.sendMessage({action: 'save_state', state: this.state});
        });
      }, 1000);
    });
  }
  resetCountdown() {
    clearInterval(this.countdownInterval);
    this.setState({
      count: time["25Min"],
      activeStep: step.reset
    });
    this.showNotification('Resetting', 'The timer will start all over again')
  }
  showNotification(title, message) {
    chrome.notifications.create("notification", { 
      type: "basic", 
      iconUrl: "pomodoro.png", 
      title, 
      message
    });
  }
  render() {
    const { count, activeStep } = this.state;
    return (
      <PomodoroContainer>
        <GlobalStyle />
        <div className="timer-container">
          <p>{this.secondsToClock(count)}</p>
        </div>
        <div className="actions-container">
          <button
            className={`action ${activeStep === step.working ? "active" : ""}`}
            onClick={() => this.startCountdown(time["25Min"], step.working)}
          >
            Work!
          </button>
          <button
            className={`action ${activeStep === step.shortPause ? "active" : ""}`}
            onClick={() => this.startCountdown(time["5min"], step.shortPause)}
          >
            Short pause
          </button>
          <button
            className={`action ${activeStep === step.longPause ? "active" : ""}`}
            onClick={() => this.startCountdown(time["30min"], step.longPause)}
          >
            Long pause
          </button>
          <button className={`action ${activeStep === step.reset ? "active" : ""}`} onClick={this.resetCountdown}>
            Reset
          </button>
        </div>
      </PomodoroContainer>
    );
  }
}

ReactDOM.render(<Pomodoro />, document.getElementById("root"));
