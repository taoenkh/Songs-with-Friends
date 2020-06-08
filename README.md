# ECS 162 Final Project Songs-with-Friends
Team members :
## Lihang Pan (lhpan@ucdavis.edu)
## Jiaqi Liu (jiqliu@ucdavis.edu)
## Tao Wang (ttwwang@ucdavis.edu)
# Prerequisites

`npm` and `nodejs` must be installed to run this project

### To start running this project

run command `npm run dev` under the current directory

### To Start the Website

Our application requires all the users to have a premium account and a web player running using the browser before checking the website.

If all the prerequisites were satisfied, you will be able to start the project.

Go to browser and type `localhost:5000`

This is the `Express js` is located.

We utilzied `Express js` for the back-end, and `create-react-app` to start the front-end.


The very first page will be a login page to our appliation. 
That login button connects to the active spotify player, starts a session for a certain user, and redirects the browser to `localhost:3000`, which is where the create-react-app is located.


In the `create-react-app`'s page the application will trigger the same play list for all the users. We made an assumption that the very first joined user will be the host, and the rest will be the clients. That means only when the very first joined user reaches the end of a song will trigger other clients to change their playing track in the Spotify web player.


