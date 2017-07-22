// Obeserver ===================================================================
var dopcode = {};
dopcode.observer = {};
dopcode.observer.events = {};
dopcode.total = 10;
dopcode.result = {
	count : 0,
	time : 0
};

//dopcode.observer.add = function(eventName, callback) {
//	dopcode.observer.events[eventName] = callback;
//}
//
//dopcode.observer.notify = function(eventName, data) {
//	dopcode.observer.events[eventName].call(dopcode.observer, data);
//}

dopcode.report = function(result) {
	console.log(result);
};
//dopcode.observer.add("result", dopcode.report);

dopcode.collects = function() {
	
	console.log("collects() is started!");
	
	for (var i = 0; i < dopcode.total; i++) {
		var count = i + 1, time = i + 1;
		dopcode.collect(count, time);
	}
	
	console.log("collects() is ended!");
}

dopcode.collect = function(index, time) {
	
	console.log(index);
	
	dopcode.result.count = index;
	dopcode.result.time += time;

	if (dopcode.result.count === dopcode.total) {
//		alert(dopcode.result.count + ", " + dopcode.result.time);
//		dopcode.observer.notify("result", dopcode.result);
		
		dopcode.report(dopcode.result);
	}
};

dopcode.collects();