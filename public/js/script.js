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
    },
    mounted: function () {
        console.log("my main vue instance has mounted");
        var self = this;
        //axios for server communication
        axios
            .get("/imageboard")
            .then(function (response) {
                console.log("response:", response);
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
    },
});
