// Dependencies
var debounce = require('just-debounce');

// Don't show sidebar until it's worth it
var OVERFLOW_PRECISION = 10;
// Debounce delay for resize event
var DEBOUNCE_DELAY = 100;


/**
 * Tabs
 *
 * @param  {Element} el
 * @param  {Object} props
 */
function Tabs(el, props) {
  this.el = el;
  this.props = props;
  this.props.nav = this.el.querySelector('nav');
  this.props.navParent = this.props.nav.parentElement;
  this.props.tabs = this.el.querySelectorAll('nav a');
  this.props.panels = [];
  this.props.isOverflowing = false;
  this.props.isOverflowSetup = false;
  this.props.isLoadingPs = false;
  this.props.isNav = this.el.hasClass('tabbed-nav') || this.el.hasClass('tabbed-course');

  // Event bindings
  if (this.el.hasAttribute('data-tabbed')) {
    this.setup();
    this.move(this.getInitialTab());
    
    if (window.addEventListener) { // don't setup the overflow at all in IE8
      this.handleResize();
      window.addEventListener('resize', debounce(this.handleResize.bind(this), DEBOUNCE_DELAY));
    }
  }
}

/**
 * Set up the tab panels and event listeners.
 */
Tabs.prototype.setup = function() {
  var recs, i, tabs;
  // Hide all tabs by default
  for (recs=this.el.querySelectorAll('[role="tabpanel"]'), i=recs.length - 1; i >= 0; i--) {
    recs[i].style.display = 'none';
    this.props.panels.push(recs[i].id || '');
  }

  // Handle clicks on tabs
  for (i=this.props.tabs.length - 1; i >= 0; i--) {
    this.props.tabs[i].addEventListener('click', this.handleClick.bind(this));
  }

  // Handle internal clicks
  for (tabs=this.el.querySelectorAll('[data-tab]'), i = tabs.length - 1; i >= 0; i--) {
    tabs[i].addEventListener('click', this.handleInternalClick.bind(this));
  }
};

/**
 * Retrieve the initial tab on page load.
 * There are four ways of determine which tab to start on!
 * @return {Element}
 */
Tabs.prototype.getInitialTab = function() {
  // 1. From JS props
  if (this.props.preselect) {
    return this.props.preselect;
  }

  // 2. From window hash (for navigational tabs only)
  if (window.location.hash && this.props.isNav) {
    // Find the tab that matches the hash
    for (var i = 0, max = this.props.tabs.length; i < max; i++) {
      var tab = this.props.tabs[i];
      if (window.location.hash === tab.hash) {
        // Match found; return it
        return tab;
      }
    }
    
    // No match found; check for a matching inner tab (i.e. sidebar tabs, not in-page tabs)
    var innerPanel = this.el.querySelector(window.location.hash + '.inner-nav-page');
    if (innerPanel) {
      // Inner-tab panel matches hash; find its parent panel's tab and return it
      var panel = findUp(innerPanel, 'tab');
      return this.el.querySelector('nav a[href="#' + panel.id + '"]');
    }
  }

  // 3. From `data-current` attribute, or
  // 4. First tab (default)
  return this.el.querySelector('[data-current]') || this.el.querySelector('nav a:first-child');
};

/**
 * On page load and resize, check whether the tabs fit on one row.
 * If they don't, activate the overflow behaviour (horizontal scroll).
 * On fist call, load the `perfect-scrollbar` library asynchronously.
 */
Tabs.prototype.handleResize = function() {
  // Check whether the full-width container is narrower than the navigation element
  var isOverflowing = this.el.clientWidth <= this.props.nav.clientWidth - OVERFLOW_PRECISION;
  
  // Activate or deactivate the overflow behaviour when needed
  if (isOverflowing !== this.props.isOverflowing) {
    // Save overflow state
    this.props.isOverflowing = isOverflowing;
    
    if (isOverflowing) {
      if (!this.props.isOverflowSetup) {
        if (!this.props.isLoadingPs) {
          // Load the 'perfect-scrollbar' library then setup the overflow behaviour
          this.props.isLoadingPs = true;
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/jquery.perfect-scrollbar/0.6.10/js/min/perfect-scrollbar.min.js', this.setupOverflow.bind(this));
        }
      } else {
        // Bring up the horizontal scrollbar
        this.activateOverflow(true);
      }
    } else {
      // Remove the horizontal scrollbar
      this.destroyOverflow();
    }
  } else if (isOverflowing && this.props.isOverflowSetup) {
    // If initialised and still overflowing, only update the horizontal scrollbar and scroll to the selected tab
    Ps.update(this.props.inner);
    this.scrollToTab(this.el.querySelector('[data-current]'), true);
  }
};

/**
 * Prepare the DOM for the overflow behaviour.
 */
Tabs.prototype.setupOverflow = function() {
  // Wrap nav in div to hold horizontal scrollbar
  var inner = document.createElement('div');
  inner.className = 'tabbed-nav__inner';
  inner.appendChild(this.props.nav);
  
  // Build arrows
  var leftArrow = document.createElement('button');
  leftArrow.className = 'button-ui tab-arrow';
  leftArrow.setAttribute('type', 'button');
  var rightArrow = leftArrow.cloneNode(false);
  leftArrow.innerHTML = '&lsaquo;';
  leftArrow.className += ' tab-arrow--left';
  rightArrow.innerHTML = '&rsaquo;';
  rightArrow.className += ' tab-arrow--right';
  
  // Store references to new elements
  this.props.inner = inner;
  this.props.leftArrow = leftArrow;
  this.props.rightArrow = rightArrow;
  
  // Append wrapper and arrows
  this.props.navParent.appendChild(inner);
  this.props.navParent.appendChild(leftArrow);
  this.props.navParent.appendChild(rightArrow);
  
  // Listen for clicks on arrows
  leftArrow.addEventListener('click', this.handleArrowClick.bind(this, 'left'));
  rightArrow.addEventListener('click', this.handleArrowClick.bind(this, 'right'));
  
  // Listen for scroll events to enable/disable arrows
  document.addEventListener('ps-scroll-right', this.updateArrow.bind(this, 'left', true));
  document.addEventListener('ps-scroll-left', this.updateArrow.bind(this, 'right', true));
  document.addEventListener('ps-x-reach-start', this.updateArrow.bind(this, 'left', false));
  document.addEventListener('ps-x-reach-end', this.updateArrow.bind(this, 'right', false));
  
  this.props.isLoadingPs = false;
  this.props.isOverflowSetup = true;
  
  // Activate the overflow behaviour
  this.activateOverflow(false);
};

/**
 * Activate the overflow behaviour and initialise the horizontal scrollbar.
 * @param {Boolean} smooth - whether to scroll to the selected tab smoothly
 */
Tabs.prototype.activateOverflow = function(smooth) {
  // Active the overflow
  this.props.navParent.addClass('overflow');
  
  // Initialise the scrollbar
  Ps.initialize(this.props.inner, {
    useBothWheelAxes: true,
    wheelPropagation: true
  });
  
  // Scroll to the selected tab
  this.scrollToTab(this.el.querySelector('[data-current]'), smooth);
};

/**
 * Deactivate the overflow behaviour and destroy the horizontal scrollbar.
 */
Tabs.prototype.destroyOverflow = function() {
  this.props.navParent.removeClass('overflow');
  Ps.destroy(this.props.inner);
};

/**
 * Update the state of one of the two overflow arrows.
 * @param {String} arrow - `left` or `right`
 * @param {Boolen} enable - `true` to enable the arrow
 */
Tabs.prototype.updateArrow = function(arrow, enable) {
  var arrowElem = this.props[arrow + 'Arrow'];
  if (enable) {
    arrowElem.removeAttribute('disabled');
  } else {
    arrowElem.setAttribute('disabled', 'disabled');
  }
};

/**
 * Handle clicks on the overflow arrows.
 * @param {String} direction - `left` or `right`
 */
Tabs.prototype.handleArrowClick = function(direction) {
  var start = this.props.inner.scrollLeft;
  var multiplier = direction === 'left' ? -1 : 1;
  var to = start + multiplier * this.props.inner.clientWidth / 2;
  this.scrollTabs(to, true);
};

/**
 * Handle clicks on tabs.
 * @param {Event} e
 */
Tabs.prototype.handleClick = function(e) {
  var target = e.target;

  // IE8/no-svg fallback
  if (target.hasClass('icon-label')) {
    target = target.parentNode.parentNode;
  }

  if (target.hasClass('icon-over')) {
    return;
  }
  
  if (target.hasAttribute('href')) {
    // go to href
    if (target.getAttribute('href').charAt(0) == '#') {
      this.move(target, true);
      this.setLocation(target.getAttribute('href'));
    }
  } else {
    this.move(target, true);
    this.setLocation(target.getAttribute('href'));
  }
};

Tabs.prototype.panelExists = function(hash) {
  var exists = false;

  for (max=this.props.panels.length, i=0; i < max; i++)
    if (hash.substr(1) === this.props.panels[i])
      exists = true;

  return exists;
};

Tabs.prototype.setLocation = function(hash) {
  if (this.props.isNav && this.panelExists(hash)) {
    var pos = document.body.scrollTop, slug;

    if (hash.charAt(0) === '#') {
      window.location.hash = hash.split('#')[1];
    } else {
      window.location = hash;
    }

    document.body.scrollTop = pos;

    if (history.pushState) {
      slug = window.location.href;
      history.pushState({'title': document.title, 'url': slug}, document.title, slug);
    }
  }
};

/**
 * Handle internal clicks (i.e. to navigate to another tab from within the content).
 * @param {Event}
 */
Tabs.prototype.handleInternalClick = function(e) {
  // Match index - could potentially match ID instead
  var target = e.target,
      idx = target.getAttribute('data-tab') - 1;
  this.moveindex(idx);
  this.setLocation(this.props.tabs[idx].hash);
};

/**
 * Match target
 */
Tabs.prototype.getIndex = function(target) {
  var curr = 0, max, i;

  for (max=this.props.tabs.length, i=0; i < max; i++)
    if (this.props.tabs[i] === target)
      curr = i;

  return curr;
};

/**
 * Match target
 */
Tabs.prototype.move = function(target, smooth) {
  var current, panels, max, i;

  this.movetab(this.getIndex(target));
  this.scrollToTab(target, smooth);

  if (this.props.panels.length === 1) {
    current = this.el.querySelector('[role="tabpanel"]');
    this.showPanel(current);

  } else {
    current = this.el.querySelector(target.getAttribute('href'));

    for (panels=this.el.querySelectorAll('[role="tabpanel"]'), max=panels.length, i=0; i < max; i++) {
      if (target.getAttribute('href') === '#'+panels[i].id) {
        this.showPanel(panels[i]);
      } else {
        this.hidePanel(panels[i]);
      }
    }
  }
};

Tabs.prototype.scrollToTab = function(tab, smooth) {
  if (this.props.isOverflowSetup && this.props.isOverflowing) {
    var to = tab.offsetLeft - this.props.inner.clientWidth / 2 + tab.clientWidth / 2;
    this.scrollTabs(to, smooth);
  }
};

Tabs.prototype.scrollTabs = function(to, smooth) {
  if (smooth) {
    var start = this.props.inner.scrollLeft;
    var change = to - start;
    var increment = Math.abs(change / 500);
    var duration = Math.abs(change / 10);
    this.animateTabsScroll(0, start, change, duration, increment);
  } else {
    this.props.inner.scrollLeft = to;
    Ps.update(this.props.inner);
  }
};

Tabs.prototype.animateTabsScroll = function(curr, start, change, duration, increment) {
  curr += increment;
  this.props.inner.scrollLeft = Math.easeInOutQuad(curr, start, change, duration);
  
  if (curr < duration) {
    setTimeout(this.animateTabsScroll.bind(this, curr, start, change, duration, increment), increment);
  } else {
    // If the tabs are still overflowing when the scrolling ends, update the scrollbars
    if (this.props.isOverflowing) {
      Ps.update(this.props.inner);
    }
  }
};

Tabs.prototype.moveindex = function(index) {
  var panels, max, i;

  this.movetab(index);

  for (panels=this.el.querySelectorAll('[role="tabpanel"]'), max=panels.length, i=0; i < max; i++) {
    if (index === i) {
      this.showPanel(panels[i]);
    } else {
      this.hidePanel(panels[i]);
    }
  }
};

Tabs.prototype.movetab = function(index) {
  var max, i, opts, panels, current;

  for (max=this.props.tabs.length, i=0; i < max; i++) {
    if (i === index) {
      this.props.tabs[i].setAttribute('data-current', '');
    } else {
      this.props.tabs[i].removeAttribute('data-current');
    }
  }
};

Tabs.prototype.showPanel = function(panel) {
  panel.setAttribute('data-current', '');
  panel.style.display = 'block';
};

Tabs.prototype.hidePanel = function(panel) {
  panel.removeAttribute('data-current');
  panel.style.display = 'none';
};

module.exports = Tabs;
