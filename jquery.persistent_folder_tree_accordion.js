/**
 * jQuery PersistentFolderTreeAccordion 0.1
 * 
 * CopyRight 2014 Prabin Giri
 *  
 * Download Source: 
 *   https://github.com/prabeengiri/Persistent-Folder-Tree-Accordion/archive/master.zip
 * Depends:
 *   jQuery.js
 *   https://github.com/carhartl/jquery-cookie
 * 
 * This Javacsript creates the clickable accordion with Javascript that
 * opens/and closes the lists. Its basically designed for the folder tree.
 * 
 * It also saves the state in the cookie. When visited next time, based 
 * on the previous open/close state, it will open or close the folders.  
 */

(function($) {
  // Constuctor Function.
  var FolderTreeAccordion = function ($listElement, options, $) {
    this.list = $listElement;
    this.settings = $.extend({}, this.defaults, options);
    this.init();
  }; 
  
  FolderTreeAccordion.prototype = {
    // Default Configuration.
    defaults: {
      useCookie : true,
      cookieExpiry: 150,
      toggleAll : true,
      folderClick: function (event, a) {},
      fileClick : function (event, a) {},
      folderClass: 'folder'
    },
    
    /***
     * Initialze the tree by settings its ids, and persist if
     * selected on the settings. Also attach the events to the
     * list items. 
     */
    init: function () {
      var self = this;
      
      if (this.settings.useCookie) {
        if (this.list.attr('id') == undefined || this.list.attr('id') == "") {
          throw new Error("FolderTreeAccordion: If 'useCookie' option is used, then CSS selector element(root UL/OL) needs to have valid 'id' attribute.");
        }
        this.persistBehaviour();
      }
      
      // Attach folder click event.
      this.list.on('click', "li." + this.settings.folderClass + " a", function (event) {
        return function ($a) {
          self.folderClick(event, $a);
        }($(this));
      });
      
      // Attach File Click Event.
      this.list.on('click', "li:not('." + this.settings.folderClass + "') a", function (event) {
        self.fileClick(event, $(this));
      });
    },
    
    /**
     * When anchor tag whose parent list is not folder,
     * then this handler gets executed. It just exposes the
     * behaviours for outside to act upon this event.
     * 
     * @param event
     *   DOM click event object.
     * @param $a
     *   JQuery Anchor Tag Object thats being clicked. 
     */
    fileClick : function (event, $a) {
      this.settings.fileClick(event, $a);
      this.list.trigger('FolderTreeAccordion.onFileClick', [$a]);
    }, 
    
    /**
     * When anchor tag with parent li as folder(class folder) is
     * clicked. It exposes the clicked event.  
     * @param event
     *   DOM event object.
     * @param $a
     *   JQuery Anchor Tag Object thats being clicked.
     */
    folderClick : function(event, $a) {
      var $li = $a.parent('li');
      var self = this;
      if (!$li.hasClass(this.settings.folderClass)) {
        return;
      }
      
      // Don't do anything as its folder.
      event.preventDefault();
      
      // Toggle slide Behvaiour
      $li.toggleClass('expanded')
       .children('ul, ol')
       .stop() //to avoid rapid clicking. 
       .slideToggle('normal' , function() {
         
         self.settings.folderClick(event, $a);
         self.list.trigger('FolderTreeAccordion.onFolderClick', [$a]);
         
         if (self.settings.useCookie) {
           self.setCookie($li);
         }
       });
    },
    
    /**
     * When anchor tag is clicked, then cookie is set
     * with the id that its parent 'li' has. 
     * 
     * @param $li
     *   JQuery List element which has the class "expanded".
     */
    setCookie : function ($li) {
      if ($li.hasClass('expanded')) 
        $.cookie($li.attr('id'), '1', { expires: this.settings.cookieExpiry });
      else 
        $.cookie($li.attr('id'), '0');
    },
    
    /**
     * This checks the expanded/collapsed state of tree
     * by checking the cookie and expading/collapsing
     * accordingly.
     */
    persistBehaviour : function() {
      if(this.settings.useCookie) {
        this.addIds();
        this.list.find('li.' + this.settings.folderClass)
        .each(function(i){
          if ($.cookie( $(this).attr('id')) == '1')
            $(this).addClass('expanded').children('ul,ol').show();
          else if ($.cookie( $(this).attr('id')) == '0')
            $(this).children('ul,ol').hide();
        }); 
      }
    },
    
    /**
     * Add the IDs to all the folder when document is ready. 
     * Based on the that id attribute, cookie is used to 
     * persist the behavioir. To make sure cookie key does not
     * clash by same name, therefore id attribute of the list is
     * used to prefix the cookie name.
     */
    addIds : function () {
      var self = this;
      this.list.find('li.' + this.settings.folderClass)
      .attr('id', function(index) { 
        return self.list.attr('id') + "_" + $(this)
         .children('a')
         .text()
         //replace all spaces with underscore.
         .replace(/ /g,'_') 
         .toLowerCase(); 
      });
    }
  };
  
  // Define Jquery Function and initialized the Accordion class.
  $.fn.FolderTreeAccordion = function(options) {
    return this.each(function () {
      new FolderTreeAccordion($(this), options, $);
      return this;
    });
  };
  
})(jQuery);