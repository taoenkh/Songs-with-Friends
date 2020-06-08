const express = require("express");
const http = require("http");

const app = express();
const passport = require('passport');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const request = require("request");

var fetch = require('node-fetch');
var SpotifyWebApi = require('spotify-web-api-node');


let preparedTrack = "6rz0dTA0PdhXImFV5EjM0w";
var spotifyApi = new SpotifyWebApi({
  clientId : "b48b5a326cbe4524afba7e80a0ad0801",
  clientSecret : "186a1a8082e44ee3afd697436a538574",
});

spotifyApi.clientCredentialsGrant()
  .then(function(data) {
    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
  }, function(err) {
    console.log('Something went wrong when retrieving an access token', err.message);
  });



let userNumber = 0;
app.use(expressSession(
  { 
    secret:'bananaBread',  // a random string used for encryption of cookies
    maxAge: 6 * 60 * 60 * 1000, // Cookie time out - six hours in milliseconds
    // setting these to default values to prevent warning messages
    resave: true,
    saveUninitialized: false,
    // make a named session cookie; makes one called "connect.sid" as well
    name: "ecs162-session-cookie"
  }));

app.use(passport.initialize());
app.use(passport.session());
let hostId = "";
let playlist = [ '{"56wVfJKtnwlSZtC4NVgIrf":{"trackname":"說好不哭","length":"3:42","album":"說好不哭","artists":["Jay Chou","阿信"]}}',
  
  '{"0F02KChKwbcQ3tk4q1YxLH":{"trackname":"晴天","length":"4:28","album":"叶惠美","artists":["Jay Chou"]}}'];


//let playlist = [];
var tokens = {};
var users = {};
let tokenOrder = [];

if (Object.keys(tokens).length !== 0){
  
  
}
let volume = 50;
// There are other strategies, including Facebook and Spotify
const SpotifyStrategy = require('passport-spotify').Strategy;

const server = http.createServer(app);
const io = require('socket.io')(server);

// global object that stores all users' access tokens, indexed by their Spotify profile id
// kind of taking the place of a user table in a database
// since we're only handling one room, this should be sufficient

passport.use(
  new SpotifyStrategy(
    {
      clientID: "b48b5a326cbe4524afba7e80a0ad0801",
      clientSecret: "186a1a8082e44ee3afd697436a538574",
      callbackURL: 'http://localhost:5000/auth/spotify/callback',
      scope: ["user-read-playback-state", "user-modify-playback-state"]
    },
  // function to call once Passport gets the user's profile and accessToken from Spotify
  gotProfile
  )
);
app.get("/volumedown", (req,res)=>{
        
  volume -= 10;
  
        });

app.get("/volumeup", (req,res)=>{
        
  volume += 10;
  
        });
// The first call to Passport, which redirects the login to Spotify to show the login menu
app.get('/auth/spotify', 
  function (req, res, next) {
    console.log("At first auth");
    next();
  },   
  passport.authenticate('spotify'), function(req, res) {
  // The request will be redirected to spotify for authentication, so this
  // function will not be called and we don't have to return the HTTP response.
});



// After the user logs in, Spotify redirects here. 
// Passport will proceed to request the user's profile information and access key
app.get(
  '/auth/spotify/callback',
  function (req, res,next) {
    console.log("At second auth");
    next();
  },
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log( playlist[0]);
    
    let nextid = Object.keys(JSON.parse(playlist[0]))[0];
    if (userNumber == 0){
      playtrack(Object.values(tokens)[0],nextid);
      console.log("host started");
    }
    res.redirect("http://localhost:3000");
  }   
  
);
function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}
app.get('/trackinfo/:id', function(req, res) {
  //console.log("trackinfo");
  let token = tokens[req.user]; 
  //console.log(tokens);
  //console.log(req.user);
  let url = "https://api.spotify.com/v1/tracks/"+req.params.id;
  //console.log(url);
  //console.log(token);
  const options = {
      url: url,
      method:"GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
  };
  request(options, 
    // The callback function for when Spotify responds
    (err, postres, body) => {
      
      
      //console.log(`Status: ${postres.statusCode}`);
      //console.log(body);
      if (err) {
          return console.log(err);
      }
      else{
        let json = JSON.parse(body);
          //console.log(json["progress_ms"]);
          //console.log(json["item"]);
        let duration = millisToMinutesAndSeconds(json['duration_ms']);
        
        
        let artists = [];
        let temp = json["artists"];
        
        for (let i = 0; i < temp.length;i++){
          artists.push(temp[i]["name"]);
        }
        let info = {trackname:json["name"],length:duration,album:json["album"]["name"],artists:artists};
        res.json(info);
      }
  });
});
app.get("/addsong/:id", function(req, res){
  
  let id = req.params.id;
  playlist.push(id);
  console.log(playlist);
  res.sendStatus(200);
  
  
});

app.get("/getplaylist", (req,res)=>{
  //console.log("getplaylist");
  let result = {data:playlist};
  res.json(result);
  
  
});

function playtrack(token,param){
  console.log("sth played",param);
  let url = "https://api.spotify.com/v1/me/player/play";

  // get the user's token
  //console.log(token);
  // console.log(req.user)
  
  
  // put some data into the body of the PUT request we will send to Spotify
  let body = {"uris": ["spotify:track:" + param]}
 // console.log(body)

  const options = {
      url: url,
      json: true,
      body: body,
      headers: {
        // give them the user's token so they know we are authorized to control the user's playback
        "Authorization": `Bearer ${token}`
      }
  };
  // send the PUT request!
  request.put(options, 
    // The callback function for when Spotify responds
    (err, postres, body) => {
      if (err) {
          return console.log(err);
      }
    //  console.log(`Status: ${postres.statusCode}`);
    // console.log(body);

      // just go back to the single homepage.  Later you might want to add a query string? 
      // or do this whole thing with an AJAX request rather than with redirects? 
      //res.redirect("/")
  });

}
app.get("/play/:id", function(req, res) {
  
  //console.log(req.user);
  let token = tokens[req.user];  // grab the user's access token
  
  let param = req.params.id;
  // next, do an API call to Spotify at this URL
  playtrack(token,param);
  
}); 
// end app.get
app.get("/getname", (req,res)=>{
  let user = req.user;
  let url = "https://api.spotify.com/v1/users/"+user;
  let token = tokens[req.user];
  const options = {
      url: url,
      method:"GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
  };
  request(options, 
    // The callback function for when Spotify responds
    (err, postres, body) => {
      
      
      //console.log(`Status: ${postres.statusCode}`);
      //console.log(body);
      if (err) {
          return console.log(err);
      }
      else{
        let json = JSON.parse(body);
          //console.log(json["progress_ms"]);
          //console.log(json["item"]);
        let info = {name:json["display_name"]};
        
        res.json(info);
      }
      


      
      
  });
  
});
app.get("/getimage", (req,res)=>{
  let user = req.user;
  let url = "https://api.spotify.com/v1/users/"+user;
  let token = tokens[req.user];
  const options = {
      url: url,
      method:"GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
  };
  request(options, 
    // The callback function for when Spotify responds
    (err, postres, body) => {
      
      
      console.log(`Status: ${postres.statusCode}`);
      console.log(body);
      if (err) {
          return console.log(err);
      }
      else{
        let json = JSON.parse(body);
          //console.log(json["progress_ms"]);
          //console.log(json["item"]);

        let img = json["images"];
        
        if (img.length === 0){
          res.json({img:"None"})
        }
        else{
          console.log(img[0]["url"],"images");
          let url = {img:img[0]["url"]};
          
          res.json(url);
        }
      }      
  });
  
});


let currentdiff = {};
function returnstatus(token){
  
  //console.log(req.user,"hi");
  let info;
  //console.log(token,"in return status");
  let url = "https://api.spotify.com/v1/me/player/currently-playing";
  
    const options = {
      url: url,
      method:"GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
  };
  
    request(options, 
    // The callback function for when Spotify responds
    (err, postres, body) => {
      
      
    //  console.log(`Status: ${postres.statusCode}`);
     // console.log(body);
      if (err) {
          console.log(err,"got error");
          return;
      }
      else{

        
          let json = JSON.parse(body);
        
        
          //console.log(json["progress_ms"]);
          //console.log(json["item"]);
          
        info = {current:json["progress_ms"],total:json["item"]["duration_ms"]};
        //console.log("ret s info",info);
        currentdiff = info;
        return info;
      }
      

      // just go back to the single homepage.  Later you might want to add a query string? 
      // or do this whole thing with an AJAX request rather than with redirects? 
      console.log(info,"res------------");
      
  });
  //console.log(info,"info-----to ret");
  return info;
}
function getstatus(req,res){

  //console.log(req.user,"hi");
  let token = tokens[req.user];
  //console.log(tokens,"---------tokens----------");
  let url = "https://api.spotify.com/v1/me/player/currently-playing";
  
    const options = {
      url: url,
      method:"GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
  };
  
    request(options, 
    // The callback function for when Spotify responds
    (err, postres, body) => {
      
      
      //console.log(`Status: ${postres.statusCode}`);
      //console.log(body);
      if (err) {
          return console.log(err);
      }
      else{
        let json = JSON.parse(body);
          //console.log(json["progress_ms"]);
          //console.log(json["item"]);
        //console.log(json,"toprin-------------t");

        let info = {current:json["progress_ms"],id:json["item"]["id"],
                total:json["item"]["duration_ms"], name:json["item"]["name"],album:json["item"]["album"]["name"],
                  artist:json["item"]["artists"][0]["name"]};
        res.json(info);
      }
      

      // just go back to the single homepage.  Later you might want to add a query string? 
      // or do this whole thing with an AJAX request rather than with redirects? 
      
      
  });
}
app.get("/getstatus",(req,res)=>{
  
  getstatus(req,res);
  
});

app.get("/search", function (request, response) {
  let query = request.query.query;
  
  spotifyApi.searchTracks(query)
  .then(function(data) {
    response.send(data.body);
  }, function(err) {
    console.log(err)
  });
});

// Usual static server stuff
app.get("/", (request, response) => {

  

  console.log(request.user); // for debugging
  response.sendFile(__dirname + "/public/index.html");
});

// make all the files in 'public' available
app.use(express.static("public"));


// listen for requests :)
server.listen(5000, () => {
  console.log("Your app is listening on port 5000" );
});


// These are the three Passport "customization functions", used for getting user information into
// rec.user.  

// This function is 
// called by Passport when the user has successfully logged in, and the accessToken, refreshToken,
// and user profile have been returned to this Server from the Spotify authentication server
function gotProfile(accessToken, refreshToken, expires_in, profile, done) {
      // the access tokens of all users are stored in the global object "tokens"
      tokens[profile.id] = accessToken;
      tokenOrder.push(accessToken);
      console.log(profile);
      // it calls "done" to tell Passport to get on with whatever it was doing.
      // See login mini-lecture 25, the customization functions described around slide 7
      done(null, profile.id)
}

// profile.id was passed out of gotProfile and into and out of here 
passport.serializeUser(function(user, done) {
  done(null, user);
});

// profile.id was passed out of serializeUser, and into and out of here. Passport will put it into rec.user
passport.deserializeUser(function(user, done) {
  done(null, user);
});
let host = "";

function checkifdone(){
  console.log(playlist);
  if (Object.keys(tokens).length !== 0){
    let token = tokenOrder[0]
    returnstatus(token);
    //temp = JSON.parse(temp);
    console.log("-----------checked if done-------",currentdiff);
    console.log(currentdiff["total"] - currentdiff["current"],"-------------diff---------");

    if (Object.values(currentdiff).length !== 0){
      console.log(currentdiff["total"] - currentdiff["current"],"-------------diff---------");
      //console.log(playlist);
      if (currentdiff["total"] - currentdiff["current"] <= 4000  ){

        if (playlist.length > 1){
          playlist.shift();

          console.log(playlist,"playlist before nextid");
          let nextid = Object.keys(JSON.parse(playlist[0]))[0];


          for (let key in tokens){
            playtrack(tokens[key],nextid);
          }
        }
        else{
          //playlist.shift();
          for (let key in tokens){
            playtrack(tokens[key],preparedTrack);
          }
          //playlist.push(p)

        }
      }
  }
}
}


setInterval(checkifdone,4000);






io.on('connection', socket => {
	socket.on("new-user", name=>{
    userNumber++;
    console.log(name,"name-------");
    console.log(Object.keys(users),"users");
    users[socket.id] = name;
    socket.broadcast.emit("user-connected",name);
    if (Object.keys(users).length === 1){
      host = socket.id;
      socket.emit("host",true);
    }
    else{
      console.log("_________not a host __________________");
      let nextid = Object.keys(JSON.parse(playlist[0]))[0];
      console.log("user number:",userNumber);
      console.log(Object.keys(tokens),"token vals");
      playtrack(tokenOrder[userNumber - 1],nextid);

      //socket.broadcast.emit("user-connected",name);
      socket.emit("host",false);

    }
    
  })
  socket.on('send-chat-message',message => {
    console.log(message,users[socket.id]);
    socket.broadcast.emit("chat-message", {message:message, name:users[socket.id]});
  });
  socket.on("disconnect", ()=>{
    userNumber--;
    socket.broadcast.emit("user-disconnected",users[socket.id]);
    delete users[socket.id];
  })
              
              
});