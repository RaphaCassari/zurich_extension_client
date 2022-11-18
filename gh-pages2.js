var ghpages = require('gh-pages');
var path = require('path');

console.log(path.join(__dirname, 'dist'))
 
ghpages.publish(path.join(__dirname, 'dist'), function(err) {
    console.log(err)
  });