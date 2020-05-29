import React from "react";
import { Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import FrontChatRoomForm from "./components/FrontChatRoomForm";
import { JSEncrypt } from "jsencrypt";
import EnterPasswordToConnectPage from "./components/EnterPasswordToConnectPage";
import ChatPage from "./components/ChatPage";
import "./App.css";
import * as helpers from "./helpers";
import { Link, withRouter } from 'react-router-dom'
import { AES, enc as CryptoEnc } from "crypto-js";
import { Presence } from './phoenix';



class App extends React.Component {
  constructor() {
    super();
    this.state = {
      password: "",
      error: "",
      authorized: false,
      allowEntranceSubmit: true,
      room_id: helpers.roomIdFromHref(),
      initialWindowTitle: document.title,
      messages: [],
      message: "",
      channel: [],
      users: [],
      presence: {}
    };
  }

  componentDidMount() {
    console.log(helpers.openSocket(), "socker");
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  // save_rsa function to set rsa in this.state
  save_rsa = (state,rsa) => {
    state.rsa = rsa;
  };

  //save credentials
  save_credentials = (state, data) => {
    state.authorized = true;
    state.room_id = data.room_id;
    state.password = data.password;
  };

  //save_channel
  save_channel = (state,channel) => {
    state.channel = channel;
  };

  receive_msg = (state, message) => {
    // state.messages.push({
    //   user_color: message.body[0],
    //   body: state.rsa.decrypt(message.body[1]),
    //   date: new Date()
    // })
    this.setState({
      messages: this.state.messages.concat({
        user_color: message.body[0],
        body: state.rsa.decrypt(message.body[1]),
        date: new Date()
      })
    })
  }

  notify_user_if_possible = (state) => {
    if (state.windowFocused === false) {
      document.title = '(*) ' + state.initialWindowTitle
    }
  }

  scroll_to_bottom = () => {
    window.scrollTo(0, document.body.scrollHeight)
  }

  update_users = (state, users) => {
    state.users = users.map((el) => {
      return {
        user_color: el.user_color,
        rsa_pub: AES.decrypt(
          el.rsa_pub, state.password
        ).toString(CryptoEnc.Utf8)
      }
    })
  }

  // presence_meta = (presence) => {
  //   presence[''].metas;
  // }

  update_presence = (state,presence) => {
    state.presence = presence
    if ((presence[''] || {}).metas) {
      this.update_users(this.state, this.state.users);
      // this.presence_meta(presence)
    }
  }

  // hook_channel
  hook_channel = (channel) => {
    channel.on("new_msg", (payload) => {
      this.receive_msg(this.state, payload)
      this.notify_user_if_possible(this.state)
      this.scroll_to_bottom()
    });

    channel.on('presence_state', initial => {
      this.update_presence(this.state, this.state.presence)
      Presence.syncState(this.state.presence, initial)
    })

    channel.on('presence_diff', diff => {
      this.update_presence(this.state, this.state.presence)
      Presence.syncDiff(this.state.presence, diff)
    })
  };

  //disconnected
  disconnected = (reason = "something went wrong...") => {
    this.setState({
      error: reason,
      authorized: false,
      password: "",
    });
  };

  //allow submit entrance
  allow_submit_entrance = () => {
    this.setState({
      allowEntranceSubmit: false,
    });
  };

  //sync href with room_id
  sync_href_with_room_id = (state) => {
    if (state.room_id !== helpers.roomIdFromHref()) {
      window.location.hash = state.room_id;
    }
  };

  //window focused
  window_focused = (state, boolean) => {
    state.windowFocused = boolean;
  };

  //hook body focus actions
  hook_body_focus_actions = () => {
    window.addEventListener("blur", () =>
      this.window_focused(this.state, false)
    );
    window.addEventListener("focus", () => {
      document.title = this.state.initialWindowTitle;
      this.window_focused(this.state, true);
    });
  };

  send_message = (e,message,state) => {
    e.preventDefault()
    const encMessage = state.users.map((user) => {
      let encrypt = new JSEncrypt()
      encrypt.setPublicKey(user.rsa_pub)
      console.log(encrypt.encrypt(message),"enc msg")
      return [
        user.user_color,
        encrypt.encrypt(message)
      ]
    })

    state.channel.push('new_msg', {body: encMessage})
  }

  onSubmit = () => {
    const socket = helpers.openSocket();
    let data = {
      room_id:this.state.room_id,
      password:this.state.password
    }
    console.log("hiiii form ");
    socket.onError(() => {
      this.setState({
        error: this.state.error,
        allowEntranceSubmit: true,
      });
    });

    socket.onOpen(() => {
      const rsa = new JSEncrypt({ default_key_size: 2048 });
      console.log(rsa)
      this.save_rsa(this.state,rsa);

      const encryptedRsaPub = AES.encrypt(
        rsa.getPublicKey(),
        data.password
      ).toString();
      console.log(encryptedRsaPub,"AES")

      const channel = helpers.prepareChannel({
        socket,
        encryptedRsaPub: encryptedRsaPub,
        roomId: data.room_id,
        password: data.password
      })
      console.log(channel,"channel")

      channel
        .join()
        .receive("ok", () => {
          this.setState({
            error: "",
            allowEntranceSubmit: true,
          });
          this.save_credentials(this.state, data);
          this.save_channel(this.state,channel);
          this.hook_channel(channel)
          this.hook_body_focus_actions();
          this.sync_href_with_room_id(this.state);
        })
        .receive("error", (res) => {
          this.disconnected(res["reason"]);
          this.allow_submit_entrance();
        });
    });
    console.log(this.state,"after onsubmit")
  };

  render() {
    console.log("messages", this.state)
    return (
      <div className="container p-5">
        <Switch>
          <Route exact path="/">
            {/* <FrontChatRoomForm /> */}
            <div className="container">
              <div className="jumbotron">
              
                  <div className="form-group">
                    <label for="exampleInputEmail1">Your desired room id</label>
                    <input
                    type="text"
                      className="form-control form-control-lg"
                      placeholder="room id. eg. party"
                      value={this.state.room_id}
                      name="room_id"
                      onChange={this.onChange}
                    />
                  </div>
                  <div className="form-group">
                    <label for="exampleInputPassword1">
                      Your secret password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="your password"
                      name="password"
                      value={this.state.password}
                      onChange={this.onChange}
                    />
                  </div>
                  <small id="emailHelp" className="form-text text-muted mb-3">
                    * - so don't hit refresh after entering the chatroom
                  </small>
                  <Link to="/chat">
                  <button
                    type="submit"
                    onClick={this.onSubmit}
                    className="btn btn-lg btn-secondary btn-block"
                  >
                    Submit
                  </button>
                  </Link>
             
              </div>
            </div>
          </Route>
          <Route exact path="/connect">
            <EnterPasswordToConnectPage />
          </Route>
          <Route exact path="/chat">
            {/* <ChatPage state={this.state} receiveMessage={this.receive_msg} /> */}
            <div className="container">
        <div className="chat_div">
          <div className="text-center m-2">CHATS</div>
        {this.state.messages.map((message) => {
          return <div style={{border:`3px solid #${message.user_color}`}}>
          <div  class="alert alert-secondary m-3" role="alert">
          <span>{message.body}</span>
        </div>
        </div>
        })}

        {/* {this.state.channel.map((message) => {
          return <div>
          <div  class="alert alert-secondary m-3" role="alert">
          <span>message</span>
        </div>
          </div>
        })} */}
      
        </div>
        <div className="m-3">
          <div className="text-center mb-2">Users online: 1</div>
          <div className="col-12">
            <form onSubmit={(e) => this.send_message(e,this.state.message,this.state)}>
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
          </Route>
        </Switch>
      </div>
    );
  }
}

export default (App);
