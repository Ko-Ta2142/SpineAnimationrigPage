"use strict";
var InOutAnimationWatchTarget;
(function (InOutAnimationWatchTarget) {
    InOutAnimationWatchTarget[InOutAnimationWatchTarget["parent"] = 0] = "parent";
    InOutAnimationWatchTarget[InOutAnimationWatchTarget["self"] = 1] = "self";
})(InOutAnimationWatchTarget || (InOutAnimationWatchTarget = {}));
;
var InOutAnimationModule = /** @class */ (function () {
    function InOutAnimationModule() {
        this.timerid = -1;
        this.datasetname = "data-visible";
        this.delaycount = 0;
        // public
        this.enable = true;
        this.interval = 50; // watch interval ms
        this.watchclass = "inout";
        this.enablehide = true;
        this.showareatop = 0.25; // high prioryty
        this.showareabottom = 0.75;
        this.hideareatop = -0.20; // middle priority
        this.hideareabottom = 1.20;
        this.noneareatop = -10000.0; // low priority
        this.noneareabottom = +10000.0;
        this.watchtarget = InOutAnimationWatchTarget.parent;
        this.visibleevent = null;
        this.setup_default();
    }
    InOutAnimationModule.prototype.checkvisible = function (element) {
        // display none , vidible false : false
        var style = window.getComputedStyle(element, "");
        if ((style.display == "none") || (style.visibility == "hidden")) {
            return false;
        }
        if (element.parentElement != null) {
            if (element.parentElement.nodeType != Node.DOCUMENT_NODE) {
                return this.checkvisible(element.parentElement);
            }
        }
        return true;
    };
    InOutAnimationModule.prototype.ontimer = function () {
        var _this = this;
        if (!this.enable)
            return;
        // optimize scan
        if (this.delaycount > 0) {
            this.delaycount--;
            return;
        }
        var scrolltop = $('html').scrollTop();
        if (scrolltop === undefined)
            return;
        var scrollend = $('html').height();
        if (scrollend === undefined)
            return;
        var windowheight = window.innerHeight;
        if (windowheight < 100)
            windowheight = 100;
        // terminate margin
        var isfooter = false;
        if (scrolltop + windowheight * 1.2 > scrollend) {
            isfooter = true;
        }
        var jqs = $("." + this.watchclass);
        jqs.each(function (index, element) {
            // base parent position
            if (_this.watchtarget == InOutAnimationWatchTarget.parent) {
                var parent_1 = element.parentElement;
                if (parent_1 == null)
                    return;
                var offset = parent_1.getBoundingClientRect();
            }
            else {
                var offset = element.getBoundingClientRect();
            }
            if (offset == null)
                return;
            if (scrolltop === undefined)
                return; // appease compiler
            // dataset
            var v = element.getAttribute(_this.datasetname);
            if (v == null)
                v = "";
            // offset y (display offset)
            var y = 0;
            {
                var s = element.getAttribute("data-offset");
                if (s == null)
                    s = "0px";
                s = s.replace("px", "");
                y = y + Number(s);
            }
            // data-onnone onhide onshow
            var onnone = "";
            var onhide = "";
            var onshow = "";
            {
                var s = void 0;
                s = element.getAttribute("data-onnone");
                if (s != null)
                    onnone = s;
                s = element.getAttribute("data-onhide");
                if (s != null)
                    onhide = s;
                s = element.getAttribute("data-onshow");
                if (s != null)
                    onshow = s;
            }
            // display none
            if (!_this.checkvisible(element)) {
                if (v != "none") {
                    element.setAttribute(_this.datasetname, "none");
                    if (_this.visibleevent != null)
                        _this.visibleevent(element, "none");
                    if (onnone != "")
                        eval(onnone);
                }
                return;
            }
            // show (high priority)
            {
                var areatop = _this.showareatop;
                var areabottom = _this.showareabottom;
                if (isfooter) {
                    areabottom = 10.0; // show all
                }
                var top_1 = windowheight * areatop;
                var bottom = windowheight * areabottom;
                if ((y + offset.bottom >= top_1) && (y + offset.top <= bottom)) {
                    if (v != "show") {
                        element.setAttribute(_this.datasetname, "show");
                        if (_this.visibleevent != null)
                            _this.visibleevent(element, "show");
                        if (onnone != "")
                            eval(onshow);
                    }
                    return;
                }
            }
            // hide (middle priority)
            // if enablehide:false , no (pass) control area.
            {
                var top_2 = windowheight * _this.hideareatop;
                var bottom = windowheight * _this.hideareabottom;
                if ((y + offset.bottom >= top_2) && (y + offset.top <= bottom)) {
                    if (_this.enablehide) {
                        if (v == "show") { // show only
                            element.setAttribute(_this.datasetname, "hide");
                            if (_this.visibleevent != null)
                                _this.visibleevent(element, "hide");
                            if (onnone != "")
                                eval(onhide);
                        }
                    }
                    return;
                }
                ;
            }
            // none (low priority)
            {
                var top_3 = windowheight * _this.noneareatop;
                var bottom = windowheight * _this.noneareabottom;
                if ((y + offset.bottom >= top_3) && (y + offset.top <= bottom)) {
                    if (v != "none") {
                        element.setAttribute(_this.datasetname, "none");
                        if (_this.visibleevent != null)
                            _this.visibleevent(element, "none");
                        if (onnone != "")
                            eval(onnone);
                    }
                    return;
                }
                ;
            }
        });
        this.delaycount = 4;
    };
    InOutAnimationModule.prototype.run = function () {
        this.stop();
        this.timerid = setInterval(this.ontimer.bind(this), this.interval);
        this.delaycount = 0;
    };
    InOutAnimationModule.prototype.stop = function () {
        if (this.timerid == -1)
            clearInterval(this.timerid);
        this.timerid = -1;
    };
    InOutAnimationModule.prototype.setup_default = function () {
        this.showareatop = -10000.0;
        this.showareabottom = 0.9;
        this.hideareatop = -10000.0;
        this.hideareabottom = 1.2;
        this.noneareatop = -10000.0;
        this.noneareabottom = +100.0;
    };
    InOutAnimationModule.prototype.setup_center = function () {
        this.showareatop = 0.0;
        this.showareabottom = 0.9;
        this.hideareatop = -1.2;
        this.hideareabottom = 1.2;
        this.noneareatop = -10000.0;
        this.noneareabottom = +10000.0;
    };
    InOutAnimationModule.prototype.change = function () {
        this.delaycount = 0;
    };
    InOutAnimationModule.prototype.dispose = function () {
        this.stop();
    };
    return InOutAnimationModule;
}());
// release switch module
// switch flag in _release.js
var $release = false;
function _log(obj) {
    if ($release)
        return;
    console.log(obj);
}
function _error(obj) {
    console.error(obj);
}
/// <reference path="release.ts" />
var LoadingOverrideModule = /** @class */ (function () {
    function LoadingOverrideModule(divid) {
        this.id = "";
        this.started = false;
        this.startduration = 0;
        this.onstart = null;
        this.endduration = 0;
        this.onendbefore = null;
        this.onendafter = null;
        this.jumpduration = 0;
        this.onjumpbefore = null;
        this.onjumpafter = null;
        this.id = divid;
    }
    LoadingOverrideModule.prototype.start = function (autostart) {
        var _this = this;
        if (autostart === void 0) { autostart = true; }
        this.started = false;
        var e = document.getElementById(this.id);
        if (e == null) {
            console.error("loadingoverride : <div> element not found : " + this.id);
            return;
        }
        _log("loadingoverride : start");
        e.setAttribute("data-visible", "start");
        if (this.onstart != null)
            this.onstart();
        if (autostart) {
            setTimeout(function () { _this.end(); }, this.startduration);
        }
    };
    // auto call ? user call ?
    LoadingOverrideModule.prototype.end = function () {
        var _this = this;
        if (this.started)
            return;
        this.started = true;
        var e = document.getElementById(this.id);
        if (e == null) {
            console.error("loadingoverride : <div> element not found : " + this.id);
            return;
        }
        _log("loadingoverride : end-before");
        e.setAttribute("data-visible", "end");
        if (this.onendbefore != null)
            this.onendbefore();
        setTimeout(function () {
            _log("loadingoverride : end-after");
            if (_this.onendafter != null)
                _this.onendafter();
            e.style.display = "none"; // safe
        }, this.endduration);
    };
    LoadingOverrideModule.prototype.jump = function (url, target) {
        var _this = this;
        var e = document.getElementById(this.id);
        if (e == null) {
            console.error("loadingoverride : <div> element not found : " + this.id);
            return;
        }
        _log("loadingoverride : jump-before");
        e.style.display = "block";
        e.setAttribute("data-visible", "jump");
        if (this.onjumpbefore != null)
            this.onjumpbefore();
        setTimeout(function () {
            _log("loadingoverride : jump-after : " + url + " : " + target);
            if (_this.onjumpafter)
                _this.onjumpafter(url, target);
        }, this.jumpduration);
    };
    return LoadingOverrideModule;
}());
/// <reference path="release.ts" />
var SmoothScrollModule = /** @class */ (function () {
    function SmoothScrollModule() {
        this.duration = 400;
        this.ease = "easeOutQuad";
        this.onjumppage = null;
        // $('a[href^="#"]').on('click.smoothscroll', "", null, this.onclick);
        $('a').on('click.smoothscroll', "", null, this.onclick.bind(this));
    }
    SmoothScrollModule.prototype.onclick = function (event) {
        var e = event.currentTarget;
        if (e == null)
            return false;
        //let href = e.href;  // return full path. lol.... :Q
        var href = e.getAttribute("href");
        if (href == null)
            return false;
        var target = e.getAttribute("target");
        if (target == null)
            target = ""; // "_top";
        // check animation
        if ($('body.html').is(':animated')) {
            return false;
        }
        var position = -1;
        if (href == "#" || href == "") {
            return false;
        }
        else if (href == "#top") {
            var offset = $('html').offset();
            if (offset != undefined)
                position = offset.top;
        }
        else {
            if (href.slice(0, 1) == "#") {
                var offset = $(href).offset(); // getElementByID
                if (offset != undefined)
                    position = offset.top;
            }
            else {
                // file link
                if (this.onjumppage != null) {
                    _log("smooth scroll : callback : " + href + " : " + target);
                    return this.onjumppage(href, target);
                }
                else {
                    _log("smooth scroll : callback : " + href);
                    return true;
                }
            }
        }
        if (position == -1)
            return false;
        // scroll
        _log("smooth scroll : " + href);
        $('body,html').animate({ scrollTop: position }, this.duration, this.ease);
        // event handling
        return false;
    };
    SmoothScrollModule.prototype.dispose = function () {
        $('a').off('click.smoothscroll', "");
    };
    return SmoothScrollModule;
}());
/// <reference path="release.ts" />
/// <reference path="smoothscroll.ts" />
/// <reference path="loadingoverride.ts" />
/// <reference path="inoutmodule.ts" />
