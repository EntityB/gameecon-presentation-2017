/**
 * Basic Chronos mediator node object.
 * Can be chained into node list. 
 * 
 * @constructor
 * @param {Boolean} [opt_updating] - if false, node will not update node childs by default
 */
var Chronos = function (opt_updating) {
    this._init();
    if (opt_updating === false)
        this.setUpdating(opt_updating);
};

Chronos.prototype = {
    /**
     * Initalizes array of nodes etc. 
     * 
     * @private
     */
    _init: function () {
        this.listeners = [];
        this.timeRunning = 0;
    },
    /**
     * Registers object that is being updated with each update loop. 
     * Object is appended, previously registered objects are updated first.
     * 
     * @param {Updateable|Object} listener - Object must implement method update
     */
    registerListener: function (listener) {
        this.listeners.push(listener);
    },
    /**
     * Registers object that is being updated with each update loop. 
     * Object is prepended and is updated before all other previously registered objects.
     * 
     * @param {Updateable|Object} listener - Object must implement method update
     */
    prependListener: function (listener) {
        this.listeners.unshift(listener);
    },
    /**
     * Removes updating of previously registered object. 
     * 
     * @param {Updateable|Object} listener - Object must implement method update
     * @returns {Object|null} - returns null if listener were not registered or listener that were removed
     */
    removeListener: function (listener) {
        var i;

        for (i = 0; i < this.listeners.length; i++) {
            if (listener === this.listeners[i]) {
                this.listeners.splice(i);
                return listener;
            }
        }
        return null;
    },
    /**
     * Updates all child nodes and notifies them about delta time .
     * 
     * @param {Number} deltaTime - time difference from last update
     */
    update: function (deltaTime) {
        var i;
        this.timeRunning += deltaTime;

        for (i = 0; i < this.listeners.length; i++)
            this.listeners[i].update(deltaTime);
    },
    /**
     * Sets if child nodes should be updated if update is 
     * called on this object or not. 
     * 
     * @param {Boolean} updating - false for stop updating nodes
     */
    setUpdating: function (updating) {
        if (updating) {
            delete this.update;
        } else {
            this.update = dummyUpdate;
        }
    }
};

var dummyUpdate = function () { };



/**
 * ===============================
 * Just for documentation purposes
 * ===============================
 */

var NotImplementedException = function () { };

/**
 * Just for documentation purposes. 
 * 
 * @interface
 */
var Updateable = function () { };

Updateable.prototype = {
    update: function () {
        throw new NotImplementedException();
    }
};