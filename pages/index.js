import { Component } from "react";
import Link from "next/link";
import fetch from "isomorphic-unfetch";
import styled from "styled-components";
class ChatOne extends Component {
  // fetch old messages data from the server
  static async getInitialProps({ req }) {
    const response = await fetch("http://localhost:3000/messages/chat1");
    const messages = await response.json();
    return { messages };
  }

  static defaultProps = {
    messages: []
  };

  // init state with the prefetched messages
  state = {
    field: "",
    newMessage: 0,
    messages: this.props.messages,
    subscribe: false,
    subscribed: false
  };

  subscribe = () => {
    if (this.state.subscribe && !this.state.subscribed) {
      // connect to WS server and listen event
      this.props.socket.on("message.chat1", this.handleMessage);
      this.props.socket.on("message.chat2", this.handleOtherMessage);
      this.setState({ subscribed: true });
    }
  };
  componentDidMount() {
    this.subscribe();
  }

  componentDidUpdate() {
    this.subscribe();
  }

  static getDerivedStateFromProps(props, state) {
    if (props.socket && !state.subscribe) return { subscribe: true };
    return null;
  }

  // close socket connection
  componentWillUnmount() {
    this.props.socket.off("message.chat1", this.handleMessage);
    this.props.socket.off("message.chat2", this.handleOtherMessage);
  }

  // add messages from server to the state
  handleMessage = message => {
    this.setState(state => ({ messages: state.messages.concat(message) }));
  };

  handleOtherMessage = () => {
    this.setState(prevState => ({ newMessage: prevState.newMessage + 1 }));
  };

  handleChange = event => {
    this.setState({ field: event.target.value });
  };

  // send messages to server and add them to the state
  handleSubmit = event => {
    event.preventDefault();

    // create message object
    const message = {
      id: new Date().getTime(),
      value: this.state.field
    };

    // send object to WS server
    this.props.socket.emit("message.chat1", message);

    // add it to state and clean current input value
    this.setState(state => ({
      field: "",
      messages: state.messages.concat(message)
    }));
  };

  render() {
    return (
      <main>
        <div>
          <H.one>Boilerplate</H.one>
          <h3>Packages installed:</h3>
          <ul>
            <li>
              <code>
                <a href="https://github.com/socketio/socket.io">
                  Socket.io - 2.2
                </a>
              </code>
            </li>
            <li>
              <code>
                <a href="https://github.com/styled-components/styled-components">
                  Styled Components - 4.2
                </a>
              </code>
            </li>
            <li>
              <code>
                <a href="https://github.com/auth0/node-jsonwebtoken">
                  JSON Web Token - 8.5.1
                </a>
              </code>
            </li>
          </ul>
        </div>
      </main>
    );
  }
}
const H = {
  one: styled.h1`
    color: blue;
  `
};

export default ChatOne;
