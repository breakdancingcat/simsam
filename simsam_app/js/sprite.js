// Generated by CoffeeScript 1.6.3
(function() {
  var GenericSprite, Interaction, Rule, SpriteFactory, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  GenericSprite = (function(_super) {
    __extends(GenericSprite, _super);

    function GenericSprite(spriteId) {
      var sWidth, shapeParams;
      this.spriteId = spriteId;
      sWidth = this.spriteType * 5;
      shapeParams = {
        height: 100,
        width: 100,
        strokeWidth: sWidth,
        fill: "rgb(0,255,0)",
        stroke: "rgb(0,0,0)",
        cornerSize: 20
      };
      fabric.Rect.call(this, shapeParams);
    }

    GenericSprite.prototype.applyRules = function(environment) {
      var rule, _i, _len, _ref, _results;
      _ref = this._rules;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rule = _ref[_i];
        _results.push(rule.act(this, environment));
      }
      return _results;
    };

    GenericSprite.prototype.addRule = function(rule) {
      this._rules.push(rule);
      return this._rules.length - 1;
    };

    GenericSprite.prototype.setRule = function(index, rule) {
      if (this._rules[index] !== void 0) {
        return this._rules[index] = rule;
      } else {
        throw Error("The rule index " + index + " doesn't exist.");
      }
    };

    GenericSprite.prototype.addTransform = function(transform) {
      var myRule;
      myRule = new Rule();
      myRule.setTransform(transform);
      return this.addRule(myRule);
    };

    GenericSprite.prototype.applyTransform = function(transform) {
      console.log("apply transform");
      return this.set({
        left: this.getLeft() + transform.dx,
        top: this.getTop() + transform.dy,
        angle: this.getAngle() + transform.dr,
        width: this.getWidth() + transform.dxScale,
        height: this.getHeight() + transform.dyScale
      });
    };

    GenericSprite.prototype.showLearning = function() {
      console.log("showLearning");
      this.set({
        borderColor: "red",
        cornerColor: "red"
      });
      return canvas.renderAll();
    };

    GenericSprite.prototype.showNormal = function() {
      console.log("showNoraml");
      this.set({
        borderColor: "rgb(210,210,255)",
        cornerColor: "rgb(210,210,255)"
      });
      return canvas.renderAll();
    };

    return GenericSprite;

  })(fabric.Rect);

  SpriteFactory = function(spriteType, imageObj) {
    var Sprite, _ref;
    console.log("sprite factory" + spriteType + imageObj);
    Sprite = (function(_super) {
      __extends(Sprite, _super);

      function Sprite() {
        _ref = Sprite.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      console.log("class sprite");

      Sprite.prototype.spriteType = spriteType;

      Sprite.prototype.imageObj = imageObj;

      Sprite.prototype._rules = [];

      return Sprite;

    })(GenericSprite);
    return Sprite;
  };

  Rule = (function() {
    Rule.prototype.setTransform = function(transform) {
      var defaultTransform;
      return defaultTransform = {
        dx: 0,
        dy: 0,
        dr: 0,
        dxScale: 1,
        dyScale: 1
      };
    };

    function Rule(transform) {
      var p, v, _ref;
      _ref = this.defaultTransform;
      for (p in _ref) {
        v = _ref[p];
        if (!(p in transform)) {
          transform[p] = v;
        }
      }
      this.transform = transform;
    }

    Rule.prototype.act = function(sprite, environment) {
      return sprite.applyTransform(this.transform);
    };

    return Rule;

  })();

  Interaction = (function(_super) {
    __extends(Interaction, _super);

    function Interaction() {
      _ref = Interaction.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Interaction.prototype.setEnvironment = function(requiredEnvironment) {
      this.requiredEnvironment = requiredEnvironment;
    };

    Interaction.prototype.act = function(sprite, environment) {
      var minCount, shouldAct, spriteType, _ref1;
      shouldAct = true;
      _ref1 = this.requiredEnvironment;
      for (spriteType in _ref1) {
        minCount = _ref1[spriteType];
        if (!(spriteType in environment)) {
          shouldAct = false;
        } else if (environment[spriteType] < minCount) {
          shouldAct = false;
        }
      }
      if (shouldAct) {
        return sprite.applyTransform(this.transform);
      }
    };

    return Interaction;

  })(Rule);

  window.spriteList = [];

  window.spriteTypeList = [];

  window.tick = function() {
    var sprite, _i, _len;
    for (_i = 0, _len = spriteList.length; _i < _len; _i++) {
      sprite = spriteList[_i];
      sprite.applyRules();
    }
    return canvas.renderAll();
  };

  window.loadSpriteTypes = function() {
    var spriteTypeList;
    console.log("loading sprite types");
    spriteTypeList = [];
    return $("img").each(function(i, sprite) {
      console.log("loading sprite type" + i);
      window.spriteTypeList.push(SpriteFactory(i, sprite));
      return $(sprite).draggable({
        revert: false,
        helper: "clone",
        stop: function(ev) {
          var newSprite;
          console.log(i);
          newSprite = new window.spriteTypeList[i];
          spriteList.push(newSprite);
          newSprite.setTop(ev.clientY);
          newSprite.setLeft(ev.clientX);
          canvas.add(newSprite);
          return canvas.renderAll();
        }
      });
    });
  };

}).call(this);
