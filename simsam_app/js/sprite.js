// Generated by CoffeeScript 1.6.1
(function() {
  var Action, GenericSprite, Interaction, OverlapInteraction, Rule, SpriteFactory, TransformAction,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  GenericSprite = (function(_super) {

    __extends(GenericSprite, _super);

    function GenericSprite(spriteId) {
      var sWidth, shapeParams;
      this.spriteId = spriteId;
      this.stateTranspose = false;
      this.stateRecording = false;
      this.ruleTempObject = null;
      this.prepObj = null;
      sWidth = this.spriteType * 5;
      shapeParams = {
        height: this.imageObj.clientHeight,
        width: this.imageObj.clientWidth,
        fill: "rgb(0,255,0)",
        stroke: "rgb(0,0,0)",
        cornerSize: 20
      };
      GenericSprite.__super__.constructor.call(this, this.imageObj, shapeParams);
    }

    GenericSprite.prototype.interactionEvent = function(obj) {
      var surviveObj;
      if (this.stateTranspose) {
        console.log("Error: interactionEvent called during Transpose");
        return;
      }
      console.log('Received interaction between ' + this + ' and ' + obj);
      this.stateRecording = false;
      this.ruleTempObject = obj;
      surviveObj = this;
      return uiInteractionChoose(this, function(choice) {
        return surviveObj.interactionCallback(choice);
      });
    };

    GenericSprite.prototype.interactionCallback = function(choice) {
      console.log('Received interaction callback ' + choice);
      if (choice === 'transpose') {
        this.stateTranspose = true;
        this.initState = getObjectState(this);
        return this.stateRecording = false;
      }
    };

    GenericSprite.prototype.applyRules = function(environment) {
      var rule, _i, _len, _ref, _results;
      console.log('--Regular Rules');
      _ref = this._rules;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rule = _ref[_i];
        console.log('applying rule' + rule);
        _results.push(rule.act(this, environment));
      }
      return _results;
    };

    GenericSprite.prototype.prepIRules = function(environment) {
      var rule, _i, _len, _ref, _results;
      _ref = this._irules;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rule = _ref[_i];
        if (rule === void 0) {
          continue;
        }
        _results.push(this.prepObj = rule.prep(this, environment));
      }
      return _results;
    };

    GenericSprite.prototype.applyIRules = function(environment) {
      var rule, _i, _len, _ref, _results;
      console.log('--Interaction Rules');
      _ref = this._irules;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rule = _ref[_i];
        console.log('Applying an iRule');
        if (rule === void 0) {
          continue;
        }
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

    GenericSprite.prototype.addIRule = function(rule, index) {
      this._irules[index] = rule;
      return this._irules.length - 1;
    };

    GenericSprite.prototype.learningToggle = function() {
      var endState, r;
      if (this.stateTranspose) {
        this.stateTranspose = false;
        this.showNormal();
        endState = getObjectState(this);
        r = new OverlapInteraction(this.ruleTempObject);
        r.setActionType('transform');
        r.addTransform(this.initState, endState);
        this.addIRule(r, this.ruleTempObject.spriteType);
        return;
      }
      if (!this.stateRecording) {
        this.initState = getObjectState(this);
        this.showLearning();
        return this.stateRecording = true;
      } else {
        endState = getObjectState(this);
        this.showNormal();
        r = new Rule(this.spriteType);
        r.setActionType('transform');
        r.addTransform(this.initState, endState);
        this.addRule(r);
        return this.stateRecording = false;
      }
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

    GenericSprite.prototype.trueIntersectsWithObject = function(obj) {
      if (this.intersectsWithObject(obj)) {
        return true;
      }
      if (this.isContainedWithinObject(obj)) {
        return true;
      }
      if (obj.isContainedWithinObject(this)) {
        return true;
      }
      return false;
    };

    return GenericSprite;

  })(fabric.Image);

  SpriteFactory = function(spriteType, imageObj) {
    var Sprite;
    console.log("sprite factory" + spriteType + imageObj);
    Sprite = (function(_super) {

      __extends(Sprite, _super);

      function Sprite() {
        return Sprite.__super__.constructor.apply(this, arguments);
      }

      console.log("class sprite");

      Sprite.prototype.spriteType = spriteType;

      Sprite.prototype.imageObj = imageObj;

      Sprite.prototype._rules = [];

      Sprite.prototype._irules = [];

      return Sprite;

    })(GenericSprite);
    return Sprite;
  };

  Rule = (function() {

    function Rule(spriteType) {
      this.spriteType = spriteType;
    }

    Rule.prototype.act = function(sprite, environment) {
      console.log('Rule[' + this.name + '].act: ' + sprite.spriteType);
      if (this.action !== null) {
        return this.action.act(sprite);
      }
    };

    Rule.prototype.prep = function(sprite, environment) {};

    Rule.prototype.setActionType = function(type) {
      var actClass;
      this.type = type;
      actClass = (function() {
        switch (type) {
          case 'transform':
            return TransformAction;
        }
      })();
      return this.action = new actClass();
    };

    Rule.prototype.addTransform = function(start, end) {
      console.log('addTransform');
      if (this.type !== 'transform') {
        console.log('Error: addTransform called on other type of Rule');
      }
      this.action = new TransformAction();
      return this.action.setTransformDelta(start, end);
    };

    return Rule;

  })();

  Interaction = (function(_super) {

    __extends(Interaction, _super);

    function Interaction(target) {
      console.log('Interaction: New ' + target.spriteType);
      this.targetType = target.spriteType;
    }

    Interaction.prototype.setEnvironment = function(requiredEnvironment) {
      this.requiredEnvironment = requiredEnvironment;
    };

    Interaction.prototype.act = function(sprite, environment) {
      var minCount, shouldAct, spriteType, _ref;
      shouldAct = true;
      _ref = this.requiredEnvironment;
      for (spriteType in _ref) {
        minCount = _ref[spriteType];
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

  OverlapInteraction = (function(_super) {

    __extends(OverlapInteraction, _super);

    function OverlapInteraction() {
      return OverlapInteraction.__super__.constructor.apply(this, arguments);
    }

    OverlapInteraction.prototype.setEnvironment = function(requiredEnvironment) {
      this.requiredEnvironment = requiredEnvironment;
    };

    OverlapInteraction.prototype.prep = function(sprite, environment) {
      return this.actOn(sprite);
    };

    OverlapInteraction.prototype.actOn = function(sprite) {
      var obj, objects, _i, _len;
      objects = canvas.getObjects();
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        obj = objects[_i];
        if (obj === sprite) {
          continue;
        }
        if (!(obj instanceof GenericSprite)) {
          continue;
        }
        if (obj.spriteType !== this.targetType) {
          continue;
        }
        if (obj.trueIntersectsWithObject(sprite)) {
          return obj;
        }
      }
      return false;
    };

    OverlapInteraction.prototype.act = function(sprite, environment) {
      var obj;
      obj = sprite.prepObj;
      if (obj === false) {
        return false;
      }
      this.action.act(sprite);
      return sprite.prepObj = null;
    };

    return OverlapInteraction;

  })(Interaction);

  Action = (function() {

    function Action() {}

    Action.prototype.act = function() {
      return console.log("Action is an abstract class, don't use it.");
    };

    return Action;

  })();

  TransformAction = (function(_super) {

    __extends(TransformAction, _super);

    function TransformAction() {
      this.transform = {
        dx: 0,
        dy: 0,
        dr: 0,
        dxScale: 1,
        dyScale: 1
      };
    }

    TransformAction.prototype.setTransformDelta = function(start, end) {
      this.transform.dxScale = end.width - start.width;
      this.transform.dyScale = end.height - start.height;
      this.transform.dx = end.left - start.left;
      this.transform.dy = end.top - start.top;
      return this.transform.dr = end.angle - start.angle;
    };

    TransformAction.prototype.act = function(sprite) {
      sprite.set({
        left: sprite.getLeft() + this.transform.dx,
        top: sprite.getTop() + this.transform.dy,
        angle: sprite.getAngle() + this.transform.dr,
        width: sprite.getWidth() + this.transform.dxScale,
        height: sprite.getHeight() + this.transform.dyScale
      });
      return sprite.setCoords();
    };

    return TransformAction;

  })(Action);

  window.spriteList = [];

  window.spriteTypeList = [];

  window.tick = function() {
    var sprite, _i, _j, _k, _len, _len1, _len2;
    for (_i = 0, _len = spriteList.length; _i < _len; _i++) {
      sprite = spriteList[_i];
      sprite.applyRules();
    }
    for (_j = 0, _len1 = spriteList.length; _j < _len1; _j++) {
      sprite = spriteList[_j];
      sprite.prepIRules();
    }
    for (_k = 0, _len2 = spriteList.length; _k < _len2; _k++) {
      sprite = spriteList[_k];
      sprite.applyIRules();
    }
    canvas.renderAll.bind(canvas);
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
          if (pointWithinElement(ev.pageX, ev.pageY, $('#trash_menu_button'))) {
            deleteImageFully(i, this);
            return;
          }
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
