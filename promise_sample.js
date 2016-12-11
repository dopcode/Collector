(function test() {
    
    new Promise(function (resolve, reject) {
        var values = "resolve1";
        console.log(values);
        
        throw new Error(values);
        
        resolve(values);
    })
    .then(function (values) {
        values = "resolve2";
        console.log(values);
        throw new Error(values);
        return values;
    })
    .catch(function (e) {
        console.log(e);
        throw new Error(e);
    })  
    .then(function (values) {
        values = "resolve3";
        console.log(values);
        throw new Error(values);
        return values
    })
    .catch(function (e) {
        console.log(e);
    });
    
})();