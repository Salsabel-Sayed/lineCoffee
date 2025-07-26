self.addEventListener("push", function (e) {
    const data = e.data?.json();
    const options = {
        body: data.body,
        icon: "/public/images/back1.avif",
        badge: "/public/images/back1.avif", 
    };

    e.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
