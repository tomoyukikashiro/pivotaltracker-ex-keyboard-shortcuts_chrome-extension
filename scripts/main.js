(function() {
  'use strict';
  $(function() {
    var pivotal = new Pivotal();
    var settings = [
      {h: movePanel.bind(null, true)},
      {j: moveStory},
      {k: moveStory.bind(null, true)},
      {l: movePanel},
      {o: toggleStory}
    ];
    addKeyboardShortcuts(settings);

    function toggleStory() {
      var currentPanel= pivotal.getCurrentPanel();
      pivotal.toggleStory(currentPanel);
    }

    function movePanel(isPrev) {
      if (!pivotal.hasPanels()) {
        return;
      }
      var currentPanel = pivotal.getCurrentPanel();
      if (!currentPanel.length) {
        pivotal.focusElement(pivotal.getFirstPanel()); 
      } else {
        if (isPrev) {
          pivotal.movePanelPrev(currentPanel);
        } else {
          pivotal.movePanelNext(currentPanel);
        }
        moveStory();
      }
    }

    function moveStory(isPrev) {
      if (!pivotal.hasPanels()) {
        return;
      }
      var currentPanel = pivotal.getCurrentPanel();
      if (!currentPanel.length) {
        pivotal.focusElement(pivotal.getFirstPanel()); 
      }
      currentPanel = pivotal.getCurrentPanel();
      var stories = pivotal.getStories(currentPanel);
      if (!stories.length) {
        return;
      }
      var currentStory = pivotal.getCurrentStory(currentPanel);
      if (!currentStory.length) {
        pivotal.focusElement(stories.first()); 
      } else {
        if (isPrev) {
          pivotal.moveStoryPrev(currentStory);
        } else {
          pivotal.moveStoryNext(currentStory);
        }
      }
    }
  });

  /**
   * array of each shortcut setting object
   * {keynum: function}
   */
  function addKeyboardShortcuts(settings) {
    $(window).keydown(function(e) {
      var activeTag = document.activeElement.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
        return;
      }
      settings.forEach(function(s) {
        if (s[e.key]) {
          s[e.key]();
        }
      });
    });
  }

  function Pivotal() {
    var currentCls = 'pteks-current';
    var storySelector = '.story[data-cid][data-id]';
    var currentPanelId;
    var currentStoryId;
    this.hasPanels = function() {
      return !!this.getPanels().length;
    };
    this.getCurrentPanel = function() {
      return $('#' + currentPanelId);
    };
    this.getPanels = function() {
      return $('.panels .panel.visible');
    };
    this.getFirstPanel = function() {
      return this.getPanels().first();
    };
    this.movePanel = function(current, isPrev) {
      var visiblePanelSelector = '.panel.visible';
      if (isPrev) {
        this.focusElement(current.prevAll(visiblePanelSelector).first());
      } else {
        this.focusElement(current.nextAll(visiblePanelSelector).first());
      }
    };
    this.movePanelNext = function(current) {
      this.movePanel(current);
    };
    this.movePanelPrev = function(current) {
      this.movePanel(current, true);
    };
    this.getStories = function(currentPanel) {
      return currentPanel.find(storySelector); 
    };
    this.getCurrentStory = function(currentPanel) {
      return currentPanel.find('.story[data-cid][data-id=' + currentStoryId + ']').first();
    };
    this.moveStory = function(current, isPrev) {
      if (isPrev) {
        this.focusElement(current.prevAll(storySelector).first());
      } else {
        this.focusElement(current.nextAll(storySelector).first());
      }
    };
    this.moveStoryNext = function(current) {
      this.moveStory(current);
    };
    this.moveStoryPrev = function(current) {
      this.moveStory(current, true);
    };
    this.toggleStory = function(currentPanel) {
      var self = this;
      var openButton = this.getCurrentStory(currentPanel).find('a.expander')[0]; 
      var closeButton = $('a.collapser')[0]; 
      var button = openButton || closeButton;
      if (button) {
        button.click();
        setTimeout(function() {
          self.getCurrentStory(currentPanel).addClass(currentCls);
        }, 100);
      } 
    };

    this.focusElement = function(element) {
      if (!element.length) {
        return;
      }
      $('.' + currentCls).removeClass(currentCls);
      element.addClass(currentCls);
      if (element.hasClass('story')) {
        currentStoryId = element.data('id');
      } else if (element.hasClass('panel')) {
        currentPanelId = element.attr('id');
      }
    };
  }
})();
