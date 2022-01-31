# [Novtube](https://novtube.herokuapp.com)

Novtube is Youtube Clone Coding Project.
Here, you can experience the function of YouTube.

## Stacks used here

Front-end :
<span><img src="https://img.shields.io/badge/Pug-a2866b?style=flat&logo=Pug&logoColor=white"></span>
<span><img src="https://img.shields.io/badge/Scss-C46092?style=flat&logo=Sass&logoColor=white"></span>
<span><img src="https://img.shields.io/badge/JavaScript-f0db4f?style=flat&logo=JavaScript&logoColor=white"></span>

Back-end :
<span><img src="https://img.shields.io/badge/Express-002663?style=flat&logo=express&logoColor=white"></span>
<span><img src="https://img.shields.io/badge/NodeJS-3c873a?style=flat&logo=node&logoColor=white"></span>

DB :
<span><img src="https://img.shields.io/badge/MongoDB-3FA037?style=flat&logo=mongoDB&logoColor=white"></span>

## Functions

### Home

1. Home
   - When going to the homepage, you can see many cards of videos.
   - If you click the thumbnail of the cards, you will watch a video that you clicked.
   - If you click the profile image, you will watch the user that clicked.
   - [Source Code](https://github.com/Novelier-Webbelier/novtube/blob/master/src/controllers/videoControllers.js#L9-L42).

### Users

- [Model](https://github.com/Novelier-Webbelier/novtube/blob/master/src/models/User.js).

1. Join / Login / Logout

   - [Source Code](https://github.com/Novelier-Webbelier/novtube/blob/master/src/controllers/userControllers.js#L11-L175).

2. Change Info

   - [Source Code](https://github.com/Novelier-Webbelier/novtube/blob/master/src/controllers/userControllers.js#L177-L276).

3. Watch User
   - [Source Code](https://github.com/Novelier-Webbelier/novtube/blob/master/src/controllers/userControllers.js#L278-L292).

### Videos

- [Model](https://github.com/Novelier-Webbelier/novtube/blob/master/src/models/Video.js)

1. Upload

   - [Source Code](https://github.com/Novelier-Webbelier/novtube/blob/master/src/controllers/videoControllers.js#L98-L136).

2. Edit

   - [Source Code](https://github.com/Novelier-Webbelier/novtube/blob/master/src/controllers/videoControllers.js#L44-L96).

3. Delete

   - [Source Code](https://github.com/Novelier-Webbelier/novtube/blob/master/src/controllers/videoControllers.js#L138-L142).

4. Watch

   - [Source Code](https://github.com/Novelier-Webbelier/novtube/blob/master/src/controllers/videoControllers.js#L144-L163).

5. Comment Section

   - [Model](https://github.com/Novelier-Webbelier/novtube/blob/master/src/models/Comment.js).

   - Create Comment

     - [Source Code](https://github.com/Novelier-Webbelier/novtube/blob/master/src/controllers/videoControllers.js#L179-L206).

   - Delete Comment
     - [Source Code](https://github.com/Novelier-Webbelier/novtube/blob/master/src/controllers/videoControllers.js#L208-L224).
