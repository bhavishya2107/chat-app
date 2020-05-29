import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";


let rootReducer = combineReducers({
  
});

export let store = createStore(rootReducer, applyMiddleware(thunk));