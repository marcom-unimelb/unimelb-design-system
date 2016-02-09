var Blanket = require('../../../shared/blanket');
var LocalNav = require('./localnav.es6');

var HISTORY_KEY = 'uom_injection';

/**
 * InjectNav
 *
 * @param  {Object} props
 */
function InjectNav(props) {
  this.props = props;
  this.props.supportsHistory = (window.history && 'pushState' in window.history);

  // Retrieve elements
  var elements = {
    root: document.querySelector('.uomcontent'),
    page: document.querySelector('.page-inner'),
    header: document.querySelector('.page-header'),
    localNav: document.querySelector('#sitemap'),
    globalNav: document.querySelector('#globalsitemap'),
    menuTrigger: document.querySelector('.page-header-tools a[title="Menu"]'),
    searchTrigger: document.querySelector('.page-header-tools a[title="Search"]'),
    sitemapTrigger: document.querySelector('.sitemap-trigger')
  };

  // Add elements to props
  for (var prop in elements) { this.props[prop] = elements[prop]; }

  // Set up a blanket object
  this.props.blanket = new Blanket({
    'root': this.props.root
  });

  // Set up local nav
  if (this.props.localNav) {
    new LocalNav({
      root:     this.props.root,
      localnav: this.props.localNav
    });
  }

  // Inialise nav state, render global sitemap and bind events
  this.setActiveNav();
  this.renderGlobalSitemap();
  this.setupEventBindings();
}

InjectNav.prototype.setActiveNav = function(state) {
  this.props.activeNav = (state ? state : {
    local: false,
    global: false
  });
};

InjectNav.prototype.setupEventBindings = function() {
  // Local nav is defined
  if (this.props.localNav && this.props.menuTrigger) {
    this.props.menuTrigger.addEventListener('click', this.openLocalNav.bind(this));

    // TODO is there ever more than one close button?
    for (var triggers=this.props.localNav.querySelectorAll('h2:first-child'), i=triggers.length - 1; i >= 0; i--) {
      triggers[i].addEventListener('click', this.closeLocalNav.bind(this));
    }

    for (triggers=this.props.localNav.querySelectorAll('a'), i=triggers.length - 1; i >= 0; i--) {
      if (triggers[i].getAttribute('href').indexOf('#') != -1) {
        triggers[i].addEventListener('click', this.closeLocalNav.bind(this));
      }
    }

    this.props.sitemapTrigger.addEventListener('click', this.openGlobalNav.bind(this));

    this.props.localSitemapTrigger = this.props.localNav.querySelector('.sitemap-link');
    if (this.props.localSitemapTrigger)
      this.props.localSitemapTrigger.addEventListener('click', this.openGlobalNav.bind(this));

  } else {
    if (this.props.menuTrigger)
      this.props.menuTrigger.addEventListener('click', this.openGlobalNav.bind(this));
  }

  this.props.globalNav.querySelector('.close-button').addEventListener('click', this.closeGlobalNav.bind(this));
  this.props.blanket.el.addEventListener('click', this.closeBothNavs.bind(this));

  if (this.props.searchTrigger) {
    this.props.searchTrigger.addEventListener('click', this.handleSearchTrigger.bind(this));
  }

  // Restore nav states when use goes back/forward
  if (this.props.supportsHistory) {
    window.addEventListener('popstate', function(e) {
      var newState = e.state && e.state[HISTORY_KEY] ? e.state[HISTORY_KEY] : null;
      this.setActiveNav(newState);
      this.update();
    }.bind(this));
  }
};

InjectNav.prototype.openLocalNav = function(e) { this.toggleNav('local', true, e); };
InjectNav.prototype.closeLocalNav = function(e) { this.toggleNav('local', false, e); };
InjectNav.prototype.openGlobalNav = function(e) { this.toggleNav('global', true, e); };
InjectNav.prototype.closeGlobalNav = function(e) { this.toggleNav('global', false, e); };

InjectNav.prototype.closeBothNavs = function(e) {
  if (e) { e.preventDefault(); }

  if (this.props.activeNav.local || this.props.activeNav.global) {
    var bothActive = this.props.activeNav.local && this.props.activeNav.global;
    this.setActiveNav();

    if (this.props.supportsHistory) {
      window.history.go(bothActive ? -2 : -1);
    } else {
      this.update();
    }
  }
};

InjectNav.prototype.toggleNav = function(nav, activate, e) {
  if (e) { e.preventDefault(); }

  this.props.activeNav[nav] = activate;

  if (this.props.supportsHistory) {
    if (activate) {
      this.update();

      var state = {};
      state[HISTORY_KEY] = this.props.activeNav;
      window.history.pushState(state, '');
    } else {
      window.history.back();
    }
  } else {
    this.update();
  }
};

InjectNav.prototype.update = function() {
  var activeNav = this.props.activeNav;
  var either = activeNav.local || activeNav.global;
  var both = activeNav.local && activeNav.global;

  this.props.blanket.toggle(either);
  this.props.globalNav.toggleClass('active', activeNav.global);
  
  if (this.props.localNav) {
    this.props.localNav.toggleClass('active', activeNav.local && !activeNav.global);
    this.props.sitemapTrigger.toggleClass('active', activeNav.local);
  }
};


InjectNav.prototype.handleSearchTrigger = function(e) {
  this.openGlobalNav(e);
  this.props.globalNav.querySelector('input[type="search"]').focus();
};

InjectNav.prototype.renderGlobalSitemap = function() {
  // Create global nav trigger
  if (this.props.localNav && !this.props.sitemapTrigger) {
    this.props.sitemapTrigger = document.createElement('div');
    this.props.sitemapTrigger.setAttribute('class', 'sitemap-trigger');
    this.props.sitemapTrigger.innerHTML = '      <span>University Sitemap</span>';
    this.props.root.appendChild(this.props.sitemapTrigger);
  }

  // Create global nav
  if (!this.props.globalNav) {
    this.props.globalNav = document.createElement('div');
    this.props.globalNav.setAttribute('role', 'navigation');
    this.props.globalNav.id = 'globalsitemap';
    this.props.globalNav.innerHTML = '     <a class="close-button" href="#">Close</a>      <a href="https://www.unimelb.edu.au" class="logo">        <svg width="100" height="100" viewBox="0 0 140 140" aria-labelledby="aria-uom-title" role="img">          <image xlink:href="' + this.props.assethost + '/logo.svg" src="' + this.props.assethost + '/logo.png" alt="The University of Melbourne Logo" width="140" height="140" preserveAspectRatio="xMaxYMin meet"/>        </svg>      </a>      <form action="https://search.unimelb.edu.au" method="get">        <fieldset>          <input data-required placeholder="Search" name="q" type="search" title="Please enter a keyword" aria-label="Search the University" />          <button type="submit" class="search-button"><span>GO</span><svg class="icon" role="img"><use xlink:href="#icon-search"></use></svg></button>        </fieldset>      </form>      <ul class="quicklinks">        <li><a href="http://about.unimelb.edu.au/governance-and-leadership/faculties"><svg role="img" class="icon"><use xlink:href="#icon-faculty" /></svg> Faculties and Graduate Schools</a></li>        <li><a href="http://students.unimelb.edu.au/"><svg role="img" class="icon"><use xlink:href="#icon-student" /></svg> Current Students</a></li>        <li><a href="http://library.unimelb.edu.au/"><svg role="img" class="icon"><use xlink:href="#icon-library" /></svg> Library</a></li>        <li><a href="http://www.unimelb.edu.au/contact/"><svg role="img" class="icon"><use xlink:href="#icon-phone" /></svg> Contact us</a></li>        <li><a href="http://maps.unimelb.edu.au/"><svg role="img" class="icon"><use xlink:href="#icon-location" /></svg> Maps</a></li>        <li><a href="http://www.campaign.unimelb.edu.au/"><svg role="img" class="icon"><use xlink:href="#icon-campaign" /></svg> Support the Campaign</a></li>      </ul>      <div>        <div class="col-3">          <div>            <h2><a href="http://coursesearch.unimelb.edu.au/">Study at Melbourne</a></h2>            <ul>              <li><a href="http://coursesearch.unimelb.edu.au/undergrad">Undergraduate study</a></li>              <li><a href="http://coursesearch.unimelb.edu.au/grad">Graduate study</a></li>              <li><a href="http://futurestudents.unimelb.edu.au/">Future students</a></li>              <li><a href="http://futurestudents.unimelb.edu.au/admissions">Admissions, fees &amp; applications</a></li>              <li><a href="http://futurestudents.unimelb.edu.au/info/international">International students</a></li>              <li><a href="http://www.unimelb.edu.au/campustour/">Campus tour</a></li>            </ul>          </div>          <div>            <h2><a href="http://about.unimelb.edu.au/">About us</a></h2>            <ul>              <li><a href="http://about.unimelb.edu.au/strategy-and-leadership">Strategy and leadership</a></li>              <li><a href="http://about.unimelb.edu.au/tradition-of-excellence">Tradition of excellence</a></li>              <li><a href="http://about.unimelb.edu.au/international-connections">International connections</a></li>              <li><a href="http://about.unimelb.edu.au/campuses-and-facilities">Campuses and facilities</a></li>              <li><a href="http://about.unimelb.edu.au/governance-and-leadership">Structure and governance</a></li>              <li><a href="http://about.unimelb.edu.au/policy-and-publications">Policy and publications</a></li>              <li><a href="http://hr.unimelb.edu.au/careers">Careers at Melbourne</a></li>              <li><a href="http://newsroom.unimelb.edu.au">Newsroom</a></li>            </ul>          </div>          <div>            <h2><a href="http://unimelb.edu.au/research/">Research</a></h2>            <ul>              <li><a href="http://www.unimelb.edu.au/research/about-research-at-melbourne.html">About Research at Melbourne</a></li>              <li><a href="http://ri.unimelb.edu.au/">Research institutes</a></li>              <li><a href="http://www.unimelb.edu.au/research/research-institutes-centres.html">Research Centres</a></li>              <li><a href="http://findanexpert.unimelb.edu.au/">Find an expert or supervisor</a></li>              <li><a href="http://gradresearch.unimelb.edu.au/">Graduate researchers</a></li>              <li><a href="https://pursuit.unimelb.edu.au/">Pursuit: our research showcase</a></li>            </ul>          </div>        </div>        <div class="col-3">          <div>            <h2><a href="http://unimelb.edu.au/engage/">Engagement</a></h2>            <ul>              <li><a href="http://events.unimelb.edu.au/">Events</a></li>              <li><a href="http://engage.unimelb.edu.au/community-engagement">Community</a></li>              <li><a href="http://engage.unimelb.edu.au/global-engagement">Global Engagement</a></li>              <li><a href="http://businessconnect.unimelb.edu.au/">Business &amp; Industry</a></li>              <li><a href="http://engage.unimelb.edu.au/cultural-engagement">Arts &amp; Culture</a></li>              <li><a href="http://www.sport.unimelb.edu.au/facilities/index.html">Sports Facilities</a></li>            </ul>          </div>          <div>            <h2><a href="http://alumni.unimelb.edu.au/">Alumni &amp; friends</a></h2>            <ul>              <li><a href="http://alumni.unimelb.edu.au/Benefits-and-offers">Benefits &amp; services</a></li>              <li><a href="http://www.campaign.unimelb.edu.au/">Giving</a></li>              <li><a href="http://alumni.unimelb.edu.au/volunteering">Get involved</a></li>              <li><a href="http://alumni.unimelb.edu.au/community">Alumni community</a></li>              <li><a href="http://mag.alumni.unimelb.edu.au/?sl=1">3010: alumni magazine</a></li>              <li><a href="http://alumni.unimelb.edu.au/news-list">News</a></li>              <li><a href="http://alumni.online.unimelb.edu.au/s/1182/3col.aspx?sid=1182&gid=1&pgid=722">Events</a></li>            </ul>          </div>          <div>            <h2><a href="http://www.unimelb.edu.au/contact/">Contact &amp; Maps</a></h2>            <ul>              <li><a href="http://ask.unimelb.edu.au/app/contact">Contact us</a></li>              <li><a href="http://ask.unimelb.edu.au">Enquiries</a></li>              <li><a href="http://newsroom.melbourne.edu/">Media</a></li>              <li><a href="http://findanexpert.unimelb.edu.au">Find an expert</a></li>              <li><a href="http://maps.unimelb.edu.au/">Campus maps</a></li>              <li><a href="http://pcs.unimelb.edu.au/traffic-and-parking/">Traffic, parking &amp; bicycles</a></li>              <li><a href="http://directory.unimelb.edu.au/">Find a staff member</a></li>            </ul>          </div>        </div>      </div>';

    var form = this.props.globalNav.querySelector('form');

    if (/(MSIE [8|9].0)/g.test(navigator.userAgent)) {
      form.elements[1].value = 'Search';
      form.elements[1].addEventListener('click', function(e) {
        this.select();
      });
    }

    this.props.root.appendChild(this.props.globalNav);
  }
};

module.exports = InjectNav;
