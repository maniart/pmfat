

var page = require('webpage').create();
page.paperSize = {
	width: '6.2in', 
    height: '9.8in', 
    border: '0in'
};
page.open('./test.html', function(status) {
  
  console.log('>> phantomjs : page.open status is: ', status);
  page.render('test.pdf');
  console.log('>> phantomjs : page render complete');
  phantom.exit();
});