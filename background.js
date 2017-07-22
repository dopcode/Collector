//Listener ====================================================================
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    dopcode.collector.setOptions();
    dopcode.collector.setMenus(tabId);
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    dopcode.collector.setOptions();
    dopcode.collector.setMenus(activeInfo.tabId);
});

chrome.pageAction.onClicked.addListener(function(tab) {
    var issueId = dopcode.collector.getIssueId(tab.url);
    dopcode.collector.create(issueId);
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
	
	dopcode.collector.total.count = 0;
	dopcode.collector.result.count = 0;
	dopcode.collector.result.hours = 0;
	
    if(info.menuItemId === dopcode.collector.ITEM_ID_CREATE) {
        var issueId = dopcode.collector.getIssueId(tab.url);
        dopcode.collector.create(issueId);
    }
    else if(info.menuItemId === dopcode.collector.ITEM_ID_COLLECT) {
        var issueId = dopcode.collector.getIssueId(tab.url);
        dopcode.collector.collect(issueId);
    }
    else if(info.menuItemId === dopcode.collector.ITEM_ID_CREATES) {
        dopcode.collector.creates(tab.url);
    }
    else if(info.menuItemId === dopcode.collector.ITEM_ID_COLLECTS) {
        dopcode.collector.collects(tab.url);
    }
});




// dopcode =====================================================================
var dopcode = dopcode || {};

dopcode.ns = function (ns_string) {  
    var sections = ns_string.split("."),
        parent = dopcode,
        i;

    if (sections[0] === "dopcode") {
        sections = sections.slice(1);
    }

    var s_length = sections.length;
    for (i=0; i<s_length; i+=1) {
        if (typeof parent[sections[i]] === "undefined") {
            parent[sections[i]] = {};
        }
        parent = parent[sections[i]];
    }
    return parent;
};




// dopcode namespaces ==========================================================
dopcode.collector                           = dopcode.ns("dopcode.collector");
dopcode.collector.redmine                   = dopcode.ns("dopcode.collector.redmine");
dopcode.collector.redmine.issue             = dopcode.ns("dopcode.collector.redmine.issue");
dopcode.collector.redmine.timeEntries       = dopcode.ns("dopcode.collector.redmine.timeEntries");
dopcode.collector.google                    = dopcode.ns("dopcode.collector.google");
dopcode.collector.google.tasks              = dopcode.ns("dopcode.collector.google.tasks");
dopcode.collector.google.calendar           = dopcode.ns("dopcode.collector.google.calendar");
dopcode.collector.google.calendar.events    = dopcode.ns("dopcode.collector.google.calendar.events");
dopcode.collector.utils                     = dopcode.ns("dopcode.collector.utils");
dopcode.collector.total						= dopcode.ns("dopcode.collector.total");
dopcode.collector.result					= dopcode.ns("dopcode.collector.result");




// dopcode.collector ===========================================================
dopcode.collector.ITEM_ID_CREATE = "CREATE";
dopcode.collector.ITEM_ID_COLLECT = "COLLELCT";
dopcode.collector.ITEM_ID_CREATES = "CREATES";
dopcode.collector.ITEM_ID_COLLECTS = "COLLELCTS";

dopcode.collector.REDMINE_URL = "";
dopcode.collector.REDMINE_PROJECT = "";
dopcode.collector.REDMINE_KEY = "";
dopcode.collector.REDMINE_ISSUE_URL = "";
dopcode.collector.REDMINE_ISSUES_URL = "";
dopcode.collector.REDMINE_PROJECT_URL = "";
dopcode.collector.REDMINE_ISSUES_API_URL = "";        
dopcode.collector.REDMINE_TIME_ENTRIES_API_URL = "";

dopcode.collector.GOOGLE_OAUTH_SCOPE = "https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/calendar";
dopcode.collector.GOOGLE_TASK_TITLE_PATTERN = "";
dopcode.collector.GOOGLE_TASK_ID = "";
dopcode.collector.GOOGLE_EVENT_ID = "";
dopcode.collector.GOOGLE_TASK_API_URL = "";
dopcode.collector.GOOGLE_EVENT_API_URL = "";

<<<<<<< HEAD
dopcode.collector.LIMIT = 100;

dopcode.collector.total.count = 0;
dopcode.collector.result.count = 0;
dopcode.collector.result.hours = 0;
=======
//dopcode.collector.LIMIT = 100;
dopcode.collector.LIMIT = 2;
>>>>>>> branch 'master' of https://github.com/dopcode/dopcode-collector.git




dopcode.collector.getIssueId = function(issueUrl) {
    var id = issueUrl.split('/');
    return id[id.length -1];
}

dopcode.collector.setMenus = function(tabId) {
    var currentTabId = tabId;
    chrome.tabs.get(currentTabId, function(tab) {
        chrome.pageAction.setIcon({tabId: tabId, path: 'icons/icon-48.png'});
        chrome.contextMenus.removeAll();

        if(dopcode.collector.pageType(tab.url) === "issue") {
            chrome.pageAction.show(tabId);
            // M001
            chrome.contextMenus.create({"title": "Google Tasks \ud560 \uc77c\ub85c \ub4f1\ub85d\ud558\uae30", "contexts":["all"], "id": dopcode.collector.ITEM_ID_CREATE});
            // M002
            chrome.contextMenus.create({"title": "Google Calendar\uc5d0 \ub4f1\ub85d\ub41c \uc791\uc5c5 \ub0b4\uc5ed\uc744 \uc815\ub9ac\ud558\uae30", "contexts": ["all"], "id": dopcode.collector.ITEM_ID_COLLECT});
        }
        else if(dopcode.collector.pageType(tab.url) === "issues") {
            chrome.pageAction.show(tabId);
            // M003
            chrome.contextMenus.create({"title": "\ud55c\ubc88\uc5d0 Google Tasks \ud560 \uc77c\ub85c \ub4f1\ub85d\ud558\uae30", "contexts":["all"], "id": dopcode.collector.ITEM_ID_CREATES});
            // M004
            chrome.contextMenus.create({"title": "\ud55c\ubc88\uc5d0 Google Calendar\uc5d0 \ub4f1\ub85d\ub41c \uc791\uc5c5 \ub0b4\uc5ed\uc744 \uc815\ub9ac\ud558\uae30", "contexts": ["all"], "id": dopcode.collector.ITEM_ID_COLLECTS});
        }
    });
}

dopcode.collector.setOptions = function() {
    
    chrome.identity.getProfileUserInfo(function(userInfo){
        chrome.storage.sync.get({
            redmine_url: "", 
            redmine_project: "", 
            redmine_key: "", 
            google_task_title_pattern: ""
        }, function(items) {
            dopcode.collector.REDMINE_URL = items.redmine_url;
            dopcode.collector.REDMINE_PROJECT = items.redmine_project;
            dopcode.collector.REDMINE_KEY = items.redmine_key;
            dopcode.collector.GOOGLE_TASK_TITLE_PATTERN = items.google_task_title_pattern;
            dopcode.collector.GOOGLE_TASK_ID = encodeURIComponent("@default");
            dopcode.collector.GOOGLE_EVENT_ID = encodeURIComponent(userInfo.email);
            dopcode.collector.REDMINE_ISSUE_URL = dopcode.collector.REDMINE_URL + "/issues";
//            dopcode.collector.REDMINE_ISSUES_URL = dopcode.collector.REDMINE_URL + "/projects/" + dopcode.collector.REDMINE_PROJECT + "/issues?";
            dopcode.collector.REDMINE_ISSUES_URL = dopcode.collector.REDMINE_URL + "/projects/" + dopcode.collector.REDMINE_PROJECT + "/issues";
            dopcode.collector.REDMINE_ISSUES_API_URL = dopcode.collector.REDMINE_URL + "/issues.json";        
            dopcode.collector.REDMINE_TIME_ENTRIES_API_URL = dopcode.collector.REDMINE_URL + "/time_entries.json";
            dopcode.collector.GOOGLE_TASK_API_URL = "https://www.googleapis.com/tasks/v1/lists/" + dopcode.collector.GOOGLE_TASK_ID + "/tasks";
            dopcode.collector.GOOGLE_EVENT_API_URL = "https://www.googleapis.com/calendar/v3/calendars/" + dopcode.collector.GOOGLE_EVENT_ID + "/events";
        });
    });
}

dopcode.collector.pageType = function(currentUrl) {
    if(currentUrl.indexOf(dopcode.collector.REDMINE_ISSUE_URL) === 0) {
        return "issue";
    }
    else if(currentUrl.indexOf(dopcode.collector.REDMINE_ISSUES_URL) === 0) {
        return "issues";
    }
    return "undefined";
}

dopcode.collector.create = function (issueId) {
    dopcode.collector.redmine.issue.get(issueId);
}

dopcode.collector.creates = function (url) {
    
    var xhr = new XMLHttpRequest(),
	    result, 
	    offset = 0,
	    page;

	xhr.onload = function() {
	    if(xhr.status == 200) {
	        result = JSON.parse(xhr.responseText);
	        
	        // M011
	        alert("\ucc98\ub9ac \ub300\uc0c1\uc740 " + result.total_count + "\uac74\uc785\ub2c8\ub2e4.");
	
	        page = Math.ceil(result.total_count / dopcode.collector.LIMIT);
	        do {
	            dopcode.collector.redmine.issue.list(url, (offset * dopcode.collector.LIMIT), dopcode.collector.create);
	            offset += 1;
	        }
	        while (offset < page);
<<<<<<< HEAD
	    }
	    else {
	        new Error(JSON.parse(xhr.responseText));
	    }
	};
	
	xhr.onerror = function () {
	    new Error(JSON.parse(xhr.responseText));
	};
	
	var tabUrl = url.replace( /\/issues\?/, "\/issues.json\?");
	tabUrl += "&sort=due_date:asc&offset=0&limit=" + dopcode.collector.LIMIT;

	if(tabUrl.search("/issues&") > -1) {
		// M013
		alert("\uc791\uc5c5 \ubaa9\ub85d \uc870\ud68c\ub97c \uc704\ud574\uc11c \uba85\ud655\ud55c \uac80\uc0c9 \uc870\uac74\uc744 \uc801\uc6a9\ud574 \uc8fc\uc2ed\uc2dc\uc624.");
		return;
	}
=======
	
	    }
	    else {
	        new Error(JSON.parse(xhr.responseText));
	    }
	};
	
	xhr.onerror = function () {
	    new Error(JSON.parse(xhr.responseText));
	};
	
	var tabUrl = url.replace( /\/issues\?/, "\/issues.json\?");
	tabUrl += "&sort=due_date:asc&offset=0&limit=" + dopcode.collector.LIMIT;
>>>>>>> branch 'master' of https://github.com/dopcode/dopcode-collector.git
	
	xhr.open("get", tabUrl, true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.setRequestHeader("X-Redmine-API-Key", dopcode.collector.REDMINE_KEY);
	xhr.send();    
}

<<<<<<< HEAD
dopcode.collector.collect = function (issueId, index) {
    dopcode.collector.google.calendar.events.list(issueId, index);
=======
dopcode.collector.collect = function (issueId) {
    dopcode.collector.google.calendar.events.list(issueId);
>>>>>>> branch 'master' of https://github.com/dopcode/dopcode-collector.git
}

dopcode.collector.collects = function (url) {
	
    var xhr = new XMLHttpRequest(),
        result, 
        offset = 0,
        page;

    xhr.onload = function() {
        if(xhr.status == 200) {
            result = JSON.parse(xhr.responseText);
            
            // M011
            alert(result.total_count + "\uac74\uc758 \uc77c\uac10\uc5d0 \ub300\ud574\uc11c \uc815\ub9ac\ub97c \uc2dc\uc791\ud569\ub2c8\ub2e4.");

            page = Math.ceil(result.total_count / dopcode.collector.LIMIT);
            
            dopcode.collector.total.count = result.total_count;
            
            do {
                dopcode.collector.redmine.issue.list(url, (offset * dopcode.collector.LIMIT), dopcode.collector.collect);
                offset += 1;
            }
            while (offset < page);

        }
        else {
            new Error(JSON.parse(xhr.responseText));
        }
    };
    
    xhr.onerror = function () {
        new Error(JSON.parse(xhr.responseText));
    };
    
    var tabUrl = url.replace( /\/issues\?/, "\/issues.json\?");
    tabUrl += "&sort=due_date:asc&offset=0&limit=" + dopcode.collector.LIMIT;
    tabUrl = tabUrl.replace( /\/issues&/, "\/issues.json\?");
    
    xhr.open("get", tabUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-Redmine-API-Key", dopcode.collector.REDMINE_KEY);
    xhr.send();
}




dopcode.collector.redmine.issue.list = function (url, offset, callback) {
    var xhr = new XMLHttpRequest(),
        result, 
        issues; 

    xhr.onload = function() {
        if(xhr.status == 200) {
            result = JSON.parse(xhr.responseText);
            issues = result.issues;
            for( var i = 0; i < issues.length; i++) {
<<<<<<< HEAD
                callback(issues[i].id, (i + offset));
=======
                callback(issues[i].id);
>>>>>>> branch 'master' of https://github.com/dopcode/dopcode-collector.git
            }
            
        }
        else {
            new Error(JSON.parse(xhr.responseText));
        }
    };
    
    xhr.onerror = function () {
        new Error(JSON.parse(xhr.responseText));
    };
    
    var tabUrl = url.replace( /\/issues\?/, "\/issues.json\?");
    tabUrl += "&sort=due_date:asc&offset=" + offset + "&limit=" + dopcode.collector.LIMIT;
    tabUrl = tabUrl.replace( /\/issues&/, "\/issues.json\?");

    xhr.open("get", tabUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-Redmine-API-Key", dopcode.collector.REDMINE_KEY);
    xhr.send();
}




// dopcode.collector.redmine.issue =============================================
dopcode.collector.redmine.issue.get = function (issueId) {
    var xhr = new XMLHttpRequest(), 
        url = dopcode.collector.REDMINE_ISSUE_URL + "/" + issueId + ".json?key=" + dopcode.collector.REDMINE_KEY,
        issue;
    
    xhr.onload = function() {
        if(xhr.status == 200) {
        	issue = JSON.parse(xhr.responseText).issue;
            dopcode.collector.google.tasks.insert(issue);
        }
        else {
<<<<<<< HEAD
    		// M013
    		alert("\uc791\uc5c5 \ub300\uc0c1\uc774 \ubd84\uba85\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4. \uc77c\uac10 \uac80\uc0c9 \ud6c4 \ub2e4\uc2dc \uc2dc\ub3c4\ud574 \uc8fc\uc2ed\uc2dc\uc624.");
=======
>>>>>>> branch 'master' of https://github.com/dopcode/dopcode-collector.git
            new Error(JSON.parse(xhr.responseText));
        }
    };
    
    xhr.onerror = function () {
        new Error(JSON.parse(xhr.responseText));
    };
    
    xhr.open("get", url, true);
    xhr.send();
}




// dopcode.collector.redmine.timeEntries =======================================
dopcode.collector.redmine.timeEntries.insert = function (issueId, event) {
    var xhr = new XMLHttpRequest(), 
        url = dopcode.collector.REDMINE_TIME_ENTRIES_API_URL,
        activityId = "10", 
        spentOn = new Date(event.start.dateTime).toISOString().slice(0,10), 
        hours = ((new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()) / (1000 * 60 * 60)).toFixed(1), 
        comments = event.summary.replace(/^\s*\[.*,.*#\d{5},.*w.*\]\s*/, ""), 
        key = dopcode.collector.REDMINE_KEY, 
        data = {time_entry: {issue_id: issueId, activity_id: activityId, spent_on: spentOn, hours: hours, comments: comments}};

    xhr.onload = function() {
        if(xhr.status == 201) {
//            JSON.parse(xhr.responseText);
        }
        else {
            new Error(JSON.parse(xhr.responseText));
        }
    };
    
    xhr.onerror = function () {
        new Error(JSON.parse(xhr.responseText));
    };
        
    xhr.open("post", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-Redmine-API-Key", dopcode.collector.REDMINE_KEY);
    xhr.send(JSON.stringify(data));
}




// dopcode.collector.google.tasks ==============================================
dopcode.collector.google.tasks.insert = function (issue) {
	chrome.identity.getAuthToken({ 'interactive': true }, function(token){
		var xhr = new XMLHttpRequest(),
            url = dopcode.collector.GOOGLE_TASK_API_URL, 
            site = issue.custom_fields[0].value, 
            title = eval("`" + dopcode.collector.GOOGLE_TASK_TITLE_PATTERN + "`"), 
            date = new Date(), 
            data = {title: title, due: date};

        if(issue.due_date) {
            data.due = new Date(issue.due_date);
        }
        
        xhr.onload = function() {
            if(xhr.status == 200) {
            	// M005
                alert(dopcode.collector.utils.format(data.due) + "\uc5d0 Google Tasks \ud560 \uc77c\uc774 \ub4f1\ub85d\ub418\uc5c8\uc2b5\ub2c8\ub2e4.\n\n" + title);
            }
            else {
                new Error(JSON.parse(xhr.responseText));
            }
        };
        
        xhr.onerror = function () {
            new Error(JSON.parse(xhr.responseText));
        };
        
        xhr.open("post", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "OAuth " + token);
        xhr.send(JSON.stringify(data));
    });
}




// dopcode.collector.google.calendar.events ====================================
<<<<<<< HEAD
dopcode.collector.google.calendar.events.list = function (issueId, index) {
    chrome.identity.getAuthToken({ 'interactive': true }, function(token){
        var xhr = new XMLHttpRequest(),
	        google, 
	        url = dopcode.collector.GOOGLE_EVENT_API_URL,
	        data = "q=" + encodeURIComponent(issueId + ", w]") + "&orderBy=startTime&singleEvents=true", 
	        events, 
	        hours = 0;

	    xhr.onload = function() {
	        if(xhr.status == 200) {
	            events = JSON.parse(xhr.responseText).items;
	
	            for (var i in events) {
	                dopcode.collector.redmine.timeEntries.insert(issueId, events[i]);
	                hours += Number(((new Date(events[i].end.dateTime).getTime() - new Date(events[i].start.dateTime).getTime()) / (1000 * 60 * 60)).toFixed(1));
	                dopcode.collector.google.calendar.events.update(issueId, events[i]);
	            }
	            
	            if(events.length > 0) {
	            	// M006
	                alert("#" + issueId + " \uc77c\uac10\uc758 Google Calendar\uc5d0 \ub4f1\ub85d\ub41c \uc791\uc5c5 \ub0b4\uc5ed\uc744 \uc815\ub9ac\ud588\uc2b5\ub2c8\ub2e4.\n\n" + events.length + "\ud68c, " + hours + "\uc2dc\uac04");

	                dopcode.collector.result.count += 1;
	                dopcode.collector.result.hours += hours;
	            }
//	            else {
//	            	// M007
//	                alert("#" + issueId + "\uc740 Google Calendar\uc5d0 \ub4f1\ub85d\ub41c \uc815\ub9ac\ud560 \uc791\uc5c5 \ub0b4\uc5ed\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.");
//	            }
	            
	            if(dopcode.collector.total.count === (index + 1)) {
	            	alert(dopcode.collector.total.count + "\uac74\uc758 \uc77c\uac10\uc744 \uc815\ub9ac\ud588\uc2b5\ub2c8\ub2e4.\n\n" + dopcode.collector.result.count + "\uac1c \uc77c\uac10, \ucd1d " + dopcode.collector.result.hours + "\uc2dc\uac04");	            	
	            }
	            
=======
dopcode.collector.google.calendar.events.list = function (issueId) {
    chrome.identity.getAuthToken({ 'interactive': true }, function(token){
        var xhr = new XMLHttpRequest(),
	        google, 
	        url = dopcode.collector.GOOGLE_EVENT_API_URL,
	        data = "q=" + encodeURIComponent(issueId + ", w]") + "&orderBy=startTime&singleEvents=true", 
	        events, 
	        hours = 0;

	    xhr.onload = function() {
	        if(xhr.status == 200) {
	            events = JSON.parse(xhr.responseText).items;
	
	            for (var i in events) {
	                dopcode.collector.redmine.timeEntries.insert(issueId, events[i]);
	                hours += Number(((new Date(events[i].end.dateTime).getTime() - new Date(events[i].start.dateTime).getTime()) / (1000 * 60 * 60)).toFixed(1));
	                dopcode.collector.google.calendar.events.update(issueId, events[i]);
	            }
	            
	            if(events.length > 0) {
	            	// M006
	                alert("#" + issueId + " \uc77c\uac10\uc758 Google Calendar\uc5d0 \ub4f1\ub85d\ub41c \uc791\uc5c5 \ub0b4\uc5ed\uc744 \uc815\ub9ac\ud588\uc2b5\ub2c8\ub2e4.\n\n" + events.length + "times, " + hours + "hours");
	            }
//	            else {
//	            	// M007
//	                alert("#" + issueId + "\uc740 Google Calendar\uc5d0 \ub4f1\ub85d\ub41c \uc815\ub9ac\ud560 \uc791\uc5c5 \ub0b4\uc5ed\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.");
//	            }
>>>>>>> branch 'master' of https://github.com/dopcode/dopcode-collector.git
	        }
	        else {
	            new Error(JSON.parse(xhr.responseText));
	        }
	    };
	    
	    xhr.onerror = function () {
	        new Error(JSON.parse(xhr.responseText));
	    };
	    
	    xhr.open("get", url + "?" + data, true);
	    xhr.setRequestHeader("Content-Type", "application/json");
	    xhr.setRequestHeader("Authorization", "OAuth " + token);
	    xhr.send();
    });
}

dopcode.collector.google.calendar.events.update = function (issueId, event) {
    chrome.identity.getAuthToken({ 'interactive': true }, function(token){
        var xhr = new XMLHttpRequest(),
	        google, 
	        url = dopcode.collector.GOOGLE_EVENT_API_URL + "/" + event.id, 
	        summary = event.summary.replace(issueId + ', w', issueId + ''),
	        data = { end: { dateTime: new Date(event.end.dateTime)}, start: { dateTime: new Date(event.start.dateTime)}, summary: summary};

	    xhr.onload = function() {
	        if(xhr.status == 200) {
//	            JSON.parse(xhr.responseText);
	        }
	        else {
	            new Error(JSON.parse(xhr.responseText));
	        }
	    };
	    
	    xhr.onerror = function () {
	        new Error(JSON.parse(xhr.responseText));
	    };            
	    
	    xhr.open("put", url, true);
	    xhr.setRequestHeader("Content-Type", "application/json");
	    xhr.setRequestHeader("Authorization", "OAuth " + token);
	    xhr.send(JSON.stringify(data));
    });
}




//dopcode.collector.utils ======================================================
dopcode.collector.utils.format = function (date) {
	// M008
    var week = ["\uc77c", "\uc6d4", "\ud654", "\uc218", "\ubaa9", "\uae08", "\ud1a0"];
    return date.toISOString().slice(5,10).replace(/-/g,".") + "(" + week[date.getDay()] + ")";   
}
