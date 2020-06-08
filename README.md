# ECS 162 Final Project Songs-with-Friends
Team members :
## Lihang Pan (lhpan@ucdavis.edu)
## Jiaqi Liu (jiqliu@ucdavis.edu)
## Tao Wang (ttwwang@ucdavis.edu)

# Problem encountered

Due to the inablity to install some packages, and the inconvinience of glitch, we decided to develop our project in our local machine with `create-react-app` and `express js`. We also found that the project itself takes about 300 MBytes after unzipped, which will exceed the disk memory of glitch. In addition, we could not find an easy way to deploy our web app, since we used proxies to route between react and the backend. It is actually two seperate apps running. 
We also prepared a video demo to show how our web app works.

# Prerequisites

`npm` and `nodejs` must be installed to run this project

### To start running this project

To download the `final_project.zip` for running the actual code.
unzip `final_project.zip` and `cd` to `final_project`

run command `npm run dev`

### To Start the Website

Our application requires all the users to have a premium account and a web player running using the browser before checking the website.

If all the prerequisites were satisfied, you will be able to start the project.

Go to browser and type `localhost:5000`

This is the `Express js` is located.

We utilzied `Express js` for the back-end, and `create-react-app` to start the front-end.


The very first page will be a login page to our appliation. 
That login button connects to the active spotify player, starts a session for a certain user, and redirects the browser to `localhost:3000`, which is where the create-react-app is located.


In the `create-react-app`'s page the application will trigger the same play list for all the users. We made an assumption that the very first joined user will be the host, and the rest will be the clients. 
That means only when the very first joined user (host) reaches the end of a song will trigger other clients to change their playing track in the Spotify web player.

In this project, we used `socket-io`, `react-chat-widget`,  `spotify-web-api-node`. These are the dependencies other than what Nima's example has used.

## Approaches

### Synchronization

The method we used to synchronize the users: Since every user's token will be stored in our server side we can use `PUT https://api.spotify.com/v1/me/player/play/{id}` to tell all the users to play the song with `id`.

We also kept track of the current position of the playing track and the total time of the playing track.

In the server side, we check the difference between them every 4 seconds, when their difference is less than 4 seconds, the server will broadcast to all the clients to play the next song in the playlist.

For the playlist, we maintained an array in the server, in which there are two songs by default, and all the clients will play the very first song once they are logged in. 
One problem is that we could not support users joined in the middle to synchronize with the host, if the host has finished playing his/her current song, all the clients will get the command to play the next song with the host together.

To update the playlist, every client will user a /getplaylist api to check the array stores the playlist in the server. Clicking Sync Playlist, will rerender the front-end page to the lates playlist.

### Chat

The chat feature utilized `socket.io`, which can detect whether a user is joined or disconnected to the app.

Everyone can join the app by visiting `localhost:5000` first to connect the Spotify web player, but the only the first person joined this app becomes the host. The chat box shows the name (Spoitfy name) of each user when they are joined or disconncted.

