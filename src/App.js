import React from "react";
import { Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import FrontChatRoomForm from "./components/FrontChatRoomForm";
import EnterPasswordToConnectPage from "./components/EnterPasswordToConnectPage";
import ChatPage from "./components/ChatPage";
import "./App.css";

class App extends React.Component {
  render() {
    return (
      <div className="container p-5">
        <Switch>
          <Route exact path="/">
            <FrontChatRoomForm />
          </Route>
          <Route exact path="/connect">
            <EnterPasswordToConnectPage />
          </Route>
          <Route exact path="/chat">
            <ChatPage />
          </Route>
        </Switch>
      </div>
    );
  }
}

export default App;
