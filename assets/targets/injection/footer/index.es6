/**
 * InjectFooter
 *
 * @param  {Object} props
 */
function InjectFooter(props) {
  this.el = document.querySelector('.page-footer');

  // Only add if the footer is not already present
  if (!this.el) {
    this.props = props;
    this.props.page = document.querySelector('.page-inner');

    this.renderFooter();
  }
}

InjectFooter.prototype.renderFooter = function() {
  this.el = document.createElement('div');
  this.el.className = 'page-footer';
  this.el.innerHTML = `
<footer>
  <a class="unimelb-lge" href="https://unimelb.edu.au">
    <svg width="300" height="100" viewBox="0 0 300 100" aria-labelledby="aria-uom-title" role="img">
      <image xlink:href="${this.props.assethost}/lockup.svg" src="${this.props.assethost}/lockup.png" alt="The University of Melbourne Logo" width="300" height="100" preserveAspectRatio="xMaxYMin meet"/>
    </svg>
  </a>
  <ul class="people-links">
    <li>
      <a href="http://students.unimelb.edu.au">Current Students</a>
    </li>
    <li>
      <a href="http://staff.unimelb.edu.au">Staff</a>
    </li>
    <li>
      <a href="http://alumni.unimelb.edu.au/">Alumni</a>
    </li>
  </ul>
  <ul class="quicklinks clearfix">
    <li>
      <a href="http://about.unimelb.edu.au/governance-and-leadership/faculties"><svg role="img" class="icon"><use xlink:href="#icon-faculty" /></svg> Faculties and Graduate Schools</a>
    </li>
    <li>
      <a href="http://library.unimelb.edu.au/"><svg role="img" class="icon"><use xlink:href="#icon-library" /></svg> Library</a>
    </li>
    <li>
      <a href="http://www.unimelb.edu.au/contact/"><svg role="img" class="icon"><use xlink:href="#icon-phone" /></svg> Contact us</a>
    </li>
    <li>
      <a href="https://maps.unimelb.edu.au/"><svg role="img" class="icon"><use xlink:href="#icon-location" /></svg> Maps</a>
    </li>
    <li>
      <a href="http://www.campaign.unimelb.edu.au/"><svg role="img" class="icon"><use xlink:href="#icon-campaign" /></svg> Support the Campaign</a>
    </li>
    <li>
      <a href="http://about.unimelb.edu.au/careers"><svg role="img" class="icon"><use xlink:href="#icon-jobs" /></svg> Jobs</a>
    </li>
  </ul>
  <div class="ind-ack">We acknowledge and pay respect to the Traditional Owners of the lands upon which our campuses are situated.</div>
  <ul class="page-footer-section nav">
    <li>
      <a href="http://safety.unimelb.edu.au/about/contacts/emergency.html">Emergency Information</a>
    </li>
    <li>
      <a href="http://www.unimelb.edu.au/disclaimer/">Disclaimer &amp; Copyright</a>
    </li>
    <li>
      <a href="http://www.unimelb.edu.au/accessibility/index.html">Accessibility</a>
    </li>
    <li>
      <a href="http://www.unimelb.edu.au/disclaimer/privacy.html">Privacy</a>
    </li>
  </ul>
  <ul class="page-footer-section social">
    <li class="social-facebook">
      <a href="https://www.facebook.com/unimelb"><svg role="img" class="icon"><use xlink:href="#icon-facebook" /></svg> Facebook</a>
    </li>
    <li class="social-twitter">
      <a href="https://www.twitter.com/unimelb"><svg role="img" class="icon"><use xlink:href="#icon-twitter" /></svg> Twitter</a>
    </li>
    <li class="social-linkedin">
      <a href="https://www.linkedin.com/company/university-of-melbourne"><svg role="img" class="icon"><use xlink:href="#icon-linkedin" /></svg> LinkedIn</a>
    </li>
  </ul>
  <small>Phone: 13 MELB (13 6352) | International: +61 3 9035 5511</small>
  <small>The University of Melbourne ABN: 84 002 705 224</small>
  <small>CRICOS Provider Code: 00116K (<a href="http://www.services.unimelb.edu.au/international/visas/index.html">visa information</a>)</small>
</footer>
`;

  this.props.page.appendChild(this.el);
};

module.exports = InjectFooter;
