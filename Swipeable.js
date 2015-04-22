'use strict';

var React = require('react');

var Swipeable = React.createClass({
  propTypes: {
    tagName: React.PropTypes.string,
    component: React.PropTypes.element,
    onSwiped: React.PropTypes.func,
    onSwipingUp: React.PropTypes.func,
    onSwipingRight: React.PropTypes.func,
    onSwipingDown: React.PropTypes.func,
    onSwipingLeft: React.PropTypes.func,
    onSwipedUp: React.PropTypes.func,
    onSwipedRight: React.PropTypes.func,
    onSwipedDown: React.PropTypes.func,
    onSwipedLeft: React.PropTypes.func,
    flickThreshold: React.PropTypes.number,
    delta: React.PropTypes.number,
    allowTouchMoveDefault: React.PropTypes.bool
  },

  getInitialState: function () {
    return {
      x: null,
      y: null,
      swiping: false,
      start: 0
    };
  },

  getDefaultProps: function () {
    return {
      tagName: 'div',
      flickThreshold: 0.6,
      delta: 10
    };
  },

  calculatePos: function (e) {
    var x = e.changedTouches[0].clientX;
    var y = e.changedTouches[0].clientY;

    var xd = x - this.state.x;
    var yd = y - this.state.y;

    var axd = Math.abs(xd);
    var ayd = Math.abs(yd);

    return {
      deltaX: xd,
      deltaY: yd,
      absX: axd,
      absY: ayd
    };
  },

  touchStart: function (e) {
    if (e.touches.length > 1) {
      return;
    }
    this.setState({
      start: Date.now(),
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      swiping: false
    });
  },

  touchMove: function (e) {
    if (!this.state.x || !this.state.y || e.touches.length > 1) {
      return;
    }

    var cancelPageSwipe = false;
    var pos = this.calculatePos(e);

    if (pos.absX < this.props.delta && pos.absY < this.props.delta) {
      return;
    }

    if (pos.absX > pos.absY) {
      if (pos.deltaX < 0) {
        if (this.props.onSwipingLeft) {
          this.props.onSwipingLeft(e, pos.absX);
          cancelPageSwipe = true;
        }
      } else {
        if (this.props.onSwipingRight) {
          this.props.onSwipingRight(e, pos.absX);
          cancelPageSwipe = true;
        }
      }
    } else {
      if (pos.deltaY < 0) {
        if (this.props.onSwipingUp) {
          this.props.onSwipingUp(e, pos.absY);
          cancelPageSwipe = true;
        }
      } else {
        if (this.props.onSwipingDown) {
          this.props.onSwipingDown(e, pos.absY);
          cancelPageSwipe = true;
        }
      }
    }

    this.setState({ swiping: true });

    if (cancelPageSwipe && !this.props.allowTouchMoveDefault) {
      e.preventDefault();
    }
  },

  touchEnd: function (ev) {
    if (this.state.swiping) {
      var pos = this.calculatePos(ev);

      var time = Date.now() - this.state.start;
      var velocity = Math.sqrt(pos.absX * pos.absX + pos.absY * pos.absY) / time;
      var isFlick = velocity > this.props.flickThreshold;

      this.props.onSwiped && this.props.onSwiped(
        ev,
        pos.deltaX,
        pos.deltaY,
        isFlick
      );

      if (pos.absX > pos.absY) {
        if (pos.deltaX < 0) {
          this.props.onSwipedLeft && this.props.onSwipedLeft(ev, pos.deltaX);
        } else {
          this.props.onSwipedRight && this.props.onSwipedRight(ev, pos.deltaX);
        }
      } else {
        if (pos.deltaY < 0) {
          this.props.onSwipedUp && this.props.onSwipedUp(ev, pos.deltaY);
        } else {
          this.props.onSwipedDown && this.props.onSwipedDown(ev, pos.deltaY);
        }
      }
    }

    this.setState(this.getInitialState());
  },

  render: function () {
    var component = this.props.component || this.props.tagName;

    return React.createElement(component, React.__spread({}, this.props, {
      onTouchStart: this.touchStart,
      onTouchMove: this.touchMove,
      onTouchEnd: this.touchEnd,
      onTouchCancel: this.touchEnd
    }), this.props.children);
  }
});

module.exports = Swipeable;
