var ITEM_ID_ADD_TO_TASK = "Add to Task";
var ITEM_ID_COLLECT_TIMELOGS = "Collect Timelogs";
var ITEM_ID_COLLECT_TIMELOGS_PROJECT = "Collect Project Timelogs";
var ITEM_ID_EXPORT_EVENTS = "Export Events";
var ITEM_ID_CREATE_ISSUES = "Create Issues";


var REDMINE_URL = "";
var REDMINE_PROJECT = "";
var REDMINE_KEY = "";
var REDMINE_ISSUE_URL = "";
var REDMINE_PROJECT_URL = "";
var REDMINE_TIME_ENTRIES_API_URL = "";

//var GOOGLE_CLIENT_ID = "452825330563-rg1hphodf8qe2li93b4vugpuj2jum687.apps.googleusercontent.com";
// REAL
//var GOOGLE_CLIENT_ID = "452825330563-0q4ao237q93jnrg19mthsa0oo6l065gq.apps.googleusercontent.com";
// DEV
//var GOOGLE_CLIENT_ID = "452825330563-18gjncr13tfsfpf2vvor55ljiikfe3pn.apps.googleusercontent.com";

//var GOOGLE_CLIENT_SECRET = "I6oU-unQ8DMSlNHyth5OO2Go";


//var GOOGLE_CLIENT_ID = "452825330563-4rsl6fsgdpp06nti2baq5qmu94hkbgak.apps.googleusercontent.com";
//var GOOGLE_CLIENT_SECRET = "bnMHV_-GzbtNlWxbI_xt8CJi";


var GOOGLE_OAUTH_SCOPE = "https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/calendar";
var GOOGLE_TASK_API_URL = "";
var GOOGLE_EVENT_API_URL = "";
var GOOGLE_CALENDAR_URL = "https://calendar.google.com/calendar";

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//    console.log("onUpdated!");
//    console.dir(changeInfo);

    setOptions();
    setMenus(tabId);
});

chrome.tabs.onHighlighted.addListener(function (highlightInfo) {
//    console.log("onHighlighted!");
//    console.dir(highlightInfo);
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
//    console.log("onActivated!");

    setOptions();
    setMenus(activeInfo.tabId);
});

chrome.pageAction.onClicked.addListener(function(tab) {

    var issueId = getIssueId(tab.url);
    getIssue(issueId, addTask);
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {


    // 2015-03-24T00:00:00+09:00
    // 2015-03-23T00:00:00+09:00

// console.log(getStartDate(info.selectionText));
// console.log(getEndDate(info.selectionText));


    var issueId = getIssueId(tab.url);
    
    if(info.menuItemId === ITEM_ID_ADD_TO_TASK) {
        getIssue(issueId, addTask);
    }
    else if(info.menuItemId === ITEM_ID_COLLECT_TIMELOGS) {
        getIssue(issueId, collectEvents);
    }
    else if(info.menuItemId === ITEM_ID_COLLECT_TIMELOGS_PROJECT) {
        // collectWaitEvents(getIssue);
        getProjectIssues(collectEventsQuietly);
    }    
    else if(info.menuItemId === ITEM_ID_EXPORT_EVENTS) {
        // collectEventsByDate("23576", exportEvents);
        // collectEventsByDate(getExportDate(info.selectionText), getStartDate(info.selectionText), getEndDate(info.selectionText), exportEvents);

        // alert(tab.title);
        var searchDate = getSearchDate(tab.title);
        // alert(searchDate[0] + " ~ " + searchDate[1]);

        var today = new Date().toISOString();
        today = today.replace(/\.\d{3}Z$|-|T|:|\./g, "");

        collectEventsByDate(today, getDate(searchDate[0]), getDate2(searchDate[1]), exportEvents);
    }
    else if(info.menuItemId === ITEM_ID_CREATE_ISSUES) {
        // collectEventsByDate("23576", exportEvents);
        // collectEventsByDate(getExportDate(info.selectionText), getStartDate(info.selectionText), getEndDate(info.selectionText), exportEvents);

        // alert(tab.title);
        var searchDate = getSearchDate(tab.title);
        // alert(searchDate[0] + " ~ " + searchDate[1]);

        collectTasksByDate(getDate(searchDate[0]), getDate2(searchDate[1]), createIssue);
    }    
});



function getDate(d) {

    // var date = (d.getFullYear() + "-0" + d.getMonth() + "-" + d.getDate() + encodeURIComponent("T00:00:00+09:00"));
    // var date = (d.getFullYear() + "-0" + (d.getMonth() + 1) + "-" + d.getDate() + encodeURIComponent("T00:00:00+09:00"));

    var date = (d.getFullYear() + "-" + d.format("MM") + "-" + d.format("dd") + encodeURIComponent("T00:00:00+09:00"));
    return date;
}

function getDate2(d) {



    // var date = (d.getFullYear() + "-0" + d.getMonth() + "-" + d.getDate() + encodeURIComponent("T00:00:00+09:00"));
    // var date = (d.getFullYear() + "-0" + d.getMonth() + "-" + d.getDate() + "T00:00:00+09:00");

//    var e = new Date(d.getFullYear() + "-" + d.format("MM") + "-" + d.format("dd"));

    d.setDate(d.getDate() + 1);

    var date = (d.getFullYear() + "-" + d.format("MM") + "-" + d.format("dd") + encodeURIComponent("T00:00:00+09:00"));
    return date;
}


function getExportDate(d) {

    var a = d.split(" ");
    var yyyy = a[0].substr(0, a[0].length -1);
    var MM = a[1].substr(0, a[1].length -1);
    var dd = a[2].substr(0, a[2].length -1);

    var date = (yyyy + MM + dd);
    return date;
}

// function getStartDate(d) {

//     var a = d.split(" ");
//     var yyyy = a[0].substr(0, a[0].length -1);
//     var MM = a[1].substr(0, a[1].length -1);
//     var dd = a[2].substr(0, a[2].length -1);

//     // var startDate = new Date(yyyy + "-" + MM + "-" + dd);
//     var startDate = (yyyy + "-" + MM + "-" + dd + encodeURIComponent("T00:00:00+09:00"));
//     return startDate;
// }

// function getEndDate(d) {

//     var a = d.split(" ");
//     var yyyy = a[0].substr(0, a[0].length -1);
//     var MM = a[1].substr(0, a[1].length -1);
//     var dd = Number(1) + Number(a[2].substr(0, a[2].length -1));

//     // var startDate = new Date(yyyy + "-" + MM + "-" + dd);
//     var endDate = (yyyy + "-" + MM + "-" + dd + encodeURIComponent("T00:00:00+09:00"));
//     return endDate;
// }




var pattern1 = /(\d{4}). (\d{1,2}). (\d{1,2}). \W (\d{1,2}). (\d{1,2}).$/;
var pattern2 = /(\d{4}). (\d{1,2}). (\d{1,2}). \W (\d{1,2}).$/;
var pattern3 = /(\d{4}). (\d{1,2}).. ... .$/;
var pattern4 = /(\d{4}). (\d{1,2}). (\d{1,2}).. ... .$/;
var pattern5 = /(\d{4}). (\d{1,2}). (\d{1,2}). \(.\)$/;
var pattern6 = /(\d{1,2}). (\d{1,2}). \(.\)$/;

function getSearchDate(strDate) {

    var searchDate = [];
    
    if(pattern1.test(strDate)) {
        var arrSearchDate = pattern1.exec(strDate);

        searchDate[0] = new Date(arrSearchDate[1] + "-" + arrSearchDate[2] + "-" + arrSearchDate[3]);
        searchDate[1] = new Date(arrSearchDate[1] + "-" + arrSearchDate[4] + "-" + arrSearchDate[5]);
    }
    else if(pattern2.test(strDate)) {
        var arrSearchDate = pattern2.exec(strDate);

        searchDate[0] = new Date(arrSearchDate[1] + "-" + arrSearchDate[2] + "-" + arrSearchDate[3]);
        searchDate[1] = new Date(arrSearchDate[1] + "-" + arrSearchDate[2] + "-" + arrSearchDate[4]);
    }
    else if(pattern3.test(strDate)) {
        var arrSearchDate = pattern3.exec(strDate);

        searchDate[0] = new Date(arrSearchDate[1] + "-" + arrSearchDate[2] + "-" + "1");
        searchDate[1] = new Date(searchDate[0]);
        searchDate[1].setMonth(searchDate[0].getMonth() + 1);
        searchDate[1].setDate(searchDate[0].getDate() - 1)
    }
    else if(pattern4.test(strDate)) {
        
        var arrSearchDate = pattern4.exec(strDate);
        
        searchDate[0] = new Date(arrSearchDate[1] + "-" + arrSearchDate[2] + "-" + arrSearchDate[3]);
        searchDate[1] = new Date(searchDate[0]);
        searchDate[1].setDate(searchDate[0].getDate() + 6);
    }
    else if(pattern5.test(strDate)) {
        var arrSearchDate = pattern5.exec(strDate);

        searchDate[0] = new Date( arrSearchDate[1] + "-" + arrSearchDate[2] + "-" + arrSearchDate[3])
        searchDate[1] = new Date(searchDate[0]);
    }
    else if(pattern6.test(strDate)) {
        var arrSearchDate = pattern6.exec(strDate);

        searchDate[0] = new Date( new Date().getFullYear() + "-" + arrSearchDate[1] + "-" + arrSearchDate[2])
        searchDate[1] = new Date(searchDate[0]);
    }

    return searchDate;

}

function collectEventsByDate(exportDate, startDate, endDate, exportEvents) {

    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {

        var xhr = new XMLHttpRequest(),
            google, 
            url = GOOGLE_EVENT_API_URL,
            // data = "q=" + encodeURIComponent("[#" + issueId + "]");
            data = "timeMin=" + startDate + "&timeMax=" + endDate;

            // alert(data);
            // data = "timeMin=" + startDate.toISOString() + "&timeMax=" + endDate.toISOString();
            // data = "timeMin=" + encodeURIComponent(startDate.toISOString()) + "&timeMax=" + encodeURIComponent(endDate.toISOString());
            // data = "timeMin=" + "2015-07-01"+encodeURIComponent("T00:00:00+09:00") + "&timeMax=" + "2015-07-31"+encodeURIComponent("T00:00:00+09:00");
            
            

        // google = new OAuth2("google", {
        //     client_id: GOOGLE_CLIENT_ID,
        //     client_secret: GOOGLE_CLIENT_SECRET,
        //     api_scope: GOOGLE_OAUTH_SCOPE
        // });
        //
        // google.authorize();

        xhr.onreadystatechange = function(e) {
            if (xhr.readyState == 4) {
                if(xhr.status == 200) {
                    var events = JSON.parse(xhr.responseText);
                    // console.dir(events);
                    // alert("Synced Events : " + events.items.length);

                    // var contents = ["a,b,c","\nd,e,f","\ng,h,i","\nj,k,l"];
                    // contents[0].creator.displayName()
                    // contents[0].summary
                    // contents[0].start.dateTime
                    // contents[0].end.dateTime

                    var contents = parseContents(events.items);

                    // var contents = item.summary.substr(item.summary.lastIndexOf("[")+2, 5) + "," + item.creator.displayName + "," + item.start.dateTime.substr(0, 10) + "," + item.summary.substr(1, item.summary.indexOf("]")-1) + "," + (item.summary.substr(item.summary.indexOf("]") + 1, item.summary.length - (item.summary.indexOf("]") + (item.summary.lastIndexOf("]") - item.summary.lastIndexOf("[") + 2))).trim()) + "," + item.start.dateTime.substr(11, 5) + "," + item.end.dateTime.substr(11, 5);
                    exportEvents(exportDate, contents);
                }
            }
        };
        xhr.open("get", url + "?" + data, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "OAuth " + token);
        xhr.send();

    })
}

function collectTasksByDate(startDate, endDate, createIssue) {

    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {

        var xhr = new XMLHttpRequest(),
            google, 
            url = GOOGLE_TASK_API_URL,
            // data = "q=" + encodeURIComponent("[#" + issueId + "]");
            data = "dueMin=" + startDate + "&dueMax=" + endDate;

            // alert(data);
            // data = "timeMin=" + startDate.toISOString() + "&timeMax=" + endDate.toISOString();
            // data = "timeMin=" + encodeURIComponent(startDate.toISOString()) + "&timeMax=" + encodeURIComponent(endDate.toISOString());
            // data = "timeMin=" + "2015-07-01"+encodeURIComponent("T00:00:00+09:00") + "&timeMax=" + "2015-07-31"+encodeURIComponent("T00:00:00+09:00");
            
            

        // google = new OAuth2("google", {
        //     client_id: GOOGLE_CLIENT_ID,
        //     client_secret: GOOGLE_CLIENT_SECRET,
        //     api_scope: GOOGLE_OAUTH_SCOPE
        // });
        //
        // google.authorize();

        xhr.onreadystatechange = function(e) {
            if (xhr.readyState == 4) {
                if(xhr.status == 200) {
                    var tasks = JSON.parse(xhr.responseText).items;
                    for (var i=0; i<tasks.length; i++) {
                        var title = tasks[i].title.match(/^\s*\[.*,.*#\d{5},.*w.*\]\s*/);
                        if(title == null) {
                            createIssue(tasks[i]);
                        }
                    }
                    // chrome.tabs.reload(currentTabId);
                }
            }
        };
        xhr.open("get", url + "?" + data, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "OAuth " + token);
        xhr.send();

    })
}

function createIssue(task) {
    // chrome.identity.getAuthToken({ 'interactive': true }, function(token) {

        var xhr = new XMLHttpRequest(), 
            url = REDMINE_ISSUES_API_URL,
            due_date = task.due.replace(/T00:00:00.000Z/, ""),
            subject = task.title.replace(/^\s*\[.*]\s*/, ""),
            site = task.title.match(/^\s*\[.*]\s*/),
            site = (site == null ? "\ubbf8\ubd84\ub958" : site.toString().replace(/[\[|\]\s*]/g, "")),
            data = {"issue": {"tracker_id":"17", "status_id": "1", "project_id": "89", "subject": subject, "description": task.notes, "priority_id": "2", "due_date": due_date, "start_date": "", "custom_fields": [{"value": site, "name":"55", "id":"55"}, {"value":"\uc77c\ubc18", "name":"62", "id":"62"}, {"value":"\ubbf8\ubd84\ub958", "name":"63", "id":"63"}]}};

        xhr.onreadystatechange = function(e) {

            if (xhr.readyState == 4) {
                if(xhr.status == 201) {
                    var issue = JSON.parse(xhr.responseText);
                    // console.log(issue);
                    // console.log(task.id);
                    
                    // alert("Created Issue : " + task.title);
                    if( confirm("Created Issue : " + task.title + "\nDo you want to delete the task?") == true) {
                        deleteTask(task.id);
                        // chrome.tabs.reload(currentTabId);
                    }
                }
            }
        };
        xhr.open("post", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-Redmine-API-Key", REDMINE_KEY);
        xhr.send(JSON.stringify(data));
    // })
}



function parseContents(items) {

    // "영업활동Key,SR,Code,날짜,영업활동주제,고객사명,사업명,대상자,영업유형,작업유형,제품유형,근무유형,,활동 TP,활동내용,시작,종료,활동평가,비고";
    // var contents = "Press \"Ctrl + Shift + End\" Keys at \"B5\" Shell and \"Copy & Paste\" to Your Reporting Sheet\n\n\n";
    var contents = "";
    contents += ",\uc601\uc5c5\ud65c\ub3d9Key,SR,Code,\ub0a0\uc9dc,\uc601\uc5c5\ud65c\ub3d9\uc8fc\uc81c,\uace0\uac1d\uc0ac\uba85,\uc0ac\uc5c5\uba85,\ub300\uc0c1\uc790,\uc601\uc5c5\uc720\ud615,\uc791\uc5c5\uc720\ud615,\uc81c\ud488\uc720\ud615,\uadfc\ubb34\uc720\ud615,-,\ud65c\ub3d9 TP,\ud65c\ub3d9\ub0b4\uc6a9,\uc2dc\uc791,\uc885\ub8cc,\ud65c\ub3d9\ud3c9\uac00,\ube44\uace0" + "\n";


    for( var i=0; i<items.length; i++) {
        // contents += items[i].summary.substr(items[i].summary.lastIndexOf("[")+2, 5) + "," + items[i].creator.displayName + "," + items[i].start.dateTime.substr(0, 10) + "," + items[i].summary.substr(1, items[i].summary.indexOf("]")-1) + "," + (items[i].summary.substr(items[i].summary.indexOf("]") + 1, items[i].summary.length - (items[i].summary.indexOf("]") + (items[i].summary.lastIndexOf("]") - items[i].summary.lastIndexOf("[") + 2))).trim()) + "," + items[i].start.dateTime.substr(11, 5) + "," + items[i].end.dateTime.substr(11, 5) + "\n";
        // contents += items[i].summary + "," + items[i].creator.displayName + "," + items[i].start.dateTime.substr(0, 10) + "," + items[i].start.dateTime.substr(11, 5) + "," + items[i].end.dateTime.substr(11, 5) + "\n";


        // contents += "\"" + items[i].summary + "\"" + "," + items[i].creator.displayName + "," + items[i].start.dateTime.substr(0, 10) + "\n";
        // contents += "aaaaa" + ", " + items[i].creator.displayName + ", " + "ccccc" + "\n";

        if(items[i].recurringEventId === undefined) {

            // if(items[i].transparency === undefined) {

                if(items[i].start.dateTime !== undefined) {

                    // contents += "\"" + items[i].summary + "\"" + "," + items[i].creator.displayName + "," + items[i].start.dateTime + "," + items[i].start.dateTime + "," + items[i].start.dateTime.substr(0, 10) + "\n";    
                    // contents += "\"" + items[i].summary + "\"" + "," + items[i].creator.displayName + "," + items[i].start + "," + items[i].end + "," + items[i].start.dateTime + "," + items[i].end.dateTime + "," + items[i].start.date + "," + items[i].end.date + "\n";    
                    // contents += "\"" + items[i].summary + "\"" + "," + items[i].creator.displayName + "," + items[i].start.dateTime + "," + items[i].end.dateTime + "\n";    

                    // console.log(items[i].summary);
                    // var summaries = items[i].summary.match(/\[(.*), (#\d{5}).*] (.*)$|.*/);
                    var summaries = items[i].summary.match(/\[(.*), (#\d{5}).*](.*)$|.*/);
                    var summary = (summaries[0] || "");
                    var issueId = (summaries[2] || "");
                    var company = (summaries[1] || "");
                    var comments = (summaries[3] || summaries[0] || "");


                    var starts = items[i].start.dateTime.match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
                    var ends = items[i].end.dateTime.match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);

                    var createDate = starts[1];
                    var startTime = starts[2];
                    var endTime = ends[2];

                    var creatorName = items[i].creator.displayName;

                    // // contents += "\"" + (summaries[2] || "") + "\"" + "," + (summaries[1] || "") + "," + (summaries[3] || "") + "," + items[i].creator.displayName + "," + starts[1] + "," + ends[1] + "," + "\"" + summaries[0] + "\"" + "\n";
                    // contents += issueId + "," + company + "," + comments + "," + creatorName + "," + starts[1] + "," + starts[2] + "," + ends[2] + "," + "\"" + summaries[0] + "\"" + "\n";

// 1. (공백)
var A = "\"" + summary.trim() + "\"";
// 2. 영업활동Key - 인덱스
var B = "=ROW()-4";
// 3. SR - "임정호"
var C = creatorName;
// 4. Code - 2201512C1024
var D = "";
// 5. 날짜 - 2015-08-01
var E = createDate;
// 6. 영업활동주제 - (공백)
var F = "";
// 7. 고객사명 - 에코프로
var G = company;
// 8. 사업명 - 에코프로 클라우디움
var H = (company === undefined || company === "" || company === "\uc0ac\uc774\ubc84\ub2e4\uc784") ? "" : company + " \ud074\ub77c\uc6b0\ub514\uc6c0";
// 9. 대상자 - 클라우디움팀/차장/임정호 - "\ud074\ub77c\uc6b0\ub514\uc6c0\ud300/\ucc28\uc7a5/\uc784\uc815\ud638"
var I = "";
// 10. 영업유형 - 과제수행
var J = (company === undefined || company === "") ? "" : "\uacfc\uc81c\uc218\ud589";
// 11. 작업유형 - "대고객미팅" - "\ub300\uace0\uac1d\ubbf8\ud305"
var K = "";
// 12. 제품유형 - "클라우디움"
var L = (company === undefined || company === "") ? "" : "\ud074\ub77c\uc6b0\ub514\uc6c0";
// 13. 근무유형 - 내근 - "\ub0b4\uadfc"
var M = "";
// 14. (공백)
var N = "";
// 15. 활동 TP - 고객요청 - "\uace0\uac1d\uc694\uccad"
var O = "";
// 16. 활동내용 - cloudium 이슈 현황 정리
var P = "\"" + comments.trim() + "\"";
// 17. 시작 - 10:00
var Q = startTime;
// 18. 종료 - 15:00
var R = endTime;
// 19. 활동평가 - *
var S = "*";
// 20. 비고 - 이슈번호
var T = issueId;

                    contents += A + "," + B + "," + C + "," + D + "," + E + "," + F + "," + G + "," + H + "," + I + "," + J + "," + K + "," + L + "," + M + "," + N + "," + O + "," + P + "," + Q + "," + R + "," + S + "," + T + "\n";
                }
            // }
        }
        
    }

    return contents;
}

function exportEvents(exportDate, contents) {

    var a = document.createElement('a');
    var blob = new Blob([ "\ufeff", contents ], {type : "text/plain;charset=utf8"});
    a.href = window.URL.createObjectURL(blob);
    a.download = "export-" + exportDate + ".csv";
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    delete a;
}



function isIssuePage( currentUrl) {
    
    if(currentUrl.indexOf(REDMINE_ISSUE_URL) === 0) {
        return true;
    }
    return false;
}

function isProjectPage( currentUrl) {
    
    if(currentUrl.indexOf(REDMINE_PROJECT_URL) === 0) {
        return true;
    }
    return false;
}

function isCalendarPage( currentUrl) {
    
    if(currentUrl.indexOf(GOOGLE_CALENDAR_URL) === 0) {
        return true;
    }
    return false;
}

function getIssueId(issueUrl) {

    var id = issueUrl.split('/');
    return id[id.length -1];
}

function getIssue(issueId, callback) {

    var xhr = new XMLHttpRequest(), 
        url = REDMINE_ISSUE_URL + "/" + issueId + ".json?key=" + REDMINE_KEY;

    xhr.onreadystatechange = function(event) {
        if (xhr.readyState == 4) {
            if(xhr.status == 200) {
                var issues = JSON.parse(xhr.responseText);
                // console.dir(issues);

                if(callback) {
                    callback(issues.issue);
                }
            }
        }
    };
    xhr.open("get", url, true);
    xhr.send();
}


function getTasks(issueId, callback) {

    var xhr = new XMLHttpRequest(), 
        url = REDMINE_ISSUE_URL + "/" + issueId + ".json?key=" + REDMINE_KEY;

    xhr.onreadystatechange = function(event) {
        if (xhr.readyState == 4) {
            if(xhr.status == 200) {
                var issues = JSON.parse(xhr.responseText);
                // console.dir(issues);

                if(callback) {
                    callback(issues.issue);
                }
            }
        }
    };
    xhr.open("get", url, true);
    xhr.send();
}


function getProjectIssues(callback) {
// console.log(currentTabId);
    var xhr = new XMLHttpRequest(), 
        // url = REDMINE_URL + "/issues.json?key=" + REDMINE_KEY + "&project_id=" + REDMINE_PROJECT + "&status_id=open";
        url = '';
//http://snow.cyberdigm.co.kr/redmine/issues.json?key=022ffd731c04b6fb30598d5e614369c857f126fe&assigned_to_id=me&project_id=59_12--cloudium-----
chrome.tabs.get(currentTabId, function(tab) {

    xhr.onreadystatechange = function(event) {
        if (xhr.readyState == 4) {
            if(xhr.status == 200) {
                var result = JSON.parse(xhr.responseText);
                // console.dir(issues);
                // console.log(result.length);
                for( var i=0; i<result.issues.length; i++) {
                    // console.dir(result.issues[i]);
                    if(callback) {
                        callback(result.issues[i]);
                    }
                }

                alert("Synced Events : " + result.issues.length + "events\nPlease refresh this page when the sync has finished!");
                // chrome.tabs.reload(currentTabId);
            }
        }
    };


// var tabUrl = '';
// tabUrl = tab.url + '&key=022ffd731c04b6fb30598d5e614369c857f126fe&limit=100';
var tabUrl = tab.url + '&limit=100';

// console.log(tabUrl);


tabUrl = tabUrl.replace( /\/issues\?/, "\/issues.json\?");

// console.log(tabUrl);


    xhr.open("get", tabUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-Redmine-API-Key", REDMINE_KEY);
    xhr.send();

});

}

/**
 * @deprecated
 */
function addTask_bak(issue) {

    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {

        var xhr = new XMLHttpRequest(),
            google, 
            url = GOOGLE_TASK_API_URL, 
            site = issue.custom_fields[0].value, 
            subject = issue.subject, 
            issueId = issue.id,
            title = "[" + site + ", #" + issueId + ", w] " + issue.subject

            if(!issue.due_date) {

                var d1 = new Date ();
                var d2 = new Date ( d1 );
                d2.setHours ( d1.getHours() + 9);

                data = {title: title, due: d2};
            }
            else {
                data = {title: title, due: new Date(issue.due_date + " 09:00:00")};    
            }
            
           // google = new OAuth2("google", {
           //     client_id: GOOGLE_CLIENT_ID,
           //     client_secret: GOOGLE_CLIENT_SECRET,
           //     api_scope: GOOGLE_OAUTH_SCOPE
           // });
           //
           // google.authorize();

        xhr.onreadystatechange = function(event) {
            if (xhr.readyState == 4) {
                if(xhr.status == 200) {
                    var task = JSON.parse(xhr.responseText);
                    // console.dir(task);
                    alert("Synced Task : " + title);
                }
            }
        };
        xhr.open("post", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "OAuth " + token);
        xhr.send(JSON.stringify(data));

    })

}

// by Promise
function addTask(issue) {
    
    new Promise(function (resolve, reject) {
        chrome.identity.getAuthToken({ 'interactive': true }, function(token){
            
            resolve(token);
            
        });
    })
    .then(function (token) {
        
        var xhr = new XMLHttpRequest(),
            google, 
            url = GOOGLE_TASK_API_URL, 
            site = issue.custom_fields[0].value, 
            subject = issue.subject, 
            issueId = issue.id,
            title = "[" + site + ", #" + issueId + ", w] " + issue.subject;

        if(!issue.due_date) {

            var d1 = new Date ();
            var d2 = new Date ( d1 );
            d2.setHours ( d1.getHours() + 9);

            data = {title: title, due: d2};
        }
        else {
            data = {title: title, due: new Date(issue.due_date + " 09:00:00")};    
        }
        
       // google = new OAuth2("google", {
       //     client_id: GOOGLE_CLIENT_ID,
       //     client_secret: GOOGLE_CLIENT_SECRET,
       //     api_scope: GOOGLE_OAUTH_SCOPE
       // });
       //
       // google.authorize();

        xhr.onreadystatechange = function(event) {
            if (xhr.readyState == 4) {
                if(xhr.status == 200) {
                    var task = JSON.parse(xhr.responseText);
                    // console.dir(task);
                    alert("Synced Task : " + title);
                }
            }
        };
        xhr.open("post", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "OAuth " + token);
        xhr.send(JSON.stringify(data));
        
        
        
        
        
        
    });
    

    
    
    
    
}

function deleteTask(taskId) {

    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {

        var xhr = new XMLHttpRequest(),
            google, 
            url = GOOGLE_TASK_API_URL, 
            data = taskId;
          
           // google = new OAuth2("google", {
           //     client_id: GOOGLE_CLIENT_ID,
           //     client_secret: GOOGLE_CLIENT_SECRET,
           //     api_scope: GOOGLE_OAUTH_SCOPE
           // });
           //
           // google.authorize();

        xhr.onreadystatechange = function(event) {
            if (xhr.readyState == 4) {
                if(xhr.status == 204) {
                    // var result = JSON.parse(xhr.responseText);
                    // console.log(result);
                    // alert("Synced Task : " + title);

                    // chrome.tabs.reload(currentTabId);
                }
            }
        };
        xhr.open("delete", url + "/" + taskId, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "OAuth " + token);
        // xhr.send(JSON.stringify(data));
        xhr.send();

    })
}





function collectEvents(issue) {

    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {

        var xhr = new XMLHttpRequest(),
            google, 
            url = GOOGLE_EVENT_API_URL,
            data = "q=" + encodeURIComponent(issue.id + ", w]") + "&orderBy=startTime&singleEvents=true";

        // google = new OAuth2("google", {
        //     client_id: GOOGLE_CLIENT_ID,
        //     client_secret: GOOGLE_CLIENT_SECRET,
        //     api_scope: GOOGLE_OAUTH_SCOPE
        // });
        //
        // google.authorize();

        xhr.onreadystatechange = function(event) {
            if (xhr.readyState == 4) {
                if(xhr.status == 200) {
                    var events = JSON.parse(xhr.responseText);
                    // console.dir(events);
                    // alert("Synced Events : " + events.items.length);              
                    // if( events.items.length > 0) {

                        //chrome.tabs.reload(currentTabId, {'bypassCache':true}, function() {

                            createTimeEntries(issue.id, events.items);

                            // if( events.items.length > 0) {
                            //     chrome.tabs.reload(currentTabId);
                            // }

                        // });
                        
                    // }
                }
            }
        };
        xhr.open("get", url + "?" + data, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "OAuth " + token);
        xhr.send();

    })
}

function collectEventsQuietly(issue) {

    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {

        var xhr = new XMLHttpRequest(),
            google, 
            url = GOOGLE_EVENT_API_URL,
            data = "q=" + encodeURIComponent(issue.id + ", w]") + "&orderBy=startTime&singleEvents=true";

        // google = new OAuth2("google", {
        //     client_id: GOOGLE_CLIENT_ID,
        //     client_secret: GOOGLE_CLIENT_SECRET,
        //     api_scope: GOOGLE_OAUTH_SCOPE
        // });
        //
        // google.authorize();

        xhr.onreadystatechange = function(event) {
            if (xhr.readyState == 4) {
                if(xhr.status == 200) {
                    var events = JSON.parse(xhr.responseText);
                    // console.dir(events);
                    // alert("Synced Events : " + events.items.length);             
                    if( events.items.length > 0) {
                        createTimeEntries(issue.id, events.items);                            
                    }
                }
            }
        };
        xhr.open("get", url + "?" + data, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "OAuth " + token);
        xhr.send();

    })
}

// function collectWaitEvents(callback) {

//     chrome.identity.getAuthToken({ 'interactive': true }, function(token) {

//         var xhr = new XMLHttpRequest(),
//             google, 
//             url = GOOGLE_EVENT_API_URL,
//             data = "q=" + encodeURIComponent(", w]") + "&orderBy=startTime&singleEvents=true";

//         // google = new OAuth2("google", {
//         //     client_id: GOOGLE_CLIENT_ID,
//         //     client_secret: GOOGLE_CLIENT_SECRET,
//         //     api_scope: GOOGLE_OAUTH_SCOPE
//         // });
//         //
//         // google.authorize();

//         xhr.onreadystatechange = function(event) {
//             if (xhr.readyState == 4) {
//                 if(xhr.status == 200) {
//                     var events = JSON.parse(xhr.responseText);
//                     console.dir(events);
//                     // alert("Synced Events : " + events.items.length);
//                     // createTimeEntries(issue.id, events.items);
//                     if(callback) {
//                         callback(createTimeEntries);
//                     }
//                 }
//             }
//         };
//         xhr.open("get", url + "?" + data, true);
//         xhr.setRequestHeader("Content-Type", "application/json");
//         xhr.setRequestHeader("Authorization", "OAuth " + token);
//         xhr.send();

//     })
// }

function setOptions() {
    chrome.storage.sync.get({
        redmine_url: "", 
        redmine_project: "", 
        redmine_key: "", 
        google_task_id: "", 
        google_event_id: ""
    }, function(items) {
        REDMINE_URL = items.redmine_url;
        REDMINE_PROJECT = items.redmine_project;
        REDMINE_KEY = items.redmine_key;
        GOOGLE_TASK_ID = encodeURIComponent(items.google_task_id);
        GOOGLE_EVENT_ID = encodeURIComponent(items.google_event_id);
        REDMINE_ISSUE_URL = REDMINE_URL + "/issues";
        REDMINE_PROJECT_URL = REDMINE_URL + "/projects/" + REDMINE_PROJECT + "/issues?";
        REDMINE_ISSUES_API_URL = REDMINE_URL + "/issues.json";
        REDMINE_TIME_ENTRIES_API_URL = REDMINE_URL + "/time_entries.json";
        GOOGLE_TASK_API_URL = "https://www.googleapis.com/tasks/v1/lists/" + GOOGLE_TASK_ID + "/tasks";
        GOOGLE_EVENT_API_URL = "https://www.googleapis.com/calendar/v3/calendars/" + GOOGLE_EVENT_ID + "/events";
    });
}

var currentTabId = '';

function setMenus(tabId) {

    currentTabId = tabId;

    // console.log(currentTabId);



    chrome.tabs.get(currentTabId, function(tab) {

        // console.dir(tab);
        chrome.pageAction.setIcon({tabId: tabId, path: 'icons/icon-48.png'});

        chrome.contextMenus.removeAll( function() {
            // console.log("removeAll at init!")
        });


        if(isIssuePage( tab.url)) {
            chrome.pageAction.show(tabId);
            chrome.contextMenus.create({"title": "Add This Issue to Task", "contexts":["all"], "id": ITEM_ID_ADD_TO_TASK});
            chrome.contextMenus.create({"title": "Collect Timelogs for This Issue", "contexts": ["all"], "id": ITEM_ID_COLLECT_TIMELOGS});
        }
        else if(isProjectPage( tab.url)) {
            chrome.pageAction.show(tabId);
            chrome.contextMenus.create({"title": "Collect Timelogs for This Project", "contexts": ["all"], "id": ITEM_ID_COLLECT_TIMELOGS_PROJECT});
        }        
        else if(isCalendarPage( tab.url)) {
            chrome.pageAction.show(tabId);
            chrome.contextMenus.create({"title": "Export Events for This Period", "contexts": ["all"], "id": ITEM_ID_EXPORT_EVENTS});
            chrome.contextMenus.create({"title": "Create Issues for This Period", "contexts": ["all"], "id": ITEM_ID_CREATE_ISSUES});
        }
        else {
            
        }


        // if(isIssuePage( tab.url)) {
        //     chrome.pageAction.show(tabId);
        //     chrome.contextMenus.create({"title": "Add This Issue to Task", "contexts":["all"], "id": ITEM_ID_ADD_TO_TASK});
        //     chrome.contextMenus.create({"title": "Collect Timelogs for This Issue", "contexts": ["all"], "id": ITEM_ID_COLLECT_TIMELOGS});
        //     // chrome.contextMenus.create({"title": "Export Events for Today", "contexts": ["all"], "id": ITEM_ID_EXPORT_EVENTS});
        // } else {
        //     chrome.pageAction.hide(tabId);
        //     chrome.contextMenus.remove(ITEM_ID_ADD_TO_TASK);
        //     chrome.contextMenus.remove(ITEM_ID_COLLECT_TIMELOGS);
        //     // chrome.contextMenus.remove(ITEM_ID_EXPORT_EVENTS);
        // } 

        // if(isCalendarPage( tab.url)) {
        //     chrome.pageAction.show(tabId);
        //     // chrome.contextMenus.create({"title": "Add This Issue to Task", "contexts":["all"], "id": ITEM_ID_ADD_TO_TASK});
        //     // chrome.contextMenus.create({"title": "Collect Timelogs for This Issue", "contexts": ["all"], "id": ITEM_ID_COLLECT_TIMELOGS});
        //     chrome.contextMenus.create({"title": "Export Events for Today", "contexts": ["all"], "id": ITEM_ID_EXPORT_EVENTS});
        // } else {
        //     chrome.pageAction.hide(tabId);
        //     // chrome.contextMenus.remove(ITEM_ID_ADD_TO_TASK);
        //     // chrome.contextMenus.remove(ITEM_ID_COLLECT_TIMELOGS);
        //     chrome.contextMenus.remove(ITEM_ID_EXPORT_EVENTS);
        // }
    });
}

function createTimeEntries(issueId, events) {

    var syncedHours = 0.0;
    for (var i in events) {

        createTimeEntry(issueId, events[i]);
        var hours = ((new Date(events[i].end.dateTime).getTime() - new Date(events[i].start.dateTime).getTime()) / (1000 * 60 * 60)).toFixed(1);
        syncedHours += Number(hours);

        updateEvent(issueId, events[i]);
    }

    alert("Synced Events : " + "#" + issueId + ", " + events.length + "times, " + syncedHours + "hours");
}

function createTimeEntry(issueId, event) {

    // chrome.identity.getAuthToken({ 'interactive': true }, function(token) {

        var xhr = new XMLHttpRequest(), 
            url = REDMINE_TIME_ENTRIES_API_URL,
            issueId = issueId, 
            activityId = "10", 
            spentOn = new Date(event.start.dateTime).format("yyyy-MM-dd"), 
            hours = ((new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()) / (1000 * 60 * 60)).toFixed(1), 
            // comments = event.summary.substring(event.summary.indexOf("]")+1).trim().substring(0, event.summary.substring(event.summary.indexOf("]")+1).trim().indexOf("[")).trim(), 
            comments = event.summary.replace(/^\s*\[.*,.*#\d{5},.*w.*\]\s*/, ""), 
            key = REDMINE_KEY, 
            // data = {time_entry: {issue_id: issueId, activity_id: activityId, spent_on: spentOn, hours: hours, comments: comments, key: REDMINE_KEY}};
            data = {time_entry: {issue_id: issueId, activity_id: activityId, spent_on: spentOn, hours: hours, comments: comments}};

        xhr.onreadystatechange = function(e) {

            if (xhr.readyState == 4) {
                if(xhr.status == 200) {
                    var timeEntries = JSON.parse(xhr.responseText);
                    // console.dir(timeEntries);
                }
            }
        };
        xhr.open("post", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-Redmine-API-Key", REDMINE_KEY);
        xhr.send(JSON.stringify(data));

    // })
}

function updateEvent(issueId, event) {

    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
        var xhr = new XMLHttpRequest(),
            google, 
            url = GOOGLE_EVENT_API_URL + "/" + event.id, 
            summary = event.summary.replace(issueId + ', w', issueId + ''),
            data = { end: { dateTime: new Date(event.end.dateTime)}, start: { dateTime: new Date(event.start.dateTime)}, summary: summary};


        // google = new OAuth2("google", {
        //     client_id: GOOGLE_CLIENT_ID,
        //     client_secret: GOOGLE_CLIENT_SECRET,
        //     api_scope: GOOGLE_OAUTH_SCOPE
        // });
        //
        // google.authorize();

        xhr.onreadystatechange = function(event) {
            if (xhr.readyState == 4) {
                if(xhr.status == 200) {
                    var task = JSON.parse(xhr.responseText);
                    // console.dir(task);
                    // alert("Updated Event : " + summary);
                }
            }
        };
        xhr.open("put", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "OAuth " + token);
        xhr.send(JSON.stringify(data));

    })
}

Date.prototype.format = function(f) {
    if (!this.valueOf()) return " ";
 
    // var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var d = this;
     
    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            // case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            // case "E": return weekName[d.getDay()];
            // case "HH": return d.getHours().zf(2);
            // case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            // case "mm": return d.getMinutes().zf(2);
            // case "ss": return d.getSeconds().zf(2);
            // case "a/p": return d.getHours() < 12 ? "오전" : "오후";
            default: return $1;
        }
    });
};
 
String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};

