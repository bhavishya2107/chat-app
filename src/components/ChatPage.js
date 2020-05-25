import React, { Component } from "react";

class ChatPage extends Component {
  render() {
    return (
      <div className="container">
        <div className="chat_div">
          <div className="text-center m-2">CHATS</div>
          <div class="alert alert-secondary m-3" role="alert">
            <span>Hiiii</span>
          </div>
          <div class="alert alert-secondary m-3" role="alert">
            <span>How are you?</span>
          </div>
        </div>

        <div className="m-3">
          <div className="text-center mb-2">Users online: 1</div>
          <div className="col-12">
            <form>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="enter your message"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default ChatPage;
