import React, { Component } from "react";

class EnterPasswordToConnectPage extends Component {
  render() {
    return (
      <div className="container">
        <div className="jumbotron">
          <form>
            <div className="form-group">
              <label for="exampleInputPassword1">Your secret password</label>
              <input
                type="password"
                className="form-control form-control-lg"
                id="exampleInputPassword1"
                placeholder="your password"
              />
            </div>
            <small id="emailHelp" className="form-text text-muted mb-3">
              * - so don't hit refresh after entering the chatroom
            </small>

            <button type="submit" className="btn btn-lg btn-secondary btn-block">
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default EnterPasswordToConnectPage;
