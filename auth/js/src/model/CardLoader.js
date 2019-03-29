class ResourceLoader {

    loadList(resourceList, endCallback) {

        if(resourceList.length > 0) {
            var i = 0;
            var getScript = function () {
                var resourcePath = resourceList[i];
                $.getScript(resourcePath, function () {
                    i++;
                    if (i < resourceList.length) getScript();
                    else endCallback();
                });
            };
            getScript();
        }
        else {
            endCallback();
        }
    }
}
let ResourceLoaderSingleton = new ResourceLoader();
module.exports = ResourceLoaderSingleton;

