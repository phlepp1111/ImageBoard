Vue.component("image-popup", {
     template: "#popup-template",
     data: function () {
          return {
               url: "",
               title: "",
               description: "",
               username: "",
               created_at: "",
               nextImgId: "",
               prevImgId: "",
          };
     },
     props: ["imageId"],
     mounted: function () {
          var self = this;
          axios.get("/imageboard/" + this.imageId)
               .then(function (response) {
                    self.title = response.data.image.title;
                    self.description = response.data.image.description;
                    self.username = response.data.image.username;
                    self.url = response.data.image.url;
                    self.created_at = response.data.image.created_at;
                    self.nextImgId = response.data.image.nextImgId;
                    self.prevImgId = response.data.image.prevImgId;
               })
               .catch(function (error) {
                    console.log("error in axios", error);
               });
     },
     methods: {
          closeElement: function () {
               this.$emit("close");
          },
     },
     watch: {
          imageId: function () {
               var self = this;
               axios.get("/imageboard/" + this.imageId)
                    .then(function (response) {
                         self.url = response.data.image.url;
                         self.title = response.data.image.title;
                         self.description = response.data.image.description;
                         self.username = response.data.image.username;
                         self.created_at = response.data.image.created_at;
                         self.nextImgId = response.data.image.nextImgId;
                         self.prevImgId = response.data.image.prevImgId;
                    })
                    .catch(function (error) {
                         console.log(
                              "Error getting response for rerouted image:",
                              error
                         );
                         self.$emit("close");
                    });
          },
     },
});

Vue.component("comment-section", {
     template: "#comment-template",
     data: function () {
          return {
               comment: "",
               username: "",
               allComments: [],
          };
     },
     props: ["imageId"],
     mounted: function () {
          axios.get("/comments/" + this.imageId)
               .then((response) => {
                    var self = this;
                    self.allComments = response.data;
               })
               .catch((error) => {
                    console.log("error in comments retrival:", error);
               });
     },
     methods: {
          handleComments: function () {
               const allCommentData = {
                    comment: this.comment,
                    username: this.username,
                    img_id: this.imageId,
               };
               axios.post("/addComment", allCommentData)
                    .then((response) => {
                         this.allComments.unshift(response.data.addComment);
                         this.comment = "";
                         this.username = "";
                    })
                    .catch((error) => {
                         console.log(
                              "error on unshift and post response:",
                              error
                         );
                    });
          },
     },
});

new Vue({
     el: "#main",
     data: {
          name: "Fennel",
          seen: true,
          images: [],
          title: "",
          description: "",
          username: "",
          file: null,
          imageSelected: location.hash.slice(1),
          lastOnScreen: false,
     },
     mounted: function () {
          var self = this;
          axios.get("/imageboard")
               .then(function (response) {
                    var imgArray = response.data;
                    imgArray.sort(function (a, b) {
                         return new Date(b.created_at) - new Date(a.created_at);
                    });
                    self.images = imgArray;
               })
               .catch(function (error) {
                    console.log("axiosError getting images: ", error);
               });
          window.addEventListener("hashchange", function () {
               self.imageSelected = location.hash.slice(1);
          });
     },
     methods: {
          handleClick: function (e) {
               e.preventDefault();
               var self = this;
               var formData = new FormData();
               formData.append("title", this.title);
               formData.append("description", this.description);
               formData.append("username", this.username);
               formData.append("file", this.file);
               axios.post("/upload", formData)
                    .then(function (response) {
                         self.images.unshift(response.data.image);
                    })
                    .catch(function (error) {
                         console.log("Post request error: ", error);
                    });
          },
          handleChange: function (e) {
               this.file = e.target.files[0];
          },
          closeComponent: function () {
               location.hash = "";
               this.imageSelected = null;
          },
          getMoreImages: function () {
               var lowestImgId = this.images[this.images.length - 1].id;
               var self = this;
               axios.get("/more/" + lowestImgId)
                    .then((response) => {
                         var moreImages = self.images.concat(response.data);
                         self.images = moreImages;
                         console.log("db response:", response);
                         if (
                              self.images[self.images.length - 1].id ==
                              response.data[0].lowestImgId
                         ) {
                              self.lastOnScreen = true;
                              console.log("All images are displayed");
                         }
                    })
                    .catch((error) => {
                         console.log("Error getting more images: ", error);
                    });
          },
     },
});
