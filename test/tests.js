var testSuite = function (renderMode) {

    var farahey;
    var offsets = {};
    var _offset = function(id) {
        return offsets[id] || {left:0,top:0};
    };
    var _size = function() { return [50,50]; };
    var _setOffset = function(id, o) {
        _offsets[id] = o;
    };

    module("jsPlumbToolkit", {
        teardown: function() {

        },
        setup: function () {
            farahey = Farahey.getInstance({
                container: document.querySelector("#container"),
                getPosition: _offset,
                getSize: _size,
                getId: function (id) {
                    return id;
                },
                setPosition: _setOffset,
                getContainerPosition: function (c) {
                    return {left:0,top:0};
                }
            });
        }
    });

    test("cannot add a null item", function() {
        farahey.addElement(null);
        equal(farahey.getElements().length, 0, "no elements registered, we tried add a null element");

    });

    test("cannot add an item more than once", function() {
        farahey.addElement("one");
        equal(farahey.getElements().length, 1, "one element registered");

        farahey.addElement("one");
        equal(farahey.getElements().length, 1, "still one element registered after attempt at adding a duplicate");
    });

    test("add elements", function() {
        farahey.addElement("one");
        equal(farahey.getElements().length, 1, "one element registered");

        farahey.addElements(["one", "two"]);
        equal(farahey.getElements().length, 2, "two elements registered after addElements, one of which was a duplicate");

        farahey.addElements(["one", "two", "three"], true);
        equal(farahey.getElements().length, 5, "five elements registered after addElements again, two of which were duplicates, but we set the flag saying to ignore the check (because its quicker)");
    });

};