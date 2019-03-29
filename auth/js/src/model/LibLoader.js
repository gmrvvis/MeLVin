class Loader {

    loadInitialLibs(libs, endCallback){
        var unsertedLibs = Object.keys(libs).map(function (libKey) {
            return libs[libKey];
        });
        this.loadLibraries(unsertedLibs, endCallback);
    }

    loadLibraries(unsortedLibs, endCallback) {
        if(unsortedLibs.length > 0) {
            unsortedLibs = unsortedLibs.map(function (lib) {
                if (lib.order === undefined)
                    lib.order = 0;

                return lib;
            });

            unsortedLibs.sort(function (a, b) {
                return a.order - b.order;
            });


            var i = 0;
            var getScript = function () {
                var libName = unsortedLibs[i].name;
                var uniqueID = unsortedLibs[i].uniqueID;
                var defaultID = unsortedLibs[i].defaultID;

                $.getScript('./auth/libs/' + libName, function () {
                    window[uniqueID] = window[defaultID];
                    if (uniqueID !== defaultID)
                        delete window[defaultID];
                    i++;
                    if (i < unsortedLibs.length) getScript();
                    else endCallback();
                }).fail(function (e) {
                    console.log("Failed to load library", e);
                    i++;
                    if (i < unsortedLibs.length) getScript();
                    else endCallback();
                });
            };
            getScript();
        }
        else{
            endCallback();
        }
    }
}
let LoaderSingleton = new Loader();
module.exports = LoaderSingleton;

