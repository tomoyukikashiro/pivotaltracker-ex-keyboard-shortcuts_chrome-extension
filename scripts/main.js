(function() {
  'use strict';
  $(function() {
    var pivotal = new Pivotal();
    var settings = [
      {h: movePanel.bind(null, true)},
      {j: moveStory.bind(null, false)},
      {k: moveStory.bind(null, true)},
      {l: movePanel.bind(null, false)},
      {o: toggleStory},
      {O: toggleFullStory, shift: true},
      {s: saveStories, meta: true}
    ];
    addKeyboardShortcuts(settings);
    addHoverStory(pivotal);

    function saveStories(e) {
      var allStories = pivotal.getAllStories();
      var count = 0
      allStories.each(function(i, story) {
        story = $(story);
        if (pivotal.isStoryOpened(story)) {
          // when we close story that will be saved
          pivotal.closeStory(story);
          count++;
        }
      });
      if (count) {
        var unit = count > 1 ? ' stories' : ' story';
        window.alert('Saved ' +  count + ' open ' + unit);
      }
      e.preventDefault();
      e.stopPropagation();
      return; 
    }

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

    function toggleFullStory() {
      var currentPanel = pivotal.getCurrentPanel();
      if (!currentPanel.length || !pivotal.getCurrentStory(currentPanel).length) {
        return;
      }
      pivotal.toggleFullStory(currentPanel);
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
        if (s[e.key] && !!s['shift'] === !!e.shiftKey && !!s['meta'] === !!e.metaKey) {
          s[e.key](e);
        }
      });
    });
  }

  function addHoverStory(pivotal) {
    $(document.body).on('mouseenter', '.panels .panel.visible .story[data-cid][data-id]', function() {
      pivotal.addExtraCopybuttons($(this));
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
    this.getAllStories = function() {
      return $(storySelector); 
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
    this.isStoryOpened = function(story) {
      return !story.find('header.preview').length;
    };
    this.toggleStory = function(currentPanel) {
      // story element is different after toggle so we need to get for each.
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
    this.closeStory = function(story) {
      var button = $('a.collapser')[0]; 
      if (button) {
        button.click();
      } 
    };
    this.toggleFullStory = function(currentPanel) {
      var self = this;
      var currentStory = this.getCurrentStory(currentPanel);
      var fullscreenCloseButton = $('#maximizes_show a.minimize');
      if (fullscreenCloseButton.length) {
        // if story is fullscreen -> open
        fullscreenCloseButton[0].click();
        return;
      }
      if (this.isStoryOpened(currentStory)) {
        // if story is opened -> fullscreen
        makeFullScreen();
      } else {
        // if story is closed -> open -> fullscreen
        this.toggleStory(currentPanel);
        setTimeout(function() {
          makeFullScreen();
        }, 100);
      }

      function makeFullScreen() {
        self.getCurrentStory(currentPanel).find('[id^=story_maximize_]')[0].click();
        $('.edit.details').scrollTop(0);
        document.activeElement.blur();
      }
    };
    /**
     * add copy to url / story id to clipboard
     */
    this.addExtraCopybuttons = function($elm) {
      var id = $elm.data('id');
      var name = $elm.find('.story_name').text();
      var cls = 'pteks-copy-buttons';
      var url = `https://www.pivotaltracker.com/story/show/${id}`;
      if ($elm.find(`.${cls}`).length) {
        return;
      }
      var buttons = `<span class="${cls}">
        <button type="button" title="Copy this story's link to your clipboard" data-clipboard-text="${url}" class="pteks-url autosaves clipboard_button hoverable link left_endcap" tabindex="-1"></button>
        <button type="button" title="Copy this story's ID to your clipboard" data-clipboard-text="#${id}" class="pteks-id autosaves clipboard_button hoverable id use_click_to_copy" tabindex="-1"></button>
        <button type="button" title="Copy this story's URL as markdown to your clipboard" data-clipboard-text="[${name}](${url})" class="pteks-md autosaves clipboard_button hoverable left_endcap" tabindex="-1"></button>
        <button type="button" title="Copy this story's URL as rich text to your clipboard" data-clipboard-element="#pteks-clipboard-richtext-${id}" class="pteks-rt hoverable left_endcap" tabindex="-1"><a id="pteks-clipboard-richtext-${id}" href="${url}">${name}</a></button>
      </span>
      `;
      $elm.find('header.preview').append(buttons);
      $elm.on('click', '[data-clipboard-element]', function() {
        var copyElm = $($elm.find('[data-clipboard-element]').data('clipboard-element'))[0];
        clipboard.copy(copyElm);
      });
    };
    this.focusElement = function(element) {
      if (!element.length) {
        return;
      }
      $('.' + currentCls).removeClass(currentCls);
      element.addClass(currentCls);
      if (element.hasClass('story')) {
        currentStoryId = element.data('id');
        this.scrollByVisible(element);
      } else if (element.hasClass('panel')) {
        currentPanelId = element.attr('id');
      }
    };

    this.scrollByVisible = function(element) {
      var scrollElm = this.getCurrentPanel().find('[data-scrollable]');
      var scrollElmTop = scrollElm[0].getBoundingClientRect().top;
      var wH = window.innerHeight;
      var eH = element.height();
      var eTop = element[0].getBoundingClientRect().top;
      var eBottom = eTop + eH;
      if (eBottom > wH) {
        scrollElm.scrollTop(scrollElm.scrollTop() + (eBottom - wH));
      } else if (eTop < scrollElmTop) {
        scrollElm.scrollTop(scrollElm.scrollTop() - (scrollElmTop - eTop));
      }
    };
  }
})();
