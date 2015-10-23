var tumblr = require('tumblr');


var velopedia_oauth = {
    consumer_key: 'g0tjMDWC1jHasbTkTdi6jkYz0lcBz9cPMUC3Fz8PnV6LUjmzBo',
    consumer_secret: 'KFKTyBlIZ6ZeIdBrais2ylfcp052DFnPSVlHQW3VXnb1jj1R5z',
    token: 'UXqgyWDhidYbH9nIsBg8r2DxQqKxDWmYAsjxiaDMDfYPVlqgIs',
    token_secret: 'nePBkXogpc7tWzW3E5z6htKPs48N6xJ2v4ldYX7AmhsuFB1Yyu'
};

var archtodate_oauth = {
    consumer_key: 'OXxJeg59FsMZJPuWwc9W4A5oDUHDWkdbCR5J0w8pEsXYkwKu40',
    consumer_secret: 'b9KTsly6J0yPImBNrDolSOsqtUNn5NtMYyMavBtwxgmEmzpL5h',
    token: 'q5NFVlXF8AAssYiBu0m96d5WRSAp48F8yAHrrhaPCEnGKlaX9e',
    token_secret: 'Po0f4h8gbncZROow4orsI2WR7gnpFC494LzDA7L2tjBnX0Rkwm'
}
var user = new tumblr.User(archtodate_oauth);


module.exports.user = user;