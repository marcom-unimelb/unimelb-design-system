// Deps
require('classlist-polyfill');
require('es6-promise').polyfill();

require("../../shared/smoothscroll");
require("../../shared/findup");

window.loadScript = require('../../shared/loadscript');

// Async load fonts from google
var WebFont = require("webfontloader");
WebFont.load({
  google: { families: [
    'Roboto:400,300,100,700,100italic,300italic,400italic,700italic:latin'
  ] }
});

// replace with viewloader eventually
window.DSComponentsLoad = function() {
  "use strict";

  var recs, i, g, Accordion, Modal, Tabs, SidebarTabs, InpageNavigation,
    JumpNav, CheckboxHelper, UnlockChecklist, FancySelect, ValidateForm,
    FilteredListing, IconHelper, ImageGallery, slingshot, LMaps,
    style, script, CreateNameSpace, Icons;

  CreateNameSpace = require('../../shared/createnamespace');
  new CreateNameSpace();

  Icons = require('../injection/icons');
  new Icons();

  recs = document.querySelectorAll('.accordion__title');
  if (recs.length > 0) {
    Accordion = require("../components/accordion");
    for (i=recs.length - 1; i >= 0; i--)
      new Accordion(recs[i], {});
  }

  recs = document.querySelectorAll('[data-modal-target]');
  if (recs.length > 0) {
    Modal = require("../components/modal");
    for (i=recs.length - 1; i >= 0; i--)
      new Modal(recs[i], {});
  }

  recs = document.querySelectorAll('select');
  if (recs.length > 0) {
    FancySelect = require("../components/forms/fancyselect");
    for (i=recs.length - 1; i >= 0; i--)
      new FancySelect(recs[i], {});
  }

  recs = document.querySelectorAll('[data-tabbed]');
  if (recs.length > 0) {
    Tabs = require("../components/tabs");
    for (i=recs.length - 1; i >= 0; i--)
      new Tabs(recs[i], {});
  }

  recs = document.querySelectorAll('.sidebar-tabs');
  if (recs.length > 0) {
    SidebarTabs = require("../components/tabs/sidebar-tabs");
    for (i=recs.length - 1; i >= 0; i--) {
      new SidebarTabs(recs[i], {
        scrollTarget: document.querySelector('.tabbed-nav[data-tabbed]')
      });
    }
  }

  recs = document.querySelectorAll('a[href^="#"]');
  if (recs.length > 0) {
    InpageNavigation = require("../components/inpage-navigation");
    for (i=recs.length - 1; i >= 0; i--)
      new InpageNavigation(recs[i], {});
  }

  if (document.querySelector('h2[id]') && document.querySelectorAll('.jumpnav, .indexnav').length === 1) {
    JumpNav = require("../components/inpage-navigation/jumpnav");
    new JumpNav({});
  }

  recs = document.querySelectorAll('input[type="radio"],input[type="checkbox"]');
  if (recs.length > 0) {
    CheckboxHelper = require("../components/checklist/checkboxhelper");
    for (i=recs.length - 1; i >= 0; i--)
      new CheckboxHelper(recs[i], {});
  }

  recs = document.querySelectorAll('ul.checklist[data-unlock-target]');
  if (recs.length > 0) {
    UnlockChecklist = require("../components/checklist");
    for (i=recs.length - 1; i >= 0; i--)
      new UnlockChecklist(recs[i], {});
  }

  recs = document.querySelectorAll('form[data-validate]');
  if (recs.length > 0) {
    ValidateForm = require("../components/forms");
    for (i=recs.length - 1; i >= 0; i--)
      new ValidateForm(recs[i], {});
  }

  // window.UOMTableLabels();

  recs = document.querySelectorAll('form.filtered-listing-select');
  if (recs.length > 0) {
    window.loadScript('https://unpkg.com/isotope-layout@3.0/dist/isotope.pkgd.min.js')
      .then(function (recs) {
        FilteredListing = require("../components/filtered-listings");
        for (i=recs.length - 1; i >= 0; i--)
          new FilteredListing(recs[i], {});
      }.bind(null, recs));
  }

  recs = document.querySelectorAll('[data-icon]');
  if (recs.length > 0) {
    IconHelper = require("../injection/icons/iconhelper");
    for (i=recs.length - 1; i >= 0; i--)
      new IconHelper(recs[i], {});
  }

  recs = document.querySelectorAll('ul.image-gallery');
  if (recs.length > 0) {
    window.loadScript([
      'https://unpkg.com/photoswipe@4.1.1/dist/photoswipe.min.js',
      'https://unpkg.com/photoswipe@4.1.1/dist/photoswipe-ui-default.min.js',
      'https://unpkg.com/isotope-layout@3.0/dist/isotope.pkgd.min.js'
    ])
      .then(function (recs) {
        ImageGallery = require("../components/gallery");
        for (i=recs.length - 1; i >= 0; i--)
          new ImageGallery(recs[i], { index: i });
      }.bind(null, recs));
  }

  recs = document.querySelectorAll('[data-leaflet-latlng]');
  if (recs.length > 0) {
    if (typeof(L) === 'undefined') {
      window.loadScript('https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.3/leaflet.js')
        .then(function() {
          style = document.createElement('link');
          style.rel = 'stylesheet';
          style.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.3/leaflet.css';
          document.head.appendChild(style);
          window.bound_lmaps = [];
          lmaps_loaded_go(recs);
        });
    } else {
      lmaps_loaded_go(recs);
    }
  }

  if (document.querySelector('[data-latlng], [data-address]')) {
    if (typeof(google) === 'undefined') {
      // GMaps loads via global callback
      window.loadScript('https://maps.googleapis.com/maps/api/js?key=' + process.env.GMAPSJSAPIKEY + '&callback=maps_loaded_go');
    } else {
      maps_loaded_go();
    }
  }
};

// GMaps callback
window.maps_loaded_go = function() {
  var GMaps = require("../components/maps/gmaps.es6");
  for (var recs = document.querySelectorAll('[data-latlng],[data-address]'), i=recs.length - 1; i >= 0; i--)
    new GMaps(recs[i], {counter: i});
};

// LMaps callback
window.lmaps_loaded_go = function(recs) {
  var LMaps = require("../components/maps/lmaps");
  for (var i=recs.length - 1; i >= 0; i--)
    new LMaps(recs[i], {counter: i});
};

document.addEventListener('DOMContentLoaded', window.DSComponentsLoad, false);
document.addEventListener('page:load', window.DSComponentsLoad, false);
document.addEventListener('page:restore', window.DSComponentsLoad, false);
