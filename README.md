# Instant-Messaging-App

Available at [https://im.rsbruce.org](https://im.rsbruce.org/)

## Instructions for Demonstrating Locally
### Set-up
- Download the repo
- Keep ports 3000 and 8080 free, as the frontend and backend use these respectively
- Run `docker-compose up -d --build` in the project root
- Wait about 30s for the database to initialise properly. If using Docker Desktop this will be when the image stops producing logging statements
- Go to http://localhost:3000 in your browser window
- Use an incognito window or different browser to simulate a conversation
    - **This is important as each user needs their own cookies**
### Creating a Room
- Make sure the Create Room tab is active on the form on the home screen
- Enter a display name
- Enter an optional name for the room
- See the room code at the top of the screen, and share with others who wish to join
- Chat with your friends
### Joining a room
- Click on the Join Room tab on the form on the home screen
- Enter a display name
- Enter a 4-digit code which has been shared with you by someone already in a room
- Chat with your friends
### Known bugs
- Safari does not set cookies properly on localhost so please use another browser until this is fixed
  
