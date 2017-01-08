// Type 1
(function createTask(issueId) {

    Promise.resolve("aaaa")    
    .then(taskA)
    .then(taskB)
    .catch(catchB)
    .then(taskC);
    
})();

function taskA(str) {
    return "taskA - " + str;
}

function taskB(value) {
    return Promise.reject(new Error("taskB - " + value));
}

function catchB(error) {
    console.log("catchB " + error);
}

function taskC() {
    console.log("taskC");
}




//Type 2
(function createTask(issueId) {

    Promise.all([ taskA(), taskB(), taskC() ])  
    .catch(catchB)
    .then(taskC)
})();

function taskA() {
    return Promise.reject(new Error("taskA")); // return reject!
    console.log("taskA");
}

function taskB() {
    return Promise.reject(new Error("taskB")); // return reject!
}

function catchB(error) {
    console.log("catchB " + error);
}

function taskC() {
    console.log("taskC");
}