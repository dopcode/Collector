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
    dopcode.collector.createTask(issueId);
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if(info.menuItemId === ITEM_ID_CREATE) {
        var issueId = dopcode.collector.getIssueId(tab.url);
        dopcode.collector.create(issueId);
    }
    else if(info.menuItemId === ITEM_ID_COLLECT) {
        var issueId = dopcode.collector.getIssueId(tab.url);
        dopcode.collector.collect(issueId);
    }
    else if(info.menuItemId === ITEM_ID_CREATES) {
        dopcode.collector.creates(tab.url);
    }
    else if(info.menuItemId === ITEM_ID_COLLECTS) {
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




// dopcode.collector ===========================================================
dopcode.collector.currentTabId = "";

dopcode.collector.getIssueId = function(issueUrl) {
    var id = issueUrl.split('/');
    return id[id.length -1];
}

dopcode.collector.setMenus = function(tabId) {
    currentTabId = tabId;
    chrome.tabs.get(currentTabId, function(tab) {
        chrome.pageAction.setIcon({tabId: tabId, path: 'icons/icon-48.png'});
        chrome.contextMenus.removeAll( function() {
        });

        if(dopcode.collector.pageType(tab.url) === "issue") {
            chrome.pageAction.show(tabId);
            chrome.contextMenus.create({"title": "\ud560 \uc77c \ub4f1\ub85d", "contexts":["all"], "id": ITEM_ID_CREATE}); // 할 일 등록
            chrome.contextMenus.create({"title": "\uc77c\uac10 \uc815\ub9ac", "contexts": ["all"], "id": ITEM_ID_COLLECT}); // 일감 정리
        }
        else if(dopcode.collector.pageType(tab.url) === "issues") {
            chrome.pageAction.show(tabId);
            chrome.contextMenus.create({"title": "\ud560 \uc77c \ubaa9\ub85d \ub4f1\ub85d", "contexts":["all"], "id": ITEM_ID_CREATES}); // 할 일 목록 등록
            chrome.contextMenus.create({"title": "\uc77c\uac10 \ubaa9\ub85d \uc815\ub9ac", "contexts": ["all"], "id": ITEM_ID_COLLECTS}); // 일감 목록 정리
        }
    });
}

dopcode.collector.setOptions = function() {
    chrome.storage.sync.get({
        redmine_url: "", 
        redmine_project: "", 
        redmine_key: "", 
        google_task_id: "@default", 
        google_event_id: ""
    }, function(items) {
        REDMINE_URL = items.redmine_url;
        REDMINE_PROJECT = items.redmine_project;
        REDMINE_KEY = items.redmine_key;
        GOOGLE_TASK_ID = encodeURIComponent(items.google_task_id);
        GOOGLE_EVENT_ID = encodeURIComponent(items.google_event_id);
        REDMINE_ISSUE_URL = REDMINE_URL + "/issues";
        REDMINE_ISSUES_URL = REDMINE_URL + "/projects/" + REDMINE_PROJECT + "/issues?";
        REDMINE_ISSUES_API_URL = REDMINE_URL + "/issues.json";        
        REDMINE_TIME_ENTRIES_API_URL = REDMINE_URL + "/time_entries.json";
        GOOGLE_TASK_API_URL = "https://www.googleapis.com/tasks/v1/lists/" + GOOGLE_TASK_ID + "/tasks";
        GOOGLE_EVENT_API_URL = "https://www.googleapis.com/calendar/v3/calendars/" + GOOGLE_EVENT_ID + "/events";
    });
}

dopcode.collector.pageType = function(currentUrl) {
    if(currentUrl.indexOf(REDMINE_ISSUE_URL) === 0) {
        return "issue";
    }
    else if(currentUrl.indexOf(REDMINE_ISSUES_URL) === 0) {
        return "issues";
    }
    return "undefined";
}

dopcode.collector.create = function (issueId) {
    Promise.resolve(issueId)    
    .then(dopcode.collector.redmine.issue.get)
    .then(dopcode.collector.google.tasks.insert)
    .catch(function(error) {
        console.error(error);
    });
}

dopcode.collector.creates = function (url) {
    Promise.resolve(url)
    .then(dopcode.collector.redmine.issue.list)
    .then(function(issues) {
        for( var i = 0; i < issues.length; i++) {
            dopcode.collector.create(issues[i].id);
        }        
    })
    .catch(function(error) {
        console.error(error);
    });
}

dopcode.collector.collect = function (issueId) {
    Promise.resolve(issueId)
    .then(dopcode.collector.google.calendar.events.list)
    .then(function(timeEntries){
        var issueId = timeEntries.issueId;
        var events = timeEntries.events.items;
        var syncedHours = 0.0;
        for (var i in events) {
            dopcode.collector.redmine.timeEntries.insert(issueId, events[i]);
            var hours = ((new Date(events[i].end.dateTime).getTime() - new Date(events[i].start.dateTime).getTime()) / (1000 * 60 * 60)).toFixed(1);
            syncedHours += Number(hours);
            dopcode.collector.google.calendar.events.update(issueId, events[i]);
        }
        
        if(events.length == 0) {
            alert("#" + issueId + ": No data to collect");
        }
        else {
            alert("#" + issueId + ": " + events.length + "times, " + syncedHours + "hours");
        }
    })
    .catch(function(error) {
        console.error(error);
    });
}

dopcode.collector.collects = function (url) {
    Promise.resolve(url)
    .then(dopcode.collector.redmine.issue.list)
    .then(function(issues) {
        for( var i = 0; i < issues.length; i++) {
            dopcode.collector.collect(issues[i].id);
        }        
    })
    .catch(function(error) {
        console.error(error);
    });
}




// dopcode.collector.redmine.issue =============================================
dopcode.collector.redmine.issue.get = function (issueId) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest(), 
            url = REDMINE_ISSUE_URL + "/" + issueId + ".json?key=" + REDMINE_KEY;
        
        xhr.onload = function() {
            if(xhr.status == 200) {
                resolve(JSON.parse(xhr.responseText).issue);
            }
            else {
                reject(new Error(xhr.statusText));
            }
        };
        
        xhr.onerror = function () {
            reject(new Error(xhr.statusText));
        };
        
        xhr.open("get", url, true);
        xhr.send();
    });
}

dopcode.collector.redmine.issue.list = function (url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest(); 

        xhr.onload = function() {
            if(xhr.status == 200) {
                
                var issues = JSON.parse(xhr.responseText)
                resolve(issues.issues);
                alert("Synced : " + issues.total_count + " issues");
            }
            else {
                reject(new Error(xhr.statusText));
            }
        };
        
        xhr.onerror = function () {
            reject(new Error(xhr.statusText));
        };
        
        var tabUrl = url.replace( /\/issues\?/, "\/issues.json\?");
        xhr.open("get", tabUrl, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-Redmine-API-Key", REDMINE_KEY);
        xhr.send();
    });
}


// dopcode.collector.redmine.timeEntries =======================================
dopcode.collector.redmine.timeEntries.insert = function (issueId, event) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest(), 
            url = REDMINE_TIME_ENTRIES_API_URL,
            activityId = "10", 
            spentOn = new Date(event.start.dateTime).format("yyyy-MM-dd"), 
            hours = ((new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()) / (1000 * 60 * 60)).toFixed(1), 
            comments = event.summary.replace(/^\s*\[.*,.*#\d{5},.*w.*\]\s*/, ""), 
            key = REDMINE_KEY, 
            data = {time_entry: {issue_id: issueId, activity_id: activityId, spent_on: spentOn, hours: hours, comments: comments}};

        xhr.onload = function() {
            if(xhr.status == 201) {
                console.dir(timeEntries);
            }
            else {
                reject(new Error(xhr.statusText));
            }
        };
        
        xhr.onerror = function () {
            reject(new Error(xhr.statusText));
        };
            
        xhr.open("post", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-Redmine-API-Key", REDMINE_KEY);
        xhr.send(JSON.stringify(data));
    });
}




// dopcode.collector.google.tasks ==============================================
dopcode.collector.google.tasks.insert = function (issue) {
    new Promise(function (resolve, reject) {
        chrome.identity.getAuthToken({ 'interactive': true }, function(token){
            resolve(token);
        });
    })
    .then(function(token) {
        new Promise(function (resolve, reject) {    
            var xhr = new XMLHttpRequest(),
                url = GOOGLE_TASK_API_URL, 
                site = issue.custom_fields[0].value, 
                subject = issue.subject, 
                issueId = issue.id,
                title = "[" + site + ", #" + issueId + ", w] " + issue.subject
                data = "";
    
            if(!issue.due_date) {
                var date = new Date ();
                date.setHours ( new Date().getHours() + 9);
    
                data = {title: title, due: date};
            }
            else {
                data = {title: title, due: new Date(issue.due_date + " 09:00:00")};
            }
            
            xhr.onload = function() {
                if(xhr.status == 200) {
                    alert(title + " at " + dopcode.collector.utils.format(data.due));
                }
                else {
                    reject(new Error(xhr.statusText));
                }
            };
            
            xhr.onerror = function () {
                reject(new Error(xhr.statusText));
            };
            
            xhr.open("post", url, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Authorization", "OAuth " + token);
            xhr.send(JSON.stringify(data));
        });
    });
}




// dopcode.collector.google.calendar.events ====================================
dopcode.collector.google.calendar.events.list = function (issueId) {
    return new Promise(function (resolve, reject) {
        chrome.identity.getAuthToken({ 'interactive': true }, function(token){
            resolve(token);
        });
    })
    .then(function(token) {
        return new Promise(function (resolve, reject) {   
            var xhr = new XMLHttpRequest(),
                google, 
                url = GOOGLE_EVENT_API_URL,
                data = "q=" + encodeURIComponent(issueId + ", w]") + "&orderBy=startTime&singleEvents=true";
    
            xhr.onload = function() {
                if(xhr.status == 200) {
                    resolve({issueId: issueId, events: JSON.parse(xhr.responseText)});
                }
                else {
                    reject(new Error(xhr.statusText));
                }
            };
            
            xhr.onerror = function () {
                reject(new Error(xhr.statusText));
            };
            
            xhr.open("get", url + "?" + data, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Authorization", "OAuth " + token);
            xhr.send();
        });
    });
}

dopcode.collector.google.calendar.events.update = function (issueId, event) {
    new Promise(function (resolve, reject) {
        chrome.identity.getAuthToken({ 'interactive': true }, function(token){
            resolve(token);
        });
    })
    .then(function(token) {
        new Promise(function (resolve, reject) {   
            var xhr = new XMLHttpRequest(),
                google, 
                url = GOOGLE_EVENT_API_URL + "/" + event.id, 
                summary = event.summary.replace(issueId + ', w', issueId + ''),
                data = { end: { dateTime: new Date(event.end.dateTime)}, start: { dateTime: new Date(event.start.dateTime)}, summary: summary};
    
            xhr.onload = function() {
                if(xhr.status == 200) {
                    resolve(JSON.parse(xhr.responseText));
                }
                else {
                    reject(new Error(xhr.statusText));
                }
            };
            
            xhr.onerror = function () {
                reject(new Error(xhr.statusText));
            };            
            
            xhr.open("put", url, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Authorization", "OAuth " + token);
            xhr.send(JSON.stringify(data));
        });
    });
}




//dopcode.collector.utils ======================================================
dopcode.collector.utils.format = function (date) {
    var week = ["\uc6d4", "\ud654", "\uc218", "\ubaa9", "\uae08", "\ud1a0", "\uc77c"];
    return date.toISOString().slice(5,10).replace(/-/g,".") + " (" + week[date.getDay()] + ")";   
}
