var casper = require('casper').create();

casper.start("http://tsvhoehtal.ch/drupal/image", function () {
    // read all available years
    var years = this.getElementsAttribute('.galleries .views-field-name a', 'href');

    this.each(years, function (self, yearUrl) {
        self.thenOpen("http://tsvhoehtal.ch/" + yearUrl, function () {
            // read the year
            var year = this.fetchText('h1');

            // read all the galleries of the year
            var galleries = this.getElementsAttribute('.galleries .views-field-name a', 'href');

            this.each(galleries, function (self, gallery) {
                self.thenOpen("http://tsvhoehtal.ch/" + gallery, function () {
                    // grep the gallery name
                    var galleryName = this.fetchText('h1') + "_" + year;
                    var galleryId = gallery.substr(gallery.lastIndexOf("/"));

                    // in the gallery find out how many pages there are and generate it's links
                    var lastPage = this.getElementAttribute('.pager-last.last a', 'href');
                    var amountOfPages = parseInt(lastPage.substr(lastPage.lastIndexOf("=") + 1), 10);

                    this.echo("need to download " + amountOfPages + " pages for the gallery '" + galleryName + "'");
                    var galleryPages = []
                    for ( var i = 0; i < amountOfPages; i++) {
                        galleryPages.push("http://tsvhoehtal.ch/drupal/image/tid/" + galleryId + "?page=" + i)
                    }

                    // iterate over all pages of a gallery
                    var imageIndex = 0;
                    var totalImages = 12 * galleryPages.length;
                    var pageIndex = 0;
                    this.each(galleryPages, function (self, link) {
                        self.thenOpen(link, function () {
                            this.echo("downloading page " + pageIndex + "/" + galleryPages.length);
                            // get all the pictures
                            var picUrls = this.getElementsAttribute('.lightbox-processed', 'href');
                            // download each picture to its gallery folder
                            this.each(picUrls, function (self, pic) {
                                if (pic !== "") {
                                    this.echo("downloading image " + ++imageIndex + "/~" + totalImages);
                                    self.download(pic, galleryName + "/" + pic.substr(pic.lastIndexOf("/") + 1));
                                }
                            })
                        });
                    })
                });
            })
        });
    });
});

casper.run();