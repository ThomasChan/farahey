### Farahey

This is a small utility that provides a means for "magnetizing" a set of elements such that no element overlaps another, 
and any two elements are at least some minimum distance apart.

Currently, all elements are assumed to have the same "charge", which is to say that every element repels every other element.  
It is possible that a future version of this utility could allow for elements to possess different charges.

***** This project used to be called **jsMagnetize**.


#### Dependencies

Farahey has a dependency on [Biltong](https://github.com/jsPlumb/biltong). If you have [jsPlumb](https://github.com/jsPlumb/jsPlumb) in 
your page then Biltong is already available to you.

#### Magnetizing

In order to magnetize a set of elements, you need to provide several pieces of information:

- a list of elements. This can be any "list-like" object, meaning it exposes a `length` property.
- a function that can return the current offset for some element in the list. It doesn't matter what datatype this 
function takes as argument, as long as it matches the objects in the element list.
- a function that can take some element in the list and a location for it, and apply that location to the element.
- a function that can take some element in the list and return its id.
- a function that can take some element in the list and return its size as a `[width,height]` array.

Should you wish to make use of the `executeAtEvent` method you will also need to provide:

- a container element. This is the element whose origin is being used calculate/set offsets. Ordinarily this will most 
likely be the parent of the elements you are magnetizing.
- a function that can return the page offset of the container element. This is used to map the event's page location 
into the coordinate system used by your get/set functions.

At this point you might be thinking this sounds kind of low-level - why didn't I just do all the offset-y type stuff using 
jQuery or something?  It is indeed low level. We need it to be this way so that we can reuse it across several libraries.

##### Origin

Magnetization takes place with respect to an origin, which is an [x,y] value in your coordinate space. There are a few 
methods exposed on the magnetizer, each of which uses a different origin.

##### `execute([x,y])` 

This method takes an [x,y] array as the magnetization origin.

##### `executeAtCenter()`

This method computes the logical center of all the elements and uses that as the magnetization origin.

##### `executeAtEvent(event)`

This method takes some event and maps its location to your coordinate space, using that value as the magnetization origin.

#### Filtering Elements

You can provide a `filter` function which, when passed some element, should return true if the
element may move, or false if it may not:
  
```javascript  
filter:function(id) {
    return myElementMap[id] == null;
}
```

This shows a simple implementation in which elements that may not move are stored via their ids in a hash.

#### Excluding Elements

You can provide an `exclude` function which, when passed some element, should return true if the given element should be excluded
from the computation. This means it neither moves nor causes any other elements to move.

```javascript
exclude:function(id) {
    return id === "excludeMe";
}
```

#### Constraining Movement

You can provide a `constrain` function to control the movement of your elements.  The method signature is:

```javascript
constrain:function(id, current, delta)
```

 Your function is provided with a `delta` array for proposed shift in each axis, and is expected to return an array of allowed shift in each axis.  Here's an example of implementing a function that constrains movement to a grid:

```javascript
var gridConstrain20x20 = function(id, current, delta) {
    return {
        left:(20 * Math.floor( (current[0] + delta.left) / 20 )) - current[0],
        top:(20 * Math.floor( (current[1] + delta.top) / 20 )) - current[1]
    };
};
```

The demo page uses a curried version of this to allow you to set an arbitrary grid size:

```javascript
var gridConstrain = function(gridX, gridY) {
    return function(id, current, delta) {
        return {
            left:(gridX * Math.floor( (current[0] + delta.left) / gridX )) - current[0],
            top:(gridY * Math.floor( (current[1] + delta.top) / gridY )) - current[1]
        };
    };
};
```


#### Constructor Parameters

This is the full list of constructor parameters:

- **getPosition(el)** - Function that takes an element from your list and returns its position as a JS object in the form `{left..., top:...}`
- **setPosition(id, p)** - Function that takes an element id and position, and applies that position to the related element.
- **getSize(el)** - Function that takes an element from your list and returns its size as an array in the form `[width, height]`
- **getId(el)** - Function that takes an element from your list and returns its id.
- **padding** - Optional array of padding values for the x and y axes. Defaults to `[20,20]`.
- **container** - Optional element whose origin is the origin of your coordinate system.
- **getContainerPosition(container)** - Optional function that returns the page offset of your `container` element. Required if you supply a `container`.
- **constrain:function(id, current, delta)** - Optional function that constrains movement of your elements.
- **origin** - Optional [x,y] magnetization origin.

#### Extras

A couple of internal methods are exposed for external use:

- Farahey.paddedRectangle = function(o, s, p) { ... }

Takes three arrays - `o` is the element's offset, `s` is its size, and `p` is the desired padding in each axis, and 
returns a rectangle that pads the element with the desired padding values.

- Farahey.calculateSpacingAdjustment = function(r1, r2, angle) { ... }

Takes two rectangles in the form `{ x:..., y:..., w:..., h:... }` and calculates how far to move r2 such that the two 
rectangles do not overlap.  `angle` denotes the angle of travel for r2, and if not supplied is calculated by drawing a 
line between the centers of the two rectangles.

#### Examples

This is the source from the various examples on the [demo page](index.html).

##### 1. click to magnetize at event location

Here the magnetizer's origin is set to be the location of the click event. `_offset` and `_setOffset` are functions the 
demo page uses to get/set absolute positions on the style of some element.

```javascript
var m1 = new Magnetizer({
    container:$("#demo1"),
    getPosition:_offset,
    getSize:function(id) { return [ $("#" + id).outerWidth(), $("#" + id).outerHeight() ]; },
    getId : function(id) { return id; },
    setPosition:_setOffset,
    getContainerPosition:function(c) { return c.offset(); },
    elements:["d1\_w5", "d1\_w4", "d1\_w1", "d1\_w2", "d1\_w3"]
});
$("#demo1").bind("click", function(e) { m1.executeAtEvent(e); });
```

##### 2. click to magnetize at center of elements

	var m2 = new Magnetizer({
		getPosition:_offset,
		getSize:function(id) { return [ $("#" + id).outerWidth(), $("#" + id).outerHeight() ]; },
		getId : function(id) { return id; },
		setPosition:_setOffset,
		elements:["d2\_w5", "d2\_w4", "d2\_w1", "d2\_w2", "d2\_w3"]
	});
	$("#demo2").bind("click", function(e) { m2.executeAtCenter(); });

#####  3. click to magnetize at fixed location

	var m3 = new Magnetizer({
		getPosition:_offset,
		getSize:function(id) { return [ $("#" + id).outerWidth(), $("#" + id).outerHeight() ]; },
		getId : function(id) { return id; },
		setPosition:_setOffset,
		elements:["d3_w5", "d3_w4", "d3_w1", "d3_w2", "d3_w3"]
	});
	$("#demo3").bind("click", function(e) { m3.execute([150,150]); });

##### 4. click to magnetize at event location with grid constrain

	var gridConstrain = function(gridX, gridY) {
		return function(id, current, delta) {
			return {
				left:(gridX * Math.floor( (current[0] + delta.left) / gridX )) - current[0],
				top:(gridY * Math.floor( (current[1] + delta.top) / gridY )) - current[1]
			};
		};
	};

	var m4 = new Magnetizer({
		container:$("#demo4"),
		getPosition:_offset,
		getSize:function(id) { return [ $("#" + id).outerWidth(), $("#" + id).outerHeight() ]; },
		getId : function(id) { return id; },
		setPosition:_setOffset,
		elements:["d4_w5", "d4_w4", "d4_w1", "d4_w2", "d4_w3"],
		getContainerPosition:function(c) { return c.offset(); },
		constrain:gridConstrain(20,20)

	});
	$("#demo4").bind("click", function(e) { m4.executeAtEvent(e); });	

##### 5. continuous magnetization on mousemove

	var m5 = new Magnetizer({
		container:$("#demo5"),
		getPosition:_offset,
		getSize:function(id) { return [ $("#" + id).outerWidth(), $("#" + id).outerHeight() ]; },
		getId : function(id) { return id; },
		setPosition:_setOffset,
		elements:["d5_w5", "d5_w4", "d5_w1", "d5_w2", "d5_w3"],
		getContainerPosition:function(c) { return c.offset(); }

	});
	$("#demo5").bind("mousemove", function(e) { m5.executeAtEvent(e); });

##### 6. continuous magnetization on mousemove with grid

	var m6 = new Magnetizer({
		container:$("#demo6"),
		getPosition:_offset,
		getSize:function(id) { return [ $("#" + id).outerWidth(), $("#" + id).outerHeight() ]; },
		getId : function(id) { return id; },
		setPosition:_setOffset,
		elements:["d6_w5", "d6_w4", "d6_w1", "d6_w2", "d6_w3"],
		getContainerPosition:function(c) { return c.offset(); },
		constrain:gridConstrain(20,20)

	});
	$("#demo6").bind("mousemove", function(e) { m6.executeAtEvent(e); });

##### 7. magnetize without moving element that was clicked on

	var _elsToFilter = {},
		_filter = function(id) {
			return _elsToFilter[id] == null;
		};

	var m7 = new Magnetizer({
		container:$("#demo7"),
		getContainerPosition:function(c) { return c.offset(); },
		getPosition:_offset,
		getSize:function(id) { return [ $("#" + id).outerWidth(), $("#" + id).outerHeight() ]; },
		getId : function(id) { return id; },
		setPosition:_setOffset,
		elements:["d7_w5", "d7_w4", "d7_w1", "d7_w2", "d7_w3"],
		filter:_filter
	});

	$("#demo7 div").bind("click", function(e) { 
		_elsToFilter = {};
		_elsToFilter[$(this).attr("id")] = true;
		m7.executeAtEvent(e); 
	});	

