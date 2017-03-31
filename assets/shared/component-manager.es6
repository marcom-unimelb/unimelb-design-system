import { loadStylesheet, loadScript } from '../utils/index.es6';

/**
 * Registered components by name.
 * @type {Object}
 */
export const components = {};

/**
 * Initialise a registered component.
 * Create a new instance of the component for each of its selector's matches in the DOM.
 * Note that when a `context` is provided, only its children are searched.
 * @param {string} name - the component's name
 * @param {element} context (optional) - restrict the search in the DOM (defaults to `document`)
 */
export function initComponent(name, context = document) {
  // Retrieve registered component
  const Component = components[name];
  if (!Component) {
    console.warn(`Component "${name}" is not registered`);
    return;
  }

  // Find matches and return if none are found
  const matches = findMatches(context, Component.selector, Component.firstOnly);
  if (matches.length === 0) return;

  // Retrieve the component's third-party dependencies
  const deps = Component.dependencies;

  // Load any stylesheet dependencies in the background
  if (deps && deps.stylesheets) {
    loadStylesheet(deps.stylesheets);
  }

  // Load any scripts dependencies and initialise matches once all scripts have finished loading
  if (deps && deps.scripts) {
    loadScript(deps.scripts).then(initMatches.bind(null, Component, matches));
    return;
  }

  // No script dependencies; initialise matches right away
  initMatches(Component, matches);
}

/**
 * Find a component's matches.
 * @param {element} context
 * @param {string} rawSelector
 * @param {boolean} firstOnly
 * @return {array<element>} - the matched elements
 */
function findMatches(context, rawSelector, firstOnly) {
  // Build selector, making sure to exclude elements that are already bound
  const selector = `${rawSelector}:not([data-bound])`;

  // Retrieve the component's matches, optionally looking only for the first one
  if (firstOnly) return [context.querySelector(selector)];
  return Array.from(context.querySelectorAll(selector))
}

/**
 * Initialise a component's matched elements.
 * If an element has attribute `data-props`, the attribute's value is parsed to JSON and the resulting
 * object is passed to the component's constructor. Only JSON object strings are allowed: `"{...}"`.
 * @param {constructor} Component
 * @param {array} matches
 */
function initMatches(Component, matches) {
  matches.forEach(el => {
    // Retrieve and parse props (only allow JSON object)
    const rawProps = el.getAttribute('data-props');
    const props = /^{/.test(rawProps) ? JSON.parse(rawProps) : {};

    // Create new instance
    new Component(el, props);

    // Mark element as bound
    el.setAttribute('data-bound', 'true');
  });
}

/**
 * Initialise all registered components.
 * @param {element} context (optional) - restrict the search in the DOM (defaults to `document`)
 */
export function initAllComponents() {
  Object.keys(components).forEach((name) => initComponent(name));
}

/**
 * Register one or more components.
 * @param {array|constructor} components - an array of components, or a single component's constructor
 */
export function registerComponents(comps) {
  // Allow passing a single component
  comps = Array.isArray(comps) ? comps : [comps];

  // Register every component
  comps.forEach(Component => {
    // Log error if component doesn't have a name
    if (!Component.name || !Component.selector) {
      console.error('Component must have a name and a selector', Component);
      return;
    }

    // Register component by name
    components[Component.name] = Component;
  });
}