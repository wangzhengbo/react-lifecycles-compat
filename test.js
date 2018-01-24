'use strict';

const createReactClass = require('create-react-class');
const React = require('react');
const ReactDOM = require('react-dom');
const polyfill = require('./index');

describe('react-lifecycles-compat', () => {
  it('should initialize and update state correctly', () => {
    class ClassComponent extends React.Component {
      constructor(props) {
        super(props);
        this.state = {count: 1};
      }
      static getDerivedStateFromProps(nextProps, prevState) {
        return {
          count: prevState.count + nextProps.incrementBy,
        };
      }
      render() {
        return React.createElement('div', null, this.state.count);
      }
    }

    polyfill(ClassComponent);

    const container = document.createElement('div');
    ReactDOM.render(
      React.createElement(ClassComponent, {incrementBy: 2}),
      container
    );

    expect(container.textContent).toBe('3');

    ReactDOM.render(
      React.createElement(ClassComponent, {incrementBy: 3}),
      container
    );

    expect(container.textContent).toBe('6');
  });

  it('should support create-react-class components', () => {
    const CRCComponent = createReactClass({
      statics: {
        getDerivedStateFromProps(nextProps, prevState) {
          return {
            count: prevState.count + nextProps.incrementBy,
          };
        },
      },
      getInitialState() {
        return {count: 1};
      },
      render() {
        return React.createElement('div', null, this.state.count);
      },
    });

    polyfill(CRCComponent);

    const container = document.createElement('div');
    ReactDOM.render(
      React.createElement(CRCComponent, {incrementBy: 2}),
      container
    );

    expect(container.textContent).toBe('3');

    ReactDOM.render(
      React.createElement(CRCComponent, {incrementBy: 3}),
      container
    );

    expect(container.textContent).toBe('6');
  });

  it('should error for non-class components', () => {
    function FunctionalComponent() {
      return null;
    }

    expect(() => polyfill(FunctionalComponent)).toThrow(
      'Can only polyfill class components'
    );
  });

  it('should ignore component with cWM or cWRP lifecycles if they do not define static gDSFP', () => {
    class ComponentWithLifecycles extends React.Component {
      componentWillMount() {}
      componentWillReceiveProps() {}
      render() {
        return null;
      }
    }

    polyfill(ComponentWithLifecycles);
  });

  it('should error if component already has cWM or cWRP lifecycles with static gDSFP', () => {
    class ComponentWithWillMount extends React.Component {
      componentWillMount() {}
      static getDerivedStateFromProps() {}
      render() {
        return null;
      }
    }

    class ComponentWithWillReceiveProps extends React.Component {
      componentWillReceiveProps() {}
      static getDerivedStateFromProps() {}
      render() {
        return null;
      }
    }

    expect(() => polyfill(ComponentWithWillMount)).toThrow(
      'Cannot polyfill if componentWillMount already exists'
    );
    expect(() => polyfill(ComponentWithWillReceiveProps)).toThrow(
      'Cannot polyfill if componentWillReceiveProps already exists'
    );
  });
});
