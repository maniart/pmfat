var initShareButton = function() {
      
  var $body,
    currentPageTitle,
    config;

  $body = $('body');
  currentPageTitle = $body.data('pagetitle');

  if(currentPageTitle !== 'archive') { return; }

  config = {
    ui : {
      flyout : 'bottom left',
      button_text : ''
    },
    networks : {
      
      email : {
        enabled : true,
        before: function(element) {
          this.title = $(element).siblings('a').data('title');
          this.description = 'Check out my own new Tiqqun title: ' 
                  + this.title  
                  + ' http://preliminarymaterialsforanytheory.com/archive#' 
                  + $(element).siblings('a').data('pdffilename')
                  + ' Create your own Preliminary Materials: http://preliminarymaterialsforanytheory.com';
          return this;
        }
      
      },
      
      google_plus : {
        enabled : true,
        before: function(element) {
          this.url = 'http://preliminarymaterialsforanytheory.com/archive#' + $(element).siblings('a').data('pdffilename');
          this.text = 'Check out my own new Tiqqun title: (' + this.title + ')';
          return this;
        }
      },
      
      facebook : {
        enabled : true,
        app_id : '363579610460876',
        
        before: function(element) {
          this.url = 'http://preliminarymaterialsforanytheory.com/archive#' + $(element).siblings('a').data('pdffilename');
          this.title = $(element).siblings('a').data('title');
          this.image = 'http://preliminarymaterialsforanytheory.com/' + $(element).siblings('a').children('img').attr('src').slice(2);
          this.caption = 'Create your own Preliminary Materials: http://preliminarymaterialsforanytheory.com';
          this.description = 'This mind blowing new title from Tiqqun will forever change your theoretical outlook: '
                + $(element).siblings('a').data('title');
          return this;
        }
        
      },
      
      twitter : {
        enabled : true,
        
        before: function(element) {
          this.url = '';
          this.description = 'Check out this mind blowing new title from Tiqqun: '
                    + 'http://preliminarymaterialsforanytheory.com/archive#' + $(element).siblings('a').data('pdffilename')  
                    + ' Create yours: http://preliminarymaterialsforanytheory.com';
          return this;
        }
      },
      
      pinterest : {
        enabled : true // turning this off via CSS. Hacky, but oh well.
      }
      
    }
  };

  new Share('.share', config);
  isShareButtonReady = true;


};

self.addEventListener('message', function(e) {
  var data = e.data;
  switch (data.cmd) {
    case 'start':
      console.log('>> sharebutton worker received message: ', e);
      self.postMessage('sharebuttonsworker > sharebuttons worker started: ' + data.msg);
      break;
    default:
      self.postMessage('Unknown command: ' + data.msg);
  };
}, false);