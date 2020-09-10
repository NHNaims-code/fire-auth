import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig);

function App() {
  const[newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password:'',
    photo: '',
    error: '',
    success: false
  });

  const provider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();

  const handleSignIn = () =>{
    firebase.auth().signInWithPopup(provider)
    .then(res => {
      const {displayName, photoURL, email} = res.user;
      const signedInUser = {
        isSignedIn: true,
        name: displayName,
        email: email,
        photo: photoURL
      }
      setUser(signedInUser)
    })
    .catch(err => {
      console.log(err.message);
    })
  }

  const handleSignOut = () =>{
    firebase.auth().signOut()
    .then(res => {
      const signOutUser = {
        isSignedIn: false,
        name: '',
        email: '',
        password: '',
        photo: '',
        error: '',
        success: true
      }
      setUser(signOutUser)
    })
    .catch(err =>{
      console.log(err.message);
    })
  }

  const signInWithFB = () => {
    firebase.auth().signInWithPopup(fbProvider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }

  const handleBlur = (event) => {
    // console.log(event.target.name, event.target.value);
    let isFormValid = true;
    if(event.target.name === 'email'){
        isFormValid = /\S+@\S+\.\S+/.test(event.target.value);
    }
    if(event.target.name === 'password'){
        const minimumSixDigit = event.target.value.length > 5;
        const isPasswordValided = /\S+\d+/.test(event.target.value);

       isFormValid = minimumSixDigit && isPasswordValided;
    }

    if(isFormValid){
      let newUserInfo = {...user};
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo)
    }
  }

  const updateUserName = name =>{
    var user = firebase.auth().currentUser;
    user.updateProfile({
      displayName: name
    }).then(function() {
      console.log("displayName updated successfully");
    }).catch(function(error) {
      console.log(error);
    });
  }

  const handleSubmit = (event) => {
      console.log("handleSubmit is clicked");
      if(newUser && user.email && user.password){
        firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = {...user}
          newUserInfo.success = true;
          newUserInfo.error = "";
          setUser(newUserInfo)
          updateUserName(user.name)
        })
        .catch(err => {
          const newUserInfo = {...user}
          newUserInfo.error = err.message;
          newUserInfo.success = false;
          setUser(newUserInfo)
        })
      }
      if(!newUser && user.email && user.password){
        firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = {...user}
          newUserInfo.success = true;
          newUserInfo.error = "";
          setUser(newUserInfo)
          console.log('sign in user info: ', res.user);
        })
        .catch(err => {
          const newUserInfo = {...user}
          newUserInfo.error = err.message;
          newUserInfo.success = false;
          setUser(newUserInfo)
        })
      }

    event.preventDefault();
  }



  return (
    <div className="App">
      {
        user.isSignedIn?<button onClick={handleSignOut}>Sign Out</button>:<button onClick={handleSignIn}>Sign In</button>
      }
      <br/>
      <button onClick={signInWithFB}>Sign In with Facebook</button>
      <h1>Our Own Auth System</h1>
      {
        user.isSignedIn && (
          <div>
            <p>Welcome,{user.name}</p>
            <p>Your Email: {user.email}</p>
            <img src={user.photo} alt=""/>
          </div>
        )
      }


     <form onSubmit={handleSubmit}>
       <br/>
      <input type="checkbox" name="newUserCheck" onChange={() => setNewUser(!newUser)}/>
      <label htmlFor="newUserCheck">Create an account</label>
       <br/>
        {
          newUser &&  <input type="text" onBlur={handleBlur} placeholder="Enter your name" name="name"/>
        }
        <br/>
        <input type="text" placeholder="Enter yur email" name="email" onBlur={handleBlur} required/>
        <br/>
        <input type="password" name="password" placeholder="Enter your password" onBlur={handleBlur} required/>
        <br/>
        <input type="submit" value={newUser?"Sign Up": "Sign In"}/>
     </form>
     {
       user.success?<p style={{color: "green"}}>"Your accout {newUser?"created":"loged in"} successfully"</p>:<p style={{color: "red"}}>{user.error}</p>
     }
      </div>
  );
}

export default App;
