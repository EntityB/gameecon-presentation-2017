/**
 * Chronos mediator node object.
 * Can be chained into node list. 
 * Can speedup time or make slow-mo effect. 
 * 
 * @constructor
 * @extends Chronos
 * @param {Boolean} [opt_updating] - if false, node will not update node childs by default
 */
var TimeAccelerator = function (opt_updating) {
    Chronos.call(this, opt_updating);
};

TimeAccelerator.prototype = Object.assign({}, Chronos.prototype, {
    _init: function () {
        Chronos.prototype._init.call(this);
        this.timeMod = 1;
    },
    /**
     * Change the speed of time for all child nodes
     * 
     * @param {Number} modificator - 
     * value = 1, normal time mode
     * value > 1, faster
     * value < 1, slower
     * value = -1, reverse
     * ...
     */
    setTimeMod: function (modificator) {
        this.timeMod = modificator;
    },
    update: function (deltaTime) {
        deltaTime = deltaTime * this.timeMod;
        Chronos.prototype.update.call(this, deltaTime);
    }
});