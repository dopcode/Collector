function save_options() {
  var redmine_url = document.getElementById("redmine_url").value;
  var redmine_project = document.getElementById("redmine_project").value;
  var redmine_key = document.getElementById("redmine_key").value;
  var google_task_title_pattern = document.getElementById("google_task_title_pattern").value;

  chrome.storage.sync.set({
    redmine_url: redmine_url, 
    redmine_project: redmine_project, 
    redmine_key: redmine_key, 
    google_task_title_pattern: google_task_title_pattern 
  }, function() {
    var status = document.getElementById("status");
    // M009
    status.textContent = "\uc131\uacf5\uc801\uc73c\ub85c \uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4.";
    setTimeout(function() {
      status.textContent = "";
    }, 1000);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    redmine_url: "", 
    redmine_project: "", 
    redmine_key: "", 
    google_task_title_pattern: ""
  }, function(items) {
    document.getElementById("redmine_url").value = items.redmine_url;
    document.getElementById("redmine_project").value = items.redmine_project;
    document.getElementById("redmine_key").value = items.redmine_key;
    document.getElementById("google_task_title_pattern").value = items.google_task_title_pattern;
  });
}

document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);