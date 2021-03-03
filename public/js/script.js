// Vue.component("my-first-component", {
//     template: "#my-component-template",
//     data: function () {
//         return {
//             name: "Philipp",
//             count: 1,
//         };
//     },
//     props: ["moodId"],
//     mounted: function () {
//         console.log("this.moodId: ", this.moodId);
//     },
//     methods: {
//         updateCount: function () {
//             console.log("component button got clicked");
//             this.count++;
//         },
//     },
// });
Vue.component("image-popup", {
    template: "#popup-template",
    data: function () {
        return {
            url: "",
            title: "",
            description: "",
            username: "",
            created_at: "",
        };
    },
    props: ["imageId"],
    mounted: function () {
        var self = this;
        axios
            .get("/imageboard/" + this.imageId)
            .then(function (response) {
                console.log(
                    "response from mounting image board",
                    response.data.image
                );
                self.title = response.data.image.title;
                self.description = response.data.image.description;
                self.username = response.data.image.username;
                self.url = response.data.image.url;
                self.created_at = response.data.image.created_at;
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
        console.log("ImageID: ", this.imageId);
        axios
            .get("/comments/" + this.imageId)
            .then((response) => {
                console.log("Comments response.data", response.data);
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
            console.log("ALL Comment Data: ", allCommentData);
            axios
                .post("/addComment", allCommentData)
                .then((response) => {
                    this.allComments.unshift(response.data.addComment);
                    this.comment = "";
                    this.username = "";
                })
                .catch((error) => {
                    console.log("error on unshift and post response:", error);
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
        // moods: [
        //     { id: 1, title: ":(" },
        //     { id: 2, title: ":)" },
        //     { id: 3, title: ":/" },
        // ],
        // moodSelected: 1,
        imageSelected: null,
    },
    mounted: function () {
        //console.log("my main vue instance has mounted");
        var self = this;
        //axios for server communication
        axios
            .get("/imageboard")
            .then(function (response) {
                //console.log("response:", response);
                var imgArray = response.data;
                imgArray.sort(function (a, b) {
                    return new Date(b.created_at) - new Date(a.created_at);
                });
                self.images = imgArray;
            })
            .catch(function (error) {
                console.log("axiosError: ", error);
            });
    },
    methods: {
        handleClick: function (e) {
            console.log(e);
            e.preventDefault();
            var formData = new FormData();
            formData.append("title", this.title);
            formData.append("description", this.description);
            formData.append("username", this.username);
            formData.append("file", this.file);
            console.log("title: ", this.title);
            console.log("description: ", this.description);
            console.log("handleClick running");
            axios
                .post("/upload", formData)
                .then(function (response) {
                    console.log("response from POST request: ", response);
                })
                .catch(function (error) {
                    console.log("Post request error: ", error);
                });
        },
        handleChange: function (e) {
            console.log("e.target.files : ", e.target.files[0]);
            console.log("handleChange is running");
            this.file = e.target.files[0];
        },
        // selectMood: function (id) {
        //     console.log("mood has been selected");
        //     console.log("mood ID clicked: ", id);
        //     this.moodSelected = id;
        // },
        selectImage: function (id) {
            console.log("select image!");
            this.imageSelected = id;
        },
        closeComponent: function () {
            console.log("component was closed!");
            this.imageSelected = null;
        },
    },
});
