

var page = require('webpage').create();
page.paperSize = {
	// try 4.6 x 7.1
	// 460 PX * 399 PX 
	width: '6.2in', 
    height: '9.8in', 
    border: '0in'
};
page.open('../public_html/tmp/test.html', function(status) {
  
  console.log('>> phantomjs : page.open status is: ', status);
  page.render('../public_html/tmp/test.pdf');
  console.log('>> phantomjs : page render complete');
  phantom.exit();
});