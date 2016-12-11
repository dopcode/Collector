// Saves options to chrome.storage.sync.
function save_options() {
  var redmine_url = document.getElementById('redmine_url').value;
  var redmine_project = document.getElementById('redmine_project').value;
  var redmine_key = document.getElementById('redmine_key').value;
  var google_task_id = document.getElementById('google_task_id').value;
  var google_event_id = document.getElementById('google_event_id').value;

  chrome.storage.sync.set({
    redmine_url: redmine_url, 
    redmine_project: redmine_project, 
    redmine_key: redmine_key, 
    google_task_id: google_task_id, 
    google_event_id: google_event_id
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1000);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    redmine_url: "", 
    redmine_project: "", 
    redmine_key: "", 
    google_task_id: "", 
    google_event_id: ""
  }, function(items) {
    document.getElementById('redmine_url').value = items.redmine_url;
    document.getElementById('redmine_project').value = items.redmine_project;
    document.getElementById('redmine_key').value = items.redmine_key;
    document.getElementById('google_task_id').value = items.google_task_id;
    document.getElementById('google_event_id').value = items.google_event_id;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);