(function () {

    function YOURAPPNAME(doc) {
        var _self = this;

        _self.doc = doc;
        _self.window = window;
        _self.html = _self.doc.querySelector('html');
        _self.body = _self.doc.body;
        _self.location = location;
        _self.hash = location.hash;
        _self.Object = Object;
        _self.scrollWidth = 0;

        _self.bootstrap();
    }

    YOURAPPNAME.prototype.bootstrap = function () {
        var _self = this;

        // Initialize window scollBar width
        _self.scrollWidth = _self.scrollBarWidth();
    };

    // Window load types (loading, dom, full)
    YOURAPPNAME.prototype.appLoad = function (type, callback) {
        var _self = this;

        switch (type) {
            case 'loading':
                if (_self.doc.readyState === 'loading') callback();

                break;
            case 'dom':
                _self.doc.onreadystatechange = function () {
                    if (_self.doc.readyState === 'complete') callback();
                };

                break;
            case 'full':
                _self.window.onload = function (e) {
                    callback(e);
                };

                break;
            default:
                callback();
        }
    };

    // Detect scroll default scrollBar width (return a number)
    YOURAPPNAME.prototype.scrollBarWidth = function () {
        var _self = this,
            outer = _self.doc.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        outer.style.msOverflowStyle = "scrollbar";

        _self.body.appendChild(outer);

        var widthNoScroll = outer.offsetWidth;

        outer.style.overflow = "scroll";

        var inner = _self.doc.createElement("div");

        inner.style.width = "100%";
        outer.appendChild(inner);

        var widthWithScroll = inner.offsetWidth;

        outer.parentNode.removeChild(outer);

        return widthNoScroll - widthWithScroll;
    };

    YOURAPPNAME.prototype.initSwitcher = function () {
        var _self = this;

        var switchers = _self.doc.querySelectorAll('[data-switcher]');

        if (switchers && switchers.length > 0) {
            for (var i = 0; i < switchers.length; i++) {
                var switcher = switchers[i],
                    switcherOptions = _self.options(switcher.dataset.switcher),
                    switcherElems = switcher.children,
                    switcherTargets = _self.doc.querySelector('[data-switcher-target="' + switcherOptions.target + '"]').children;

                for (var y = 0; y < switcherElems.length; y++) {
                    var switcherElem = switcherElems[y],
                        parentNode = switcher.children,
                        switcherTarget = switcherTargets[y];

                    if (switcherElem.classList.contains('active')) {
                        for (var z = 0; z < parentNode.length; z++) {
                            parentNode[z].classList.remove('active');
                            switcherTargets[z].classList.remove('active');
                        }
                        switcherElem.classList.add('active');
                        switcherTarget.classList.add('active');
                    }

                    switcherElem.children[0].addEventListener('click', function (elem, target, parent, targets) {
                        return function (e) {
                            e.preventDefault();
                            if (!elem.classList.contains('active')) {
                                for (var z = 0; z < parentNode.length; z++) {
                                    parent[z].classList.remove('active');
                                    targets[z].classList.remove('active');
                                }
                                elem.classList.add('active');
                                target.classList.add('active');
                            }
                        };

                    }(switcherElem, switcherTarget, parentNode, switcherTargets));
                }
            }
        }
    };

    YOURAPPNAME.prototype.str2json = function (str, notevil) {
        try {
            if (notevil) {
                return JSON.parse(str
                    .replace(/([\$\w]+)\s*:/g, function (_, $1) {
                        return '"' + $1 + '":';
                    })
                    .replace(/'([^']+)'/g, function (_, $1) {
                        return '"' + $1 + '"';
                    })
                );
            } else {
                return (new Function("", "var json = " + str + "; return JSON.parse(JSON.stringify(json));"))();
            }
        } catch (e) {
            return false;
        }
    };

    YOURAPPNAME.prototype.options = function (string) {
        var _self = this;

        if (typeof string != 'string') return string;

        if (string.indexOf(':') != -1 && string.trim().substr(-1) != '}') {
            string = '{' + string + '}';
        }

        var start = (string ? string.indexOf("{") : -1), options = {};

        if (start != -1) {
            try {
                options = _self.str2json(string.substr(start));
            } catch (e) {
            }
        }

        return options;
    };

    YOURAPPNAME.prototype.popups = function (options) {
        var _self = this;

        var defaults = {
            reachElementClass: '.js-popup',
            closePopupClass: '.js-close-popup',
            currentElementClass: '.js-open-popup',
            changePopupClass: '.js-change-popup'
        };

        options = $.extend({}, options, defaults);

        var plugin = {
            reachPopups: $(options.reachElementClass),
            bodyEl: $('body'),
            topPanelEl: $('.top-panel-wrapper'),
            htmlEl: $('html'),
            closePopupEl: $(options.closePopupClass),
            openPopupEl: $(options.currentElementClass),
            changePopupEl: $(options.changePopupClass),
            bodyPos: 0
        };

        plugin.openPopup = function (popupName) {
            plugin.reachPopups.filter('[data-popup="' + popupName + '"]').addClass('opened');
            plugin.bodyEl.css('overflow-y', 'scroll');
            // plugin.topPanelEl.css('padding-right', scrollSettings.width);
            plugin.htmlEl.addClass('popup-opened');
        };

        plugin.closePopup = function (popupName) {
            plugin.reachPopups.filter('[data-popup="' + popupName + '"]').removeClass('opened');
            setTimeout(function () {
                plugin.bodyEl.removeAttr('style');
                plugin.htmlEl.removeClass('popup-opened');
                plugin.topPanelEl.removeAttr('style');
            }, 500);
        };

        plugin.changePopup = function (closingPopup, openingPopup) {
            plugin.reachPopups.filter('[data-popup="' + closingPopup + '"]').removeClass('opened');
            plugin.reachPopups.filter('[data-popup="' + openingPopup + '"]').addClass('opened');
        };

        plugin.init = function () {
            plugin.bindings();
        };

        plugin.bindings = function () {
            plugin.openPopupEl.on('click', function (e) {
                e.preventDefault();
                var pop = $(this).attr('data-open-popup');
                plugin.openPopup(pop);
            });

            plugin.closePopupEl.on('click', function (e) {
                var pop;
                if (this.hasAttribute('data-close-popup')) {
                    pop = $(this).attr('data-close-popup');
                } else {
                    pop = $(this).closest(options.reachElementClass).attr('data-popup');
                }

                plugin.closePopup(pop);
            });

            plugin.changePopupEl.on('click', function (e) {
                var closingPop = $(this).attr('data-closing-popup');
                var openingPop = $(this).attr('data-opening-popup');

                plugin.changePopup(closingPop, openingPop);
            });

            plugin.reachPopups.on('click', function (e) {
                var target = $(e.target);
                var className = options.reachElementClass.replace('.', '');
                if (target.hasClass(className)) {
                    plugin.closePopup($(e.target).attr('data-popup'));
                }
            });
        };

        if (options)
            plugin.init();

        return plugin;
    };


    YOURAPPNAME.prototype.timer = function (expirationDate, startNow) {
        var _self = this,
            timerBody = {};

        if (expirationDate === undefined) return console.error('Expects a expirationData/ Example: 2017-05-30 (typeof string)');

        timerBody.options = {
            expirationDate: expirationDate
        };

        timerBody.timers = _self.doc.getElementsByClassName('js-timer');

        timerBody.calculate = function () {
            var t = Date.parse(timerBody.options.expirationDate) - Date.parse(new Date()),
                seconds = Math.floor((t / 1000) % 60),
                minutes = Math.floor((t / 1000 / 60) % 60),
                hours = Math.floor((t / (1000 * 60 * 60)) % 24),
                days = Math.floor(t / (1000 * 60 * 60 * 24));

            return {
                'total': t,
                'days': days,
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds
            };
        };

        timerBody.render = function () {
            var t = timerBody.calculate();

            for (var i = timerBody.timers.length - 1; i >= 0; --i) {
                var timer = timerBody.timers[i],
                    daysSpan = timer.getElementsByClassName('js-days')[0],
                    hoursSpan = timer.getElementsByClassName('js-hours')[0],
                    minutesSpan = timer.getElementsByClassName('js-minutes')[0],
                    secondsSpan = timer.getElementsByClassName('js-seconds')[0];
                if (daysSpan !== undefined) daysSpan.innerHTML = (('' + t.days).length > 1) ? t.days : '0' + t.days;
                if (hoursSpan !== undefined) hoursSpan.innerHTML = (('' + t.hours).length > 1) ? t.hours : '0' + t.hours;
                if (minutesSpan !== undefined) minutesSpan.innerHTML = (('' + t.minutes).length > 1) ? t.minutes : '0' + t.minutes;
                if (secondsSpan !== undefined) secondsSpan.innerHTML = (('' + t.seconds).length > 1) ? t.seconds : '0' + t.seconds;

                if (t.total <= 0)
                    clearInterval(timerBody.timerInterval);
            }
        };

        timerBody.init = function () {
            timerBody.render();
            timerBody.timerInterval = setInterval(timerBody.render, 1000);
        };

        if (startNow !== undefined && startNow) timerBody.init();

        return timerBody;
    };


    var app = new YOURAPPNAME(document);

    app.appLoad('loading', function () {
        // App is loading... Paste your app code here. 4example u can run preloader event here and stop it in action appLoad dom or full

        function nextDate() {
            var nextDateSpan = $('.js-next-day'),
                today = new Date(),
                addDays = parseInt(nextDateSpan.attr('add-days')),
                monthNames = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"
                ];

            console.log();

            nextDateSpan.html((today.getDate() + addDays) + ' ' + monthNames[today.getMonth()] + '!');
        }

        nextDate();

        function todayDate() {
            var todayDate = $('.js-today'),
                todayDateSlash = $('.js-today-slash-divider'),
                todayDay = new Date().getDate(),
                todayMonth = new Date().getMonth(),
                todayYear = new Date().getFullYear();
            if (todayDay < 9)
                todayDay = '0' + todayDay;
            if (todayMonth < 9)
                todayMonth = '0' + todayMonth;
            var todaySlash = todayDay+'/'+todayMonth+'/'+todayYear,
                today = todayDay+'.'+todayMonth+'.'+todayYear;
            todayDateSlash.html(todaySlash);
            todayDate.html(today);
        }

        function todayDataLabelDay() {
            var todayDate = $('.js-data-label-today'),
                options = {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                },
                today = new Date().toLocaleString("ru", options);

            todayDate.attr('data-label', "На " + today);
        }

        todayDate();
        todayDataLabelDay()
    });

    app.appLoad('dom', function () {
        // DOM is loaded! Paste your app code here (Pure JS code).
        // Do not use jQuery here cause external libs do not loads here...

        // app.initSwitcher(); // data-switcher="{target='anything'}" , data-switcher-target="anything"
        app.timer('2017-12-31', true);

        app.popups();
    });

    app.appLoad('full', function (e) {
        // App was fully load! Paste external app source code here... 4example if your use jQuery and something else
        // Please do not use jQuery ready state function to avoid mass calling document event trigger!
    });

})();
