//console.log('>>>>>> render : 1st');
var page = require('webpage').create();
//console.log('>>>>>> render : 2nd');
var args = require('system').args;


console.log('___________ args are: ', JSON.stringify(args));



page.paperSize = { 
	width: '6.2in', 
    height: '9.8in', 
    border: '0in'
};





page.open(args[1], function(status) {

  page.render(args[2]);
  
  console.log('>> phantomjs : pdf render complete');
  
  page.clipRect = { 
  	left: 0, 
  	top: 0, 
  	width: 595, 
  	height: 938 
  };
  page.render(args[3]);

  console.log('>> phantomjs : png render complete');
  
  phantom.exit();
  
});

